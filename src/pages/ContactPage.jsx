import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Send,
  Building2,
  MessageSquare,
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import SectionHeader from '../components/common/SectionHeader';
import RevealOnScroll from '../components/common/RevealOnScroll';
import { submitContactMessage, isSupabaseConfigured } from '../lib/supabase';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    institution_name: '',
    topic: 'Institutional SaaS Inquiry',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await submitContactMessage(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Unable to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden py-16 lg:py-20 bg-gradient-to-b from-brand-50/70 via-cream-50 to-white bg-subtle-dots">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-brand-200/35 blur-3xl"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative">
        <SectionHeader
          badge="Get in Touch"
          badgeIcon={MessageSquare}
          title="Speak with Our Institutional"
          highlight="FoodTech Specialists"
          subtitle="Whether you are a college dean, chief hostel warden, catering contractor, or student mess secretary, our team is ready to help."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Info Cards */}
          <RevealOnScroll className="lg:col-span-5 space-y-5">
            <Card className="bg-brand-950 text-white border-brand-900 space-y-5 overflow-hidden p-0">
              <div className="relative h-40 overflow-hidden">
                <img
                  src="/images/food-thali.jpg"
                  alt="Balanced Indian vegetarian campus thali meal"
                  width="560"
                  height="260"
                  loading="lazy"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/60 to-transparent flex items-end p-6">
                  <div>
                    <Badge variant="dark">Campus Dining Partnerships</Badge>
                    <h3 className="text-lg font-bold text-white mt-1.5">
                      SmartBite Institutional Desk
                    </h3>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-4">
                <p className="text-xs text-brand-200 leading-relaxed">
                  Built for engineering colleges, medical institutes, universities, and residential hostels across India.
                </p>

                <div className="space-y-4 pt-1 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center text-brand-300 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white">
                        Institutional Partnerships
                      </p>
                      <p className="text-brand-200">partnerships@smartbite.ai</p>
                      <p className="text-brand-300">support@smartbite.ai</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center text-brand-300 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Direct Helpline</p>
                      <p className="text-brand-200">+91 (80) 4568-2910</p>
                      <p className="text-brand-300">
                        +91 98450-11290 (WhatsApp Campus Desk)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center text-brand-300 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Headquarters</p>
                      <p className="text-brand-200">
                        SmartBite Technologies Pvt. Ltd., 27th Main Road, HSR Layout Sector 2, Bengaluru, KA 560102
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center text-brand-300 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white">
                        Kitchen Support Hours
                      </p>
                      <p className="text-brand-200">
                        06:00 AM – 10:30 PM IST (Aligned with Mess Breakfast to Dinner Shifts)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="flex items-center justify-between bg-gradient-to-r from-white to-brand-50/50">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-brand-700" />
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Looking for a Live Product Walkthrough?
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Explore our interactive mess savings estimator
                  </p>
                </div>
              </div>
              <Button variant="soft" size="sm" to="/request-demo">
                Book Demo
              </Button>
            </Card>
          </RevealOnScroll>

          {/* Contact Form */}
          <RevealOnScroll delayMs={100} className="lg:col-span-7">
            <Card className="p-6 sm:p-8 bg-white shadow-elevated">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-800 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <Badge variant="green">
                    {isSupabaseConfigured
                      ? 'Saved to Supabase contact_messages'
                      : 'Saved in Demo Mode'}
                  </Badge>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Message Received!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Thank you, <strong>{formData.full_name}</strong>. Our institutional team will respond to{' '}
                    <span className="underline">{formData.email}</span> within 4 business hours.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Send Us a Message
                      </h3>
                      <p className="text-xs text-slate-500">
                        All institutional and student council inquiries welcome
                      </p>
                    </div>
                    <Badge variant="green">Fast Response</Badge>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({ ...formData, full_name: e.target.value })
                        }
                        placeholder="Prof. S. Radhakrishnan"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="warden@college.edu.in"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        College / Hostel / Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.institution_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            institution_name: e.target.value,
                          })
                        }
                        placeholder="Vellore Campus Hostels"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Inquiry Topic
                      </label>
                      <select
                        value={formData.topic}
                        onChange={(e) =>
                          setFormData({ ...formData, topic: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-700"
                      >
                        <option>Institutional SaaS Inquiry</option>
                        <option>Multi-Hostel Enterprise Quote</option>
                        <option>Student Mess Council Partnership</option>
                        <option>Nutritionist / Menu Audit</option>
                        <option>Technical / Supabase Integration</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      How can we help your institution? *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Tell us about your hostel student strength, current mess setup, and waste reduction goals..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={Send}
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </Card>
          </RevealOnScroll>
        </div>
      </div>
    </div>
  );
}
