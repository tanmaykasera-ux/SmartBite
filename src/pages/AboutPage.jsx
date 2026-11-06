import React from 'react';
import {
  Leaf,
  Target,
  ShieldCheck,
  HeartHandshake,
  Building2,
  Users,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Ban,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import SectionHeader from '../components/common/SectionHeader';

export default function AboutPage() {
  return (
    <div className="py-16 space-y-20">
      {/* Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-5">
          <Badge variant="green" icon={Leaf}>
            About SmartBite • Eat Smart. Waste Less.
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Re-Engineering Institutional Dining with{' '}
            <span className="text-brand-800">AI & Nutrition Science</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Across colleges, universities, and hostels, up to 30% of prepared food is discarded every day—not because students don&apos;t care, but because institutional kitchens lack real-time demand visibility and dish-level feedback.
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8 bg-brand-950 text-white border-brand-900 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-brand-800 flex items-center justify-center text-brand-300">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            <p className="text-sm text-brand-100/90 leading-relaxed">
              To empower every college mess, hostel kitchen, and institutional cafeteria with predictive demand intelligence—slashing food waste by over one-third while reinvesting those savings into higher-protein, nutrient-dense meals for students.
            </p>
          </Card>

          <Card className="p-8 bg-white border-slate-200 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-800">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Our Entitlement-First Philosophy
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We believe technology in a hostel mess must build trust, never anxiety. Students already pay mess fees to their institution; therefore, SmartBite is <strong>100% free for students</strong> and <strong>never revokes meal entitlement</strong> even if a student forgets to submit a daily meal selection.
            </p>
          </Card>
        </div>
      </section>

      {/* How Our Business Model Works */}
      <section className="bg-white border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <SectionHeader
            badge="Transparent Institutional Model"
            badgeIcon={Sparkles}
            title="How SmartBite Creates Value for"
            highlight="Every Campus Stakeholder"
            subtitle="We are a pure-play B2B Institutional FoodTech SaaS—not a consumer food delivery app or restaurant marketplace."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="space-y-3">
              <Badge variant="dark" icon={Building2}>
                Paying Customers
              </Badge>
              <h3 className="text-lg font-bold text-slate-900">
                Mess Owners & Institutional Operators
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mess contractors, hostel committees, and university dining departments subscribe to SmartBite to accurately predict meal turnout, optimize raw ingredient purchases, and eliminate overproduction waste.
              </p>
            </Card>

            <Card className="space-y-3">
              <Badge variant="green" icon={Users}>
                Free Campus Users
              </Badge>
              <h3 className="text-lg font-bold text-slate-900">
                Hostel & College Students
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Students use SmartBite free of charge to inspect daily calories and macros, indicate preferred meals or portion sizes, and give honest taste feedback that directly improves the weekly menu.
              </p>
            </Card>

            <Card className="space-y-3 bg-cream-100/70">
              <Badge variant="amber" icon={ShieldCheck}>
                Protected Dining Rights
              </Badge>
              <h3 className="text-lg font-bold text-slate-900">
                Unconditional Meal Entitlement
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Student meal selections act as a statistical signal for our AI engine. Our walk-in buffer algorithm accounts for unpolled students so nobody is ever turned away at the dining counter.
              </p>
            </Card>
          </div>

          {/* Comparison Table: SmartBite vs Delivery Apps vs Legacy Messes */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-soft">
            <table className="w-full text-left border-collapse bg-white text-sm">
              <thead>
                <tr className="bg-cream-100 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-4 px-5">Dimension</th>
                  <th className="py-4 px-5 text-brand-800">SmartBite Institutional SaaS</th>
                  <th className="py-4 px-5">Traditional Unassisted Mess</th>
                  <th className="py-4 px-5">Online Food Ordering Apps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-900">Primary Purpose</td>
                  <td className="py-3.5 px-5 text-brand-900 font-semibold">
                    AI Demand Estimation, Waste Reduction &amp; Nutrition
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">Manual Rule-of-Thumb Cooking</td>
                  <td className="py-3.5 px-5 text-slate-500">Commercial Paid Food Delivery</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-900">Who Pays?</td>
                  <td className="py-3.5 px-5 text-brand-900 font-semibold">
                    Mess Owners &amp; Institutions (Students ₹0)
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">Hidden in 25–35% Food Waste Costs</td>
                  <td className="py-3.5 px-5 text-slate-500">Students Pay Per Order + Delivery Fees</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-900">Student Meal Entitlement</td>
                  <td className="py-3.5 px-5 text-brand-900 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-700" /> 100% Guaranteed (With or Without Poll)
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">Guaranteed, but Frequent Item Shortages</td>
                  <td className="py-3.5 px-5 text-slate-500 flex items-center gap-1.5">
                    <Ban className="w-4 h-4 text-slate-400" /> Not Applicable
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-900">Nutrition Intelligence</td>
                  <td className="py-3.5 px-5 text-brand-900 font-semibold">
                    Complete Calorie, Protein &amp; Micronutrient Tracking
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">None (Paper Noticeboard Menu)</td>
                  <td className="py-3.5 px-5 text-slate-500">Limited / Restaurant Marketing</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl font-bold text-slate-900">
          Bring SmartBite to Your Campus Dining Hall
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Talk to our institutional food specialists to see how much your hostel or cafeteria can save every month.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="primary" size="lg" to="/request-demo" icon={ArrowRight}>
            Request a Demo
          </Button>
          <Button variant="secondary" size="lg" to="/contact">
            Contact Our Team
          </Button>
        </div>
      </section>
    </div>
  );
}
