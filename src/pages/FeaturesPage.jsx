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
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import SectionHeader from '../components/common/SectionHeader';
import { WasteReductionAreaChart, MealDemandBarChart } from '../components/analytics/WasteReductionChart';

const coreModules = [
  {
    icon: BrainCircuit,
    tag: 'For Mess Operators',
    title: 'AI Headcount & Dish Demand Forecasting',
    description:
      'Combines real-time student meal selections with historical dining attendance, academic calendars, exam schedules, and local weather to predict turnout with 96.4% accuracy.',
    bullets: [
      'Breakfast, Lunch, Snacks & Dinner turnout predictions',
      'Automatic weekend & holiday drop-off modeling',
      '6-hour advance pre-soaking and batch cooking alerts',
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
      'Portion-size preference signals (Full vs Light Portion)',
    ],
  },
  {
    icon: Scale,
    tag: 'Kitchen Operations',
    title: 'Automated Raw Ingredient Batch Calculator',
    description:
      'Translates predicted student headcount into exact kilogram and liter quantities of rice, dal, vegetables, paneer, oil, and spices for head chefs.',
    bullets: [
      'Standardized recipe scaling for 100 to 10,000 plates',
      'Daily storeroom indent & procurement sheets',
      'Per-plate food cost tracking in real time',
    ],
  },
  {
    icon: Salad,
    tag: 'For Students & Dietitians',
    title: 'ICMR-Aligned Nutrition & Macro Intelligence',
    description:
      'Gives every student free access to complete nutritional breakdowns for every mess meal while helping mess committees design balanced menus.',
    bullets: [
      'Calorie, Protein, Complex Carb, Fat & Fiber breakdown',
      'Allergen tags & dietary badges (Veg, Jain, High-Protein)',
      'Weekly institutional nutrition compliance scorecard',
    ],
  },
  {
    icon: MessageSquareHeart,
    tag: 'Continuous Improvement',
    title: 'Dish-Level Taste & Plate-Waste Feedback',
    description:
      'Captures structured 10-second student ratings after each meal to pinpoint why specific dishes generate high bin waste.',
    bullets: [
      'Separate ratings for taste, spice level, and oiliness',
      'Correlates low dish ratings with wet-waste bin weight',
      'Student menu voting for upcoming Sunday specials',
    ],
  },
  {
    icon: FileBarChart2,
    tag: 'Executive Governance',
    title: 'Multi-Hostel ESG & Cost Savings Analytics',
    description:
      'Provides college deans, chief wardens, and catering directors with transparent dashboards tracking monthly rupee savings and carbon reduction.',
    bullets: [
      'Hostel-by-hostel waste benchmark comparisons',
      'CO₂e emissions and water footprint saved reports',
      'One-click CSV/PDF audit exports for mess committees',
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="py-16 space-y-20">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Platform Capabilities"
          badgeIcon={Sparkles}
          title="Every Tool Needed to Run a"
          highlight="Zero-Waste, High-Nutrition Mess"
          subtitle="Built specifically for institutional kitchens where mess operators pay for operational intelligence and students enjoy free nutrition and meal preference tools."
        />

        {/* 6 Core Modules Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Card key={mod.title} hover className="flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-800">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="green">{mod.tag}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{mod.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{mod.description}</p>
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
            );
          })}
        </div>
      </section>

      {/* Deep-Dive Visual Analytics Section */}
      <section className="bg-white border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <SectionHeader
            badge="Real-Time Recharts Analytics"
            title="Actionable Kitchen Intelligence,"
            highlight="Not Just Spreadsheets"
            subtitle="Monitor daily batch accuracy and student participation across every meal session."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Batch Preparation vs. Actual Consumption (kg)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Eliminates the 25%+ overproduction gap common in unassisted messes
                  </p>
                </div>
                <Badge variant="green" icon={Building2}>
                  Operator View
                </Badge>
              </div>
              <WasteReductionAreaChart />
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Student Poll Signals + Walk-In Entitlement Buffer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ensures 100% meal availability even for students who do not submit a poll
                  </p>
                </div>
                <Badge variant="green" icon={Users}>
                  Entitlement Safe
                </Badge>
              </div>
              <MealDemandBarChart />
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl font-bold text-slate-900">
          Want to See the Full Sidebar Dashboard in Action?
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Explore our interactive Workspace Preview or schedule a tailored walkthrough for your institution’s mess committee.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="primary" size="lg" to="/workspace-preview" icon={ArrowRight}>
            Open Interactive Workspace Preview
          </Button>
          <Button variant="secondary" size="lg" to="/request-demo">
            Schedule Live Demo
          </Button>
        </div>
      </section>
    </div>
  );
}
