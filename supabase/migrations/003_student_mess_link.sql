-- ============================================================================
-- SmartBite Migration 003: Student-to-Mess Linking, Join Codes & Strict Menu RLS
-- File: supabase/migrations/003_student_mess_link.sql
-- Instructions: Paste and run this entire script in the Supabase SQL Editor.
-- Note: Uses ALTER TABLE statements only; does not drop any existing data.
-- ============================================================================

-- 1. Add join_code and ensure registered_students / walk_in_buffer_pct exist on public.messes
ALTER TABLE public.messes
  ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS registered_students INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS walk_in_buffer_pct INTEGER NOT NULL DEFAULT 8;

ALTER TABLE public.messes
  ALTER COLUMN capacity SET DEFAULT 0,
  ALTER COLUMN join_code SET DEFAULT ('SB-' || UPPER(SUBSTRING(MD5(random()::text || clock_timestamp()::text) FROM 1 FOR 6)));

-- Backfill unique join_code for any existing messes that do not have one yet
UPDATE public.messes
SET join_code = 'SB-' || UPPER(SUBSTRING(MD5(id::text || created_at::text) FROM 1 FOR 6))
WHERE join_code IS NULL OR TRIM(join_code) = '';

CREATE INDEX IF NOT EXISTS idx_messes_join_code ON public.messes(UPPER(join_code));
CREATE INDEX IF NOT EXISTS idx_messes_college_id ON public.messes(college_id);

-- 2. Ensure students table has mess_id and college_id columns & indexes
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS mess_id UUID REFERENCES public.messes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_students_mess_id ON public.students(mess_id);
CREATE INDEX IF NOT EXISTS idx_students_profile_id ON public.students(profile_id);

-- Backfill students.mess_id from profiles.mess_id if any existing student had profile.mess_id set
UPDATE public.students s
SET mess_id = p.mess_id
FROM public.profiles p
WHERE s.profile_id = p.id
  AND s.mess_id IS NULL
  AND p.mess_id IS NOT NULL;

-- Backfill profiles.mess_id from students.mess_id if any existing student had students.mess_id set
UPDATE public.profiles p
SET mess_id = s.mess_id
FROM public.students s
WHERE s.profile_id = p.id
  AND p.mess_id IS NULL
  AND s.mess_id IS NOT NULL;

-- 3. Keep public.messes.registered_students automatically synced with real student count in DB
CREATE OR REPLACE FUNCTION public.sync_mess_registered_students_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.mess_id IS NOT NULL THEN
      UPDATE public.messes
      SET registered_students = (
        SELECT COUNT(*) FROM public.students WHERE mess_id = NEW.mess_id
      )
      WHERE id = NEW.mess_id;
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    IF OLD.mess_id IS NOT NULL AND (TG_OP = 'DELETE' OR OLD.mess_id IS DISTINCT FROM NEW.mess_id) THEN
      UPDATE public.messes
      SET registered_students = (
        SELECT COUNT(*) FROM public.students WHERE mess_id = OLD.mess_id
      )
      WHERE id = OLD.mess_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_mess_student_count ON public.students;
CREATE TRIGGER trg_sync_mess_student_count
  AFTER INSERT OR UPDATE OF mess_id OR DELETE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.sync_mess_registered_students_count();

-- Recalculate real registered_students count for all existing messes from public.students
UPDATE public.messes m
SET registered_students = (
  SELECT COUNT(*) FROM public.students s WHERE s.mess_id = m.id
);

-- 4. Update RLS Helper Function so current_user_mess_id() checks both students & profiles/messes
CREATE OR REPLACE FUNCTION public.current_user_mess_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT s.mess_id FROM public.students s WHERE s.profile_id = auth.uid() LIMIT 1),
    (SELECT p.mess_id FROM public.profiles p WHERE p.id = auth.uid() LIMIT 1),
    (SELECT m.id FROM public.messes m WHERE m.owner_id = auth.uid() LIMIT 1)
  );
$$;

-- 5. Update handle_new_user() trigger so Student registration links directly via mess_id or join_code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
  v_college_name TEXT;
  v_mess_name TEXT;
  v_hostel_name TEXT;
  v_student_id TEXT;
  v_phone TEXT;
  v_join_code TEXT;
  v_college_id UUID;
  v_mess_id UUID;
BEGIN
  -- Security Guard: Never allow public signup to self-assign super_admin
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  IF v_role NOT IN ('mess_owner', 'student') THEN
    v_role := 'student';
  END IF;

  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_college_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'college_name'), ''), 'Partner Institution');
  v_mess_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'mess_name', '')), '');
  v_hostel_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'hostel_name'), ''), 'Hostel');
  v_student_id := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'student_id_code'), ''), 'STU-' || substr(NEW.id::text, 1, 6));
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  v_join_code := UPPER(TRIM(COALESCE(NEW.raw_user_meta_data->>'join_code', '')));

  -- Try reading explicit mess_id / college_id from user_metadata if provided
  BEGIN
    IF NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'mess_id', '')), '') IS NOT NULL THEN
      v_mess_id := (NEW.raw_user_meta_data->>'mess_id')::UUID;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_mess_id := NULL;
  END;

  BEGIN
    IF NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'college_id', '')), '') IS NOT NULL THEN
      v_college_id := (NEW.raw_user_meta_data->>'college_id')::UUID;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_college_id := NULL;
  END;

  IF v_role = 'mess_owner' THEN
    -- Lookup existing college by case-insensitive name, or create a new one
    IF v_college_id IS NULL THEN
      SELECT id INTO v_college_id
      FROM public.colleges
      WHERE LOWER(TRIM(name)) = LOWER(TRIM(v_college_name))
      ORDER BY created_at ASC
      LIMIT 1;
    END IF;

    IF v_college_id IS NULL THEN
      INSERT INTO public.colleges (name, is_active)
      VALUES (v_college_name, TRUE)
      RETURNING id INTO v_college_id;
    END IF;

    INSERT INTO public.messes (
      college_id,
      name,
      college_name,
      contact_number,
      capacity,
      registered_students,
      join_code,
      status
    )
    VALUES (
      v_college_id,
      COALESCE(v_mess_name, v_college_name || ' Central Mess'),
      v_college_name,
      v_phone,
      0,
      0,
      'SB-' || UPPER(SUBSTRING(MD5(NEW.id::text || clock_timestamp()::text) FROM 1 FOR 6)),
      'active'
    )
    RETURNING id, name INTO v_mess_id, v_mess_name;

  ELSE
    -- Student signup: Resolve mess by explicit mess_id OR join_code
    IF v_mess_id IS NOT NULL THEN
      SELECT id, name, college_id, college_name
      INTO v_mess_id, v_mess_name, v_college_id, v_college_name
      FROM public.messes
      WHERE id = v_mess_id
      LIMIT 1;
    ELSIF v_join_code <> '' THEN
      SELECT id, name, college_id, college_name
      INTO v_mess_id, v_mess_name, v_college_id, v_college_name
      FROM public.messes
      WHERE UPPER(TRIM(join_code)) = v_join_code
      LIMIT 1;
    END IF;
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, role, phone, college_id, mess_id,
    college_name, mess_name, hostel_name, student_id_code
  ) VALUES (
    NEW.id, NEW.email, v_full_name, v_role, v_phone, v_college_id, v_mess_id,
    v_college_name, v_mess_name, v_hostel_name, v_student_id
  )
  ON CONFLICT (id) DO UPDATE SET
    mess_id = EXCLUDED.mess_id,
    college_id = EXCLUDED.college_id,
    mess_name = EXCLUDED.mess_name,
    college_name = EXCLUDED.college_name,
    hostel_name = EXCLUDED.hostel_name,
    student_id_code = EXCLUDED.student_id_code;

  IF v_role = 'mess_owner' AND v_mess_id IS NOT NULL THEN
    UPDATE public.messes SET owner_id = NEW.id WHERE id = v_mess_id;
  ELSIF v_role = 'student' THEN
    INSERT INTO public.students (
      profile_id, college_id, mess_id, full_name, email,
      student_roll_id, college_name, hostel_name, meal_entitlement_active
    ) VALUES (
      NEW.id, v_college_id, v_mess_id, v_full_name, NEW.email,
      v_student_id, v_college_name, v_hostel_name, TRUE
    )
    ON CONFLICT (profile_id) DO UPDATE SET
      mess_id = EXCLUDED.mess_id,
      college_id = EXCLUDED.college_id,
      college_name = EXCLUDED.college_name,
      hostel_name = EXCLUDED.hostel_name,
      student_roll_id = EXCLUDED.student_roll_id;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES FOR COLLEGES, MESSES, STUDENTS & MENUS
-- ============================================================================

-- Colleges: Readable by all (including unauthenticated students during registration)
DROP POLICY IF EXISTS "Colleges viewable by all" ON public.colleges;
CREATE POLICY "Colleges viewable by all" ON public.colleges
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Colleges manageable by mess owners and admins" ON public.colleges;
CREATE POLICY "Colleges manageable by mess owners and admins" ON public.colleges
  FOR ALL USING (public.current_user_role() IN ('mess_owner', 'super_admin'));

-- Messes: Readable by all (so registration dropdown & join code lookup work); editable by owner or super_admin
DROP POLICY IF EXISTS "Messes viewable by authenticated users" ON public.messes;
CREATE POLICY "Messes viewable by authenticated users" ON public.messes
  FOR SELECT USING (true);

-- Students:
-- 1) Students can read, insert, and update their own student row (including linking mess_id)
-- 2) Mess owners can read ONLY students whose mess_id matches their own mess
-- 3) Super Admin can read/manage all students
DROP POLICY IF EXISTS "Students viewable by self, own mess owner, or admin" ON public.students;
CREATE POLICY "Students viewable by self, own mess owner, or admin" ON public.students
  FOR SELECT USING (
    profile_id = auth.uid()
    OR (mess_id IS NOT NULL AND mess_id = public.current_user_mess_id())
    OR public.current_user_role() = 'super_admin'
  );

DROP POLICY IF EXISTS "Students insertable by self or admin" ON public.students;
CREATE POLICY "Students insertable by self or admin" ON public.students
  FOR INSERT WITH CHECK (
    profile_id = auth.uid()
    OR public.current_user_role() = 'super_admin'
  );

DROP POLICY IF EXISTS "Students updatable by self, own mess owner, or admin" ON public.students;
CREATE POLICY "Students updatable by self, own mess owner, or admin" ON public.students
  FOR UPDATE USING (
    profile_id = auth.uid()
    OR (mess_id IS NOT NULL AND mess_id = public.current_user_mess_id() AND public.current_user_role() = 'mess_owner')
    OR public.current_user_role() = 'super_admin'
  );

-- Menus:
-- Mess owners see all menus for their own mess (including drafts).
-- Students ONLY see menus from their own linked mess AND only when publish_status = 'published'.
DROP POLICY IF EXISTS "Menus viewable by mess members" ON public.menus;
CREATE POLICY "Menus viewable by mess members" ON public.menus
  FOR SELECT USING (
    public.current_user_role() = 'super_admin'
    OR (
      mess_id = public.current_user_mess_id()
      AND (
        public.current_user_role() = 'mess_owner'
        OR publish_status = 'published'
      )
    )
  );

-- Menu Items:
-- Mess owners see all items for their mess.
-- Students ONLY see items belonging to a published menu of their own linked mess.
DROP POLICY IF EXISTS "Menu items viewable by mess members" ON public.menu_items;
CREATE POLICY "Menu items viewable by mess members" ON public.menu_items
  FOR SELECT USING (
    public.current_user_role() = 'super_admin'
    OR (
      mess_id = public.current_user_mess_id()
      AND (
        public.current_user_role() = 'mess_owner'
        OR EXISTS (
          SELECT 1 FROM public.menus m
          WHERE m.id = menu_items.menu_id
            AND m.mess_id = public.current_user_mess_id()
            AND m.publish_status = 'published'
        )
      )
    )
  );

-- Meal Selections:
-- Students can only view/submit meal selections for their own account AND only on published menus of their own mess.
-- Mess owners can view meal selections for their own mess.
DROP POLICY IF EXISTS "Students manage own meal selections" ON public.meal_selections;
DROP POLICY IF EXISTS "Meal selections viewable by student, mess owner, or admin" ON public.meal_selections;
DROP POLICY IF EXISTS "Students insert own selections on published menus only" ON public.meal_selections;
DROP POLICY IF EXISTS "Students update own selections on published menus only" ON public.meal_selections;

CREATE POLICY "Meal selections viewable by student, mess owner, or admin" ON public.meal_selections
  FOR SELECT USING (
    student_id = auth.uid()
    OR mess_id = public.current_user_mess_id()
    OR public.current_user_role() = 'super_admin'
  );

CREATE POLICY "Students insert own selections on published menus only" ON public.meal_selections
  FOR INSERT WITH CHECK (
    student_id = auth.uid()
    AND mess_id = public.current_user_mess_id()
    AND EXISTS (
      SELECT 1 FROM public.menus m
      WHERE m.id = meal_selections.menu_id
        AND m.mess_id = public.current_user_mess_id()
        AND m.publish_status = 'published'
    )
  );

CREATE POLICY "Students update own selections on published menus only" ON public.meal_selections
  FOR UPDATE USING (
    student_id = auth.uid()
    AND mess_id = public.current_user_mess_id()
    AND EXISTS (
      SELECT 1 FROM public.menus m
      WHERE m.id = meal_selections.menu_id
        AND m.mess_id = public.current_user_mess_id()
        AND m.publish_status = 'published'
    )
  );
