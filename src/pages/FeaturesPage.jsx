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
    title: 'Plate-Based Demand Forecasting',
    description:
      'Combines student skip-poll responses with historical plates served, silent no-show rates, and guest buffers to compute expected plates and recommended plate preparation per meal.',
    bullets: [
      'Breakfast, Lunch & Dinner expected plate forecasts',
      'Transparent formula inputs, confidence range & overrides',
      'Record actual plates served to improve accuracy over time',
    ],
  },
  {
    icon: ShieldCheck,
    tag: 'Entitlement-First Core',
    title: 'Per-Meal Attendance Polls (Skip Notification)',
    description:
      'Every student defaults to Attending. Students only tap "I will NOT be coming" before the cutoff when they plan to skip a meal—and can undo it anytime before cutoff.',
    bullets: [
      'Not responding means the student is counted as attending',
      'Students never lose their meal entitlement in any case',
      'Automatic poll opening right after the previous meal finishes',
    ],
  },
  {
    icon: Scale,
    tag: 'Kitchen Operations',
    title: 'Weekly Menu Planner (Monday – Sunday)',
    description:
      'Plan the full Monday–Sunday fixed menu across Breakfast, Lunch, and Dinner with dish photos, descriptions, and one-click week publishing.',
    bullets: [
      'Copy Last Week’s Menu & Duplicate a Day in one click',
      'Save Week as Draft or Publish Week to students',
      'Draft menus stay hidden until officially published',
    ],
  },
  {
    icon: Salad,
    tag: 'For Students',
    title: 'Today’s Menu, Weekly Schedule & Meal History',
    description:
      'Students view Today’s Menu and This Week’s Menu for their linked mess, respond to attendance polls, and review their past meal attendance history.',
    bullets: [
      'Instant access to Today’s Menu & This Week’s Menu',
      'In-app notifications when the next meal poll opens',
      'Meal History showing attended vs. skipped meals',
    ],
  },
  {
    icon: MessageSquareHeart,
    tag: 'Continuous Improvement',
    title: 'Dish Ratings, Reviews & Suggestions',
    description:
      'Captures 5-star ratings on dishes from the published menu along with student reviews, complaints, and suggestions for the mess owner.',
    bullets: [
      '5-star dish ratings and structured meal feedback',
      'Correlates dish feedback with daily leftover plates',
      'Direct status tracking from Mess Owner dashboard',
    ],
  },
  {
    icon: FileBarChart2,
    tag: 'Executive Governance',
    title: 'Plate Waste & Attendance Reports',
    description:
      'Staff log plates prepared, plates served, leftover plates, and cost per plate, and export daily, weekly, and monthly attendance reports.',
    bullets: [
      'Meal-by-meal plates prepared, served, and leftover logs',
      'Weekly Kitchen Prep (plates) & Daily Leftover Plates trends',
      'Attendance Report with CSV download and print view',
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
                  Low-Waste, Well-Planned Mess
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Built specifically for college messes, hostels, and campus cafeterias where mess operators forecast plate attendance, publish weekly menus, and reduce leftover waste while students enjoy free menu and attendance tools.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" size="lg" to="/login" icon={ArrowRight}>
                    Login to SmartBite
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    to="/mess-owner-dashboard"
                    className="border-brand-700/60 text-brand-900 hover:bg-brand-50"
                  >
                    Open Dashboard Preview
                  </Button>
                </div>
                <p className="text-xs text-slate-600">
                  Evaluating SmartBite for your campus?{' '}
                  <Button
                    variant="ghost"
                    size="sm"
                    to="/request-demo"
                    className="px-1.5 py-0.5 text-brand-800 font-bold underline"
                  >
                    Request a Demo →
                  </Button>
                </p>
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
                    Weekly Kitchen Prep (plates) vs. Actual Plates Served
                  </h3>
                  <p className="text-xs text-slate-500">
                    Illustrative model comparing unassisted cooking vs. plate-guided preparation
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
                    Attendance Poll Signals + Guest &amp; Safety Buffer (plates)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Illustrative model showing how default-attending students and guest buffers are counted in plates
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
              to="/login"
              icon={ArrowRight}
            >
              Login to SmartBite
            </Button>
            <Button
              variant="secondary"
              size="lg"
              to="/request-demo"
              className="border-brand-700/60 text-brand-900 hover:bg-brand-50"
            >
              Schedule Live Demo
            </Button>
            <Button
              variant="secondary"
              size="lg"
              to="/workspace-preview"
            >
              Interactive Workspace Preview
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
