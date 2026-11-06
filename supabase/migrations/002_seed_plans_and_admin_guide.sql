-- ============================================================================
-- SmartBite Seed Migration (002_seed_plans_and_admin_guide.sql)
-- Seeds Subscription Plans & Documents Secure Super Admin Creation
-- ============================================================================

INSERT INTO public.subscription_plans (code, name, monthly_price_inr, annual_price_inr, max_students, features, is_indicative)
VALUES
  (
    'starter',
    'Starter',
    7999.00,
    6499.00,
    400,
    '["Up to 400 enrolled students (Free student accounts)", "Daily Menu Scheduling & Macro Tagging", "Student Meal Selection Polling (Non-restrictive)", "Basic Food Waste Logging & Cost Calculator", "Standard Email Support"]'::jsonb,
    true
  ),
  (
    'professional',
    'Professional',
    16999.00,
    13999.00,
    1500,
    '["Up to 1,500 enrolled students (Free student accounts)", "AI Demand Forecasting & Walk-In Safety Buffer", "Smart Inventory & Automated Purchase Planning", "Dish-Wise Student Feedback & Nutrition Analytics", "Daily, Weekly & Monthly CSV/PDF Reports", "Priority Kitchen Operations Support"]'::jsonb,
    true
  ),
  (
    'enterprise',
    'Enterprise',
    34999.00,
    28999.00,
    10000,
    '["Unlimited Hostel Blocks & Multi-Mess Campus Hierarchy", "Custom Forecast Overrides & Holiday/Exam Modeling", "ICMR-NIN Institutional Nutrition Audit & ESG Reports", "Dedicated Account Manager & Staff Onboarding", "Custom ERP / Biometric Attendance Integration"]'::jsonb,
    true
  )
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SECURE SUPER ADMIN PROMOTION PROCEDURE
-- Note: Public signup cannot register as super_admin.
-- To promote a verified user account to super_admin, run the following SQL
-- inside the Supabase SQL Editor (requires database owner privileges):
--
-- UPDATE public.profiles
-- SET role = 'super_admin'
-- WHERE email = 'admin@yourdomain.com';
-- ============================================================================
