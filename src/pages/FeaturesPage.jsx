import React from 'react';
import {
  Sparkles,
  BrainCircuit,
  Salad,
  ShieldCheck,
  Scale,
  MessageSquareHeart,
  FileBarChart2,
  CheckCircle2,
  ArrowRight,
  Users,
  Building2,
  UtensilsCrossed,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import SectionHeader from '../components/common/SectionHeader';
import RevealOnScroll from '../components/common/RevealOnScroll';
import {
  WasteReductionAreaChart,
  MealDemandBarChart,
} from '../components/analytics/WasteReductionChart';

const coreModules = [
  {
    icon: BrainCircuit,
    tag: 'For Mess Operators',
    title: 'AI Headcount & Dish Demand Forecasting',
    description:
      'Combines real-time student meal selections with historical dining attendance, academic calendars, and day-of-week patterns to model expected meal turnout.',
    bullets: [
      'Breakfast, Lunch & Dinner turnout predictions',
      'Automatic weekend & holiday drop-off modeling',
      'Advance pre-soaking and batch cooking quantity guidance',
    ],
  },
  {
    icon: ShieldCheck,
    tag: 'Entitlement-First Core',
    title: 'Non-Restrictive Student Polling & Safety Buffer',
    description:
      'Students can tap their meal preference in seconds, yet never lose their meal entitlement if they forget to respond or change their plans last minute.',
    bullets: [
      'Dynamic Walk-In Buffer for unpolled students',
      'Zero penalty or gate denial at the mess counter',
      'Portion-size preference signals (Light, Regular, Extra)',
    ],
  },
  {
    icon: Scale,
    tag: 'Kitchen Operations',
    title: 'Automated Raw Ingredient Batch Calculator',
    description:
      'Translates predicted student headcount into kilogram and liter quantities of rice, dal, vegetables, paneer, oil, and spices for head chefs.',
    bullets: [
      'Standardized recipe scaling for institutional dining halls',
      'Daily storeroom indent & procurement planning sheets',
      'Per-meal prepared vs. leftover waste cost tracking',
    ],
  },
  {
    icon: Salad,
    tag: 'For Students & Dietitians',
    title: 'ICMR-Aligned Nutrition & Macro Intelligence',
    description:
      'Gives every student free access to complete nutritional breakdowns for every mess meal while helping mess committees design balanced menus.',
    bullets: [
      'Calorie, Protein, Carbohydrate & Fat breakdown per dish',
      'Dietary tags (Vegetarian, Jain, High-Protein, Vegan)',
      'Automatic macro totals as students select their plate',
    ],
  },
  {
    icon: MessageSquareHeart,
    tag: 'Continuous Improvement',
    title: 'Dish-Level Taste & Plate-Waste Feedback',
    description:
      'Captures structured student ratings after each meal to help kitchen teams identify why specific dishes generate leftover waste.',
    bullets: [
      '5-star dish ratings and structured meal feedback',
      'Correlates dish feedback with daily leftover logs',
      'Direct status tracking from Mess Owner dashboard',
    ],
  },
  {
    icon: FileBarChart2,
    tag: 'Executive Governance',
    title: 'Operational & Waste Cost Analytics',
    description:
      'Provides mess operators, hostel wardens, and catering directors with transparent dashboards tracking food waste reduction and inventory stock.',
    bullets: [
      'Meal-by-meal prepared, consumed, and leftover logs',
      'Low-stock and ingredient expiry alerts',
      'One-click CSV report exports for mess committees',
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="space-y-0">
      {/* Warm Food-Focused Hero Banner */}
      <section className="relative overflow-hidden py-16 lg:py-20 bg-gradient-to-b from-brand-50/80 via-cream-50 to-white border-b border-slate-200/70 bg-subtle-dots">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-200/35 blur-3xl"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <RevealOnScroll className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="green" icon={Sparkles}>
                  Platform Capabilities
                </Badge>
                <Badge variant="neutral" icon={UtensilsCrossed}>
                  Built for Institutional Kitchens
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Every Tool Needed to Run a{' '}
                <span className="text-brand-800">
                  Low-Waste, High-Nutrition Mess
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Built specifically for college messes, hostels, and campus cafeterias where mess operators subscribe for operational intelligence and students enjoy free nutrition and meal preference tools.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button variant="primary" size="lg" to="/request-demo" icon={ArrowRight}>
                  Request a Demo
                </Button>
                <Button variant="secondary" size="lg" to="/mess-owner-dashboard">
                  Open Dashboard Preview
                </Button>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delayMs={120} className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border-2 border-brand-200/80 shadow-elevated bg-brand-950">
                <img
                  src="/images/kitchen-prep.jpg"
                  alt="Modern institutional kitchen prep counter with stainless steel trays and fresh vegetables"
                  width="640"
                  height="440"
                  loading="lazy"
                  className="w-full h-64 sm:h-72 object-cover"
                />
                <div className="p-4 bg-gradient-to-r from-brand-950 via-brand-900 to-brand-950 text-white flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-brand-200">
                      Closed-Loop Kitchen Intelligence
                    </p>
                    <p className="text-[11px] text-brand-100/80">
                      Menus → Student Preferences → Batch Prep → Waste Ledger
                    </p>
                  </div>
                  <Badge variant="dark">100% Entitled</Badge>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 6 Core Modules Grid */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreModules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <RevealOnScroll key={mod.title} delayMs={(idx % 3) * 80}>
                  <Card
                    hover
                    className="h-full flex flex-col justify-between space-y-5 bg-gradient-to-br from-white via-white to-brand-50/40 hover:-translate-y-1.5 transition-all duration-300"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-brand-100/80 border border-brand-200 flex items-center justify-center text-brand-800 shadow-xs">
                          <Icon className="w-6 h-6" />
                        </div>
                        <Badge variant="green">{mod.tag}</Badge>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {mod.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>

                    <ul className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-700">
                      {mod.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* Deep-Dive Visual Analytics Section (Clearly labelled Sample Preview) */}
      <section className="bg-white border-y border-slate-200/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <SectionHeader
            badge="Interactive Recharts Analytics • Sample Preview"
            title="Actionable Kitchen Intelligence,"
            highlight="Not Just Spreadsheets"
            subtitle="Illustrative preview of how SmartBite visualizes batch preparation versus consumption and student participation across meal sessions."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6 space-y-4 bg-gradient-to-b from-white to-cream-50/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Batch Preparation vs. Actual Consumption (kg)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Illustrative model comparing unassisted cooking vs. demand-guided prep
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="amber">Sample Preview</Badge>
                  <Badge variant="green" icon={Building2}>
                    Operator View
                  </Badge>
                </div>
              </div>
              <WasteReductionAreaChart />
            </Card>

            <Card className="p-6 space-y-4 bg-gradient-to-b from-white to-cream-50/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Student Poll Signals + Walk-In Entitlement Buffer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Illustrative model showing how unpolled students remain covered by the buffer
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="amber">Sample Preview</Badge>
                  <Badge variant="green" icon={Users}>
                    Entitlement Safe
                  </Badge>
                </div>
              </div>
              <MealDemandBarChart />
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-brand-50/50 to-cream-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Want to See the Full Sidebar Dashboard in Action?
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Explore our interactive Workspace Preview or schedule a tailored walkthrough for your institution’s mess committee.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              to="/workspace-preview"
              icon={ArrowRight}
            >
              Open Interactive Workspace Preview
            </Button>
            <Button variant="secondary" size="lg" to="/request-demo">
              Schedule Live Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
