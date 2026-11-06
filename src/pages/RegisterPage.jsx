import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  AlertCircle,
  KeyRound,
  Utensils,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useAuth, getDashboardPathForRole } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function RegisterPage() {
  const [role, setRole] = useState('mess_owner');

  // Shared fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeName, setCollegeName] = useState('');

  // Mess Owner specific fields
  const [messName, setMessName] = useState('');
  const [phone, setPhone] = useState('');

  // Student specific fields (College -> Active Mess Dropdown OR Join Code)
  const [activeMesses, setActiveMesses] = useState([]);
  const [loadingMesses, setLoadingMesses] = useState(false);
  const [selectedCollegeName, setSelectedCollegeName] = useState('');
  const [selectedMessId, setSelectedMessId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [hostelName, setHostelName] = useState('');
  const [studentId, setStudentId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, loginWithDemoRole, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();

  // Fetch active messes from Supabase so students can select their college & mess from a dropdown
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let mounted = true;
    setLoadingMesses(true);
    supabase
      .from('messes')
      .select('id, name, college_id, college_name, hostel_name, join_code, status')
      .eq('status', 'active')
      .order('college_name', { ascending: true })
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (!mounted) return;
        const rows = data || [];
        setActiveMesses(rows);
        if (rows.length > 0 && !selectedCollegeName) {
          setSelectedCollegeName(rows[0].college_name);
        }
      })
      .finally(() => {
        if (mounted) setLoadingMesses(false);
      });

    return () => {
      mounted = false;
    };
  }, [isSupabaseConfigured]);

  // Unique college names that have active messes
  const collegeOptions = useMemo(() => {
    const names = new Set();
    activeMesses.forEach((m) => {
      if (m.college_name?.trim()) names.add(m.college_name.trim());
    });
    return Array.from(names);
  }, [activeMesses]);

  // Active messes filtered by the student's chosen college
  const messesForSelectedCollege = useMemo(() => {
    if (!selectedCollegeName) return activeMesses;
    return activeMesses.filter(
      (m) =>
        (m.college_name || '').trim().toLowerCase() ===
        selectedCollegeName.trim().toLowerCase()
    );
  }, [activeMesses, selectedCollegeName]);

  // Auto-select first mess when college changes if current mess is not in that college
  useEffect(() => {
    if (role !== 'student') return;
    if (messesForSelectedCollege.length > 0) {
      const stillValid = messesForSelectedCollege.some(
        (m) => m.id === selectedMessId
      );
      if (!stillValid) {
        setSelectedMessId(messesForSelectedCollege[0].id);
      }
    } else {
      setSelectedMessId('');
    }
  }, [role, selectedCollegeName, messesForSelectedCollege]);

  // Match mess by Join Code if entered by student
  const matchedMessByCode = useMemo(() => {
    const trimmed = joinCode.trim().toUpperCase();
    if (!trimmed) return null;
    return (
      activeMesses.find(
        (m) => (m.join_code || '').trim().toUpperCase() === trimmed
      ) || null
    );
  }, [joinCode, activeMesses]);

  // If Join Code matches an active mess, sync dropdown selection automatically
  useEffect(() => {
    if (matchedMessByCode) {
      setSelectedCollegeName(matchedMessByCode.college_name || '');
      setSelectedMessId(matchedMessByCode.id);
    }
  }, [matchedMessByCode]);

  const validateForm = () => {
    if (!fullName.trim() || !email.trim() || !password) {
      return 'Please complete Full Name, Email, and Password.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (role === 'mess_owner') {
      if (!collegeName.trim() || !messName.trim() || !phone.trim()) {
        return 'Mess Owner registration requires College Name, Mess Name, and Contact Number.';
      }
    }
    if (role === 'student') {
      if (!hostelName.trim() || !studentId.trim()) {
        return 'Student registration requires Hostel Name and Student ID.';
      }
      if (!selectedMessId && !joinCode.trim()) {
        return 'Please select your Mess from the dropdown or enter your Mess Join Code.';
      }
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const chosenMessObj =
      matchedMessByCode ||
      activeMesses.find((m) => m.id === selectedMessId) ||
      null;

    setSubmitting(true);
    try {
      const { user: registeredUser } = await register({
        role,
        fullName,
        email,
        password,
        collegeId: chosenMessObj?.college_id || null,
        collegeName:
          role === 'mess_owner'
            ? collegeName
            : chosenMessObj?.college_name || selectedCollegeName || collegeName,
        messId: role === 'student' ? chosenMessObj?.id || selectedMessId : null,
        messName:
          role === 'mess_owner' ? messName : chosenMessObj?.name || '',
        joinCode: role === 'student' ? joinCode.trim().toUpperCase() : '',
        phone,
        hostelName,
        studentId,
      });
      navigate(getDashboardPathForRole(registeredUser?.role || role));
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoRegistration = () => {
    setError('');
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    const { user: demoUser } = loginWithDemoRole(role, {
      fullName,
      email,
      collegeName,
      messName,
      phone,
      hostelName,
      studentId,
    });
    navigate(getDashboardPathForRole(demoUser.role));
  };

  return (
    <div className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Value Breakdown & Super Admin Security Notice */}
        <div className="lg:col-span-5 space-y-6">
          <Badge variant="green" icon={Sparkles}>
            Role-Based Registration
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Create Your SmartBite Account
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Register as a <strong>Mess Owner</strong> to manage menus, inventory, and AI demand forecasting, or register as a <strong>Student</strong> for free meal preference and nutrition access.
          </p>

          <Card className="bg-brand-950 text-white border-brand-900 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-400" />
              Entitlement &amp; Role Security Rules
            </h3>
            <ul className="space-y-3 text-xs text-brand-100 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Mess Owners (Paying Customers):</strong> Register with your mess name, college/institution name, and contact number.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Students (100% Free Users):</strong> Register with your college name, hostel name, and student ID. Your meal entitlement is always preserved.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Super Admin Protection:</strong> Public registration for Super Admin is strictly disabled. Admin accounts are provisioned only via the protected database process documented in <code>README.md</code>.
                </span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Right Registration Form */}
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Account Registration</h2>
                <p className="text-xs text-slate-500">
                  Select your role to display the required institutional fields
                </p>
              </div>
              <Badge variant={role === 'student' ? 'green' : 'dark'}>
                {role === 'student' ? 'Free Student Account' : 'Mess Owner SaaS Account'}
              </Badge>
            </div>

            {/* 2 Allowed Public Roles + Disabled Super Admin Notice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole('mess_owner');
                  setError('');
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  role === 'mess_owner'
                    ? 'bg-brand-50/90 border-brand-700 ring-2 ring-brand-700/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Building2 className="w-4 h-4 text-brand-700" /> 1. Mess Owner
                  </span>
                  <span className="text-[11px] font-bold text-brand-900 bg-brand-100 px-2 py-0.5 rounded-full">
                    Operator
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Manage menus, forecasts, waste &amp; inventory.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('student');
                  setError('');
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  role === 'student'
                    ? 'bg-brand-50/90 border-brand-700 ring-2 ring-brand-700/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Users className="w-4 h-4 text-brand-700" /> 2. Student
                  </span>
                  <span className="text-[11px] font-bold text-brand-800 bg-brand-100 px-2 py-0.5 rounded-full">
                    100% Free
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Select preferred meals &amp; give dish feedback.
                </p>
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Shared Fields: Full Name, Email, Password, College/Institution Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={role === 'mess_owner' ? 'Vikramaditya Mehta' : 'Aarav Sharma'}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'mess_owner' ? 'owner@mess.edu.in' : 'student@college.edu.in'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                  />
                </div>
                {role === 'mess_owner' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      College / Institution Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="e.g., National Institute of Technology"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      1. Select College / Institution *
                    </label>
                    <select
                      value={selectedCollegeName}
                      onChange={(e) => setSelectedCollegeName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                    >
                      {loadingMesses ? (
                        <option value="">Loading colleges...</option>
                      ) : collegeOptions.length === 0 ? (
                        <option value="">
                          No active colleges yet — enter Join Code below
                        </option>
                      ) : (
                        collegeOptions.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>

              {/* Role-Specific Fields */}
              {role === 'mess_owner' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mess Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={messName}
                      onChange={(e) => setMessName(e.target.value)}
                      placeholder="e.g., Annapurna Central Hostel Mess"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98450 22190"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  {/* Student Mess Selection Dropdown OR Unique Join Code */}
                  <div className="p-4 rounded-xl bg-brand-50/70 border border-brand-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-brand-700" />
                          2. Select Active Mess *
                        </label>
                        <select
                          value={selectedMessId}
                          onChange={(e) => setSelectedMessId(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-700"
                        >
                          {messesForSelectedCollege.length === 0 ? (
                            <option value="">
                              No active messes found for this college
                            </option>
                          ) : (
                            messesForSelectedCollege.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                                {m.hostel_name ? ` (${m.hostel_name})` : ''}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-brand-700" />
                          Or Enter Unique Mess Join Code
                        </label>
                        <input
                          type="text"
                          value={joinCode}
                          onChange={(e) =>
                            setJoinCode(e.target.value.toUpperCase())
                          }
                          placeholder="e.g., SB-8F4K2M (from Mess Owner)"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-700"
                        />
                      </div>
                    </div>

                    {matchedMessByCode && (
                      <div className="p-2.5 rounded-lg bg-white border border-brand-300 text-xs text-brand-900 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
                        <span>
                          Join Code matched:{' '}
                          <strong>{matchedMessByCode.name}</strong> (
                          {matchedMessByCode.college_name})
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Hostel Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={hostelName}
                        onChange={(e) => setHostelName(e.target.value)}
                        placeholder="e.g., Hostel Block A"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Student ID / Roll Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="e.g., 2024CS101"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                icon={ArrowRight}
                disabled={submitting}
              >
                {submitting
                  ? 'Creating Account in Supabase...'
                  : role === 'mess_owner'
                  ? 'Register as Mess Owner (Supabase Auth)'
                  : 'Register as Student (Supabase Auth)'}
              </Button>

              {!isSupabaseConfigured && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2.5">
                  <p className="text-xs text-amber-900 font-medium">
                    <strong>Demo Mode Option:</strong> Since Supabase <code>.env</code> credentials are not connected yet, click below to test registration and role-based redirection in Demo Mode:
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={handleDemoRegistration}
                    className="w-full border-amber-300 bg-white hover:bg-amber-100/50 text-amber-950"
                  >
                    Continue in Demo Mode as {role === 'mess_owner' ? 'Mess Owner' : 'Student'}
                  </Button>
                </div>
              )}
            </form>

            <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-800 hover:underline">
                Sign in here
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
