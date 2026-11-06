import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Save,
  CheckCircle2,
  ShieldCheck,
  Lock,
  KeyRound,
  RefreshCw,
  Copy,
  Users,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function SettingsTab() {
  const {
    messProfile,
    totalRegisteredStudents,
    updateMessProfile,
    regenerateMessJoinCode,
  } = useData();
  const { user, isDemoMode, updatePassword } = useAuth();

  const liveRegisteredStudentsCount = totalRegisteredStudents;

  const [form, setForm] = useState({
    name: messProfile.name || '',
    college_name: messProfile.college_name || '',
    hostel_name: messProfile.hostel_name || '',
    contact_number: messProfile.contact_number || '',
    capacity: messProfile.capacity ?? 0,
    breakfast_time: messProfile.breakfast_time || '07:30 AM – 09:30 AM',
    lunch_time: messProfile.lunch_time || '12:30 PM – 02:30 PM',
    dinner_time: messProfile.dinner_time || '07:30 PM – 09:30 PM',
    default_cutoff_hours: messProfile.default_cutoff_hours ?? 4,
    walk_in_buffer_pct: messProfile.walk_in_buffer_pct ?? 8,
  });

  useEffect(() => {
    setForm({
      name: messProfile.name || '',
      college_name: messProfile.college_name || '',
      hostel_name: messProfile.hostel_name || '',
      contact_number: messProfile.contact_number || '',
      capacity: messProfile.capacity ?? 0,
      breakfast_time: messProfile.breakfast_time || '07:30 AM – 09:30 AM',
      lunch_time: messProfile.lunch_time || '12:30 PM – 02:30 PM',
      dinner_time: messProfile.dinner_time || '07:30 PM – 09:30 PM',
      default_cutoff_hours: messProfile.default_cutoff_hours ?? 4,
      walk_in_buffer_pct: messProfile.walk_in_buffer_pct ?? 8,
    });
  }, [messProfile]);

  const [newPassword, setNewPassword] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [joinCodeNotice, setJoinCodeNotice] = useState('');
  const [regeneratingCode, setRegeneratingCode] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateMessProfile({
      ...form,
      capacity: Number(form.capacity || 0),
      default_cutoff_hours: Number(form.default_cutoff_hours || 4),
      walk_in_buffer_pct: Number(form.walk_in_buffer_pct || 8),
    });
    setSavedMessage('Mess profile and operational timings saved successfully!');
  };

  const handleCopyJoinCode = async () => {
    const code = messProfile.join_code || 'SB-MESS01';
    try {
      await navigator.clipboard.writeText(code);
      setJoinCodeNotice(`Copied Join Code "${code}" to clipboard!`);
    } catch {
      setJoinCodeNotice(`Join Code: ${code}`);
    }
  };

  const handleRegenerateJoinCode = async () => {
    setRegeneratingCode(true);
    setJoinCodeNotice('');
    try {
      const nextCode = await regenerateMessJoinCode();
      setJoinCodeNotice(
        `Generated new Mess Join Code: ${nextCode}. Share this code with your students.`
      );
    } finally {
      setRegeneratingCode(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return;
    await updatePassword(newPassword);
    setNewPassword('');
    setPwdMessage('Account password updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Student Mess Join Code & Onboarding Card */}
      <Card className="p-6 space-y-4 border-brand-200 bg-brand-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-brand-700" />
              Student Mess Join Code &amp; Onboarding Link
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl">
              Share this unique Join Code with your students. Students can either select{' '}
              <strong>{messProfile.name || 'your mess'}</strong> from the college dropdown during registration or enter this code to link their account directly to your mess.
            </p>
          </div>
          <Badge variant="green" icon={Users}>
            {liveRegisteredStudentsCount.toLocaleString()} Linked Students in DB
          </Badge>
        </div>

        {joinCodeNotice && (
          <div className="p-3 rounded-xl bg-white border border-brand-300 text-xs font-semibold text-brand-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
            <span>{joinCodeNotice}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-brand-200">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Mess Join Code
            </span>
            <p className="text-2xl font-mono font-extrabold text-brand-900 tracking-wider mt-0.5">
              {messProfile.join_code || 'SB-MESS01'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Copy}
              iconPosition="left"
              onClick={handleCopyJoinCode}
            >
              Copy Join Code
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={RefreshCw}
              iconPosition="left"
              disabled={regeneratingCode}
              onClick={handleRegenerateJoinCode}
            >
              {regeneratingCode ? 'Regenerating...' : 'Regenerate Code'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Mess Profile & Operational Timings Card */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-700" />
              Mess Profile &amp; Kitchen Operational Settings
            </h2>
            <p className="text-xs text-slate-500">
              Configure your institutional mess details, student capacity, and AI walk-in safety buffer
            </p>
          </div>
          <Badge variant="green" icon={Settings}>
            Mess Owner Settings
          </Badge>
        </div>

        {savedMessage && (
          <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mess / Kitchen Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College / Institution Name *
              </label>
              <input
                type="text"
                required
                value={form.college_name}
                onChange={(e) =>
                  setForm({ ...form, college_name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hostel Blocks Served
              </label>
              <input
                type="text"
                value={form.hostel_name}
                onChange={(e) =>
                  setForm({ ...form, hostel_name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={form.contact_number}
                onChange={(e) =>
                  setForm({ ...form, contact_number: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Capacity (Max Seats)
              </label>
              <input
                type="number"
                min={0}
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registered Students (Live DB Count)
              </label>
              <div className="w-full px-3.5 py-2.5 rounded-xl border border-brand-200 bg-brand-50/70 text-sm font-extrabold text-brand-900 flex items-center justify-between">
                <span>{liveRegisteredStudentsCount.toLocaleString()}</span>
                <span className="text-[10px] font-bold uppercase text-brand-700">
                  Real DB Rows
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Breakfast Serving Window
              </label>
              <input
                type="text"
                value={form.breakfast_time}
                onChange={(e) =>
                  setForm({ ...form, breakfast_time: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lunch Serving Window
              </label>
              <input
                type="text"
                value={form.lunch_time}
                onChange={(e) =>
                  setForm({ ...form, lunch_time: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dinner Serving Window
              </label>
              <input
                type="text"
                value={form.dinner_time}
                onChange={(e) =>
                  setForm({ ...form, dinner_time: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Selection Cutoff (Hours Before Meal)
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={form.default_cutoff_hours}
                onChange={(e) =>
                  setForm({ ...form, default_cutoff_hours: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Walk-In Entitlement Safety Buffer (%)
              </label>
              <input
                type="number"
                min={3}
                max={30}
                value={form.walk_in_buffer_pct}
                onChange={(e) =>
                  setForm({ ...form, walk_in_buffer_pct: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-950 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-800 shrink-0" />
            <span>
              <strong>Entitlement Rule Enforced:</strong> Students always retain their dining entitlement regardless of whether they submit a selection before the cutoff window.
            </span>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              iconPosition="left"
            >
              Save Mess Profile Settings
            </Button>
          </div>
        </form>
      </Card>

      {/* Account & Password Settings */}
      <Card className="p-6 space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-700" />
            Account &amp; Security Settings
          </h3>
          <p className="text-xs text-slate-500">
            Signed in as{' '}
            <strong>{user?.fullName || messProfile.owner_name}</strong> (
            {user?.email || messProfile.owner_email})
          </p>
        </div>

        {pwdMessage && (
          <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
            <span>{pwdMessage}</span>
          </div>
        )}

        <form
          onSubmit={handlePasswordChange}
          className="flex flex-col sm:flex-row items-end gap-4"
        >
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Update Account Password (min 6 characters)
            </label>
            <input
              type="password"
              minLength={6}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <Button type="submit" variant="secondary">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
