-- ============================================================================
-- SmartBite Shared Database Schema Migration (001_shared_schema.sql)
-- Supports: Mess Owner Dashboard, Student Portal, and Super Admin Console
-- Database: PostgreSQL (Supabase)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. COLLEGES & INSTITUTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.colleges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  city TEXT,
  state TEXT,
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. MESSES (OPERATED WITHIN COLLEGES/HOSTELS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
  owner_id UUID, -- Linked to profiles(id) after profile creation
  name TEXT NOT NULL,
  college_name TEXT NOT NULL,
  hostel_name TEXT,
  contact_number TEXT,
  capacity INTEGER NOT NULL DEFAULT 0,
  registered_students INTEGER NOT NULL DEFAULT 0,
  walk_in_buffer_pct INTEGER NOT NULL DEFAULT 8,
  breakfast_time TEXT DEFAULT '07:30 AM - 09:30 AM',
  lunch_time TEXT DEFAULT '12:30 PM - 02:30 PM',
  dinner_time TEXT DEFAULT '07:30 PM - 09:30 PM',
  default_cutoff_hours INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'Onboarding', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. USER PROFILES (LINKED TO SUPABASE AUTH.USERS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('mess_owner', 'student', 'super_admin')),
  phone TEXT,
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  mess_id UUID REFERENCES public.messes(id) ON DELETE SET NULL,
  college_name TEXT,
  mess_name TEXT,
  hostel_name TEXT,
  student_id_code TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.messes
  DROP CONSTRAINT IF EXISTS fk_messes_owner;
ALTER TABLE public.messes
  ADD CONSTRAINT fk_messes_owner
  FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ============================================================================
-- 4. STUDENTS TABLE (EXTENDED STUDENT RECORD & ENTITLEMENT GUARANTEE)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
  mess_id UUID REFERENCES public.messes(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  student_roll_id TEXT NOT NULL,
  college_name TEXT NOT NULL,
  hostel_name TEXT NOT NULL,
  room_number TEXT,
  dietary_preference TEXT NOT NULL DEFAULT 'vegetarian' CHECK (dietary_preference IN ('vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'jain')),
  meal_entitlement_active BOOLEAN NOT NULL DEFAULT TRUE, -- Guaranteed regardless of selection submission
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. MENUS (DAILY SCHEDULED BREAKFAST, LUNCH, DINNER)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mess_id UUID NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
  menu_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  title TEXT,
  publish_status TEXT NOT NULL DEFAULT 'draft' CHECK (publish_status IN ('draft', 'published', 'archived')),
  selection_deadline TIMESTAMPTZ,
  notes TEXT,
  total_calories INTEGER NOT NULL DEFAULT 0,
  total_protein NUMERIC(6,1) NOT NULL DEFAULT 0,
  total_carbs NUMERIC(6,1) NOT NULL DEFAULT 0,
  total_fats NUMERIC(6,1) NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mess_id, menu_date, meal_type)
);

-- ============================================================================
-- 6. MENU ITEMS / DISHES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  mess_id UUID NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  serving_size TEXT NOT NULL DEFAULT '1 Bowl (150g)',
  calories INTEGER NOT NULL DEFAULT 180,
  protein NUMERIC(6,1) NOT NULL DEFAULT 8.0,
  carbs NUMERIC(6,1) NOT NULL DEFAULT 24.0,
  fats NUMERIC(6,1) NOT NULL DEFAULT 6.0,
  ingredients TEXT[] DEFAULT '{}',
  dietary_tag TEXT DEFAULT 'veg' CHECK (dietary_tag IN ('veg', 'non_veg', 'egg', 'vegan', 'jain')),
  per_serving_raw_kg NUMERIC(6,3) DEFAULT 0.120,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. MEAL SELECTIONS (STUDENT PREFERENCES — NON-RESTRICTIVE)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.meal_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  mess_id UUID NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  will_attend BOOLEAN NOT NULL DEFAULT TRUE,
  portion_preference TEXT NOT NULL DEFAULT 'regular' CHECK (portion_preference IN ('light', 'regular', 'extra')),
  entitlement_retained BOOLEAN NOT NULL DEFAULT TRUE, -- Always true by business rule
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(menu_id, student_id)
);

-- ============================================================================
-- 8. SELECTION ITEMS (INDIVIDUAL DISH SELECTIONS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.selection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_selection_id UUID NOT NULL REFERENCES public.meal_selections(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  selected BOOLEAN NOT NULL DEFAULT TRUE,
  servings NUMERIC(3,1) NOT NULL DEFAULT 1.0,
  UNIQUE(meal_selection_id, menu_item_id)
);

-- ============================================================================
-- 9. ATTENDANCE RECORDS (ACTUAL DINING HALL TURNOUT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mess_id UUID NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
  menu_id UUID REFERENCES public.menus(id) ON DELETE SET NULL,
  record_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  total_registered INTEGER NOT NULL DEFAULT 0,
  selected_count INTEGER NOT NULL DEFAULT 0,
  unselected_walkin_count INTEGER NOT NULL DEFAULT 0,
  actual_attended_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. FOOD WASTE LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.food_waste_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mess_id UUID NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
  menu_id UUID REFERENCES public.menus(id) ON DELETE SET NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  dish_name TEXT DEFAULT 'Full Meal Batch',
  prepared_kg NUMERIC(8,2) NOT NULL CHECK (prepared_kg >= 0),
  consumed_kg NUMERIC(8,2) NOT NULL CHECK (consumed_kg >= 0),
  leftover_kg NUMERIC(8,2) NOT NULL CHECK (leftover_kg >= 0),
  unit_cost_inr NUMERIC(8,2) NOT NULL DEFAULT 140.00,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- Total estimated waste cost in INR
  waste_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  logged_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 11. INVENTORY ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mess_id UUID NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Grains & Pulses',
  current_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  minimum_stock NUMERIC(10,2) NOT NULL DEFAULT 10,
  unit TEXT NOT NULL DEFAULT 'kg',
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 60.00,
  expiry_date DATE,
  supplier_name TEXT,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 12. INVENTORY TRANSACTIONS (PURCHASES & CONSUMPTION)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mess_id UUID NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'consumption', 'adjustment')),
  quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(10,2) DEFAULT 0,
  total_cost NUMERIC(12,2) DEFAULT 0,
  reference_note TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 13. STUDENT FEEDBACK (RATINGS, REVIEWS, COMPLAINTS, SUGGESTIONS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mess_id UUID NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
  menu_id UUID REFERENCES public.menus(id) ON DELETE SET NULL,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_name TEXT DEFAULT 'Hostel Resident',
  meal_type TEXT NOT NULL DEFAULT 'lunch' CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  dish_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback_type TEXT NOT NULL DEFAULT 'review' CHECK (feedback_type IN ('review', 'complaint', 'suggestion')),
  review TEXT,
  complaint TEXT,
  suggestion TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved')),
  owner_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 14. NOTIFICATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mess_id UUID REFERENCES public.messes(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_role TEXT DEFAULT 'student' CHECK (recipient_role IN ('mess_owner', 'student', 'super_admin', 'all')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'menu_published' CHECK (notification_type IN ('menu_published', 'low_stock', 'waste_alert', 'feedback_alert', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 15. DEMAND FORECASTS & 16. FORECAST OVERRIDES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mess_id UUID NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
  menu_id UUID REFERENCES public.menus(id) ON DELETE SET NULL,
  forecast_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  dish_name TEXT NOT NULL,
  registered_students INTEGER NOT NULL DEFAULT 0,
  student_selections_count INTEGER NOT NULL DEFAULT 0,
  walk_in_buffer_count INTEGER NOT NULL DEFAULT 0,
  expected_attendance INTEGER NOT NULL DEFAULT 0,
  predicted_quantity_kg NUMERIC(8,2) NOT NULL DEFAULT 0,
  recommended_prep_kg NUMERIC(8,2) NOT NULL DEFAULT 0,
  confidence_score NUMERIC(5,2) NOT NULL DEFAULT 94.5,
  uncertainty_margin_kg NUMERIC(6,2) NOT NULL DEFAULT 4.5,
  assumptions JSONB NOT NULL DEFAULT '{"weather": "Normal", "day_type": "Regular Weekday", "walkin_buffer_pct": 12}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forecast_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  forecast_id UUID NOT NULL REFERENCES public.forecasts(id) ON DELETE CASCADE,
  mess_id UUID NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
  overridden_prep_kg NUMERIC(8,2) NOT NULL,
  reason TEXT NOT NULL,
  overridden_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 17. HOLIDAYS & CAMPUS EVENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.holidays_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mess_id UUID NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'holiday' CHECK (event_type IN ('holiday', 'exam_week', 'campus_fest', 'weekend_exodus')),
  expected_attendance_impact_pct NUMERIC(5,2) NOT NULL DEFAULT -25.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 18. SUBSCRIPTION PLANS, 19. SUBSCRIPTIONS & 20. PAYMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  monthly_price_inr NUMERIC(10,2) NOT NULL,
  annual_price_inr NUMERIC(10,2) NOT NULL,
  max_students INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_indicative BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mess_id UUID NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  plan_name TEXT NOT NULL DEFAULT 'Professional',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('trial', 'active', 'past_due', 'cancelled')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  current_period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  current_period_end DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  mess_id UUID NOT NULL REFERENCES public.messes(id) ON DELETE CASCADE,
  amount_inr NUMERIC(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'UPI / NEFT Institutional',
  invoice_number TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 21. SUPPORT TICKETS, 22. DEMO REQUESTS & 23. CONTACT MESSAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mess_id UUID REFERENCES public.messes(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.demo_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  mess_name TEXT,
  institution_type TEXT NOT NULL DEFAULT 'college_mess',
  daily_meals_served INTEGER NOT NULL DEFAULT 500,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'converted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  institution_name TEXT,
  topic TEXT NOT NULL DEFAULT 'General Inquiry',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'replied', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_mess_id ON public.profiles(mess_id);
CREATE INDEX IF NOT EXISTS idx_menus_mess_date ON public.menus(mess_id, menu_date);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON public.menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_meal_selections_menu_id ON public.meal_selections(menu_id);
CREATE INDEX IF NOT EXISTS idx_food_waste_logs_mess_date ON public.food_waste_logs(mess_id, log_date);
CREATE INDEX IF NOT EXISTS idx_inventory_items_mess_id ON public.inventory_items(mess_id);
CREATE INDEX IF NOT EXISTS idx_feedback_mess_id ON public.feedback(mess_id);
CREATE INDEX IF NOT EXISTS idx_notifications_mess_id ON public.notifications(mess_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_mess_date ON public.forecasts(mess_id, forecast_date);

-- ============================================================================
-- TRIGGER: AUTO-CREATE PROFILE, COLLEGE/MESS OR STUDENT RECORD ON AUTH SIGNUP
-- ============================================================================
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
  v_college_id UUID;
  v_mess_id UUID;
BEGIN
  -- Security Guard: Never allow public signup to self-assign super_admin
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  IF v_role NOT IN ('mess_owner', 'student') THEN
    v_role := 'student';
  END IF;

  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_college_name := COALESCE(NEW.raw_user_meta_data->>'college_name', 'Partner Institution');
  v_mess_name := COALESCE(NEW.raw_user_meta_data->>'mess_name', v_college_name || ' Central Mess');
  v_hostel_name := COALESCE(NEW.raw_user_meta_data->>'hostel_name', 'Hostel Block A');
  v_student_id := COALESCE(NEW.raw_user_meta_data->>'student_id_code', 'STU-' || substr(NEW.id::text, 1, 6));
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');

  -- Create or lookup college
  INSERT INTO public.colleges (name)
  VALUES (v_college_name)
  RETURNING id INTO v_college_id;

  IF v_role = 'mess_owner' THEN
    INSERT INTO public.messes (college_id, name, college_name, contact_number, capacity, registered_students)
    VALUES (v_college_id, v_mess_name, v_college_name, v_phone, 0, 0)
    RETURNING id INTO v_mess_id;
  ELSE
    SELECT id INTO v_mess_id
    FROM public.messes
    WHERE LOWER(name) = LOWER(v_mess_name)
       OR LOWER(college_name) = LOWER(v_college_name)
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, role, phone, college_id, mess_id,
    college_name, mess_name, hostel_name, student_id_code
  ) VALUES (
    NEW.id, NEW.email, v_full_name, v_role, v_phone, v_college_id, v_mess_id,
    v_college_name, v_mess_name, v_hostel_name, v_student_id
  );

  IF v_role = 'mess_owner' AND v_mess_id IS NOT NULL THEN
    UPDATE public.messes SET owner_id = NEW.id WHERE id = v_mess_id;
  ELSIF v_role = 'student' THEN
    INSERT INTO public.students (
      profile_id, college_id, mess_id, full_name, email,
      student_roll_id, college_name, hostel_name, meal_entitlement_active
    ) VALUES (
      NEW.id, v_college_id, v_mess_id, v_full_name, NEW.email,
      v_student_id, v_college_name, v_hostel_name, TRUE
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS role & mess checks
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_mess_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT mess_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Profiles: Users can read/update their own profile; mess owners can read students in their mess; super_admin can read all
CREATE POLICY "Profiles viewable by self, mess owner, or admin" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR mess_id = public.current_user_mess_id()
    OR public.current_user_role() = 'super_admin'
  );

CREATE POLICY "Profiles updatable by self or admin" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.current_user_role() = 'super_admin');

-- Messes: Publicly readable for student registration lookup; editable by owner or super_admin
CREATE POLICY "Messes viewable by authenticated users" ON public.messes
  FOR SELECT USING (true);

CREATE POLICY "Messes editable by owner or admin" ON public.messes
  FOR ALL USING (owner_id = auth.uid() OR id = public.current_user_mess_id() OR public.current_user_role() = 'super_admin');

-- Menus & Menu Items: Readable by members of the mess; writable by mess_owner or super_admin
CREATE POLICY "Menus viewable by mess members" ON public.menus
  FOR SELECT USING (mess_id = public.current_user_mess_id() OR public.current_user_role() = 'super_admin');

CREATE POLICY "Menus manageable by mess owner" ON public.menus
  FOR ALL USING (
    (mess_id = public.current_user_mess_id() AND public.current_user_role() IN ('mess_owner', 'super_admin'))
    OR public.current_user_role() = 'super_admin'
  );

CREATE POLICY "Menu items viewable by mess members" ON public.menu_items
  FOR SELECT USING (mess_id = public.current_user_mess_id() OR public.current_user_role() = 'super_admin');

CREATE POLICY "Menu items manageable by mess owner" ON public.menu_items
  FOR ALL USING (
    (mess_id = public.current_user_mess_id() AND public.current_user_role() IN ('mess_owner', 'super_admin'))
    OR public.current_user_role() = 'super_admin'
  );

-- Meal Selections: Students manage own selections; mess owners read selections for their mess
CREATE POLICY "Students manage own meal selections" ON public.meal_selections
  FOR ALL USING (
    student_id = auth.uid()
    OR mess_id = public.current_user_mess_id()
    OR public.current_user_role() = 'super_admin'
  );

CREATE POLICY "Selection items access" ON public.selection_items
  FOR ALL USING (true);

-- Mess Owner Operational Tables (Waste, Inventory, Forecasts, Attendance)
CREATE POLICY "Mess operational waste logs access" ON public.food_waste_logs
  FOR ALL USING (mess_id = public.current_user_mess_id() OR public.current_user_role() = 'super_admin');

CREATE POLICY "Mess inventory items access" ON public.inventory_items
  FOR ALL USING (mess_id = public.current_user_mess_id() OR public.current_user_role() = 'super_admin');

CREATE POLICY "Mess inventory transactions access" ON public.inventory_transactions
  FOR ALL USING (mess_id = public.current_user_mess_id() OR public.current_user_role() = 'super_admin');

CREATE POLICY "Mess forecasts access" ON public.forecasts
  FOR ALL USING (mess_id = public.current_user_mess_id() OR public.current_user_role() = 'super_admin');

CREATE POLICY "Mess forecast overrides access" ON public.forecast_overrides
  FOR ALL USING (mess_id = public.current_user_mess_id() OR public.current_user_role() = 'super_admin');

CREATE POLICY "Feedback accessible by student author, mess owner, or admin" ON public.feedback
  FOR ALL USING (
    student_id = auth.uid()
    OR mess_id = public.current_user_mess_id()
    OR public.current_user_role() = 'super_admin'
  );

CREATE POLICY "Notifications accessible by mess members" ON public.notifications
  FOR ALL USING (
    recipient_id = auth.uid()
    OR mess_id = public.current_user_mess_id()
    OR public.current_user_role() = 'super_admin'
  );

-- Public Lead Capture Tables (Demo Requests & Contact Messages)
CREATE POLICY "Anyone can insert demo requests" ON public.demo_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins view demo requests" ON public.demo_requests
  FOR SELECT USING (public.current_user_role() IN ('super_admin', 'mess_owner'));

CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins view contact messages" ON public.contact_messages
  FOR SELECT USING (public.current_user_role() = 'super_admin');

CREATE POLICY "Subscription plans viewable by all" ON public.subscription_plans
  FOR SELECT USING (true);

-- ============================================================================
-- SUPABASE STORAGE BUCKET FOR FOOD IMAGES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for food images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'food-images');

CREATE POLICY "Authenticated mess owners can upload food images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'food-images' AND auth.role() = 'authenticated');
