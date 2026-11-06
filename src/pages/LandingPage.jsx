import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  TrendingDown,
  Salad,
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Scale,
  AlertTriangle,
  PackageSearch,
  HelpCircle,
  BrainCircuit,
  CalendarCheck,
  ClipboardList,
  MessageSquareHeart,
  FileSpreadsheet,
  UploadCloud,
  CheckSquare,
  Cpu,
  ChefHat,
  TrendingUp,
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import SectionHeader from '../components/common/SectionHeader';
import { WasteReductionAreaChart } from '../components/analytics/WasteReductionChart';
import { pricingPlans } from '../data/mockData';
import { submitDemoRequest, isSupabaseConfigured } from '../lib/supabase';

const problemsList = [
  {
    icon: Scale,
    title: 'Excessive Food Preparation',
    description:
      'Institutional kitchens routinely cook for 100% of enrolled capacity even when 18–30% of students skip meals due to lectures, internships, or weekend travel.',
    stat: '24% avg. overproduction',
  },
  {
    icon: TrendingDown,
    title: 'Massive Daily Food Wastage',
    description:
      'Hundreds of kilograms of cooked rice, dal, curries, and rotis end up in wet-waste bins every week—draining ₹1.5L–₹3.5L+ monthly from mess operating margins.',
    stat: '350+ kg wasted/week',
  },
  {
    icon: PackageSearch,
    title: 'Poor Inventory Management',
    description:
      'Manual register logs lead to sudden stockouts of critical staples like paneer and pulses, or spoilage from untracked expiry dates in the dry store.',
    stat: '14% spoilage & pilferage',
  },
  {
    icon: HelpCircle,
    title: 'Unpredictable Daily Demand',
    description:
      'Exam schedules, rainy evenings, campus fests, and dish popularity swings make headcount estimation a daily guessing game for head chefs.',
    stat: '±32% turnout variance',
  },
  {
    icon: Salad,
    title: 'Lack of Nutritional Transparency',
    description:
      'Paper noticeboard menus offer zero visibility into calories, protein, carbs, or fats—leaving students dissatisfied and nutrition committees in the dark.',
    stat: '0% macro visibility',
  },
];

const solutionsList = [
  {
    icon: BrainCircuit,
    title: 'AI Demand Forecasting',
    description:
      'Combines student meal selections, historical attendance, day-of-week patterns, and walk-in buffers to predict exact dish quantities before cooking begins.',
    highlight: '96.4% Headcount Accuracy',
  },
  {
    icon: TrendingDown,
    title: 'Food Waste Tracking',
    description:
      'Log prepared, consumed, and leftover kilograms per meal to automatically compute waste percentages, rupee losses, and weekly reduction trends.',
    highlight: 'Up to 38% Waste Reduction',
  },
  {
    icon: PackageSearch,
    title: 'Smart Inventory Management',
    description:
      'Track real-time ingredient stock, minimum thresholds, supplier purchases, batch consumption, expiry alerts, and automated purchase planning.',
    highlight: 'Zero Stockout Surprises',
  },
  {
    icon: Users,
    title: 'Student Meal Preferences',
    description:
      'Students select preferred meals and dishes for free. Selections help estimate demand while students retain 100% of their meal entitlement regardless of polling.',
    highlight: 'Entitlement 100% Protected',
  },
  {
    icon: Salad,
    title: 'Nutrition Intelligence',
    description:
      'Every scheduled menu automatically calculates calories, protein, carbohydrates, and fats per serving—empowering healthier campus dining.',
    highlight: 'ICMR-NIN Macro Aligned',
  },
];

const howItWorksSteps = [
  {
    step: '01',
    icon: UploadCloud,
    title: 'Mess Uploads Daily Menu',
    description:
      'Mess owners schedule breakfast, lunch, and dinner menus with dish photos, serving sizes, ingredients, macros, and selection cutoff deadlines.',
  },
  {
    step: '02',
    icon: CheckSquare,
    title: 'Students Select Meal Preferences',
    description:
      'Students receive instant notifications and tap their preferred meals and dishes for free—while keeping full dining entitlement even if they don’t respond.',
  },
  {
    step: '03',
    icon: Cpu,
    title: 'SmartBite Analyzes the Data',
    description:
      'Our AI engine blends live student selections with historical turnout and calculates a safe walk-in buffer for unpolled students.',
  },
  {
    step: '04',
    icon: ChefHat,
    title: 'Mess Receives Prep Recommendations',
    description:
      'Kitchen staff get exact kilogram preparation targets per dish and automated raw ingredient purchase lists hours before cooking starts.',
  },
];

const majorFeatures = [
  {
    icon: CalendarCheck,
    title: 'Scheduled Menu & Macro Builder',
    description:
      'Create daily menus across Breakfast, Lunch, and Dinner with dish images, ingredients, serving sizes, and automatic calorie/protein/carb/fat summaries.',
  },
  {
    icon: Users,
    title: 'Non-Restrictive Student Polling',
    description:
      'Track meal-wise and dish-wise selection counts plus unpolled student counts—built around our unconditional student meal entitlement guarantee.',
  },
  {
    icon: BrainCircuit,
    title: 'AI Batch & Buffer Forecasting',
    description:
      'View expected attendance, dish-wise predicted kilograms, confidence intervals, and apply manual chef overrides whenever campus events arise.',
  },
  {
    icon: Scale,
    title: 'Automated Waste Cost Ledger',
    description:
      'Record prepared vs. consumed vs. leftover food in kilograms with automatic waste percentage and rupee cost calculations.',
  },
  {
    icon: ClipboardList,
    title: 'Inventory & Purchase Planner',
    description:
      'Monitor stock levels, expiry dates, purchase/consumption logs, and generate smart purchase lists directly from upcoming scheduled menus.',
  },
  {
    icon: MessageSquareHeart,
    title: 'Student Feedback & Dish Ratings',
    description:
      'Collect 5-star dish ratings, reviews, complaints, and menu suggestions so mess owners can continuously improve meal quality.',
  },
  {
    icon: Salad,
    title: 'Daily & Weekly Nutrition Analytics',
    description:
      'Visualize macro-nutrient balance across meals and ensure institutional menus meet student protein and micronutrient requirements.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Executive Reports & CSV Exports',
    description:
      'Generate daily, weekly, and monthly operational, financial, waste, and nutrition compliance reports with one-click export.',
  },
];

const institutionalBenefits = [
  {
    metric: '18% – 28%',
    title: 'Lower Raw Ingredient Procurement Cost',
    description:
      'Eliminate chronic over-cooking on Fridays, weekends, and exam days without ever risking a food shortage at the counter.',
  },
  {
    metric: '3.2★ → 4.7★',
    title: 'Higher Student Dining Satisfaction',
    description:
      'Reinvest waste savings into higher-quality paneer, seasonal fruits, and student-voted favorite dishes with full macro transparency.',
  },
  {
    metric: '100% Safe',
    title: 'Zero Friction & Full Entitlement Protection',
    description:
      'Students are free users and never lose their meal entitlement—making campus-wide adoption effortless for wardens and student councils.',
  },
  {
    metric: '< 10 Mins/Day',
    title: 'Streamlined Kitchen & Store Governance',
    description:
      'Replace fragmented paper registers and WhatsApp groups with a unified SaaS dashboard for owners, chefs, storekeepers, and deans.',
  },
];

export default function LandingPage() {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [demoForm, setDemoForm] = useState({
    full_name: '',
    work_email: '',
    phone: '',
    institution_name: '',
    mess_name: '',
    institution_type: 'college_mess',
    daily_meals_served: 1200,
    message: '',
  });
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);
  const [demoError, setDemoError] = useState('');

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    setDemoError('');

    if (!demoForm.full_name.trim() || !demoForm.work_email.trim() || !demoForm.phone.trim() || !demoForm.institution_name.trim()) {
      setDemoError('Please complete all required fields.');
      return;
    }

    setDemoLoading(true);
    try {
      await submitDemoRequest({
        ...demoForm,
        daily_meals_served: Number(demoForm.daily_meals_served || 1000),
      });
      setDemoSuccess(true);
    } catch (err) {
      setDemoError(err.message || 'Unable to submit demo request. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="space-y-24 pb-24">
      {/* ================= 2. HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-brand-50/80 via-cream-50 to-cream-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline, Subheading & Two CTA Buttons */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="green" icon={Sparkles}>
                  AI Food Management &amp; Nutrition Intelligence SaaS
                </Badge>
                <Badge variant="neutral" icon={ShieldCheck}>
                  Eat Smart. Waste Less.
                </Badge>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Smarter Kitchens. Less Waste.{' '}
                <span className="text-brand-800">Better Profits.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
                SmartBite helps institutional kitchens predict food demand, optimize inventory, reduce food waste and improve nutrition transparency.
              </p>

              {/* Two Required CTA Buttons: Request a Demo & Explore Features */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  href="#request-demo"
                  icon={ArrowRight}
                >
                  Request a Demo
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  href="#features"
                >
                  Explore Features
                </Button>
              </div>

              {/* Business Model & Entitlement Guarantee Callout */}
              <div className="p-4 rounded-2xl bg-white border border-brand-200/90 shadow-soft space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-brand-900">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-700" />
                    Built for College Messes, Hostels &amp; Institutional Cafeterias
                  </span>
                  <span className="text-brand-700">100% Free for Students</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mess operators subscribe to optimize operations. Students join free to select preferred meals and share feedback—and{' '}
                  <strong className="text-slate-900">
                    students always retain their existing meal entitlement regardless of whether they submit a selection.
                  </strong>
                </p>
              </div>

              {/* Quick Trust Metrics */}
              <div className="pt-2 grid grid-cols-3 gap-6 border-t border-slate-200/80">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-brand-800">34.8%</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Avg. Food Waste Cut</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-brand-800">96.4%</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Demand Forecast Accuracy</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-brand-800">₹2.4L+</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Monthly Savings / Mess</p>
                </div>
              </div>
            </div>

            {/* Right Column: Attractive Executive Dashboard Preview */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-brand-950 p-3 sm:p-4 shadow-elevated border border-brand-900">
                {/* Browser Window Top Bar */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-brand-900 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                    <span className="ml-2 text-[11px] font-semibold text-brand-200">
                      SmartBite Mess Owner Command Center — Live Forecast
                    </span>
                  </div>
                  <Link
                    to="/mess-owner-dashboard"
                    className="text-[11px] font-bold text-brand-300 hover:text-white underline"
                  >
                    Open Full Dashboard →
                  </Link>
                </div>

                {/* Inner Dashboard Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 space-y-4 text-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-brand-800 text-white flex items-center justify-center">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">
                          Annapurna Central Mess • Today’s Operations
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          1,140 Registered Students • Entitlement Protection Active
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200">
                      <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                      96.8% AI Confidence
                    </span>
                  </div>

                  {/* 4 Mini KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-cream-50 border border-slate-200/70">
                      <p className="text-[10px] font-semibold uppercase text-slate-500">Expected Today</p>
                      <p className="text-lg font-extrabold text-slate-900 mt-0.5">1,045</p>
                      <p className="text-[10px] text-brand-700 font-semibold">+65 Walk-In Buffer</p>
                    </div>
                    <div className="p-3 rounded-xl bg-brand-50/70 border border-brand-200">
                      <p className="text-[10px] font-semibold uppercase text-brand-800">Meal Selections</p>
                      <p className="text-lg font-extrabold text-brand-900 mt-0.5">980</p>
                      <p className="text-[10px] text-brand-700 font-semibold">86% Polled</p>
                    </div>
                    <div className="p-3 rounded-xl bg-cream-50 border border-slate-200/70">
                      <p className="text-[10px] font-semibold uppercase text-slate-500">Food Prepared</p>
                      <p className="text-lg font-extrabold text-slate-900 mt-0.5">500 kg</p>
                      <p className="text-[10px] text-emerald-700 font-semibold">-74 kg vs manual</p>
                    </div>
                    <div className="p-3 rounded-xl bg-cream-50 border border-slate-200/70">
                      <p className="text-[10px] font-semibold uppercase text-slate-500">Waste Today</p>
                      <p className="text-lg font-extrabold text-brand-800 mt-0.5">3.8%</p>
                      <p className="text-[10px] text-slate-500 font-semibold">₹10,730 Saved</p>
                    </div>
                  </div>

                  {/* Embedded Recharts Area Chart */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-slate-700">
                        Weekly Kitchen Prep (kg): Unassisted vs. SmartBite AI
                      </p>
                      <span className="text-[11px] font-bold text-brand-700">
                        -565 kg waste prevented
                      </span>
                    </div>
                    <WasteReductionAreaChart />
                  </div>

                  {/* Dish Forecast Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div className="px-3 py-2 rounded-xl bg-cream-100/80 border border-slate-200/80 text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Palak Paneer</span>
                      <span className="font-bold text-brand-800">135 kg rec.</span>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-cream-100/80 border border-slate-200/80 text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Dal Tadka</span>
                      <span className="font-bold text-brand-800">69 kg rec.</span>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-cream-100/80 border border-slate-200/80 text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Jeera Rice</span>
                      <span className="font-bold text-brand-800">148 kg rec.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. PROBLEM SECTION ================= */}
      <section id="problems" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="The Institutional Kitchen Crisis"
          badgeIcon={AlertTriangle}
          title="Why Traditional College Messes Lose Lakhs to"
          highlight="Avoidable Food Waste"
          subtitle="Running a 500 to 5,000-student dining hall on manual guesswork creates five compounding operational failures."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {problemsList.map((prob) => {
            const Icon = prob.icon;
            return (
              <Card
                key={prob.title}
                hover
                className="p-5 flex flex-col justify-between border-t-4 border-t-amber-600/80 space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {prob.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {prob.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    {prob.stat}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ================= 4. SOLUTION SECTION ================= */}
      <section id="solutions" className="bg-brand-950 text-white py-20 border-y border-brand-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="dark" icon={Sparkles}>
              The SmartBite Solution Suite
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Five Connected Intelligence Pillars for{' '}
              <span className="text-brand-300">Modern Institutional Dining</span>
            </h2>
            <p className="text-base text-brand-200/90 leading-relaxed">
              SmartBite replaces kitchen guesswork with closed-loop data connecting menus, student preferences, storeroom inventory, and nutrition science.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {solutionsList.map((sol) => {
              const Icon = sol.icon;
              return (
                <div
                  key={sol.title}
                  className="rounded-2xl bg-brand-900/70 border border-brand-800 p-5 flex flex-col justify-between space-y-4 hover:border-brand-600 transition-all"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-800 border border-brand-700 text-brand-300 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {sol.title}
                    </h3>
                    <p className="text-xs text-brand-200/85 leading-relaxed">
                      {sol.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-brand-800/80">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                      {sol.highlight}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 5. HOW IT WORKS (4-STEP PROCESS) ================= */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <SectionHeader
          badge="Simple 4-Step Daily Workflow"
          badgeIcon={ChefHat}
          title="How SmartBite Works in Your"
          highlight="Campus Mess"
          subtitle="From menu publication to exact batch cooking quantities in four frictionless steps—while preserving every student’s dining entitlement."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorksSteps.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.step} hover className="relative p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-brand-800 text-white flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-extrabold text-brand-100 select-none">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ================= 6. FEATURES SECTION ================= */}
      <section id="features" className="bg-white border-y border-slate-200/80 py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <SectionHeader
            badge="Complete Feature Ecosystem"
            badgeIcon={Sparkles}
            title="Everything You Need to Manage"
            highlight="Institutional Food & Nutrition"
            subtitle="Purpose-built modules for mess owners, kitchen managers, storekeepers, and hostel residents."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {majorFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <Card key={feat.title} hover className="p-6 space-y-3.5">
                  <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </Card>
              );
            })}
          </div>

          <div className="text-center pt-4">
            <Button variant="secondary" size="lg" to="/mess-owner-dashboard" icon={ArrowRight}>
              Explore Interactive Mess Owner Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* ================= 7. BENEFITS SECTION ================= */}
      <section id="benefits" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Measurable Institutional ROI"
          badgeIcon={TrendingUp}
          title="Why Mess Owners, Hostel Wardens &"
          highlight="Colleges Choose SmartBite"
          subtitle="SmartBite aligns financial profitability for mess operators with superior nutrition and zero restrictions for students."
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {institutionalBenefits.map((b) => (
            <Card key={b.title} hover className="p-6 border-t-4 border-t-brand-800 space-y-3">
              <p className="text-3xl font-extrabold text-brand-800">{b.metric}</p>
              <h3 className="text-base font-bold text-slate-900">{b.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{b.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ================= 8. PRICING SECTION (INDICATIVE / PROPOSED) ================= */}
      <section id="pricing" className="bg-white border-y border-slate-200/80 py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <SectionHeader
            badge="Proposed Indicative SaaS Pricing"
            badgeIcon={Building2}
            title="Transparent Institutional Plans."
            highlight="Always 100% Free for Students."
            subtitle="All pricing below is indicative proposed pricing for institutional kitchens and mess operators. Students never pay to use SmartBite."
          />

          {/* Billing Cycle Switch */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-semibold ${!annualBilling ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly Billing (Indicative)
            </span>
            <button
              type="button"
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-14 h-7 rounded-full bg-brand-800 p-1 flex items-center transition-all"
              aria-label="Toggle Annual Billing"
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  annualBilling ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-semibold flex items-center gap-2 ${annualBilling ? 'text-slate-900' : 'text-slate-500'}`}>
              Annual Institutional Contract
              <Badge variant="green">Save ~18%</Badge>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`flex flex-col justify-between p-7 relative ${
                  plan.popular
                    ? 'border-2 border-brand-800 shadow-elevated ring-4 ring-brand-800/5'
                    : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-6">
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-brand-800 text-white shadow-sm">
                      Most Popular • Proposed Plan
                    </span>
                  </div>
                )}

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                      <Badge variant="neutral">{plan.capacity}</Badge>
                    </div>
                    <p className="text-xs text-slate-500">{plan.subtitle}</p>
                  </div>

                  <div className="pt-2 pb-4 border-b border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold text-slate-900">
                        {annualBilling ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        / mess / month (Indicative)
                      </span>
                    </div>
                    <p className="text-xs text-brand-700 font-semibold mt-1.5">
                      Student Access: {plan.studentPrice}
                    </p>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-700">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Button
                    variant={plan.popular ? 'primary' : 'secondary'}
                    size="lg"
                    href="#request-demo"
                    className="w-full"
                    icon={ArrowRight}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 9. REQUEST A DEMO SECTION ================= */}
      <section id="request-demo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="rounded-3xl bg-brand-950 text-white p-6 sm:p-10 lg:p-12 shadow-elevated border border-brand-900">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Info */}
            <div className="lg:col-span-5 space-y-5">
              <Badge variant="dark" icon={Sparkles}>
                Request a Product Demonstration
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                See SmartBite in Action for Your Mess or Campus.
              </h2>
              <p className="text-sm sm:text-base text-brand-100/90 leading-relaxed">
                Schedule a personalized walkthrough with our FoodTech specialists. We will model your daily meal turnout, demonstrate our inventory and waste calculators, and set up a 14-day pilot.
              </p>

              <div className="space-y-3 pt-2 text-xs text-brand-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Live demonstration of all 11 Mess Owner Dashboard modules</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Free onboarding for 100% of your hostel students</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Submissions saved directly to Supabase demo_requests table</span>
                </div>
              </div>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-7">
              <Card className="p-6 sm:p-8 text-slate-900">
                {demoSuccess ? (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-800 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <Badge variant="green">
                      {isSupabaseConfigured ? 'Saved to Supabase Database' : 'Saved in Demo Mode Storage'}
                    </Badge>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Demo Request Received!
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      Thank you, <strong>{demoForm.full_name}</strong>. Our institutional onboarding team will reach out to{' '}
                      <span className="underline">{demoForm.work_email}</span> to schedule your walkthrough for{' '}
                      <strong>{demoForm.institution_name}</strong>.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      <Button variant="primary" to="/mess-owner-dashboard" icon={ArrowRight}>
                        Explore Mess Owner Dashboard Now
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setDemoSuccess(false);
                          setDemoForm({
                            full_name: '',
                            work_email: '',
                            phone: '',
                            institution_name: '',
                            mess_name: '',
                            institution_type: 'college_mess',
                            daily_meals_served: 1200,
                            message: '',
                          });
                        }}
                      >
                        Submit Another Request
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleDemoSubmit} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Book Your Institutional Demo
                        </h3>
                        <p className="text-xs text-slate-500">
                          Fill in your mess details below
                        </p>
                      </div>
                      <Badge variant="green">Fast Onboarding</Badge>
                    </div>

                    {demoError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                        {demoError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={demoForm.full_name}
                          onChange={(e) => setDemoForm({ ...demoForm, full_name: e.target.value })}
                          placeholder="e.g., Vikram Mehta"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Work / Institutional Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={demoForm.work_email}
                          onChange={(e) => setDemoForm({ ...demoForm, work_email: e.target.value })}
                          placeholder="owner@campusmess.edu"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Contact Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={demoForm.phone}
                          onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                          placeholder="+91 98450 22190"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          College / Institution Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={demoForm.institution_name}
                          onChange={(e) => setDemoForm({ ...demoForm, institution_name: e.target.value })}
                          placeholder="e.g., NIT Karnataka Hostels"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Mess / Kitchen Name
                        </label>
                        <input
                          type="text"
                          value={demoForm.mess_name}
                          onChange={(e) => setDemoForm({ ...demoForm, mess_name: e.target.value })}
                          placeholder="e.g., Hostel Block A Central Mess"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Estimated Daily Meals Served
                        </label>
                        <input
                          type="number"
                          min={50}
                          max={50000}
                          value={demoForm.daily_meals_served}
                          onChange={(e) =>
                            setDemoForm({ ...demoForm, daily_meals_served: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Key Requirements or Notes
                      </label>
                      <textarea
                        rows={2}
                        value={demoForm.message}
                        onChange={(e) => setDemoForm({ ...demoForm, message: e.target.value })}
                        placeholder="Tell us about your student strength and waste reduction goals..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      icon={ArrowRight}
                      className="w-full"
                      disabled={demoLoading}
                    >
                      {demoLoading ? 'Submitting Request...' : 'Request a Demo'}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
