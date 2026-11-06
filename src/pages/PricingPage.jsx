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
import { pricingPlans } from '../data/mockData';

export default function PricingPage() {
  const [annualBilling, setAnnualBilling] = useState(true);

  return (
    <div className="py-16 space-y-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeader
          badge="Simple Institutional SaaS Pricing"
          badgeIcon={Sparkles}
          title="Mess Operators Subscribe."
          highlight="Students Eat & Use SmartBite Free."
          subtitle="Every plan includes unlimited free student accounts, unconditional student meal entitlement protection, and typically pays for itself within the first 9 days of food waste savings."
        />

        {/* Student Free Banner */}
        <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-brand-50 border border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-800 text-white flex items-center justify-center shrink-0">
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
        </div>

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
            <Badge variant="green">Save 18%</Badge>
          </span>
        </div>

        {/* Pricing Cards Grid */}
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
                    Most Popular for Colleges
                  </span>
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
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
                        / mess / month
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
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionHeader
          badge="Pricing & Policy FAQs"
          badgeIcon={HelpCircle}
          title="Frequently Asked Questions"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              q: 'Do students ever have to pay to use SmartBite?',
              a: 'Never. SmartBite is 100% free for students. Mess owners, hostel administrations, or institutional food contractors pay the SaaS subscription because they directly realize huge savings from reduced food waste.',
            },
            {
              q: 'What happens if a student does not submit a meal selection on the app?',
              a: 'The student still gets their meal without any hassle or penalty! Students retain 100% of their existing meal entitlement regardless of whether they submit a selection. Our AI automatically calculates a safety walk-in buffer for unpolled students.',
            },
            {
              q: 'Is SmartBite an online food ordering or delivery platform?',
              a: 'No. SmartBite is an institutional B2B food management and nutrition intelligence platform designed for fixed-menu or buffet messes, hostels, and campus cafeterias.',
            },
            {
              q: 'How quickly do messes see a return on investment (ROI)?',
              a: 'A 1,000-student mess typically saves ₹1.4 Lakhs to ₹2.8 Lakhs per month in prevented raw material overproduction—delivering a 10x+ return on the monthly SaaS subscription.',
            },
          ].map((faq) => (
            <Card key={faq.q} className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.a}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
