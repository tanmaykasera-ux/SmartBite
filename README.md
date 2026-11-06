# SmartBite — Eat Smart. Waste Less.

**SmartBite** is an AI-powered food management and nutrition intelligence SaaS platform designed for **college messes, university hostels, institutional kitchens, and campus cafeterias**.

---

## Business Model & Entitlement Charter

1. **Mess Owners & Institutional Food Operators (Paying Customers):**
   Subscribe to SmartBite to schedule menus, forecast dish-level food demand, track kitchen waste, manage inventory, and plan raw material purchases.
2. **Students (100% Free Users):**
   Use SmartBite free of charge to inspect daily calories and macro-nutrients, select preferred meals/dishes, and submit post-meal ratings, complaints, and suggestions.
3. **Unconditional Student Meal Entitlement:**
   Student meal selections help mess owners estimate demand, **but students always retain 100% of their existing meal entitlement regardless of whether they submit a selection**. Our AI Walk-In Buffer automatically accounts for unpolled students.
4. **Institutional SaaS (Not a Food Delivery App):**
   SmartBite is **not** an online food ordering or commercial restaurant delivery website.

---

## Completed Architecture (Parts A, B, C & D)

### PART A — Premium Startup Landing Page (`src/pages/LandingPage.jsx`)
1. **Navbar (`src/components/layout/Navbar.jsx`):** SmartBite logo, Home, Features, How It Works, Pricing, About Us, Login button, Get a Demo button, plus live connection status badge.
2. **Hero Section:** *"Smarter Kitchens. Less Waste. Better Profits."* with subheading, `Request a Demo` and `Explore Features` CTAs, and interactive Mess Owner Dashboard preview.
3. **Problem Section:** Excessive food preparation, Food wastage, Poor inventory management, Unpredictable daily demand, Lack of nutritional transparency.
4. **Solution Section:** AI demand forecasting, Food waste tracking, Smart inventory management, Student meal preferences, Nutrition intelligence.
5. **How It Works:** 4-step workflow (Mess uploads daily menu → Students select meal preferences → SmartBite analyzes the data → Mess receives preparation recommendations).
6. **Features Section:** 8 comprehensive feature cards.
7. **Benefits Section:** Quantified operational ROI and satisfaction metrics for mess owners and institutions.
8. **Pricing Section:** `Starter`, `Professional`, and `Enterprise` plans clearly marked as **Proposed Indicative Pricing** (Students ₹0 Free).
9. **Request a Demo Section:** Validated lead capture form saving directly to Supabase `demo_requests` (with Demo Mode persistence fallback).
10. **Footer (`src/components/layout/Footer.jsx`):** Contact details, navigation links, portal links, and social media links.

---

### PART B — Authentication & Role-Based Access Control (Supabase Auth)
- **Three Roles:**
  1. `mess_owner` → Redirects to `/mess-owner-dashboard`
  2. `student` → Redirects to `/student-dashboard`
  3. `super_admin` → Redirects to `/admin-dashboard`
- **Role-Specific Public Registration (`src/pages/RegisterPage.jsx`):**
  - **Mess Owner:** Full name, email, password, mess name, college/institution name, contact number.
  - **Student:** Full name, email, password, college name, hostel name, student ID.
  - **Super Admin:** Public registration is strictly prohibited and blocked both in the UI and in the PostgreSQL `handle_new_user()` trigger.
- **Password Recovery:** Forgot Password (`/forgot-password`) and Reset Password (`/reset-password`).
- **Protected Routes (`src/components/auth/ProtectedRoute.jsx`):**
  - Prevents students from accessing Mess Owner pages (`/mess-owner-dashboard`).
  - Prevents mess owners and students from accessing Super Admin pages (`/admin-dashboard`).
- **Clearly Separated Demo Mode:**
  - When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not configured in `.env`, the app displays a clear **Demo Mode** banner and provides dedicated Demo Role Launchers on `/login` without pretending live Supabase Auth is connected.

#### Secure Super Admin Provisioning Procedure
To create a `super_admin` account securely in Supabase:
1. Register a standard account via `/register` or create a user in **Supabase Dashboard → Authentication → Users**.
2. Open the **Supabase SQL Editor** (accessible only to project administrators) and run:
   ```sql
   UPDATE public.profiles
   SET role = 'super_admin'
   WHERE email = 'admin@yourdomain.com';
   ```

---

### PART C — Shared Database Schema (`supabase/migrations/`)
Run the SQL migration files in your Supabase SQL Editor in order:
1. `supabase/migrations/001_shared_schema.sql` — Creates all 23 shared tables (`colleges`, `messes`, `profiles`, `students`, `menus`, `menu_items`, `meal_selections`, `selection_items`, `attendance_records`, `food_waste_logs`, `inventory_items`, `inventory_transactions`, `feedback`, `notifications`, `forecasts`, `forecast_overrides`, `holidays_events`, `subscription_plans`, `subscriptions`, `payments`, `support_tickets`, `demo_requests`, `contact_messages`), foreign keys, performance indexes, `handle_new_user()` auth trigger, Row Level Security (RLS) policies, and the `food-images` Supabase Storage bucket.
2. `supabase/migrations/002_seed_plans_and_admin_guide.sql` — Seeds the subscription plans (`Starter`, `Professional`, `Enterprise`).

---

### PART D — Complete Mess Owner Dashboard (`src/pages/MessOwnerDashboardPage.jsx`)
Includes a collapsible sidebar, top navigation bar, notifications dropdown, profile dropdown, and all **11 functional modules**:
1. **Overview (`OverviewTab.jsx`):** 6 KPI cards, Breakfast/Lunch/Dinner summary, Weekly food consumption chart, Food waste trend chart, Popular dishes, Low inventory alerts, Recent student feedback.
2. **Menu Management (`MenuManagementTab.jsx`):** Create/schedule Breakfast, Lunch, and Dinner menus by date, add/edit/delete dishes, upload dish images, set selection deadlines, save as draft, and publish (automatically sends student notifications).
3. **Student Selections (`StudentSelectionsTab.jsx`):** Meal-wise and dish-wise selection counts, filterable list of students who have not submitted preferences (with Entitlement Retained status), and 7-day historical selection chart.
4. **Demand Forecasting (`DemandForecastingTab.jsx`):** Expected attendance, dish-wise predicted and recommended preparation quantities (`kg`), confidence & uncertainty margins, chef override controls, and historical demand chart.
5. **Food Waste (`FoodWasteTab.jsx`):** Staff entry form for prepared, consumed, and leftover kilograms + unit cost, real-time automatic calculation of waste percentage and waste cost, and daily/weekly waste trend charts.
6. **Inventory (`InventoryTab.jsx`):** Add ingredients, set minimum stock thresholds, record stock purchases (`+`) and kitchen consumption (`-`), track expiry dates, and filter low-stock alerts.
7. **Purchase Planning (`PurchasePlanningTab.jsx`):** Automatically generates a suggested purchase order from upcoming menus, current stock, and expected attendance, with one-click stock receipt and CSV export.
8. **Student Feedback (`StudentFeedbackTab.jsx`):** Dish-wise satisfaction ratings, filterable reviews/complaints/suggestions, and owner reply & resolution workflow.
9. **Nutrition Analytics (`NutritionAnalyticsTab.jsx`):** Daily and weekly macro-nutrient composition charts and meal-by-meal nutritional compliance table.
10. **Reports (`ReportsTab.jsx`):** Daily, weekly, and monthly reports with one-click CSV download and print/PDF view.
11. **Settings (`SettingsTab.jsx`):** Mess profile, meal timings, cutoff hours, walk-in safety buffer %, and account password settings.

---

## Running Locally

```bash
# 1. Copy environment template and add your Supabase URL and Anon Key (never use service_role key in frontend)
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Verify production build
npm run build
```

tk