import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf,
  Building2,
  Users,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useAuth, getDashboardPathForRole } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, loginWithDemoRole, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();

  const handleSupabaseLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      const { user: loggedInUser } = await login({ email, password });
      navigate(getDashboardPathForRole(loggedInUser.role));
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoRoleLogin = (role) => {
    const { user: demoUser } = loginWithDemoRole(role);
    navigate(getDashboardPathForRole(demoUser.role));
  };

  return (
    <div className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Informational Column */}
        <div className="lg:col-span-5 space-y-6">
          <Badge variant="green" icon={Leaf}>
            Role-Based Institutional Authentication
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Sign In to SmartBite
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            SmartBite automatically routes you to your authorized workspace based on your verified role: Mess Owner, Student, or Super Admin.
          </p>

          <div className="space-y-3 pt-1">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-800 text-white flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">1. Mess Owner</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Full access to the 11-module Mess Owner Dashboard (menus, selections, AI forecasting, waste, inventory, purchase planning, nutrition &amp; reports).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-800 border border-brand-200 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">2. Student (100% Free User)</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Select preferred meals, inspect daily macros, and rate dishes while retaining unconditional meal entitlement.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">3. Super Admin</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Protected platform governance across colleges, messes, subscriptions, and demo requests.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Login Form + Clearly Separated Demo Mode */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Supabase Auth Sign In
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isSupabaseConfigured
                    ? 'Connected to live Supabase project'
                    : 'Supabase .env not configured — see Demo Mode section below'}
                </p>
              </div>
              <Badge variant={isSupabaseConfigured ? 'green' : 'amber'}>
                {isSupabaseConfigured ? 'Live Auth Ready' : 'Config Pending'}
              </Badge>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSupabaseLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@institution.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password *
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-brand-700 font-semibold hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                icon={ArrowRight}
                disabled={submitting}
              >
                {submitting ? 'Authenticating...' : 'Sign In with Email & Password'}
              </Button>
            </form>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
              <span>New to SmartBite?</span>
              <Link
                to="/register"
                className="font-bold text-brand-800 hover:underline inline-flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Create Mess Owner or Student Account →
              </Link>
            </div>
          </Card>

          {/* Clearly Separated Demo Mode Card */}
          <Card className="p-6 bg-amber-50/70 border-2 border-amber-200/90 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  Clearly Separated Interactive Demo Mode
                </span>
                <p className="text-xs text-amber-900/80 leading-relaxed">
                  {isSupabaseConfigured
                    ? 'You can also launch a pre-populated Demo session below to inspect role-based dashboards immediately.'
                    : 'Supabase credentials (.env) are not connected yet. Use the explicit Demo Mode role launchers below to test the full Mess Owner Dashboard and Role-Based Access Control (RBAC).'}
                </p>
              </div>
              <Badge variant="amber">Demo Mode</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleDemoRoleLogin('mess_owner')}
                className="p-3.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-left transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <Building2 className="w-4 h-4 text-brand-300" />
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-700 text-brand-100">
                    Primary
                  </span>
                </div>
                <p className="text-xs font-bold mt-2">Enter as Mess Owner</p>
                <p className="text-[10px] text-brand-200 mt-0.5">
                  Opens Full 11-Tab Dashboard
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoRoleLogin('student')}
                className="p-3.5 rounded-xl bg-white hover:bg-cream-100 text-slate-900 border border-amber-300 text-left transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <Users className="w-4 h-4 text-brand-700" />
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-800">
                    Free Role
                  </span>
                </div>
                <p className="text-xs font-bold mt-2">Enter as Student</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Tests Student RBAC Guard
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoRoleLogin('super_admin')}
                className="p-3.5 rounded-xl bg-white hover:bg-cream-100 text-slate-900 border border-amber-300 text-left transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Protected
                  </span>
                </div>
                <p className="text-xs font-bold mt-2">Enter as Super Admin</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Tests Admin Console Access
                </p>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
