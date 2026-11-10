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
import RevealOnScroll from '../components/common/RevealOnScroll';

export default function AboutPage() {
  return (
    <div className="space-y-0">
      {/* Hero Banner with Supporting Food & Kitchen Imagery */}
      <section className="relative overflow-hidden py-16 lg:py-20 bg-gradient-to-b from-brand-50/80 via-cream-50 to-white border-b border-slate-200/70 bg-subtle-dots">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-10 w-96 h-96 rounded-full bg-brand-200/35 blur-3xl"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <RevealOnScroll className="lg:col-span-7 space-y-5">
              <Badge variant="green" icon={Leaf}>
                About SmartBite • Eat Smart. Waste Less.
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Re-Engineering Institutional Dining with{' '}
                <span className="text-brand-800">AI &amp; Nutrition Science</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Across colleges, universities, and hostels, large quantities of prepared food are discarded every day—not because students don&apos;t care, but because institutional kitchens lack real-time demand visibility and dish-level feedback.
              </p>
            </RevealOnScroll>

            <RevealOnScroll delayMs={120} className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border-2 border-brand-200/80 shadow-elevated bg-white">
                <img
                  src="/images/hero-indian-thali.jpg"
                  alt="Freshly prepared Indian institutional thali with dal, palak paneer, jeera rice, rotis, and salad"
                  width="640"
                  height="440"
                  loading="lazy"
                  className="w-full h-64 sm:h-72 object-cover"
                />
                <div className="p-4 bg-brand-950 text-white flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-brand-200">
                      Wholesome Campus Meals, Zero Guesswork
                    </p>
                    <p className="text-[11px] text-brand-100/80">
                      Designed for messes, hostels &amp; institutional cafeterias
                    </p>
                  </div>
                  <Badge variant="dark">Eat Smart</Badge>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* Mission & Vision Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <RevealOnScroll>
              <Card className="h-full p-8 bg-brand-950 text-white border-brand-900 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-800 flex items-center justify-center text-brand-300">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">Our Mission</h2>
                <p className="text-sm text-brand-100/90 leading-relaxed">
                  To empower every college mess, hostel kitchen, and institutional cafeteria with predictive demand intelligence—helping reduce avoidable food waste while reinvesting savings into higher-protein, nutrient-dense meals for students.
                </p>
              </Card>
            </RevealOnScroll>

            <RevealOnScroll delayMs={100}>
              <Card className="h-full p-8 bg-gradient-to-br from-white via-white to-brand-50/50 border-slate-200 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-800">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Our Entitlement-First Philosophy
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We believe technology in a hostel mess must build trust, never anxiety. Students already pay mess fees to their institution; therefore, SmartBite is <strong>100% free for students</strong> and <strong>never revokes meal entitlement</strong> even if a student forgets to submit a daily meal selection.
                </p>
              </Card>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* How Our Business Model Works */}
      <section className="bg-cream-50 py-20 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <SectionHeader
            badge="Transparent Institutional Model"
            badgeIcon={Sparkles}
            title="How SmartBite Creates Value for"
            highlight="Every Campus Stakeholder"
            subtitle="We are a pure-play B2B Institutional FoodTech SaaS—not a consumer food delivery app or restaurant marketplace."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover className="space-y-3 bg-white">
              <Badge variant="dark" icon={Building2}>
                Paying Customers
              </Badge>
              <h3 className="text-lg font-bold text-slate-900">
                Mess Owners &amp; Institutional Operators
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mess contractors, hostel committees, and university dining departments subscribe to SmartBite to forecast meal turnout, optimize raw ingredient purchases, and reduce overproduction waste.
              </p>
            </Card>

            <Card hover className="space-y-3 bg-white">
              <Badge variant="green" icon={Users}>
                Free Campus Users
              </Badge>
              <h3 className="text-lg font-bold text-slate-900">
                Hostel &amp; College Students
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Students use SmartBite free of charge to inspect daily calories and macros, indicate preferred meals or dishes, and give honest taste feedback that directly improves the weekly menu.
              </p>
            </Card>

            <Card hover className="space-y-3 bg-gradient-to-br from-brand-50/70 to-cream-100/80 border-brand-200">
              <Badge variant="amber" icon={ShieldCheck}>
                Protected Dining Rights
              </Badge>
              <h3 className="text-lg font-bold text-slate-900">
                Unconditional Meal Entitlement
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Student meal selections act as a demand signal for our planning engine. Our walk-in buffer accounts for unpolled students so nobody is ever turned away at the dining counter.
              </p>
            </Card>
          </div>

          {/* Comparison Table: SmartBite vs Delivery Apps vs Legacy Messes */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-soft bg-white">
            <table className="w-full text-left border-collapse bg-white text-sm">
              <thead>
                <tr className="bg-cream-100 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-4 px-5">Dimension</th>
                  <th className="py-4 px-5 text-brand-800">
                    SmartBite Institutional SaaS
                  </th>
                  <th className="py-4 px-5">Traditional Unassisted Mess</th>
                  <th className="py-4 px-5">Online Food Ordering Apps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-900">
                    Primary Purpose
                  </td>
                  <td className="py-3.5 px-5 text-brand-900 font-semibold">
                    AI Demand Estimation, Waste Reduction &amp; Nutrition
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    Manual Rule-of-Thumb Cooking
                  </td>
                  <td className="py-3.5 px-5 text-slate-500">
                    Commercial Paid Food Delivery
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-900">
                    Who Pays?
                  </td>
                  <td className="py-3.5 px-5 text-brand-900 font-semibold">
                    Mess Owners &amp; Institutions (Students ₹0)
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    Hidden in Unplanned Overproduction Waste
                  </td>
                  <td className="py-3.5 px-5 text-slate-500">
                    Students Pay Per Order + Delivery Fees
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-900">
                    Student Meal Entitlement
                  </td>
                  <td className="py-3.5 px-5 text-brand-900 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-700" /> 100%
                    Guaranteed (With or Without Poll)
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    Guaranteed, but Frequent Item Shortages
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 flex items-center gap-1.5">
                    <Ban className="w-4 h-4 text-slate-400" /> Not Applicable
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-slate-900">
                    Nutrition Intelligence
                  </td>
                  <td className="py-3.5 px-5 text-brand-900 font-semibold">
                    Complete Calorie, Protein &amp; Macro Tracking
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    None (Paper Noticeboard Menu)
                  </td>
                  <td className="py-3.5 px-5 text-slate-500">
                    Limited / Restaurant Marketing
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Bring SmartBite to Your Campus Dining Hall
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Talk to our institutional food specialists to see how your hostel or cafeteria can plan menus and reduce daily waste.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              to="/request-demo"
              icon={ArrowRight}
            >
              Request a Demo
            </Button>
            <Button variant="secondary" size="lg" to="/contact">
              Contact Our Team
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
