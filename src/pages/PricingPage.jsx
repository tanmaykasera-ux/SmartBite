import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Users,
  Building2,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import SectionHeader from '../components/common/SectionHeader';
import RevealOnScroll from '../components/common/RevealOnScroll';
import { pricingPlans } from '../data/mockData';

export default function PricingPage() {
  const [annualBilling, setAnnualBilling] = useState(true);

  return (
    <div className="space-y-0">
      <section className="relative overflow-hidden py-16 lg:py-20 bg-gradient-to-b from-brand-50/80 via-cream-50 to-white border-b border-slate-200/70 bg-subtle-dots">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 left-1/3 w-96 h-96 rounded-full bg-brand-200/35 blur-3xl"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative">
          <SectionHeader
            badge="Indicative Institutional SaaS Pricing"
            badgeIcon={Sparkles}
            title="Mess Operators Subscribe."
            highlight="Students Eat & Use SmartBite Free."
            subtitle="Indicative proposed plans for institutional kitchens and mess operators. Every plan includes unlimited free student accounts and unconditional student meal entitlement protection."
          />

          {/* Student Free Banner */}
          <RevealOnScroll className="max-w-3xl mx-auto p-5 rounded-2xl bg-gradient-to-r from-brand-50 via-white to-brand-50 border border-brand-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-brand-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-950">
                  Are you a College or Hostel Student?
                </p>
                <p className="text-xs text-brand-800">
                  SmartBite is <strong>₹0 forever for students</strong>. Your meal entitlement is never restricted.
                </p>
              </div>
            </div>
            <Button variant="primary" size="sm" to="/register">
              Free Student Sign Up
            </Button>
          </RevealOnScroll>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span
              className={`text-sm font-semibold ${
                !annualBilling ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              Monthly Institutional Billing
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
              Annual Semester Contract
              <Badge variant="green">Save ~18%</Badge>
            </span>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
            {pricingPlans.map((plan, idx) => (
              <RevealOnScroll key={plan.id} delayMs={idx * 90}>
                <Card
                  hover
                  className={`h-full flex flex-col justify-between p-7 relative transition-all duration-300 hover:-translate-y-1.5 ${
                    plan.popular
                      ? 'border-2 border-brand-800 shadow-elevated ring-4 ring-brand-800/5 bg-gradient-to-b from-white via-white to-brand-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-6">
                      <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-brand-800 text-white shadow-sm">
                        Most Popular • Indicative Plan
                      </span>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900">
                          {plan.name}
                        </h3>
                        <Badge variant="neutral" icon={Building2}>
                          {plan.capacity}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">{plan.subtitle}</p>
                    </div>

                    <div className="pt-2 pb-4 border-b border-slate-100">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-extrabold text-slate-900">
                          {annualBilling ? plan.annualPrice : plan.monthlyPrice}
                        </span>
                        {plan.monthlyPrice !== 'Custom' && (
                          <span className="text-xs text-slate-500 font-medium">
                            / mess / month (Indicative)
                          </span>
                        )}
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
                      to="/request-demo"
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

      {/* FAQ Section */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <SectionHeader
            badge="Pricing & Policy FAQs"
            badgeIcon={HelpCircle}
            title="Frequently Asked Questions"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: 'Do students ever have to pay to use SmartBite?',
                a: 'Never. SmartBite is 100% free for students. Mess owners, hostel administrations, or institutional food contractors subscribe because they benefit directly from better demand planning and reduced food waste.',
              },
              {
                q: 'What happens if a student does not submit a meal selection on the app?',
                a: 'The student still gets their meal without any hassle or penalty! Students retain 100% of their existing meal entitlement regardless of whether they submit a selection. Our system includes a configurable walk-in buffer for unpolled students.',
              },
              {
                q: 'Is SmartBite an online food ordering or delivery platform?',
                a: 'No. SmartBite is an institutional B2B food management and nutrition intelligence platform designed for fixed-menu or buffet messes, hostels, and campus cafeterias.',
              },
              {
                q: 'How is return on investment (ROI) modeled for a mess?',
                a: 'In an illustrative 1,000-student mess scenario, preventing 15%–25% of daily overproduction helps offset raw ingredient wastage while improving dish planning and nutritional transparency.',
              },
            ].map((faq, idx) => (
              <RevealOnScroll key={faq.q} delayMs={idx * 70}>
                <Card
                  hover
                  className="h-full space-y-2 bg-gradient-to-br from-white to-brand-50/30"
                >
                  <h3 className="text-sm font-bold text-slate-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </Card>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
