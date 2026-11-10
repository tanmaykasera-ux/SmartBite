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
  UtensilsCrossed,
  Smartphone,
  Monitor,
  Flame,
  Clock,
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import SectionHeader from '../components/common/SectionHeader';
import RevealOnScroll from '../components/common/RevealOnScroll';
import { WasteReductionAreaChart } from '../components/analytics/WasteReductionChart';
import { pricingPlans } from '../data/mockData';
import { submitDemoRequest, isSupabaseConfigured } from '../lib/supabase';

const foodGalleryItems = [
  {
    title: 'Balanced Campus Thali',
    subtitle: 'Rotis, dal tadka, paneer curry, rice, salad & raita',
    image: '/images/food-thali.jpg',
    alt: 'Overhead view of a balanced vegetarian Indian mess thali with dal, paneer, rice, chapatis, curd, and fresh salad',
    macros: '680 kcal • 24g Protein',
    tag: 'Complete Meal',
  },
  {
    title: 'Yellow Dal Tadka',
    subtitle: 'Slow-simmered lentils tempered with cumin, garlic & herbs',
    image: '/images/food-dal-tadka.jpg',
    alt: 'Steaming bowl of golden Indian yellow Dal Tadka garnished with roasted cumin seeds and fresh coriander leaves',
    macros: '195 kcal • 11g Protein',
    tag: 'High Protein',
  },
  {
    title: 'Fresh Palak Paneer',
    subtitle: 'Soft cottage cheese cubes in iron-rich spinach gravy',
    image: '/images/food-palak-paneer.jpg',
    alt: 'Close-up of fresh Indian Palak Paneer with white cottage cheese cubes in vibrant green spinach gravy',
    macros: '260 kcal • 15g Protein',
    tag: 'Calcium & Iron',
  },
  {
    title: 'Aromatic Jeera Rice',
    subtitle: 'Fluffy long-grain basmati rice tempered with whole cumin',
    image: '/images/food-jeera-rice.jpg',
    alt: 'Steamed fluffy basmati Jeera Rice tempered with cumin seeds and garnished with cilantro in a stainless steel bowl',
    macros: '210 kcal • 4.5g Protein',
    tag: 'Energy Staple',
  },
  {
    title: 'Seasonal Mixed Sabzi',
    subtitle: 'Farm-fresh carrots, beans, peas & cauliflower in light spices',
    image: '/images/food-seasonal-veg.jpg',
    alt: 'Colorful Indian mixed seasonal vegetable sabzi with carrots, green beans, peas, and cauliflower',
    macros: '140 kcal • 5g Fiber',
    tag: 'Micronutrients',
  },
  {
    title: 'Chilled Seasonal Fruit Bowl',
    subtitle: 'Freshly cut papaya, watermelon, banana, apple & pomegranate',
    image: '/images/food-fresh-fruits.jpg',
    alt: 'Freshly cut seasonal fruit bowl with papaya, watermelon, banana, apple slices, and pomegranate arils',
    macros: '110 kcal • Vitamin Rich',
    tag: 'Fresh Vitamins',
  },
];

const problemsList = [
  {
    icon: Scale,
    title: 'Excessive Food Preparation',
    description:
      'Institutional kitchens often cook for 100% of enrolled capacity even when many students skip meals due to lectures, internships, or weekend travel.',
    stat: 'Illustrative: ~20–25% over-prep risk',
    visualLabel: 'Blind 100% capacity batching',
  },
  {
    icon: TrendingDown,
    title: 'Avoidable Daily Food Wastage',
    description:
      'Large quantities of cooked rice, dal, curries, and rotis end up in wet-waste bins when kitchens lack advance headcount signals before cooking starts.',
    stat: 'Illustrative: High daily bin losses',
    visualLabel: 'Unplanned wet-waste disposal',
  },
  {
    icon: PackageSearch,
    title: 'Manual Inventory Registers',
    description:
      'Paper ledger logs lead to sudden stockouts of critical staples like paneer and pulses, or spoilage from untracked expiry dates in the dry store.',
    stat: 'Illustrative: Unseen stock drift',
    visualLabel: 'Disconnected storeroom logs',
  },
  {
    icon: HelpCircle,
    title: 'Unpredictable Daily Turnout',
    description:
      'Exam schedules, rainy evenings, campus fests, and dish popularity swings make headcount estimation a daily guessing game for head chefs.',
    stat: 'Illustrative: Wide turnout swings',
    visualLabel: 'No advance student signal',
  },
  {
    icon: Salad,
    title: 'Zero Nutritional Transparency',
    description:
      'Paper noticeboard menus offer no visibility into calories, protein, carbs, or fats—leaving students and mess committees without macro clarity.',
    stat: '0% macro visibility on paper',
    visualLabel: 'Static chalkboard menus',
  },
];

const solutionsList = [
  {
    icon: BrainCircuit,
    title: 'AI Demand Forecasting',
    description:
      'Combines student meal selections, historical attendance, day-of-week patterns, and walk-in buffers to estimate dish quantities before cooking begins.',
    highlight: 'Data-Guided Headcount Planning',
    pill: 'Demand Engine',
  },
  {
    icon: TrendingDown,
    title: 'Food Waste Tracking',
    description:
      'Log prepared, consumed, and leftover kilograms per meal to automatically compute waste percentages, rupee costs, and weekly reduction trends.',
    highlight: 'Batch-Level Waste Ledger',
    pill: 'Waste Control',
  },
  {
    icon: PackageSearch,
    title: 'Smart Inventory Management',
    description:
      'Track real-time ingredient stock, minimum thresholds, supplier purchases, batch consumption, expiry alerts, and automated purchase planning.',
    highlight: 'Low-Stock & Expiry Alerts',
    pill: 'Store Sync',
  },
  {
    icon: Users,
    title: 'Student Meal Preferences',
    description:
      'Students select preferred meals and dishes for free. Selections help estimate demand while students retain 100% of their meal entitlement regardless of polling.',
    highlight: 'Entitlement 100% Protected',
    pill: 'Free for Students',
  },
  {
    icon: Salad,
    title: 'Nutrition Intelligence',
    description:
      'Every scheduled menu automatically calculates calories, protein, carbohydrates, and fats per serving—empowering healthier campus dining.',
    highlight: 'Per-Serving Macro Breakdown',
    pill: 'ICMR-Aligned',
  },
];

const howItWorksSteps = [
  {
    step: '01',
    icon: UploadCloud,
    title: 'Mess Publishes Daily Menu',
    description:
      'Mess owners schedule breakfast, lunch, and dinner menus with dish photos, serving sizes, ingredients, macros, and selection cutoff deadlines.',
    previewTitle: 'Lunch Menu Published',
    previewSub: 'Dal Tadka • Palak Paneer • Jeera Rice',
  },
  {
    step: '02',
    icon: CheckSquare,
    title: 'Students Select Meal Preferences',
    description:
      'Students view published menus and tap their preferred dishes for free—while keeping full dining entitlement even if they do not submit a selection.',
    previewTitle: 'Optional Student Poll',
    previewSub: '100% Entitlement Always Retained',
  },
  {
    step: '03',
    icon: Cpu,
    title: 'SmartBite Analyzes Demand + Buffer',
    description:
      'Our analytics engine combines student selections with historical turnout and adds a configurable walk-in buffer for unpolled students.',
    previewTitle: 'Demand + Walk-In Buffer',
    previewSub: 'Polled Count + Safe Unpolled Margin',
  },
  {
    step: '04',
    icon: ChefHat,
    title: 'Kitchen Cooks Optimal Batch Sizes',
    description:
      'Kitchen staff receive kilogram preparation guidance per dish and raw ingredient purchase lists before cooking begins.',
    previewTitle: 'Batch Prep Guidance',
    previewSub: 'Exact kg targets per vessel',
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
    metric: 'Target: 15–30%',
    badge: 'Illustrative Goal',
    title: 'Lower Avoidable Over-Production',
    description:
      'Designed to help kitchens curb chronic over-cooking on Fridays, weekends, and exam days while keeping a safety buffer at the counter.',
  },
  {
    metric: '5-Star Loop',
    badge: 'Student Voice',
    title: 'Higher Student Dining Satisfaction',
    description:
      'Reinvest waste savings into higher-quality paneer, seasonal fruits, and student-voted favorite dishes with full macro transparency.',
  },
  {
    metric: '100% Safe',
    badge: 'Core Guarantee',
    title: 'Zero Friction & Full Entitlement Protection',
    description:
      'Students are free users and never lose their meal entitlement—making campus-wide adoption smooth for wardens and student councils.',
  },
  {
    metric: 'Unified SaaS',
    badge: 'Cloud Workflow',
    title: 'Streamlined Kitchen & Store Governance',
    description:
      'Replace fragmented paper registers and chat groups with a single workspace for mess owners, head chefs, and storekeepers.',
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

    if (
      !demoForm.full_name.trim() ||
      !demoForm.work_email.trim() ||
      !demoForm.phone.trim() ||
      !demoForm.institution_name.trim()
    ) {
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
      setDemoError(
        err.message || 'Unable to submit demo request. Please try again.'
      );
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="overflow-x-hidden">
      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-brand-50/90 via-cream-50 to-white border-b border-slate-200/70 bg-subtle-dots">
        {/* Decorative Blurred Green Blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-300/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-emerald-200/35 blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline, Subheading & Two CTA Buttons */}
            <RevealOnScroll className="lg:col-span-6 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="green" icon={Sparkles}>
                  AI Food Management &amp; Nutrition Intelligence SaaS
                </Badge>
                <Badge variant="neutral" icon={ShieldCheck}>
                  Eat Smart. Waste Less.
                </Badge>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.35rem] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Smarter Kitchens. Less Waste.{' '}
                <span className="text-brand-800">Better Profits.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
                SmartBite helps institutional kitchens predict food demand, optimize inventory, reduce food waste and improve nutrition transparency.
              </p>

              {/* Primary CTA: Login to SmartBite | Secondary: Explore Features + Understated Demo Link */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center gap-3.5">
                  <Button
                    variant="primary"
                    size="lg"
                    to="/login"
                    icon={ArrowRight}
                  >
                    Login to SmartBite
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    href="#features"
                    className="border-brand-700/60 text-brand-900 hover:bg-brand-50"
                  >
                    Explore Features
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pl-0.5">
                  <span>
                    New college mess or institution?{' '}
                    <a
                      href="#request-demo"
                      className="font-bold text-brand-800 hover:text-brand-950 underline underline-offset-2"
                    >
                      Request a Demo →
                    </a>
                  </span>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span>
                    First time here?{' '}
                    <Link
                      to="/register"
                      className="font-semibold text-slate-700 hover:text-brand-800 underline underline-offset-2"
                    >
                      Create Free Student / Mess Account
                    </Link>
                  </span>
                </div>
              </div>

              {/* Business Model & Entitlement Guarantee Callout */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-brand-200 shadow-soft space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-brand-900">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0" />
                    Built for College Messes, Hostels &amp; Institutional Cafeterias
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200">
                    100% Free for Students
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mess operators subscribe to optimize kitchen operations. Students join free to select preferred meals and share feedback—and{' '}
                  <strong className="text-slate-900">
                    students always retain their existing meal entitlement regardless of whether they submit a selection.
                  </strong>
                </p>
              </div>

              {/* Illustrative Platform Capabilities Strip */}
              <div className="pt-2 grid grid-cols-3 gap-4 sm:gap-6 border-t border-slate-200/80">
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md mb-1">
                    Illustrative Target
                  </span>
                  <p className="text-xl sm:text-2xl font-extrabold text-brand-800">
                    Up to 30%
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Over-Prep Waste Reduction
                  </p>
                </div>
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-brand-800 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-md mb-1">
                    Core Guarantee
                  </span>
                  <p className="text-xl sm:text-2xl font-extrabold text-brand-800">
                    100% Safe
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Student Meal Entitlement
                  </p>
                </div>
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-brand-800 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-md mb-1">
                    Nutrition Clarity
                  </span>
                  <p className="text-xl sm:text-2xl font-extrabold text-brand-800">
                    4 Macros
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Calorie, Protein, Carb &amp; Fat
                  </p>
                </div>
              </div>
            </RevealOnScroll>

            {/* Right Column: Warm Food Visual + Overlapping Floating Stat Cards */}
            <RevealOnScroll delayMs={120} className="lg:col-span-6">
              <div className="relative mx-auto max-w-xl lg:max-w-none">
                {/* Soft Green Gradient Shape Behind Image */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-3 sm:-inset-4 rounded-[2rem] bg-gradient-to-tr from-brand-800/25 via-brand-500/15 to-amber-200/30 rotate-1 blur-md"
                />

                {/* Main Hero Food Image Card */}
                <div className="relative rounded-3xl overflow-hidden border-2 border-white shadow-elevated bg-brand-950">
                  <img
                    src="/images/hero-indian-thali.jpg"
                    alt="Freshly served Indian institutional mess thali with dal tadka, palak paneer, jeera rice, rotis, raita, and salad in a bright dining hall"
                    width="960"
                    height="540"
                    className="w-full h-[300px] sm:h-[390px] object-cover"
                  />
                  {/* Soft Bottom Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/25 to-transparent" />

                  {/* Top-Left Sample Preview Pill */}
                  <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-950/85 text-brand-100 border border-brand-700 backdrop-blur-md">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-brand-400" />
                      Fresh Campus Dining • Zero Guesswork
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100/95 text-amber-900 border border-amber-300">
                      Sample Preview
                    </span>
                  </div>

                  {/* Bottom Caption Inside Image */}
                  <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs p-3.5 rounded-2xl bg-brand-950/85 border border-brand-800/90 text-white backdrop-blur-md">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-brand-300">
                      Today&apos;s Balanced Lunch Thali (Sample)
                    </p>
                    <p className="text-sm font-extrabold text-white mt-0.5">
                      Dal Tadka • Palak Paneer • Jeera Rice • Roti
                    </p>
                    <p className="text-xs text-brand-200 mt-1 flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>680 kcal • 24g Protein • 100% Entitled</span>
                    </p>
                  </div>
                </div>

                {/* Floating Overlapping Card 1 (Top-Right): Sample Demand Poll */}
                <div className="mt-3 sm:mt-0 sm:absolute sm:-top-5 sm:-right-4 bg-white rounded-2xl p-3.5 shadow-elevated border border-brand-200 sm:w-60">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                      Sample Preview
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700">
                      +8% Walk-In Buffer
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 mt-2">
                    Illustrative Lunch Forecast
                  </p>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <p className="text-xl font-extrabold text-slate-900">
                      420 Plates
                    </p>
                    <span className="text-[11px] font-semibold text-brand-700">
                      385 Polled + 35 Buffer
                    </span>
                  </div>
                </div>

                {/* Floating Overlapping Card 2 (Bottom-Right): Sample Batch Prep */}
                <div className="mt-3 sm:mt-0 sm:absolute sm:-bottom-5 sm:-right-4 bg-white rounded-2xl p-3.5 shadow-elevated border border-slate-200 sm:w-64">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <ChefHat className="w-4 h-4 text-brand-700" />
                      Batch Prep Target (Sample)
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Illustrative
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Palak Paneer:</span>
                      <strong className="text-brand-800">54 kg rec.</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Yellow Dal Tadka:</span>
                      <strong className="text-brand-800">48 kg rec.</strong>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Interactive Executive Dashboard Preview (With Explicit "Sample Preview" Honesty Label) */}
          <RevealOnScroll className="pt-4">
            <div className="rounded-3xl bg-brand-950 p-3 sm:p-5 shadow-elevated border border-brand-900">
              {/* Browser Window Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-brand-900 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-[11px] font-semibold text-brand-200">
                    SmartBite Mess Owner Command Center — Interactive Preview
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    Sample Preview • Illustrative Data
                  </span>
                </div>
                <Link
                  to="/mess-owner-dashboard"
                  className="text-[11px] font-bold text-brand-300 hover:text-white underline"
                >
                  Open Live / Demo Dashboard →
                </Link>
              </div>

              {/* Inner Dashboard Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 space-y-4 text-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-800 text-white flex items-center justify-center">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900">
                          Sample Hostel Mess • Illustrative Daily Operations
                        </h2>
                        <Badge variant="amber">Sample Preview</Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Illustrative scenario for a 1,140-capacity hostel mess • Entitlement Protection Active
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200">
                    <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                    Sample Forecast Model
                  </span>
                </div>

                {/* 4 Mini KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-cream-50 border border-slate-200/70">
                    <p className="text-[10px] font-semibold uppercase text-slate-500">
                      Sample Expected Turnout
                    </p>
                    <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                      1,045
                    </p>
                    <p className="text-[10px] text-brand-700 font-semibold">
                      Includes +65 Walk-In Buffer
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-brand-50/70 border border-brand-200">
                    <p className="text-[10px] font-semibold uppercase text-brand-800">
                      Sample Meal Selections
                    </p>
                    <p className="text-lg font-extrabold text-brand-900 mt-0.5">
                      980
                    </p>
                    <p className="text-[10px] text-brand-700 font-semibold">
                      Illustrative Poll Signal
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-cream-50 border border-slate-200/70">
                    <p className="text-[10px] font-semibold uppercase text-slate-500">
                      Sample Batch Prepared
                    </p>
                    <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                      500 kg
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold">
                      Illustrative -74 kg vs full capacity
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-cream-50 border border-slate-200/70">
                    <p className="text-[10px] font-semibold uppercase text-slate-500">
                      Sample Leftover Ratio
                    </p>
                    <p className="text-lg font-extrabold text-brand-800 mt-0.5">
                      3.8%
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Illustrative ~₹10,730 saved
                    </p>
                  </div>
                </div>

                {/* Embedded Recharts Area Chart */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-bold text-slate-700">
                      Illustrative Weekly Kitchen Prep (kg): Unassisted vs. SmartBite Guided
                    </p>
                    <span className="text-[11px] font-bold text-brand-700">
                      Sample preview chart
                    </span>
                  </div>
                  <WasteReductionAreaChart />
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ================= 2. FOOD GALLERY SECTION ("Fresh meals, less waste") ================= */}
      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <RevealOnScroll>
            <SectionHeader
              badge="Nutritious Institutional Menus"
              badgeIcon={UtensilsCrossed}
              title="Fresh Meals,"
              highlight="Less Waste"
              subtitle="SmartBite is built around real campus dining—helping kitchens serve hot, balanced Indian staples in the right quantities while giving students full macro visibility for every dish."
            />
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodGalleryItems.map((food, idx) => (
              <RevealOnScroll key={food.title} delayMs={(idx % 3) * 80}>
                <div className="group rounded-2xl overflow-hidden bg-cream-50 border border-slate-200/80 shadow-soft hover:shadow-elevated hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full">
                  <div className="relative overflow-hidden h-52 bg-slate-100">
                    <img
                      src={food.image}
                      alt={food.alt}
                      width="640"
                      height="480"
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-brand-900 border border-brand-200 shadow-xs">
                      {food.tag}
                    </span>
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-brand-950/90 text-brand-100 border border-brand-800">
                      {food.macros}
                    </span>
                  </div>
                  <div className="p-5 space-y-1.5 bg-gradient-to-b from-white to-cream-50/70">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-800 transition-colors">
                      {food.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {food.subtitle}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 3. PROBLEM SECTION ================= */}
      <section
        id="problems"
        className="relative py-20 lg:py-24 bg-cream-50 bg-subtle-grid border-b border-slate-200/70"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Top Row: Section Copy + Supporting Kitchen Photo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <RevealOnScroll className="lg:col-span-7 space-y-4">
              <Badge variant="amber" icon={AlertTriangle}>
                The Institutional Kitchen Challenge
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Why Unassisted College Messes Struggle with{' '}
                <span className="text-brand-800">Avoidable Food Waste</span>
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Running a 500 to 5,000-student dining hall on manual registers and rule-of-thumb batching creates five compounding operational challenges every single day.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delayMs={100} className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border-2 border-amber-200/80 shadow-elevated bg-white">
                <img
                  src="/images/kitchen-prep.jpg"
                  alt="Institutional kitchen prep counter with stainless steel gastronorm containers, digital scales, and raw ingredients"
                  width="640"
                  height="420"
                  loading="lazy"
                  className="w-full h-56 sm:h-64 object-cover"
                />
                <div className="p-4 bg-gradient-to-r from-slate-900 to-brand-950 text-white flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-amber-300">
                      From Guesswork to Measured Prep
                    </p>
                    <p className="text-[11px] text-slate-200">
                      Without advance student demand signals, kitchens overcook by default
                    </p>
                  </div>
                  <Scale className="w-5 h-5 text-amber-300 shrink-0" />
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* 5 Problem Cards with Soft Green Icon Circles & Visual Header Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {problemsList.map((prob, idx) => {
              const Icon = prob.icon;
              return (
                <RevealOnScroll key={prob.title} delayMs={idx * 70}>
                  <Card
                    hover
                    className="h-full p-5 flex flex-col justify-between bg-gradient-to-b from-white via-white to-amber-50/35 border-t-4 border-t-amber-600/80 space-y-4 hover:-translate-y-1.5 transition-all duration-300"
                  >
                    <div className="space-y-3.5">
                      {/* Mini Visual Illustration Header */}
                      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-brand-50/70 border border-brand-100">
                        <div className="w-11 h-11 rounded-full bg-brand-100 border border-brand-200 text-brand-800 flex items-center justify-center shrink-0 shadow-xs">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-600 px-2 text-right leading-tight">
                          {prob.visualLabel}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {prob.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {prob.description}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100">
                      <span className="inline-block text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        {prob.stat}
                      </span>
                    </div>
                  </Card>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 4. SOLUTION SECTION ================= */}
      <section
        id="solutions"
        className="relative overflow-hidden bg-brand-950 text-white py-20 lg:py-24 border-b border-brand-900"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/3 w-96 h-96 rounded-full bg-brand-700/20 blur-3xl"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Solution Intro + Supporting Photo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <RevealOnScroll className="lg:col-span-7 space-y-4">
              <Badge variant="dark" icon={Sparkles}>
                The SmartBite Solution Suite
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Five Connected Intelligence Pillars for{' '}
                <span className="text-brand-300">
                  Modern Institutional Dining
                </span>
              </h2>
              <p className="text-base text-brand-100/90 leading-relaxed">
                SmartBite replaces kitchen guesswork with closed-loop workflows connecting published menus, optional student preferences, storeroom inventory, and nutrition science.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delayMs={100} className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border-2 border-brand-800 shadow-elevated bg-brand-900">
                <img
                  src="/images/food-thali.jpg"
                  alt="Balanced vegetarian Indian thali served in stainless steel bowls with zero plate waste"
                  width="640"
                  height="420"
                  loading="lazy"
                  className="w-full h-56 sm:h-64 object-cover"
                />
                <div className="p-4 bg-brand-950/95 border-t border-brand-800 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-brand-300">
                      Entitlement-First Demand Planning
                    </p>
                    <p className="text-[11px] text-brand-100/80">
                      Students eat free &amp; retain 100% entitlement; operators cut waste
                    </p>
                  </div>
                  <Badge variant="dark">Eat Smart</Badge>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* 5 Solution Cards with Soft Green Circles & Illustration Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {solutionsList.map((sol, idx) => {
              const Icon = sol.icon;
              return (
                <RevealOnScroll key={sol.title} delayMs={idx * 70}>
                  <div className="h-full rounded-2xl bg-gradient-to-b from-brand-900/90 to-brand-900/50 border border-brand-800 p-5 flex flex-col justify-between space-y-4 hover:border-brand-500 hover:-translate-y-1.5 transition-all duration-300">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-full bg-brand-800/90 border border-brand-600 text-brand-200 flex items-center justify-center shadow-sm">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-950/80 text-brand-300 border border-brand-800">
                          {sol.pill}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {sol.title}
                      </h3>
                      <p className="text-xs text-brand-100/85 leading-relaxed">
                        {sol.description}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-brand-800/80">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                        {sol.highlight}
                      </span>
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 5. HOW IT WORKS (4-STEP CONNECTED TIMELINE) ================= */}
      <section
        id="how-it-works"
        className="py-20 lg:py-24 bg-gradient-to-b from-brand-50/60 via-white to-cream-50 scroll-mt-20 border-b border-slate-200/70"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <RevealOnScroll>
            <SectionHeader
              badge="Simple 4-Step Daily Workflow"
              badgeIcon={ChefHat}
              title="How SmartBite Works in Your"
              highlight="Campus Mess"
              subtitle="From menu publication to batch cooking quantities in four connected steps—while preserving every student’s dining entitlement."
            />
          </RevealOnScroll>

          {/* Connected Step Timeline */}
          <div className="relative">
            {/* Horizontal connecting line on desktop */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute top-14 left-[12%] right-[12%] h-1 bg-gradient-to-r from-brand-200 via-brand-600 to-brand-200 rounded-full"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {howItWorksSteps.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <RevealOnScroll key={item.step} delayMs={idx * 90}>
                    <Card
                      hover
                      className="relative h-full p-6 flex flex-col justify-between space-y-4 bg-white border-slate-200/90 hover:-translate-y-1.5 transition-all duration-300"
                    >
                      <div className="space-y-4">
                        {/* Numbered Timeline Node + Soft Green Circle Icon */}
                        <div className="flex items-center justify-between">
                          <div className="relative z-10 w-14 h-14 rounded-full bg-brand-100 border-2 border-brand-700 text-brand-900 flex items-center justify-center shadow-sm">
                            <Icon className="w-6 h-6 text-brand-800" />
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-800 text-white shadow-xs">
                            Step {item.step}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Mini Step Illustration Box */}
                      <div className="p-3 rounded-xl bg-gradient-to-r from-brand-50/90 to-cream-100/80 border border-brand-200/80">
                        <p className="text-[11px] font-bold text-brand-900">
                          {item.previewTitle}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {item.previewSub}
                        </p>
                      </div>
                    </Card>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. PRODUCT MOCKUPS: MESS OWNER DASHBOARD & STUDENT PHONE APP ================= */}
      <section className="py-20 lg:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <RevealOnScroll>
            <SectionHeader
              badge="Dual-Portal Product Experience • Sample Preview"
              badgeIcon={Monitor}
              title="One Platform for Mess Operators &"
              highlight="Hostel Students"
              subtitle="Mess owners get a command center for menus, student demand signals, inventory, and waste logs—while students get a clean mobile experience to preview dishes and macros for free."
            />
          </RevealOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left (7 cols): Mess Owner Desktop Mockup */}
            <RevealOnScroll className="lg:col-span-7">
              <div className="rounded-3xl bg-slate-900 p-3 sm:p-4 shadow-elevated border border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-brand-400" />
                      Mess Owner Dashboard (Desktop View)
                    </span>
                  </div>
                  <Badge variant="amber">Sample Preview</Badge>
                </div>

                <div className="bg-cream-50 rounded-2xl p-4 sm:p-5 space-y-4 text-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">
                        Menu &amp; Demand Planner • Lunch Session (Sample)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Join Code: <span className="font-mono font-bold text-brand-800">SB-DEMO01</span> • Status: Published to Students
                      </p>
                    </div>
                    <Badge variant="green">Published Menu</Badge>
                  </div>

                  {/* Dish Demand Rows */}
                  <div className="space-y-2.5">
                    {[
                      {
                        dish: 'Palak Paneer',
                        img: '/images/food-palak-paneer.jpg',
                        polled: '312 students opted in',
                        prep: '54 kg recommended',
                        macros: '260 kcal • 15g P',
                      },
                      {
                        dish: 'Yellow Dal Tadka',
                        img: '/images/food-dal-tadka.jpg',
                        polled: '348 students opted in',
                        prep: '48 kg recommended',
                        macros: '195 kcal • 11g P',
                      },
                      {
                        dish: 'Steamed Jeera Rice',
                        img: '/images/food-jeera-rice.jpg',
                        polled: '340 students opted in',
                        prep: '62 kg recommended',
                        macros: '210 kcal • 4.5g P',
                      },
                    ].map((row) => (
                      <div
                        key={row.dish}
                        className="p-3 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={row.img}
                            alt={row.dish}
                            width="56"
                            height="56"
                            loading="lazy"
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {row.dish}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {row.polled} • {row.macros}
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 text-xs font-extrabold text-brand-800 shrink-0">
                          {row.prep}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-brand-950 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-brand-200">
                      <ShieldCheck className="w-4 h-4 text-brand-400" />
                      Unpolled students covered by +8% Walk-In Buffer
                    </span>
                    <Link
                      to="/mess-owner-dashboard"
                      className="font-bold text-brand-300 hover:text-white underline"
                    >
                      Try Owner Dashboard →
                    </Link>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            {/* Right (5 cols): Student Mobile App Phone Frame Mockup */}
            <RevealOnScroll delayMs={120} className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[340px] rounded-[2.6rem] border-[7px] border-slate-900 bg-white shadow-elevated overflow-hidden">
                {/* Phone Notch / Status Bar */}
                <div className="bg-brand-950 text-white px-5 pt-3 pb-4 space-y-2">
                  <div className="w-20 h-1.5 rounded-full bg-brand-800 mx-auto mb-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-brand-300 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5" /> Student Portal
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                      Sample Preview
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-white">
                    Today&apos;s Published Lunch
                  </p>
                  <p className="text-[11px] text-brand-200 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-brand-400" />
                    Serving: 12:30 PM – 02:30 PM
                  </p>
                </div>

                {/* Phone Body */}
                <div className="p-4 bg-cream-50 space-y-3">
                  {/* Entitlement Guarantee Pill */}
                  <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-200 flex items-center gap-2 text-[11px] text-brand-950 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0" />
                    <span>Optional poll • 100% Meal Entitlement Guaranteed</span>
                  </div>

                  {/* Mobile Dish Selection Cards */}
                  {[
                    {
                      name: 'Palak Paneer (1 Bowl)',
                      macros: '260 kcal • 15g Protein',
                      img: '/images/food-palak-paneer.jpg',
                      selected: true,
                    },
                    {
                      name: 'Yellow Dal Tadka (1 Bowl)',
                      macros: '195 kcal • 11g Protein',
                      img: '/images/food-dal-tadka.jpg',
                      selected: true,
                    },
                    {
                      name: 'Fresh Seasonal Fruit Bowl',
                      macros: '110 kcal • Vitamins',
                      img: '/images/food-fresh-fruits.jpg',
                      selected: true,
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="p-2.5 rounded-2xl bg-white border-2 border-brand-600/80 flex items-center justify-between gap-2.5 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.img}
                          alt={item.name}
                          width="48"
                          height="48"
                          loading="lazy"
                          className="w-11 h-11 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] font-semibold text-brand-800">
                            {item.macros}
                          </p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
                    </div>
                  ))}

                  {/* Plate Macro Total & CTA */}
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">
                        Selected Plate Macros:
                      </span>
                      <span className="font-extrabold text-brand-800">
                        565 kcal • 28g Protein
                      </span>
                    </div>
                    <Link
                      to="/student-dashboard"
                      className="w-full py-2 px-3 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      Open Student Portal Preview <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ================= 7. FEATURES SECTION ================= */}
      <section
        id="features"
        className="relative py-20 lg:py-24 bg-cream-50 bg-subtle-dots border-b border-slate-200/80 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <RevealOnScroll>
            <SectionHeader
              badge="Complete Feature Ecosystem"
              badgeIcon={Sparkles}
              title="Everything You Need to Manage"
              highlight="Institutional Food & Nutrition"
              subtitle="Purpose-built modules for mess owners, kitchen managers, storekeepers, and hostel residents."
            />
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {majorFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <RevealOnScroll key={feat.title} delayMs={(idx % 4) * 70}>
                  <Card
                    hover
                    className="h-full p-6 space-y-3.5 bg-gradient-to-br from-white via-white to-brand-50/55 border-slate-200/90 hover:-translate-y-1.5 hover:border-brand-300 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-brand-100/80 border border-brand-200 text-brand-800 flex items-center justify-center shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {feat.description}
                    </p>
                  </Card>
                </RevealOnScroll>
              );
            })}
          </div>

          <div className="text-center pt-4">
            <Button
              variant="secondary"
              size="lg"
              to="/mess-owner-dashboard"
              icon={ArrowRight}
            >
              Explore Interactive Mess Owner Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* ================= 8. BENEFITS SECTION ================= */}
      <section
        id="benefits"
        className="py-20 lg:py-24 bg-gradient-to-b from-white via-brand-50/35 to-white border-b border-slate-200/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <RevealOnScroll>
            <SectionHeader
              badge="Institutional Value Proposition"
              badgeIcon={TrendingUp}
              title="Why Mess Owners, Hostel Wardens &"
              highlight="Colleges Choose SmartBite"
              subtitle="SmartBite aligns operational efficiency for mess operators with superior nutrition visibility and zero restrictions for students."
            />
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {institutionalBenefits.map((b, idx) => (
              <RevealOnScroll key={b.title} delayMs={idx * 80}>
                <Card
                  hover
                  className="h-full p-6 border-t-4 border-t-brand-800 bg-gradient-to-b from-white to-cream-50/70 space-y-3 hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-2xl font-extrabold text-brand-800">
                      {b.metric}
                    </p>
                    <Badge variant="green">{b.badge}</Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {b.description}
                  </p>
                </Card>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 9. PRICING SECTION (INDICATIVE / PROPOSED) ================= */}
      <section
        id="pricing"
        className="bg-cream-50 border-b border-slate-200/80 py-20 lg:py-24 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <RevealOnScroll>
            <SectionHeader
              badge="Proposed Indicative SaaS Pricing"
              badgeIcon={Building2}
              title="Transparent Institutional Plans."
              highlight="Always 100% Free for Students."
              subtitle="All pricing below is indicative proposed pricing for institutional kitchens and mess operators. Students never pay to use SmartBite."
            />
          </RevealOnScroll>

          {/* Billing Cycle Switch */}
          <div className="flex items-center justify-center gap-3">
            <span
              className={`text-sm font-semibold ${
                !annualBilling ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
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
            <span
              className={`text-sm font-semibold flex items-center gap-2 ${
                annualBilling ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              Annual Institutional Contract
              <Badge variant="green">Save ~18%</Badge>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
            {pricingPlans.map((plan, idx) => (
              <RevealOnScroll key={plan.id} delayMs={idx * 90}>
                <Card
                  hover
                  className={`h-full flex flex-col justify-between p-7 relative transition-all duration-300 hover:-translate-y-1.5 ${
                    plan.popular
                      ? 'border-2 border-brand-800 shadow-elevated ring-4 ring-brand-800/5 bg-white'
                      : 'border-slate-200 bg-white'
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
                        <h3 className="text-xl font-bold text-slate-900">
                          {plan.name}
                        </h3>
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
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 10. REQUEST A DEMO SECTION ================= */}
      <section
        id="request-demo"
        className="py-20 lg:py-24 bg-white scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-brand-950 text-white p-6 sm:p-10 lg:p-12 shadow-elevated border border-brand-900 relative overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-700/20 blur-3xl"
            />
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Info */}
              <div className="lg:col-span-5 space-y-5">
                <Badge variant="dark" icon={Sparkles}>
                  Request a Product Demonstration
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  See SmartBite in Action for Your Mess or Campus.
                </h2>
                <p className="text-sm sm:text-base text-brand-100/90 leading-relaxed">
                  Schedule a personalized walkthrough with our FoodTech team. We will model your daily meal turnout, demonstrate our inventory and waste calculators, and help you set up a pilot.
                </p>

                <div className="space-y-3 pt-2 text-xs text-brand-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                    <span>
                      Live walkthrough of all 11 Mess Owner Dashboard modules
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                    <span>
                      Free join-code onboarding for 100% of your hostel students
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
                    <span>
                      Submissions saved directly to Supabase demo_requests table
                    </span>
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
                        {isSupabaseConfigured
                          ? 'Saved to Supabase Database'
                          : 'Saved in Demo Mode Storage'}
                      </Badge>
                      <h3 className="text-2xl font-bold text-slate-900">
                        Demo Request Received!
                      </h3>
                      <p className="text-sm text-slate-600 max-w-md mx-auto">
                        Thank you, <strong>{demoForm.full_name}</strong>. Our institutional onboarding team will reach out to{' '}
                        <span className="underline">{demoForm.work_email}</span>{' '}
                        to schedule your walkthrough for{' '}
                        <strong>{demoForm.institution_name}</strong>.
                      </p>
                      <div className="flex flex-wrap justify-center gap-3 pt-2">
                        <Button
                          variant="primary"
                          to="/mess-owner-dashboard"
                          icon={ArrowRight}
                        >
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
                            onChange={(e) =>
                              setDemoForm({
                                ...demoForm,
                                full_name: e.target.value,
                              })
                            }
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
                            onChange={(e) =>
                              setDemoForm({
                                ...demoForm,
                                work_email: e.target.value,
                              })
                            }
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
                            onChange={(e) =>
                              setDemoForm({
                                ...demoForm,
                                phone: e.target.value,
                              })
                            }
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
                            onChange={(e) =>
                              setDemoForm({
                                ...demoForm,
                                institution_name: e.target.value,
                              })
                            }
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
                            onChange={(e) =>
                              setDemoForm({
                                ...demoForm,
                                mess_name: e.target.value,
                              })
                            }
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
                              setDemoForm({
                                ...demoForm,
                                daily_meals_served: e.target.value,
                              })
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
                          onChange={(e) =>
                            setDemoForm({
                              ...demoForm,
                              message: e.target.value,
                            })
                          }
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
        </div>
      </section>
    </div>
  );
}
