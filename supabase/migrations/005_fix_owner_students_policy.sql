-- ============================================================================
-- SmartBite Migration 005: Fix Mess Owner SELECT RLS Policy on public.students
-- File: supabase/migrations/005_fix_owner_students_policy.sql
-- Instructions: Paste and run this entire script in the Supabase SQL Editor.
-- Note: Policy and helper function changes only. Zero data loss.
-- ============================================================================

-- 1. Ensure any mess linked to a mess_owner profile has owner_id populated
UPDATE public.messes m
SET owner_id = p.id
FROM public.profiles p
WHERE p.mess_id = m.id
  AND p.role = 'mess_owner'
  AND m.owner_id IS NULL;

-- 2. Fix current_user_role() and current_user_mess_id() using plpgsql SECURITY DEFINER
--    Using plpgsql prevents SQL function inlining and avoids recursive RLS evaluation on public.students.
--    For mess owners, messes.owner_id = auth.uid() is checked first.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT p.role INTO v_role
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;

  RETURN v_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_mess_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mess_id UUID;
BEGIN
  -- 1) If user owns a mess in public.messes, return that mess id
  SELECT m.id INTO v_mess_id
  FROM public.messes m
  WHERE m.owner_id = auth.uid()
  ORDER BY m.created_at DESC
  LIMIT 1;

  IF v_mess_id IS NOT NULL THEN
    RETURN v_mess_id;
  END IF;

  -- 2) Otherwise check public.profiles.mess_id
  SELECT p.mess_id INTO v_mess_id
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;

  IF v_mess_id IS NOT NULL THEN
    RETURN v_mess_id;
  END IF;

  -- 3) Otherwise check public.students.mess_id for student accounts
  SELECT s.mess_id INTO v_mess_id
  FROM public.students s
  WHERE s.profile_id = auth.uid()
  LIMIT 1;

  RETURN v_mess_id;
END;
$$;

-- 3. Replace RLS policies on public.students so a Mess Owner can directly SELECT
--    students whose mess_id belongs to a mess they own (messes.owner_id = auth.uid())
--    without any recursive query on public.students.
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students viewable by self, own mess owner, or admin" ON public.students;
DROP POLICY IF EXISTS "Mess owner can select own mess students" ON public.students;
DROP POLICY IF EXISTS "Students can select own row" ON public.students;

CREATE POLICY "Students viewable by self, own mess owner, or admin"
  ON public.students
  FOR SELECT
  USING (
    -- Student can read their own student row
    profile_id = auth.uid()
    -- Mess owner can read students whose mess_id belongs to a mess they own
    OR EXISTS (
      SELECT 1
      FROM public.messes m
      WHERE m.id = students.mess_id
        AND m.owner_id = auth.uid()
    )
    -- Fallback if mess owner profile is linked via profiles.mess_id
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'mess_owner'
        AND p.mess_id = students.mess_id
    )
    -- Super Admin can read all students
    OR public.current_user_role() = 'super_admin'
  );

DROP POLICY IF EXISTS "Students insertable by self or admin" ON public.students;
CREATE POLICY "Students insertable by self or admin"
  ON public.students
  FOR INSERT
  WITH CHECK (
    profile_id = auth.uid()
    OR public.current_user_role() = 'super_admin'
  );

DROP POLICY IF EXISTS "Students updatable by self, own mess owner, or admin" ON public.students;
CREATE POLICY "Students updatable by self, own mess owner, or admin"
  ON public.students
  FOR UPDATE
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.messes m
      WHERE m.id = students.mess_id
        AND m.owner_id = auth.uid()
    )
    OR public.current_user_role() = 'super_admin'
  );

-- 4. Update public.profiles SELECT policy so mess owners can also read profiles
--    of students linked to their mess (if joined or queried).
DROP POLICY IF EXISTS "Profiles viewable by self, mess owner, or admin" ON public.profiles;
CREATE POLICY "Profiles viewable by self, mess owner, or admin"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1
      FROM public.messes m
      WHERE m.id = profiles.mess_id
        AND m.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.students s
      JOIN public.messes m ON m.id = s.mess_id
      WHERE s.profile_id = profiles.id
        AND m.owner_id = auth.uid()
    )
    OR public.current_user_role() = 'super_admin'
  );
