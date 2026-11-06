-- ============================================================================
-- SmartBite PostgreSQL Schema for Supabase
-- AI-Powered Food Management & Nutrition Intelligence Platform
-- Business Rules:
--   1. Institutions / Mess Operators are paying SaaS subscribers.
--   2. Students are free users linked to an institution.
--   3. Students retain full meal entitlement regardless of pre-selection status.
--   4. Student selections & attendance history feed AI demand estimation.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Institutions (Messes, Hostels, Campus Cafeterias)
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('college_mess', 'hostel', 'university_cafeteria', 'corporate_kitchen')),
  city TEXT,
  state TEXT,
  total_enrolled_students INTEGER NOT NULL DEFAULT 500,
  subscription_tier TEXT NOT NULL DEFAULT 'growth' CHECK (subscription_tier IN ('starter', 'growth', 'enterprise')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Profiles (Mess Operators & Students)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('mess_owner', 'kitchen_manager', 'nutritionist', 'student')),
  roll_number TEXT,
  hostel_block TEXT,
  dietary_preference TEXT DEFAULT 'vegetarian' CHECK (dietary_preference IN ('vegetarian', 'non_vegetarian', 'vegan', 'jain', 'eggetarian')),
  entitlement_active BOOLEAN NOT NULL DEFAULT TRUE, -- Guaranteed meal entitlement regardless of pre-selection
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Daily Menus & Nutrition Intelligence
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  meal_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_calories INTEGER NOT NULL DEFAULT 650,
  protein_grams NUMERIC(5,1) NOT NULL DEFAULT 22.0,
  carbs_grams NUMERIC(5,1) NOT NULL DEFAULT 85.0,
  fats_grams NUMERIC(5,1) NOT NULL DEFAULT 18.0,
  predicted_headcount INTEGER,
  actual_headcount INTEGER,
  prepared_kg NUMERIC(6,2),
  wasted_kg NUMERIC(6,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(institution_id, meal_date, meal_type)
);

-- 4. Student Meal Selections (Demand Signal — Non-Restrictive)
CREATE TABLE IF NOT EXISTS meal_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attending_intent TEXT NOT NULL DEFAULT 'attending' CHECK (attending_intent IN ('attending', 'skipping', 'light_portion')),
  preferred_items JSONB DEFAULT '[]'::jsonb,
  entitlement_preserved BOOLEAN NOT NULL DEFAULT TRUE, -- Always true: student never loses meal access
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(menu_id, student_id)
);

-- 5. Student Meal Feedback & Waste Rating
CREATE TABLE IF NOT EXISTS meal_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  taste_rating INTEGER NOT NULL CHECK (taste_rating BETWEEN 1 AND 5),
  nutrition_satisfaction INTEGER CHECK (nutrition_satisfaction BETWEEN 1 AND 5),
  portion_feedback TEXT CHECK (portion_feedback IN ('too_little', 'just_right', 'too_much')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Demo Requests (B2B Lead Capture)
CREATE TABLE IF NOT EXISTS demo_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  institution_type TEXT NOT NULL,
  daily_meals_served INTEGER NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'converted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
