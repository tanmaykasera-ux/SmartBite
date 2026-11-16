# Mealwise (SmartBite) — Eat Smart. Waste Less.

**Mealwise (SmartBite)** is an institutional dining management platform designed for **college messes, university hostels, institutional kitchens, and campus cafeterias**.

---

## Business Model & Entitlement Charter

1. **Mess Owners & Institutional Food Operators (Paying Customers):**
   Subscribe to schedule weekly menus, run per-meal attendance polls, forecast plate demand, track kitchen plate waste, and export attendance reports.
2. **Students (100% Free Users):**
   Use the platform free of charge to view Today’s Menu and This Week’s Menu, mark meals they plan to skip before the cutoff, and submit post-meal ratings, complaints, and suggestions.
3. **Unconditional Student Meal Entitlement:**
   Every enrolled student defaults to **Attending** (`1 plate`). Students only mark *"I will NOT be coming"* when they plan to skip a meal, and **students never lose their meal entitlement in any case**.
4. **Institutional SaaS (Not a Food Delivery App):**
   SmartBite is **not** an online food ordering or commercial restaurant delivery website.

---

## Completed Architecture

### 1. Public Marketing Website
- **Landing Page (`src/pages/LandingPage.jsx`):** Hero section, food gallery, problem & solution cards, 4-step workflow, desktop & mobile product previews, features, benefits, indicative pricing, and demo request form.
- **Public Pages:** `/features`, `/pricing`, `/about`, `/contact`, `/request-demo`, `/workspace-preview`, `/login`, `/register`.

### 2. Authentication & Role-Based Access Control (Supabase Auth)
- **Three Roles:**
  1. `mess_owner` → Redirects to `/mess-owner-dashboard`
  2. `student` → Redirects to `/student-dashboard`
  3. `super_admin` → Redirects to `/admin-dashboard`

### 3. Mess Owner Dashboard (`src/pages/MessOwnerDashboardPage.jsx`) — 8 Modules
1. **Overview (`OverviewTab.jsx`):** 6 plate-based KPI cards (`Total Registered Students`, `Plates Expected Today`, `Plates Prepared`, `Plates Served`, `Leftover Plates`, `Waste Cost`), Weekly Kitchen Prep (plates) chart, Daily Leftover Plates Trend chart, and Today’s 3-Meal Poll summary.
2. **Menu Management (`MenuManagementTab.jsx`):** Monday–Sunday Weekly Menu Planner with Breakfast, Lunch, and Dinner rows, Copy Last Week’s Menu, Duplicate a Day, Save Week as Draft, and Publish Week.
3. **Attendance Polls (`StudentSelectionsTab.jsx`):** Per-meal enrolled count, students marked "Not Coming", poll status (`Open`/`Closed` in IST), opt-out rate, expected plates, and the list of students who marked "Not Coming".
4. **Demand Forecasting (`DemandForecastingTab.jsx`):** Plate-based demand forecasting (`Enrolled - Marked Not Coming - Silent No-Shows + Guest Buffer`), recommended preparation in plates, chef overrides, and actual plates served logging.
5. **Food Waste (`FoodWasteTab.jsx`):** Staff entry form for plates prepared, plates served, leftover plates, and cost per plate, with automatic waste percentage and waste cost calculation.
6. **Student Feedback (`StudentFeedbackTab.jsx`):** Dish-wise ratings, filterable reviews/complaints/suggestions, and owner reply workflow.
7. **Reports (`ReportsTab.jsx`):** Real Supabase Attendance Report for the owner’s mess with Daily, Weekly, and Monthly date range filters, summary row, chart, CSV download, and print view.
8. **Settings (`SettingsTab.jsx`):** Mess profile, meal serving windows (`Asia/Kolkata`), poll cutoff hours, guest buffer %, safety buffer %, and default cost per plate.

### 4. Student Dashboard (`src/pages/StudentDashboardPage.jsx`) — 8 Modules
1. **Dashboard**
2. **Today’s Menu**
3. **This Week’s Menu**
4. **Meal Attendance**
5. **Meal History**
6. **Feedback**
7. **Notifications**
8. **My Profile**

---

## Running Locally

```bash
# 1. Copy environment template and add your Supabase URL and Anon Key
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Verify production build
npm run build
```
