import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Utensils,
  Users,
  CreditCard,
  Receipt,
  LifeBuoy,
  BarChart3,
  Settings,
  Leaf,
  LogOut,
  Menu,
  X,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Search,
  Sparkles,
  ExternalLink,
  KeyRound,
  Edit3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const ADMIN_SIDEBAR = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'colleges', label: 'Colleges', icon: Building2 },
  { id: 'messes', label: 'Mess Management', icon: Utensils },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'payments', label: 'Payments', icon: Receipt },
  { id: 'tickets', label: 'Support Tickets', icon: LifeBuoy },
  { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminDashboardPage() {
  const { user, signOut, isDemoMode } = useAuth();
  const {
    colleges,
    messesList,
    platformUsers,
    subscriptionPlans,
    activeSubscriptions,
    paymentRecords,
    supportTickets,
    platformGrowthSeries,
    wasteLogs,
    addOrUpdateCollege,
    toggleCollegeStatus,
    updateMessAdminStatus,
    updatePlatformUser,
    createSubscriptionPlan,
    updateSubscriptionRecord,
    recordPlatformPayment,
    updateSupportTicket,
  } = useData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');

  // 2. College Management form state
  const [collegeForm, setCollegeForm] = useState({
    id: '',
    name: '',
    city: '',
    state: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    total_hostels: 4,
    status: 'active',
  });
  const [editingCollegeMode, setEditingCollegeMode] = useState(false);

  // 4. User Management search & filter state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // 5. Subscription Plan creation state
  const [newPlanForm, setNewPlanForm] = useState({
    name: '',
    monthly_price_inr: 6999,
    student_limit: 1200,
    description: '',
    featuresText: 'AI Demand Forecasting, Student Nutrition Portal, Inventory Alerts',
  });

  // 6. Manual Invoice Payment Record form state
  const [paymentForm, setPaymentForm] = useState({
    mess_name: messesList[0]?.mess_name || '',
    college_name: colleges[0]?.name || '',
    plan_name: 'Growth Plan',
    amount_inr: 4999,
    payment_method: 'NEFT / Institutional Bank Transfer',
    gateway_reference: `INV-${Date.now().toString().slice(-6)}`,
    payment_status: 'succeeded',
  });

  // 9. Platform Settings state
  const [platformSettings, setPlatformSettings] = useState({
    platform_name: 'SmartBite Institutional Cloud',
    support_sla_hours: 4,
    default_entitlement_protection: true,
    require_college_verification: true,
    allow_student_self_signup: true,
  });

  // Merge supportTickets with any demo/contact requests submitted on public pages (Demo Mode only)
  const combinedTickets = useMemo(() => {
    if (!isDemoMode) {
      return supportTickets;
    }
    let publicDemoReqs = [];
    let publicContacts = [];
    try {
      publicDemoReqs = JSON.parse(
        localStorage.getItem('smartbite_demo_requests') || '[]'
      ).map((r, i) => ({
        id: r.id || `demo-local-${i}`,
        ticket_type: 'demo_request',
        subject: `Demo Request – ${r.college_name || r.mess_name || 'Campus'}`,
        requester_name: r.full_name || 'Prospective Operator',
        requester_email: r.email || 'operator@campus.edu',
        organization: r.college_name || r.mess_name || 'Institution',
        priority: 'high',
        status: r.status || 'open',
        created_at: r.created_at || new Date().toISOString(),
        message:
          r.notes ||
          `Requested product walkthrough for ${r.student_capacity || 500} students (${r.city || 'India'}).`,
      }));
      publicContacts = JSON.parse(
        localStorage.getItem('smartbite_contact_messages') || '[]'
      ).map((c, i) => ({
        id: c.id || `contact-local-${i}`,
        ticket_type: 'contact_query',
        subject: c.subject || 'Website Contact Inquiry',
        requester_name: c.full_name || 'Visitor',
        requester_email: c.email || 'visitor@campus.edu',
        organization: c.organization || 'Campus Inquiry',
        priority: 'medium',
        status: 'open',
        created_at: c.created_at || new Date().toISOString(),
        message: c.message || 'Submitted via public Contact Us page.',
      }));
    } catch (err) {
      console.warn('Could not read local public tickets:', err);
    }
    return [...publicDemoReqs, ...publicContacts, ...supportTickets];
  }, [supportTickets, isDemoMode]);

  // 1. Live Calculated Platform Overview Metrics
  const overviewMetrics = useMemo(() => {
    const totalColleges = colleges.length;
    const activeMesses = messesList.filter(
      (m) => m.status === 'active' || m.status === 'trial'
    ).length;

    // Total registered students across platform messes + user directory
    const studentCountFromMesses = messesList.reduce(
      (sum, m) => sum + Number(m.enrolled_students || 0),
      0
    );
    const totalRegisteredStudents = Math.max(
      studentCountFromMesses,
      platformUsers.filter((u) => u.role === 'student').length
    );

    const activeSubs = activeSubscriptions.filter(
      (s) => s.status === 'active' || s.status === 'trial'
    );
    const totalPlatformSubscriptions = activeSubs.length;

    const monthlyRecurringRevenue = activeSubscriptions
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + Number(s.monthly_amount_inr || 0), 0);

    // Total food waste tracked across messes & logs
    const messWasteSum = messesList.reduce(
      (sum, m) => sum + Number(m.monthly_waste_kg || 0),
      0
    );
    const localLogWasteSum = wasteLogs.reduce(
      (sum, w) => sum + Number(w.wasted_kg || 0),
      0
    );
    const totalFoodWasteTrackedKg = Number(
      (messWasteSum + localLogWasteSum).toFixed(1)
    );

    return {
      totalColleges,
      activeMesses,
      totalRegisteredStudents,
      totalPlatformSubscriptions,
      monthlyRecurringRevenue,
      totalFoodWasteTrackedKg,
    };
  }, [colleges, messesList, platformUsers, activeSubscriptions, wasteLogs]);

  const handleSaveCollege = async (e) => {
    e.preventDefault();
    if (!collegeForm.name.trim()) return;
    await addOrUpdateCollege(collegeForm);
    setBannerMessage(
      editingCollegeMode
        ? `Updated college details for ${collegeForm.name}.`
        : `Registered new college: ${collegeForm.name}.`
    );
    setCollegeForm({
      id: '',
      name: '',
      city: '',
      state: '',
      contact_person: '',
      contact_email: '',
      contact_phone: '',
      total_hostels: 4,
      status: 'active',
    });
    setEditingCollegeMode(false);
  };

  const handleStartEditCollege = (col) => {
    setCollegeForm({ ...col });
    setEditingCollegeMode(true);
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!newPlanForm.name.trim()) return;
    await createSubscriptionPlan({
      name: newPlanForm.name,
      monthly_price_inr: Number(newPlanForm.monthly_price_inr),
      student_limit: Number(newPlanForm.student_limit),
      description: newPlanForm.description,
      features: newPlanForm.featuresText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setBannerMessage(`Created new subscription tier: ${newPlanForm.name}.`);
    setNewPlanForm({
      name: '',
      monthly_price_inr: 6999,
      student_limit: 1200,
      description: '',
      featuresText: 'AI Demand Forecasting, Student Nutrition Portal',
    });
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    await recordPlatformPayment(paymentForm);
    setBannerMessage(
      `Recorded ₹${Number(paymentForm.amount_inr).toLocaleString('en-IN')} payment for ${
        paymentForm.mess_name
      }.`
    );
    setPaymentForm((prev) => ({
      ...prev,
      gateway_reference: `INV-${Date.now().toString().slice(-6)}`,
    }));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col lg:flex-row">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-brand-950 text-white flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-800 border border-brand-700 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-brand-300" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-white">
                  Smart<span className="text-brand-400">Bite</span>
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-amber-300">
                  Super Admin Console
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-brand-200 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Role Switcher for Super Admin QA */}
          <div className="p-3.5 rounded-xl bg-brand-900/90 border border-brand-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300 block">
              Platform Governance Access
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <Link
                to="/mess-owner-dashboard"
                className="text-[11px] font-bold bg-brand-800 hover:bg-brand-700 text-white py-1.5 px-2.5 rounded-lg text-center border border-brand-700 flex items-center justify-center gap-1"
              >
                Mess View <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                to="/student-dashboard"
                className="text-[11px] font-bold bg-brand-800 hover:bg-brand-700 text-white py-1.5 px-2.5 rounded-lg text-center border border-brand-700 flex items-center justify-center gap-1"
              >
                Student View <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <nav className="space-y-1">
            {ADMIN_SIDEBAR.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                    setBannerMessage('');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-800 text-white shadow-xs border border-brand-700'
                      : 'text-brand-100/80 hover:bg-brand-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-brand-300' : 'text-brand-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'tickets' &&
                    combinedTickets.filter((t) => t.status === 'open').length >
                      0 && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-400 text-slate-950">
                        {
                          combinedTickets.filter((t) => t.status === 'open')
                            .length
                        }
                      </span>
                    )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-brand-900 space-y-3">
          <div className="p-3 rounded-xl bg-brand-900/60 border border-brand-800 text-[11px] text-brand-200">
            <p className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Super Admin RBAC Enforced
            </p>
            Signed in as {user?.email || 'admin@smartbite.in'}
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-brand-900 hover:bg-rose-950/80 text-brand-100 hover:text-rose-200 border border-brand-800 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
                Super Admin •{' '}
                {ADMIN_SIDEBAR.find((i) => i.id === activeTab)?.label}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Multi-Campus SaaS Governance, Subscriptions &amp; Waste Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isDemoMode && (
              <Badge variant="amber">Demo data</Badge>
            )}
            <Badge variant="dark">Role: super_admin</Badge>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {bannerMessage && (
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-300 text-xs font-bold text-brand-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
                <span>{bannerMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setBannerMessage('')}
                className="text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ==================== 1. OVERVIEW ==================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <Card className="p-6 bg-brand-950 text-white border-brand-900">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Badge variant="dark" icon={Sparkles}>
                      Live SaaS Platform Telemetry
                    </Badge>
                    <h2 className="text-2xl font-extrabold text-white pt-1">
                      SmartBite Multi-Campus Command Center
                    </h2>
                    <p className="text-xs text-brand-200 max-w-2xl">
                      All metrics below are dynamically aggregated from registered colleges, active messes, student enrollments, B2B subscriptions, and logged food waste records.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveTab('colleges')}
                    >
                      Manage Colleges
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-brand-700 text-white hover:bg-brand-900"
                      onClick={() => setActiveTab('tickets')}
                    >
                      Review Support Tickets
                    </Button>
                  </div>
                </div>
              </Card>

              {/* 6 Required KPI Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <Card className="p-5 space-y-1">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Total Colleges Registered
                  </span>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {overviewMetrics.totalColleges}
                  </p>
                  <p className="text-xs text-brand-700 font-semibold">
                    {colleges.filter((c) => c.status === 'active').length} Active
                    • {colleges.filter((c) => c.status === 'pending').length}{' '}
                    Pending Approval
                  </p>
                </Card>

                <Card className="p-5 space-y-1">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Total Active Messes
                  </span>
                  <p className="text-3xl font-extrabold text-brand-800">
                    {overviewMetrics.activeMesses}
                  </p>
                  <p className="text-xs text-slate-500">
                    Out of {messesList.length} total registered dining halls
                  </p>
                </Card>

                <Card className="p-5 space-y-1">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Total Registered Students
                  </span>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {overviewMetrics.totalRegisteredStudents.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold">
                    100% Free Student Entitlement Tier
                  </p>
                </Card>

                <Card className="p-5 space-y-1">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Total Platform Subscriptions
                  </span>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {overviewMetrics.totalPlatformSubscriptions}
                  </p>
                  <p className="text-xs text-slate-500">
                    B2B Institutional Mess Operators
                  </p>
                </Card>

                <Card className="p-5 space-y-1 border-brand-200 bg-brand-50/40">
                  <span className="text-xs font-bold uppercase text-brand-800">
                    Monthly Recurring Revenue (MRR)
                  </span>
                  <p className="text-3xl font-extrabold text-brand-900">
                    ₹{overviewMetrics.monthlyRecurringRevenue.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-brand-700 font-semibold">
                    ARR Run-Rate: ₹
                    {(overviewMetrics.monthlyRecurringRevenue * 12).toLocaleString(
                      'en-IN'
                    )}
                  </p>
                </Card>

                <Card className="p-5 space-y-1">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Total Food Waste Tracked
                  </span>
                  <p className="text-3xl font-extrabold text-amber-700">
                    {overviewMetrics.totalFoodWasteTrackedKg.toLocaleString('en-IN')}{' '}
                    kg
                  </p>
                  <p className="text-xs text-slate-500">
                    Monitored across all partner kitchens
                  </p>
                </Card>
              </div>

              {/* Quick Tables: Recent Messes & Open Tickets */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">
                      Registered Campus Messes
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('messes')}
                      className="text-xs font-bold text-brand-800 hover:underline"
                    >
                      Manage All →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {messesList.length === 0 ? (
                      <div className="p-4 rounded-xl bg-cream-50 border border-dashed border-slate-200 text-center space-y-2">
                        <p className="text-xs text-slate-500">
                          No campus messes registered yet.
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setActiveTab('colleges')}
                        >
                          Add Partner College
                        </Button>
                      </div>
                    ) : (
                      messesList.slice(0, 4).map((m) => (
                        <div
                          key={m.id}
                          className="p-3.5 rounded-xl bg-cream-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{m.mess_name}</p>
                            <p className="text-slate-500">
                              {m.college_name} • {m.enrolled_students} students
                            </p>
                          </div>
                          <Badge
                            variant={
                              m.status === 'active'
                                ? 'green'
                                : m.status === 'pending'
                                ? 'amber'
                                : 'neutral'
                            }
                          >
                            {m.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">
                      Recent Demo Requests &amp; Support Tickets
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('tickets')}
                      className="text-xs font-bold text-brand-800 hover:underline"
                    >
                      Open Helpdesk →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {combinedTickets.length === 0 ? (
                      <div className="p-4 rounded-xl bg-cream-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                        No open demo requests or support tickets.
                      </div>
                    ) : (
                      combinedTickets.slice(0, 4).map((t) => (
                        <div
                          key={t.id}
                          className="p-3.5 rounded-xl bg-cream-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {t.subject}
                            </p>
                            <p className="text-slate-500 truncate">
                              {t.requester_name} ({t.organization})
                            </p>
                          </div>
                          <Badge
                            variant={t.status === 'resolved' ? 'green' : 'amber'}
                          >
                            {t.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ==================== 2. COLLEGES ==================== */}
          {activeTab === 'colleges' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Add / Edit College Form */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">
                    {editingCollegeMode
                      ? 'Edit College Details'
                      : 'Add New Partner College'}
                  </h2>
                  {editingCollegeMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCollegeMode(false);
                        setCollegeForm({
                          id: '',
                          name: '',
                          city: '',
                          state: '',
                          contact_person: '',
                          contact_email: '',
                          contact_phone: '',
                          total_hostels: 4,
                          status: 'active',
                        });
                      }}
                      className="text-xs text-slate-500 hover:underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveCollege} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Institution / College Name
                    </label>
                    <input
                      type="text"
                      required
                      value={collegeForm.name}
                      onChange={(e) =>
                        setCollegeForm({ ...collegeForm, name: e.target.value })
                      }
                      placeholder="e.g., IIT Madras Hostel Board"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={collegeForm.city}
                        onChange={(e) =>
                          setCollegeForm({ ...collegeForm, city: e.target.value })
                        }
                        placeholder="Chennai"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        required
                        value={collegeForm.state}
                        onChange={(e) =>
                          setCollegeForm({
                            ...collegeForm,
                            state: e.target.value,
                          })
                        }
                        placeholder="Tamil Nadu"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chief Warden / Administrative Contact
                    </label>
                    <input
                      type="text"
                      required
                      value={collegeForm.contact_person}
                      onChange={(e) =>
                        setCollegeForm({
                          ...collegeForm,
                          contact_person: e.target.value,
                        })
                      }
                      placeholder="Dr. S. Subramanian"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Official Email
                      </label>
                      <input
                        type="email"
                        required
                        value={collegeForm.contact_email}
                        onChange={(e) =>
                          setCollegeForm({
                            ...collegeForm,
                            contact_email: e.target.value,
                          })
                        }
                        placeholder="warden@campus.ac.in"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Total Hostels
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={collegeForm.total_hostels}
                        onChange={(e) =>
                          setCollegeForm({
                            ...collegeForm,
                            total_hostels: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="primary" className="w-full">
                    {editingCollegeMode
                      ? 'Save College Changes'
                      : 'Register College'}
                  </Button>
                </form>
              </Card>

              {/* Colleges Directory Table */}
              <Card className="lg:col-span-2 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    Registered Colleges &amp; Associated Messes ({colleges.length})
                  </h3>
                  <Badge variant="green">Multi-Institution Registry</Badge>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                        <th className="py-3.5 px-4">College &amp; Location</th>
                        <th className="py-3.5 px-4">Primary Contact</th>
                        <th className="py-3.5 px-4">Associated Messes</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Governance Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {colleges.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 px-4 text-center text-slate-500">
                            No partner colleges registered yet. Use the form on the left to add your first college.
                          </td>
                        </tr>
                      ) : (
                      colleges.map((col) => {
                        const associatedMesses = messesList.filter(
                          (m) =>
                            m.college_id === col.id ||
                            m.college_name === col.name
                        );
                        return (
                          <tr key={col.id} className="hover:bg-cream-50/70">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-900 text-sm">
                                {col.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {col.city}, {col.state} • {col.total_hostels}{' '}
                                Hostels
                              </p>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-slate-800">
                                {col.contact_person}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {col.contact_email}
                              </p>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-brand-800">
                                {associatedMesses.length || col.associated_messes || 0}{' '}
                                Mess(es)
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge
                                variant={
                                  col.status === 'active'
                                    ? 'green'
                                    : col.status === 'pending'
                                    ? 'amber'
                                    : 'neutral'
                                }
                              >
                                {col.status}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditCollege(col)}
                                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 font-bold text-slate-700"
                                >
                                  Edit
                                </button>
                                {col.status === 'pending' ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      toggleCollegeStatus(col.id, 'active');
                                      setBannerMessage(
                                        `Approved college registration for ${col.name}.`
                                      );
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-brand-800 text-white font-bold"
                                  >
                                    Approve
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextStatus =
                                        col.status === 'active'
                                          ? 'inactive'
                                          : 'active';
                                      toggleCollegeStatus(col.id, nextStatus);
                                      setBannerMessage(
                                        `Set ${col.name} status to ${nextStatus}.`
                                      );
                                    }}
                                    className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 font-bold text-slate-700"
                                  >
                                    {col.status === 'active'
                                      ? 'Deactivate'
                                      : 'Activate'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ==================== 3. MESS MANAGEMENT ==================== */}
          {activeTab === 'messes' && (
            <Card className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Registered Institutional Messes &amp; Operator Accounts
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review mess capacity, approve or reject operator registrations, and monitor real-time kitchen activity.
                  </p>
                </div>
                <Badge variant="green">{messesList.length} Mess Accounts</Badge>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                      <th className="py-3.5 px-4">Mess &amp; College</th>
                      <th className="py-3.5 px-4">Operator Contact</th>
                      <th className="py-3.5 px-4">Capacity &amp; Students</th>
                      <th className="py-3.5 px-4">Plan &amp; Activity</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Approval / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {messesList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 px-4 text-center text-slate-500">
                          No institutional messes registered yet.
                        </td>
                      </tr>
                    ) : (
                    messesList.map((mess) => (
                      <tr key={mess.id} className="hover:bg-cream-50/70">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 text-sm">
                            {mess.mess_name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {mess.college_name} • {mess.city}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">
                            {mess.owner_name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {mess.owner_email}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900">
                            {mess.enrolled_students} enrolled
                          </span>
                          <p className="text-[10px] text-slate-500">
                            Max Capacity: {mess.student_capacity}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-brand-800">
                            {mess.subscription_tier}
                          </span>
                          <p className="text-[10px] text-slate-500">
                            Active: {mess.last_active}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              mess.status === 'active'
                                ? 'green'
                                : mess.status === 'pending'
                                ? 'amber'
                                : 'neutral'
                            }
                          >
                            {mess.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                updateMessAdminStatus(mess.id, 'active');
                                setBannerMessage(
                                  `Approved mess account: ${mess.mess_name}.`
                                );
                              }}
                              className="px-2.5 py-1 rounded-lg bg-brand-800 text-white font-bold hover:bg-brand-900"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                updateMessAdminStatus(mess.id, 'rejected');
                                setBannerMessage(
                                  `Marked ${mess.mess_name} as rejected/suspended.`
                                );
                              }}
                              className="px-2.5 py-1 rounded-lg border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ==================== 4. USER MANAGEMENT ==================== */}
          {activeTab === 'users' && (
            <Card className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Platform User Directory (Students, Mess Owners &amp; Admins)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Search, filter, manage role assignments, and control account status across all colleges.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {['all', 'student', 'mess_owner', 'super_admin'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setUserRoleFilter(r)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize ${
                        userRoleFilter === r
                          ? 'bg-brand-800 text-white'
                          : 'bg-cream-100 text-slate-700'
                      }`}
                    >
                      {r.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users by name, email, or college..."
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs"
                />
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                      <th className="py-3.5 px-4">User Name &amp; Email</th>
                      <th className="py-3.5 px-4">Institution / Mess</th>
                      <th className="py-3.5 px-4">Role Assignment</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Account Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {platformUsers
                      .filter(
                        (u) =>
                          userRoleFilter === 'all' || u.role === userRoleFilter
                      )
                      .filter(
                        (u) =>
                          !userSearch.trim() ||
                          u.full_name
                            ?.toLowerCase()
                            .includes(userSearch.toLowerCase()) ||
                          u.email
                            ?.toLowerCase()
                            .includes(userSearch.toLowerCase()) ||
                          u.college_name
                            ?.toLowerCase()
                            .includes(userSearch.toLowerCase())
                      )
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-cream-50/70">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900 text-sm">
                              {u.full_name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {u.email}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-800">
                              {u.college_name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {u.mess_name}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={u.role}
                              onChange={(e) => {
                                updatePlatformUser(u.id, {
                                  role: e.target.value,
                                });
                                setBannerMessage(
                                  `Updated ${u.full_name}'s role to ${e.target.value}.`
                                );
                              }}
                              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-800"
                            >
                              <option value="student">student (Free)</option>
                              <option value="mess_owner">mess_owner</option>
                              <option value="super_admin">super_admin</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                u.status === 'active' ? 'green' : 'amber'
                              }
                            >
                              {u.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => {
                                const nextStatus =
                                  u.status === 'active'
                                    ? 'suspended'
                                    : 'active';
                                updatePlatformUser(u.id, {
                                  status: nextStatus,
                                });
                                setBannerMessage(
                                  `Set account status for ${u.full_name} to ${nextStatus}.`
                                );
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 font-bold text-slate-700"
                            >
                              {u.status === 'active'
                                ? 'Suspend'
                                : 'Reactivate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ==================== 5. SUBSCRIPTIONS ==================== */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Create Subscription Plan Form */}
                <Card className="p-6 space-y-4">
                  <h2 className="text-base font-bold text-slate-900">
                    Create New B2B Subscription Plan
                  </h2>
                  <form onSubmit={handleCreatePlan} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Plan Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newPlanForm.name}
                        onChange={(e) =>
                          setNewPlanForm({
                            ...newPlanForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g., University Cluster Plus"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Monthly Price (INR)
                        </label>
                        <input
                          type="number"
                          min={0}
                          required
                          value={newPlanForm.monthly_price_inr}
                          onChange={(e) =>
                            setNewPlanForm({
                              ...newPlanForm,
                              monthly_price_inr: Number(e.target.value),
                            })
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Student Capacity Limit
                        </label>
                        <input
                          type="number"
                          min={100}
                          required
                          value={newPlanForm.student_limit}
                          onChange={(e) =>
                            setNewPlanForm({
                              ...newPlanForm,
                              student_limit: Number(e.target.value),
                            })
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Included Features (comma-separated)
                      </label>
                      <textarea
                        rows={2}
                        value={newPlanForm.featuresText}
                        onChange={(e) =>
                          setNewPlanForm({
                            ...newPlanForm,
                            featuresText: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs"
                      />
                    </div>
                    <Button type="submit" variant="primary" className="w-full">
                      Publish Subscription Tier
                    </Button>
                  </form>
                </Card>

                {/* Active Subscription Plans Catalog */}
                <Card className="lg:col-span-2 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">
                      Published B2B Mess Operator Tiers ({subscriptionPlans.length})
                    </h3>
                    <Badge variant="green">Students Always Free</Badge>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {subscriptionPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="p-4 rounded-2xl bg-cream-50 border border-slate-200/90 space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <Badge variant="green">{plan.name}</Badge>
                          <p className="text-xl font-extrabold text-slate-900">
                            ₹
                            {Number(
                              plan.monthly_price_inr ?? plan.price ?? 0
                            ).toLocaleString('en-IN')}
                            <span className="text-xs font-normal text-slate-500">
                              /mo
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Up to {plan.student_limit || 1000} students
                          </p>
                        </div>
                        <ul className="space-y-1 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                          {(plan.features || []).slice(0, 4).map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-brand-700 shrink-0" />
                              <span className="truncate">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Active Subscriptions & Renewal Tracking Table */}
              <Card className="p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  Active Mess Subscriptions &amp; Renewal Schedule
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                        <th className="py-3.5 px-4">Subscribed Mess &amp; College</th>
                        <th className="py-3.5 px-4">Tier</th>
                        <th className="py-3.5 px-4">Monthly Fee</th>
                        <th className="py-3.5 px-4">Renewal Date</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Renewal Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeSubscriptions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 px-4 text-center text-slate-500">
                            No active B2B mess subscriptions recorded yet.
                          </td>
                        </tr>
                      ) : (
                      activeSubscriptions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-cream-50/70">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900 text-sm">
                              {sub.mess_name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {sub.college_name}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-brand-800">
                            {sub.plan_name}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-900">
                            ₹{Number(sub.monthly_amount_inr).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {sub.current_period_end}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                sub.status === 'active' ? 'green' : 'amber'
                              }
                            >
                              {sub.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => {
                                updateSubscriptionRecord(sub.id, {
                                  status: 'active',
                                  current_period_end: '2025-12-31',
                                });
                                setBannerMessage(
                                  `Extended subscription renewal for ${sub.mess_name}.`
                                );
                              }}
                              className="px-2.5 py-1 rounded-lg bg-brand-800 text-white font-bold"
                            >
                              Extend Renewal
                            </button>
                          </td>
                        </tr>
                      ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ==================== 6. PAYMENTS ==================== */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Explicit External Payment Gateway API Key Notice */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <KeyRound className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-950 space-y-0.5">
                    <p className="font-extrabold">
                      External API Key Required for Live Payment Gateway Processing
                    </p>
                    <p>
                      Automated online card/UPI webhook collection requires configuring a live{' '}
                      <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">
                        VITE_RAZORPAY_KEY_ID
                      </code>{' '}
                      or{' '}
                      <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">
                        STRIPE_SECRET_KEY
                      </code>{' '}
                      in a backend edge function. No secret payment keys are exposed in the frontend bundle; institutional NEFT/invoice settlements can be recorded directly below.
                    </p>
                  </div>
                </div>
                <Badge variant="amber">Gateway Key Optional</Badge>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Record Institutional Payment Form */}
                <Card className="p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Record Institutional Invoice Payment
                  </h3>
                  <form
                    onSubmit={handleRecordPaymentSubmit}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mess Name
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentForm.mess_name}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            mess_name: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        College / University
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentForm.college_name}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            college_name: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Amount (INR)
                        </label>
                        <input
                          type="number"
                          required
                          value={paymentForm.amount_inr}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              amount_inr: Number(e.target.value),
                            })
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Status
                        </label>
                        <select
                          value={paymentForm.payment_status}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              payment_status: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs"
                        >
                          <option value="succeeded">Succeeded</option>
                          <option value="pending">Pending Verification</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        UTR / Invoice Reference
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentForm.gateway_reference}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            gateway_reference: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs"
                      />
                    </div>
                    <Button type="submit" variant="primary" className="w-full">
                      Log Payment Record
                    </Button>
                  </form>
                </Card>

                {/* Payment Ledger Table */}
                <Card className="lg:col-span-2 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">
                      Platform Payment Ledger ({paymentRecords.length})
                    </h3>
                    <Badge variant="green">B2B Settlements</Badge>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                          <th className="py-3.5 px-4">Date &amp; Ref</th>
                          <th className="py-3.5 px-4">Mess &amp; Institution</th>
                          <th className="py-3.5 px-4">Plan &amp; Method</th>
                          <th className="py-3.5 px-4">Amount</th>
                          <th className="py-3.5 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paymentRecords.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 px-4 text-center text-slate-500">
                              No institutional payment records logged yet.
                            </td>
                          </tr>
                        ) : (
                        paymentRecords.map((pay) => (
                          <tr key={pay.id} className="hover:bg-cream-50/70">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-900">
                                {pay.paid_at}
                              </p>
                              <p className="text-[10px] font-mono text-slate-500">
                                {pay.gateway_reference}
                              </p>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-900">
                                {pay.mess_name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {pay.college_name}
                              </p>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-brand-800">
                                {pay.plan_name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {pay.payment_method}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 font-extrabold text-slate-900">
                              ₹{Number(pay.amount_inr).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge
                                variant={
                                  pay.payment_status === 'succeeded'
                                    ? 'green'
                                    : 'amber'
                                }
                              >
                                {pay.payment_status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ==================== 7. SUPPORT TICKETS ==================== */}
          {activeTab === 'tickets' && (
            <Card className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Customer Queries, Demo Requests &amp; Support Helpdesk
                  </h2>
                  <p className="text-xs text-slate-500">
                    Unified queue of inbound Demo Requests, Contact Us inquiries, and technical support tickets from partner messes.
                  </p>
                </div>
                <Badge variant="green">{combinedTickets.length} Total Tickets</Badge>
              </div>

              <div className="space-y-3">
                {combinedTickets.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-cream-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                    No support tickets, demo requests, or contact messages in the queue.
                  </div>
                ) : (
                combinedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-2xl bg-cream-50 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            ticket.ticket_type === 'demo_request'
                              ? 'green'
                              : 'neutral'
                          }
                        >
                          {ticket.ticket_type?.replace('_', ' ') || 'support'}
                        </Badge>
                        <h3 className="text-sm font-bold text-slate-900">
                          {ticket.subject}
                        </h3>
                        <Badge
                          variant={
                            ticket.status === 'resolved'
                              ? 'green'
                              : ticket.status === 'in_progress'
                              ? 'amber'
                              : 'dark'
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {ticket.message}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        From: <strong>{ticket.requester_name}</strong> (
                        {ticket.requester_email}) • {ticket.organization}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={ticket.status}
                        onChange={(e) => {
                          updateSupportTicket(ticket.id, {
                            status: e.target.value,
                          });
                          setBannerMessage(
                            `Updated ticket "${ticket.subject}" to ${e.target.value}.`
                          );
                        }}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                ))
                )}
              </div>
            </Card>
          )}

          {/* ==================== 8. PLATFORM ANALYTICS ==================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Monthly Revenue & MRR Growth Chart */}
                <Card className="p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Monthly Recurring Revenue (MRR) Growth (INR)
                    </h3>
                    <p className="text-xs text-slate-500">
                      6-month B2B institutional subscription revenue trajectory
                    </p>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={platformGrowthSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Area
                          type="monotone"
                          dataKey="mrr"
                          name="Monthly Revenue (₹)"
                          stroke="#14532d"
                          fill="#bbf7d0"
                          strokeWidth={2.5}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* College & Active Student Growth Chart */}
                <Card className="p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Campus Adoption &amp; Active Student Usage
                    </h3>
                    <p className="text-xs text-slate-500">
                      Active students using SmartBite meal selection &amp; nutrition tracking
                    </p>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={platformGrowthSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar
                          dataKey="students"
                          name="Active Students"
                          fill="#166534"
                          radius={[6, 6, 0, 0]}
                        />
                        <Bar
                          dataKey="waste_saved_kg"
                          name="Food Waste Saved (kg)"
                          fill="#d97706"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ==================== 9. SETTINGS ==================== */}
          {activeTab === 'settings' && (
            <Card className="max-w-3xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Platform Governance &amp; Security Configuration
                </h2>
                <p className="text-xs text-slate-500">
                  Global SmartBite policy rules enforced across all registered colleges and messes.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Platform Instance Name
                  </label>
                  <input
                    type="text"
                    value={platformSettings.platform_name}
                    onChange={(e) =>
                      setPlatformSettings({
                        ...platformSettings,
                        platform_name: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs"
                  />
                </div>

                <div className="p-4 rounded-xl bg-cream-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Enforce Unconditional Student Meal Entitlement Policy
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Guarantees that non-responding students are never denied dining access and AI forecasting includes historical walk-in buffers.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformSettings.default_entitlement_protection}
                    onChange={(e) =>
                      setPlatformSettings({
                        ...platformSettings,
                        default_entitlement_protection: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-brand-800"
                  />
                </div>

                <div className="p-4 rounded-xl bg-cream-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Require Super Admin Approval for New College Onboarding
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Places newly registered institutions in pending review until verified.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformSettings.require_college_verification}
                    onChange={(e) =>
                      setPlatformSettings({
                        ...platformSettings,
                        require_college_verification: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-brand-800"
                  />
                </div>

                <Button
                  variant="primary"
                  onClick={() =>
                    setBannerMessage(
                      'Platform governance settings saved and applied globally.'
                    )
                  }
                >
                  Save Platform Settings
                </Button>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
