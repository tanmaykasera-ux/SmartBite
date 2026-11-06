import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calculator,
  CalendarCheck,
  ArrowRight,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { submitDemoRequest } from '../lib/supabase';

export default function RequestDemoPage() {
  const [studentsCount, setStudentsCount] = useState(800);
  const [formState, setFormState] = useState({
    full_name: '',
    work_email: '',
    phone: '',
    institution_name: '',
    institution_type: 'college_mess',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Live ROI Estimator based on student count
  const estimatedMonthlyKgSaved = Math.round(studentsCount * 3.8);
  const estimatedMonthlyRupeesSaved = Math.round(studentsCount * 215);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await submitDemoRequest({
        ...formState,
        daily_meals_served: Number(studentsCount) * 3,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Could not submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Interactive Mess Savings Calculator & Demo Highlights */}
        <div className="lg:col-span-5 space-y-6">
          <Badge variant="green" icon={Sparkles}>
            Book Your 14-Day Institutional Pilot
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            See How Much Your Mess Can Save with SmartBite AI
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            In a 30-minute walkthrough, our institutional food engineers will show you how to forecast daily meal turnout, optimize nutrition, and onboard your students for free—while keeping 100% of their meal entitlement intact.
          </p>

          {/* Interactive Waste & ROI Estimator Card */}
          <Card className="bg-brand-950 text-white border-brand-900 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-300 flex items-center gap-1.5">
                <Calculator className="w-4 h-4" /> Instant Mess Savings Estimator
              </span>
              <Badge variant="dark">{studentsCount} Residents</Badge>
            </div>

            <div>
              <label className="block text-xs text-brand-200 mb-2">
                Slide to set your Hostel / Mess Student Strength:{' '}
                <strong className="text-white">{studentsCount} students</strong>
              </label>
              <input
                type="range"
                min={150}
                max={5000}
                step={50}
                value={studentsCount}
                onChange={(e) => setStudentsCount(Number(e.target.value))}
                className="w-full accent-brand-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-brand-400 mt-1">
                <span>150 Students</span>
                <span>2,500 Students</span>
                <span>5,000 Students</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-brand-900/90 border border-brand-800">
                <p className="text-[11px] text-brand-300">Est. Food Waste Prevented</p>
                <p className="text-2xl font-extrabold text-white mt-0.5">
                  {estimatedMonthlyKgSaved.toLocaleString()} kg
                </p>
                <p className="text-[10px] text-brand-400">per month across 4 meals/day</p>
              </div>
              <div className="p-3.5 rounded-xl bg-brand-800/90 border border-brand-600">
                <p className="text-[11px] text-brand-200 font-semibold">Est. Net Kitchen Savings</p>
                <p className="text-2xl font-extrabold text-brand-200 mt-0.5">
                  ₹{estimatedMonthlyRupeesSaved.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-brand-300">per month in raw ingredients</p>
              </div>
            </div>
          </Card>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
              <span>Custom AI demand calibration for your institution&apos;s cyclic menu</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
              <span>Free QR-code onboarding kit for 100% of your hostel students</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0" />
              <span>Guaranteed non-restrictive student meal entitlement workflow</span>
            </div>
          </div>
        </div>

        {/* Right Column: Demo Request Form */}
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-8">
            {submitted ? (
              <div className="py-12 text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-800 flex items-center justify-center mx-auto">
                  <CalendarCheck className="w-8 h-8" />
                </div>
                <Badge variant="green">Pilot Request Confirmed</Badge>
                <h2 className="text-2xl font-bold text-slate-900">
                  We’ve Reserved Your Institutional Demo!
                </h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{formState.full_name}</strong> from{' '}
                  <strong>{formState.institution_name}</strong>. Our onboarding specialist will email{' '}
                  <span className="underline">{formState.work_email}</span> with calendar slots and a custom waste-reduction forecast for your {studentsCount}-student kitchen.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Button variant="primary" to="/workspace-preview" icon={ArrowRight}>
                    Explore Interactive Workspace Now
                  </Button>
                  <Button variant="secondary" onClick={() => setSubmitted(false)}>
                    Submit Another Institution
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Request an Institutional Demo
                    </h2>
                    <p className="text-xs text-slate-500">
                      For Mess Owners, Hostel Wardens, College Deans &amp; Catering Operators
                    </p>
                  </div>
                  <Building2 className="w-6 h-6 text-brand-700 hidden sm:block" />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name &amp; Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.full_name}
                      onChange={(e) => setFormState({ ...formState, full_name: e.target.value })}
                      placeholder="e.g., Dr. Manoj Joshi (Chief Warden)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Work / Institutional Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formState.work_email}
                      onChange={(e) => setFormState({ ...formState, work_email: e.target.value })}
                      placeholder="chiefwarden@institute.ac.in"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      College / Hostel / Catering Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.institution_name}
                      onChange={(e) =>
                        setFormState({ ...formState, institution_name: e.target.value })
                      }
                      placeholder="e.g., Symbiosis Hostel Mess Block B"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Facility Type *
                    </label>
                    <select
                      value={formState.institution_type}
                      onChange={(e) =>
                        setFormState({ ...formState, institution_type: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-700"
                    >
                      <option value="college_mess">College / Engineering Mess</option>
                      <option value="hostel">University Residential Hostel</option>
                      <option value="university_cafeteria">Central Campus Cafeteria</option>
                      <option value="corporate_kitchen">Institutional Catering Contractor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Enrolled Residents (Synced from Slider)
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={50000}
                      value={studentsCount}
                      onChange={(e) => setStudentsCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Current Challenges or Goals (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder="e.g., High dinner waste on Fridays and weekends, want macro tracking for students..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Scheduling Your Demo...'
                    : 'Schedule My Custom SmartBite Demo'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
