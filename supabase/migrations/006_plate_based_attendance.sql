-- ============================================================================
-- MIGRATION 006: PLATE-BASED ATTENDANCE POLLS, WEEKLY MENU & PLATE ANALYTICS
-- ============================================================================
-- Additive migration using CREATE and ALTER statements only.
-- Preserves all existing tables, data, authentication, and 005 RLS policies.
-- ============================================================================

-- 1. ADD STRUCTURED MEAL TIMINGS, CUTOFF & PLATE BUFFERS TO public.messes
ALTER TABLE public.messes
  ADD COLUMN IF NOT EXISTS breakfast_start TIME DEFAULT '07:30',
  ADD COLUMN IF NOT EXISTS breakfast_end TIME DEFAULT '09:30',
  ADD COLUMN IF NOT EXISTS lunch_start TIME DEFAULT '12:30',
  ADD COLUMN IF NOT EXISTS lunch_end TIME DEFAULT '14:30',
  ADD COLUMN IF NOT EXISTS dinner_start TIME DEFAULT '19:30',
  ADD COLUMN IF NOT EXISTS dinner_end TIME DEFAULT '21:30',
  ADD COLUMN IF NOT EXISTS cutoff_hours NUMERIC(4,1) DEFAULT 2.0,
  ADD COLUMN IF NOT EXISTS guest_buffer_pct NUMERIC(5,2) DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS safety_buffer_pct NUMERIC(5,2) DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS cost_per_plate NUMERIC(10,2) DEFAULT 65.00;

-- 2. ADD WEEKLY MENU COLUMNS TO public.menus
ALTER TABLE public.menus
  ADD COLUMN IF NOT EXISTS week_start_date DATE,
  ADD COLUMN IF NOT EXISTS day_of_week SMALLINT CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6)),
  ADD COLUMN IF NOT EXISTS day_name TEXT;

CREATE INDEX IF NOT EXISTS idx_menus_mess_week_start
  ON public.menus(mess_id, week_start_date, menu_date, meal_type);

-- 3. ADD PER-PLATE INGREDIENT QUANTITIES TO public.menu_items & public.inventory_items
-- ingredient_quantities stores JSON array: [{"name": "Fresh Paneer", "quantity_per_plate": 60, "unit": "g"}, ...]
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS ingredient_quantities JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS quantity_per_plate NUMERIC(10,3),
  ADD COLUMN IF NOT EXISTS plate_unit TEXT DEFAULT 'g' CHECK (plate_unit IS NULL OR plate_unit IN ('g', 'ml', 'pieces'));

-- 4. CREATE TABLE public.meal_attendance_responses (PER-MEAL ATTENDANCE POLLS)
-- Default state for every enrolled student is 'attending' (will_attend = TRUE).
-- Students use this poll to mark 'not_coming' (or undo back to 'attending') before the cutoff.
CREATE TABLE IF NOT EXISTS public.meal_attendance_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mess_id UUID NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  menu_id UUID REFERENCES public.menus(id) ON DELETE SET NULL,
  meal_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  status TEXT NOT NULL DEFAULT 'attending' CHECK (status IN ('attending', 'not_coming')),
  will_attend BOOLEAN NOT NULL DEFAULT TRUE,
  opens_at TIMESTAMPTZ,
  cutoff_at TIMESTAMPTZ,
  entitlement_retained BOOLEAN NOT NULL DEFAULT TRUE,
  responded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mess_id, student_id, meal_date, meal_type)
);

CREATE INDEX IF NOT EXISTS idx_meal_attendance_responses_mess_date_meal
  ON public.meal_attendance_responses(mess_id, meal_date, meal_type);

CREATE INDEX IF NOT EXISTS idx_meal_attendance_responses_student_date
  ON public.meal_attendance_responses(student_id, meal_date);

ALTER TABLE public.meal_attendance_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public.meal_attendance_responses (idempotent creation without DROP)
DO $$
BEGIN
  -- Policy 1: Students can SELECT their own attendance responses for their own mess
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'meal_attendance_responses'
      AND policyname = 'Students can read own meal attendance responses'
  ) THEN
    CREATE POLICY "Students can read own meal attendance responses"
      ON public.meal_attendance_responses
      FOR SELECT
      TO authenticated
      USING (
        student_id = auth.uid()
        AND mess_id = public.current_user_mess_id()
      );
  END IF;

  -- Policy 2: Mess owners can SELECT attendance responses for their own mess only
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'meal_attendance_responses'
      AND policyname = 'Mess owners can read mess attendance responses'
  ) THEN
    CREATE POLICY "Mess owners can read mess attendance responses"
      ON public.meal_attendance_responses
      FOR SELECT
      TO authenticated
      USING (
        public.is_super_admin()
        OR mess_id = public.current_user_mess_id()
        OR EXISTS (
          SELECT 1
          FROM public.messes m
          WHERE m.id = meal_attendance_responses.mess_id
            AND m.owner_id = auth.uid()
        )
      );
  END IF;

  -- Policy 3: Students can INSERT their own response for their own mess before cutoff
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'meal_attendance_responses'
      AND policyname = 'Students can insert own meal attendance response before cutoff'
  ) THEN
    CREATE POLICY "Students can insert own meal attendance response before cutoff"
      ON public.meal_attendance_responses
      FOR INSERT
      TO authenticated
      WITH CHECK (
        student_id = auth.uid()
        AND mess_id = public.current_user_mess_id()
        AND (cutoff_at IS NULL OR NOW() <= cutoff_at)
      );
  END IF;

  -- Policy 4: Students can UPDATE their own response for their own mess before cutoff
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'meal_attendance_responses'
      AND policyname = 'Students can update own meal attendance response before cutoff'
  ) THEN
    CREATE POLICY "Students can update own meal attendance response before cutoff"
      ON public.meal_attendance_responses
      FOR UPDATE
      TO authenticated
      USING (
        student_id = auth.uid()
        AND mess_id = public.current_user_mess_id()
        AND (cutoff_at IS NULL OR NOW() <= cutoff_at)
      )
      WITH CHECK (
        student_id = auth.uid()
        AND mess_id = public.current_user_mess_id()
        AND (cutoff_at IS NULL OR NOW() <= cutoff_at)
      );
  END IF;
END $$;

-- 5. ADD PLATE-BASED COLUMNS TO public.food_waste_logs
ALTER TABLE public.food_waste_logs
  ADD COLUMN IF NOT EXISTS plates_prepared INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS plates_served INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leftover_plates INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cost_per_plate NUMERIC(10,2) DEFAULT 65.00;

-- 6. ADD PLATE-BASED FORECAST & ATTENDANCE COLUMNS TO public.demand_forecasts & public.attendance_records
ALTER TABLE public.demand_forecasts
  ADD COLUMN IF NOT EXISTS enrolled_students INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS not_coming_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS silent_no_shows_est INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS guest_buffer_plates INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expected_plates INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recommended_prep_plates INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overridden_prep_plates INTEGER,
  ADD COLUMN IF NOT EXISTS actual_served_plates INTEGER,
  ADD COLUMN IF NOT EXISTS uncertainty_margin_plates INTEGER DEFAULT 0;

ALTER TABLE public.attendance_records
  ADD COLUMN IF NOT EXISTS not_coming_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expected_plates INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS plates_prepared INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS plates_served INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leftover_plates INTEGER DEFAULT 0;
