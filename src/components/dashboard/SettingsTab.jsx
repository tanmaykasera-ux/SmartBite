import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Clock,
  ShieldCheck,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function SettingsTab() {
  const { messProfile, updateMessProfile } = useData();
  const [form, setForm] = useState(messProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(messProfile);
  }, [messProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateMessProfile({
      ...form,
      capacity: Number(form.capacity),
      registered_students: Number(form.registered_students),
      default_cutoff_hours: Number(form.default_cutoff_hours || 2),
      cutoff_hours: Number(form.default_cutoff_hours || 2),
      walk_in_buffer_pct: Number(form.walk_in_buffer_pct || 5),
      guest_buffer_pct: Number(form.walk_in_buffer_pct || 5),
      safety_buffer_pct: Number(form.safety_buffer_pct || 5),
      cost_per_plate: Number(form.cost_per_plate || 65),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {saved && (
        <div className="p-4 rounded-xl bg-brand-900 text-white text-xs font-semibold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-brand-300" />
          <span>
            Mess profile, meal timings, poll cutoff hours, and plate buffer settings updated!
          </span>
        </div>
      )}

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Mess Profile &amp; Plate Poll Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Configure hostel capacity, meal serving windows, poll cutoff hours, and plate buffers
              </p>
            </div>
          </div>
          <Badge variant="green">
            {messProfile.plan_name || 'Active Mess'}
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mess Name *
              </label>
              <input
                type="text"
                required
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                College / University Name *
              </label>
              <input
                type="text"
                required
                value={form.college_name || ''}
                onChange={(e) =>
                  setForm({ ...form, college_name: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hostel Blocks Covered
              </label>
              <input
                type="text"
                value={form.hostel_name || ''}
                onChange={(e) =>
                  setForm({ ...form, hostel_name: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Seating / Dining Capacity
              </label>
              <input
                type="number"
                required
                value={form.capacity ?? 0}
                onChange={(e) =>
                  setForm({ ...form, capacity: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enrolled Students (Live DB Count)
              </label>
              <input
                type="number"
                readOnly
                value={form.registered_students ?? 0}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-brand-900"
              />
            </div>
          </div>

          {/* Meal Serving Windows & Poll Timing Rules */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-700" />
                <span>
                  Meal Timings (Asia/Kolkata) &amp; Sequential Attendance Poll Schedule
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Breakfast ends &rarr; Lunch poll opens. Lunch ends &rarr; Dinner poll opens. Dinner ends &rarr; Next day&rsquo;s Breakfast poll opens. Each poll closes at the cutoff hours before its meal starts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Breakfast Window
                </label>
                <input
                  type="text"
                  value={form.breakfast_time || '07:30 AM – 09:30 AM'}
                  onChange={(e) =>
                    setForm({ ...form, breakfast_time: e.target.value })
                  }
                  placeholder="07:30 AM – 09:30 AM"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lunch Window
                </label>
                <input
                  type="text"
                  value={form.lunch_time || '12:30 PM – 02:30 PM'}
                  onChange={(e) =>
                    setForm({ ...form, lunch_time: e.target.value })
                  }
                  placeholder="12:30 PM – 02:30 PM"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dinner Window
                </label>
                <input
                  type="text"
                  value={form.dinner_time || '07:30 PM – 09:30 PM'}
                  onChange={(e) =>
                    setForm({ ...form, dinner_time: e.target.value })
                  }
                  placeholder="07:30 PM – 09:30 PM"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Plate Forecasting & Cutoff Parameters */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-700" />
              <span>
                Poll Cutoff, Walk-In Guest Buffer &amp; Safety Buffer Parameters
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Poll Cutoff Hours Before Meal
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={form.default_cutoff_hours ?? 2}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      default_cutoff_hours: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Poll locks this many hours before meal start.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Walk-In / Guest Buffer (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  step="0.5"
                  value={form.walk_in_buffer_pct ?? 5}
                  onChange={(e) =>
                    setForm({ ...form, walk_in_buffer_pct: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-brand-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Added to expected plates per meal.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recommended Prep Safety Buffer (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  step="0.5"
                  value={form.safety_buffer_pct ?? 5}
                  onChange={(e) =>
                    setForm({ ...form, safety_buffer_pct: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-brand-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Recommended prep = expected plates + safety buffer %.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Default Cost per Plate (₹)
                </label>
                <input
                  type="number"
                  min="10"
                  step="1"
                  value={form.cost_per_plate ?? 65}
                  onChange={(e) =>
                    setForm({ ...form, cost_per_plate: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Default plate cost used in Food Waste logging.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" variant="primary" icon={Save}>
              Save Mess Configuration
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
