import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Leaf,
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  CheckSquare,
  History,
  MessageSquarePlus,
  Bell,
  UserCircle,
  ShieldCheck,
  Clock,
  Star,
  CheckCircle2,
  Menu,
  X,
  LogOut,
  Home,
  KeyRound,
  AlertCircle,
  UserMinus,
  RotateCcw,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  getTodayDateStr,
  getTomorrowDateStr,
  normalizeDateStr,
  formatHumanDate,
  getWeekStartDateStr,
  getWeekDays,
  addDaysToDateStr,
  computeMealPollWindow,
  getNextActivePollMeal,
} from '../lib/dateUtils';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

const STUDENT_TABS = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'today_menu', label: 'Today’s Menu', icon: UtensilsCrossed },
  { id: 'week_menu', label: 'This Week’s Menu', icon: CalendarDays },
  { id: 'meal_attendance', label: 'Meal Attendance', icon: CheckSquare },
  { id: 'meal_history', label: 'Meal History', icon: History },
  { id: 'feedback', label: 'Feedback', icon: MessageSquarePlus },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'My Profile', icon: UserCircle },
];

const validStudentTabIds = new Set(STUDENT_TABS.map((t) => t.id));

export default function StudentDashboardPage() {
  const { user, logout, isDemoMode, linkStudentToMessByCode } = useAuth();
  const {
    messProfile,
    menus,
    studentSelectionsMap,
    studentMealHistory,
    studentProfile,
    feedbackList,
    notifications,
    submitMealAttendancePoll,
    submitStudentFeedback,
    updateStudentProfile,
    markNotificationRead,
    markAllNotificationsRead,
    refreshFromSupabase,
  } = useData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');

  // Redirect any unrecognised or legacy tab query parameter cleanly to overview
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      if (validStudentTabIds.has(tabParam)) {
        setActiveTab(tabParam);
      } else {
        setActiveTab('overview');
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  // Join Mess Code state if student has not linked a mess yet
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joiningMess, setJoiningMess] = useState(false);
  const [joinError, setJoinError] = useState('');

  const handleLinkMessCode = async (e) => {
    e.preventDefault();
    setJoinError('');
    setJoiningMess(true);
    try {
      await linkStudentToMessByCode(joinCodeInput);
      await refreshFromSupabase();
      showToast('Successfully linked to your Hostel Mess!');
      setJoinCodeInput('');
    } catch (err) {
      setJoinError(
        err.message || 'Invalid Mess Join Code. Please check with your Mess Owner.'
      );
    } finally {
      setJoiningMess(false);
    }
  };

  // Date & Week state
  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();
  const [pollDate, setPollDate] = useState(todayStr);
  const [weekStartDate, setWeekStartDate] = useState(() =>
    getWeekStartDateStr(todayStr)
  );
  const weekDays = useMemo(() => getWeekDays(weekStartDate), [weekStartDate]);

  // Feedback form state
  const [fbForm, setFbForm] = useState({
    meal_type: 'Lunch',
    dish_name: '',
    rating: 5,
    feedback_category: 'review',
    comment: '',
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState(studentProfile);

  useEffect(() => {
    setProfileForm(studentProfile);
  }, [studentProfile]);

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 4000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Strict published menu lookup for a specific (date, mealType)
  const getPublishedMenu = (dateStr, mealType) => {
    const targetDate = normalizeDateStr(dateStr);
    const targetMeal = String(mealType || '').toLowerCase();
    return (
      menus.find(
        (m) =>
          normalizeDateStr(m.menu_date) === targetDate &&
          String(m.meal_type || '').toLowerCase() === targetMeal &&
          String(m.publish_status || 'published').toLowerCase() === 'published'
      ) || null
    );
  };

  // Helper to check if student marked "not_coming" for (dateStr, mealType)
  // Default state for every student is "attending" (will_attend = true)
  const getStudentAttendanceStatus = (dateStr, mealType) => {
    const cleanDate = normalizeDateStr(dateStr);
    const lowerMeal = String(mealType || '').toLowerCase();
    const capMeal = lowerMeal.charAt(0).toUpperCase() + lowerMeal.slice(1);
    const rec =
      studentSelectionsMap[`${cleanDate}_${lowerMeal}`] ||
      studentSelectionsMap[`${cleanDate}_${capMeal}`];
    if (!rec) {
      return { status: 'attending', willAttend: true, hasResponded: false };
    }
    const isNotComing =
      rec.status === 'not_coming' || rec.will_attend === false;
    return {
      status: isNotComing ? 'not_coming' : 'attending',
      willAttend: !isNotComing,
      hasResponded: true,
      updatedAt: rec.updated_at || rec.submitted_at,
    };
  };

  // Handle clicking "I will NOT be coming" or "Undo — I will attend"
  const handlePollResponse = async (dateStr, mealType, nextStatus) => {
    try {
      await submitMealAttendancePoll({
        meal_date: dateStr,
        meal_type: mealType,
        status: nextStatus,
        will_attend: nextStatus !== 'not_coming',
      });
      const mealCap =
        mealType.charAt(0).toUpperCase() + mealType.slice(1).toLowerCase();
      if (nextStatus === 'not_coming') {
        showToast(
          `Marked "Not Coming" for ${mealCap} (${formatHumanDate(
            dateStr
          )}). You can undo this anytime before the cutoff, and your meal entitlement is always preserved.`
        );
      } else {
        showToast(
          `Undone! Your status for ${mealCap} (${formatHumanDate(
            dateStr
          )}) is back to Attending.`
        );
      }
    } catch (err) {
      showToast(
        err.message || 'Unable to update attendance poll response.',
        'error'
      );
    }
  };

  const nextActivePoll = useMemo(
    () => getNextActivePollMeal(messProfile),
    [messProfile]
  );

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!fbForm.comment.trim()) return;
    await submitStudentFeedback({
      student_name: studentProfile.full_name,
      meal_type: fbForm.meal_type,
      dish_name: fbForm.dish_name || `${fbForm.meal_type} Fixed Menu`,
      rating: Number(fbForm.rating),
      feedback_category: fbForm.feedback_category,
      comment: fbForm.comment,
    });
    setFbForm({
      meal_type: 'Lunch',
      dish_name: '',
      rating: 5,
      feedback_category: 'review',
      comment: '',
    });
    showToast(
      'Thank you! Your feedback has been sent to the Mess Owner Dashboard.'
    );
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    await updateStudentProfile(profileForm);
    showToast('Student profile & preferences updated!');
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const activeTabMeta =
    STUDENT_TABS.find((t) => t.id === activeTab) || STUDENT_TABS[0];

  const publishedTodayCount = ['breakfast', 'lunch', 'dinner'].filter((m) =>
    Boolean(getPublishedMenu(todayStr, m))
  ).length;

  return (
    <div className="min-h-screen flex bg-cream-50 text-slate-900">
      {/* ================= DESKTOP STUDENT SIDEBAR ================= */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-brand-950 text-brand-100 border-r border-brand-900 shrink-0">
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-brand-900">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center text-white">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-extrabold text-white tracking-tight">
                  Smart<span className="text-brand-400">Bite</span>
                </span>
                <p className="text-[10px] text-brand-300 font-semibold">
                  Free Student Portal
                </p>
              </div>
            </Link>
            <Badge variant="green">₹0 Free</Badge>
          </div>

          <nav className="space-y-1">
            {STUDENT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-800 text-white shadow-xs border border-brand-700'
                      : 'text-brand-200/80 hover:bg-brand-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-brand-300' : 'text-brand-400'
                      }`}
                    />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === 'notifications' && unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Unconditional Entitlement Guarantee Box */}
        <div className="p-4 border-t border-brand-900 space-y-3">
          <div className="p-3.5 rounded-xl bg-brand-900/80 border border-brand-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-300">
              <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
              <span>100% Meal Entitlement</span>
            </div>
            <p className="text-[11px] text-brand-200/85 leading-relaxed">
              Your default status for every meal is <strong>Attending</strong>. You never lose your meal entitlement under any circumstance.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-brand-300">
            <Link
              to="/"
              className="hover:text-white inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-brand-900"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Website</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="hover:text-white inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-brand-900 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-72 bg-brand-950 text-brand-100 h-full flex flex-col justify-between p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-brand-900">
                <span className="text-base font-extrabold text-white">
                  Smart<span className="text-brand-400">Bite</span> Student
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-brand-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1">
                {STUDENT_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        activeTab === tab.id
                          ? 'bg-brand-800 text-white'
                          : 'text-brand-200 hover:bg-brand-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-brand-900 text-brand-200 text-xs font-bold"
            >
              Sign Out
            </button>
          </aside>
        </div>
      )}

      {/* ================= MAIN STUDENT CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {activeTabMeta.label}
                </h1>
                <Badge variant="green">Free Student Account</Badge>
                {isDemoMode && <Badge variant="amber">Demo Mode</Badge>}
              </div>
              <p className="text-xs text-slate-500 truncate">
                {studentProfile.full_name} ({studentProfile.roll_number}) •{' '}
                {messProfile.name} ({studentProfile.hostel_name})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-900 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-brand-700" />
              <span>Default Status: Attending • Entitlement Active</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl border border-slate-200 bg-cream-50 hover:bg-cream-100 text-slate-700 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Prompt to link Mess Join Code if student hasn't linked a mess yet */}
          {!isDemoMode && !user?.messId && (
            <Card className="p-5 bg-amber-50 border-amber-300 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <h2 className="text-sm font-extrabold text-amber-950">
                    Link Your Account to Your Hostel Mess
                  </h2>
                  <p className="text-xs text-amber-800">
                    Enter the Mess Join Code shared by your Mess Owner (e.g.{' '}
                    <code className="font-mono font-bold">SB-XXXXXX</code>) to view your mess’s weekly menu and respond to meal attendance polls.
                  </p>
                  {joinError && (
                    <p className="text-xs font-bold text-rose-600 flex items-center gap-1 pt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {joinError}
                    </p>
                  )}
                  <form
                    onSubmit={handleLinkMessCode}
                    className="flex flex-wrap items-center gap-2 pt-2"
                  >
                    <input
                      type="text"
                      required
                      value={joinCodeInput}
                      onChange={(e) =>
                        setJoinCodeInput(e.target.value.toUpperCase())
                      }
                      placeholder="Enter Mess Join Code (e.g. SB-482910)"
                      className="rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-900 focus:outline-none focus:border-brand-700"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="primary"
                      disabled={joiningMess}
                    >
                      {joiningMess ? 'Linking...' : 'Join Hostel Mess'}
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          )}

          {toast && (
            <div
              className={`p-4 rounded-xl text-white text-xs font-semibold flex items-center justify-between shadow-lg ${
                toastType === 'error' ? 'bg-rose-700' : 'bg-brand-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {toastType === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-brand-300 shrink-0" />
                )}
                <span>{toast}</span>
              </div>
              <button type="button" onClick={() => setToast('')}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ================= 1. STUDENT DASHBOARD OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome & Active Attendance Poll Banner */}
              <Card className="p-6 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 text-white border-none">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-200">
                      <ShieldCheck className="w-4 h-4 text-brand-300" />
                      <span>
                        100% Free for Students • Default Status is Attending
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold">
                      Hello, {studentProfile.full_name.split(' ')[0]}! Will you have{' '}
                      {nextActivePoll.mealType} on{' '}
                      {nextActivePoll.mealDate === todayStr
                        ? 'today'
                        : formatHumanDate(nextActivePoll.mealDate)}
                      ?
                    </h2>
                    <p className="text-xs text-brand-100/90 max-w-xl leading-relaxed">
                      Your mess cooks a fixed menu for everyone enrolled. You are counted as <strong>Attending by default</strong>. Only click <strong>&ldquo;I will NOT be coming&rdquo;</strong> if you plan to skip a meal so the kitchen can avoid extra leftover plates.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveTab('meal_attendance')}
                    >
                      Open Attendance Polls
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                      onClick={() => setActiveTab('week_menu')}
                    >
                      This Week’s Menu
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Quick KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-5 space-y-1">
                  <span className="text-xs text-slate-500 font-semibold">
                    Today’s Published Meals
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {publishedTodayCount} / 3 Meals Published
                  </p>
                  <p className="text-xs text-brand-700 font-bold">
                    Fixed mess menu for {formatHumanDate(todayStr)}
                  </p>
                </Card>

                <Card className="p-5 space-y-1">
                  <span className="text-xs text-slate-500 font-semibold">
                    Today’s Meal Attendance Status
                  </span>
                  <p className="text-2xl font-extrabold text-brand-800">
                    {
                      ['breakfast', 'lunch', 'dinner'].filter(
                        (m) => getStudentAttendanceStatus(todayStr, m).willAttend
                      ).length
                    }{' '}
                    / 3 Meals Attending
                  </p>
                  <p className="text-xs text-slate-500">
                    Default state is Attending for every meal
                  </p>
                </Card>

                <Card className="p-5 space-y-1">
                  <span className="text-xs text-slate-500 font-semibold">
                    My Dining Entitlement
                  </span>
                  <p className="text-2xl font-extrabold text-emerald-700">
                    100% Guaranteed
                  </p>
                  <p className="text-xs text-slate-500">
                    You never lose your meal entitlement in any case
                  </p>
                </Card>
              </div>

              {/* Today's 3 Meals + Instant Attendance Poll Toggle */}
              <Card className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Today’s Fixed Menu &amp; Attendance Polls ({formatHumanDate(todayStr)})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Default status is Attending. Mark &ldquo;I will NOT be coming&rdquo; before the cutoff only if you will skip a meal.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveTab('meal_attendance')}
                  >
                    See Today &amp; Tomorrow Polls →
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                    const menu = getPublishedMenu(todayStr, mealType);
                    const pollWin = computeMealPollWindow(
                      todayStr,
                      mealType,
                      messProfile
                    );
                    const att = getStudentAttendanceStatus(todayStr, mealType);
                    const items = menu?.items || [];

                    return (
                      <div
                        key={mealType}
                        className={`p-4 rounded-2xl border flex flex-col justify-between space-y-4 ${
                          att.willAttend
                            ? 'bg-cream-50 border-slate-200/80'
                            : 'bg-rose-50/40 border-rose-200'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-800">
                              {mealType}
                            </span>
                            <Badge
                              variant={att.willAttend ? 'green' : 'red'}
                            >
                              {att.willAttend
                                ? 'Attending (Default)'
                                : 'Marked Not Coming'}
                            </Badge>
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              Will you have {mealType} today?
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-brand-700 shrink-0" />
                              {pollWin.statusBadge}
                            </p>
                          </div>

                          {menu && items.length > 0 ? (
                            <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                              <p className="text-xs font-bold text-slate-800">
                                {menu.title}
                              </p>
                              <ul className="space-y-1 text-xs text-slate-600">
                                {items.map((item) => (
                                  <li
                                    key={item.id}
                                    className="truncate"
                                  >
                                    • {item.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic py-2">
                              No menu published for this meal yet.
                            </p>
                          )}
                        </div>

                        {/* Single clear action to mark "I will NOT be coming" or Undo */}
                        <div className="pt-2 border-t border-slate-200/70">
                          {pollWin.isLocked ? (
                            <div className="w-full py-2 px-3 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center gap-1.5">
                              <Lock className="w-3.5 h-3.5" />
                              <span>
                                Locked after cutoff ({pollWin.closesAtFormatted})
                              </span>
                            </div>
                          ) : att.willAttend ? (
                            <button
                              type="button"
                              onClick={() =>
                                handlePollResponse(
                                  todayStr,
                                  mealType,
                                  'not_coming'
                                )
                              }
                              className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              <span>I will NOT be coming</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handlePollResponse(
                                  todayStr,
                                  mealType,
                                  'attending'
                                )
                              }
                              className="w-full py-2.5 px-3 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Undo — I WILL be attending</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* ================= 2. TODAY'S MENU ================= */}
          {activeTab === 'today_menu' && (
            <div className="space-y-6">
              <Card className="p-5 bg-brand-50/70 border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-brand-700">
                    Published Fixed Menu • {formatHumanDate(todayStr)}
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Today’s Breakfast, Lunch &amp; Dinner Menu
                  </h2>
                  <p className="text-xs text-slate-600">
                    Showing published dishes for your hostel mess today.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setActiveTab('meal_attendance')}
                >
                  Mark Meal Attendance Poll
                </Button>
              </Card>

              {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                const menu = getPublishedMenu(todayStr, mealType);
                const items = menu?.items || [];

                return (
                  <Card key={mealType} className="p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-brand-700">
                          {mealType} •{' '}
                          {mealType === 'breakfast'
                            ? messProfile.breakfast_time
                            : mealType === 'lunch'
                            ? messProfile.lunch_time
                            : messProfile.dinner_time}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900">
                          {menu ? menu.title : `${mealType.toUpperCase()} Menu`}
                        </h3>
                      </div>
                      {menu && items.length > 0 && (
                        <Badge variant="green">
                          {items.length} Dish{items.length === 1 ? '' : 'es'} Published
                        </Badge>
                      )}
                    </div>

                    {!menu || items.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-cream-50 border border-dashed border-slate-200 text-center">
                        <p className="text-sm font-bold text-slate-700">
                          No menu published for this date yet.
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Your mess owner has not published the {mealType} menu for {formatHumanDate(todayStr)} yet.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {items.map((dish) => (
                          <div
                            key={dish.id}
                            className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white flex flex-col justify-between"
                          >
                            <div>
                              <img
                                src={dish.image_url}
                                alt={dish.name}
                                className="h-36 w-full object-cover"
                              />
                              <div className="p-4 space-y-2">
                                <h4 className="text-sm font-bold text-slate-900">
                                  {dish.name}
                                </h4>
                                <p className="text-xs text-slate-500">
                                  {dish.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* ================= 3. THIS WEEK'S MENU (MONDAY TO SUNDAY) ================= */}
          {activeTab === 'week_menu' && (
            <div className="space-y-6">
              <Card className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
                      <CalendarDays className="w-4 h-4" />
                      <span>Published Weekly Menu (Monday – Sunday)</span>
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                      Week of {weekDays[0]?.humanDate} – {weekDays[6]?.humanDate}
                    </h2>
                    <p className="text-xs text-slate-500">
                      View the published Breakfast, Lunch, and Dinner menu across the week.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setWeekStartDate(addDaysToDateStr(weekStartDate, -7))
                      }
                    >
                      ← Prev Week
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setWeekStartDate(getWeekStartDateStr(todayStr))
                      }
                    >
                      Current Week
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setWeekStartDate(addDaysToDateStr(weekStartDate, 7))
                      }
                    >
                      Next Week →
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left min-w-[860px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-cream-100/80">
                        <th className="py-3 px-3 text-xs font-extrabold uppercase text-slate-600 w-28">
                          Meal
                        </th>
                        {weekDays.map((day) => (
                          <th
                            key={day.dateStr}
                            className={`py-3 px-3 text-xs border-l border-slate-200/70 ${
                              day.isToday
                                ? 'bg-brand-900 text-white'
                                : 'text-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold">
                                {day.shortDay}
                              </span>
                              {day.isToday && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-700 text-white uppercase font-bold">
                                  Today
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[10px] mt-0.5 ${
                                day.isToday
                                  ? 'text-brand-200'
                                  : 'text-slate-500'
                              }`}
                            >
                              {day.shortDate}
                            </p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80">
                      {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                        <tr key={mealType}>
                          <td className="py-3.5 px-3 bg-cream-50 font-extrabold text-xs uppercase tracking-wider text-brand-900 align-top">
                            {mealType}
                          </td>
                          {weekDays.map((day) => {
                            const pubMenu = getPublishedMenu(
                              day.dateStr,
                              mealType
                            );
                            const dishes = pubMenu?.items || [];

                            return (
                              <td
                                key={`${day.dateStr}_${mealType}`}
                                className="p-3 align-top border-l border-slate-200/70 bg-white"
                              >
                                {pubMenu && dishes.length > 0 ? (
                                  <div className="space-y-1.5">
                                    <p className="text-[11px] font-bold text-brand-900 line-clamp-1">
                                      {pubMenu.title}
                                    </p>
                                    <ul className="space-y-0.5">
                                      {dishes.map((d) => (
                                        <li
                                          key={d.id}
                                          className="text-[11px] text-slate-700"
                                        >
                                          • {d.name}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-slate-400 italic">
                                    Not published yet
                                  </p>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ================= 4. MEAL ATTENDANCE POLLS ================= */}
          {activeTab === 'meal_attendance' && (
            <div className="space-y-6">
              <Card className="p-5 bg-brand-900 text-white border-none">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-300">
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        Per-Meal Attendance Poll • Default State is Attending
                      </span>
                    </div>
                    <h2 className="text-lg font-extrabold">
                      Let the Mess Know Only When You Will Skip a Meal
                    </h2>
                    <p className="text-xs text-brand-100/90 max-w-2xl leading-relaxed">
                      Breakfast ends &rarr; Lunch poll opens. Lunch ends &rarr; Dinner poll opens. Dinner ends &rarr; Next day’s Breakfast poll opens. Each poll closes at the cutoff time before its meal ({messProfile.default_cutoff_hours || 2}h before start). Not responding means you are counted as <strong>Attending</strong>, and you never lose your meal entitlement.
                    </p>
                  </div>

                  {/* Date Selector (Today / Tomorrow) */}
                  <div className="inline-flex rounded-xl bg-white/10 p-1 border border-white/15 shrink-0">
                    {[
                      {
                        id: todayStr,
                        label: `Today (${formatHumanDate(todayStr)})`,
                      },
                      {
                        id: tomorrowStr,
                        label: `Tomorrow (${formatHumanDate(tomorrowStr)})`,
                      },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setPollDate(d.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          pollDate === d.id
                            ? 'bg-white text-brand-900'
                            : 'text-brand-100 hover:text-white'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                  const pollWin = computeMealPollWindow(
                    pollDate,
                    mealType,
                    messProfile
                  );
                  const menu = getPublishedMenu(pollDate, mealType);
                  const att = getStudentAttendanceStatus(pollDate, mealType);
                  const items = menu?.items || [];
                  const dayWord =
                    pollDate === todayStr
                      ? 'today'
                      : pollDate === tomorrowStr
                      ? 'tomorrow'
                      : `on ${formatHumanDate(pollDate)}`;

                  return (
                    <Card
                      key={`${pollDate}_${mealType}`}
                      className={`p-5 flex flex-col justify-between space-y-5 border-2 ${
                        !att.willAttend
                          ? 'border-rose-300 bg-rose-50/30'
                          : 'border-brand-200 bg-white'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-brand-800">
                            {mealType} • {formatHumanDate(pollDate)}
                          </span>
                          <Badge
                            variant={
                              pollWin.status === 'open'
                                ? 'green'
                                : pollWin.status === 'closed'
                                ? 'neutral'
                                : 'amber'
                            }
                          >
                            {pollWin.status === 'open'
                              ? 'Poll Open'
                              : pollWin.status === 'closed'
                              ? 'Closed'
                              : 'Upcoming'}
                          </Badge>
                        </div>

                        <div>
                          <h3 className="text-lg font-extrabold text-slate-900">
                            Will you have {mealType} {dayWord}?
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                            <span>{pollWin.statusBadge}</span>
                          </p>
                        </div>

                        {/* Current Student Attendance State Box */}
                        <div
                          className={`p-3.5 rounded-xl border ${
                            att.willAttend
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                              : 'bg-rose-100/70 border-rose-300 text-rose-950'
                          }`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                            Your Current Status
                          </p>
                          <p className="text-sm font-extrabold mt-0.5">
                            {att.willAttend
                              ? '✓ Attending (Default — 1 Plate Counted)'
                              : '✕ Marked "I will NOT be coming"'}
                          </p>
                          <p className="text-[11px] mt-1 opacity-85">
                            {att.willAttend
                              ? 'No action needed if you are coming to eat.'
                              : 'Kitchen will deduct 1 plate for this meal. Your dining entitlement remains active.'}
                          </p>
                        </div>

                        {/* Published Menu Preview for this Meal */}
                        <div className="p-3 rounded-xl bg-cream-50 border border-slate-200/80 space-y-1.5">
                          <p className="text-[11px] font-bold text-slate-700">
                            {menu
                              ? `Menu: ${menu.title}`
                              : `Fixed ${mealType} menu`}
                          </p>
                          {items.length > 0 ? (
                            <ul className="space-y-0.5 text-xs text-slate-600">
                              {items.map((d) => (
                                <li key={d.id}>• {d.name}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">
                              Menu dishes not published yet for this slot.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Poll Action Button */}
                      <div className="pt-3 border-t border-slate-200/80 space-y-2">
                        {pollWin.isLocked ? (
                          <div className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center gap-2">
                            <Lock className="w-4 h-4" />
                            <span>
                              Answer Locked (Cutoff {pollWin.closesAtFormatted} Passed)
                            </span>
                          </div>
                        ) : att.willAttend ? (
                          <button
                            type="button"
                            onClick={() =>
                              handlePollResponse(
                                pollDate,
                                mealType,
                                'not_coming'
                              )
                            }
                            className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                          >
                            <UserMinus className="w-4 h-4" />
                            <span>I will NOT be coming</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handlePollResponse(pollDate, mealType, 'attending')
                            }
                            className="w-full py-3 px-4 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Undo — I WILL be attending</span>
                          </button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= 5. MEAL HISTORY ================= */}
          {activeTab === 'meal_history' && (
            <Card className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    My Past Meal Attendance History
                  </h3>
                  <p className="text-xs text-slate-500">
                    Shows meals attended or skipped across your mess schedule.
                  </p>
                </div>
                <Badge variant="neutral">Attendance Log</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase bg-cream-50">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Meal</th>
                      <th className="py-3 px-3">Menu &amp; Dishes</th>
                      <th className="py-3 px-3">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentMealHistory.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-slate-500"
                        >
                          No past meal attendance history recorded yet.
                        </td>
                      </tr>
                    ) : (
                      studentMealHistory.map((h) => (
                        <tr key={h.id} className="hover:bg-cream-50/60">
                          <td className="py-3 px-3 font-medium text-slate-600">
                            {formatHumanDate(h.meal_date)}
                          </td>
                          <td className="py-3 px-3 font-bold uppercase text-brand-800">
                            {h.meal_type}
                          </td>
                          <td className="py-3 px-3 text-slate-800">
                            {(h.dishes || h.selected_dishes || []).join(' • ')}
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant={
                                String(h.status || '')
                                  .toLowerCase()
                                  .includes('skip')
                                  ? 'red'
                                  : 'green'
                              }
                            >
                              {h.status || 'Attended'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ================= 6. FEEDBACK & COMPLAINTS ================= */}
          {activeTab === 'feedback' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-5 p-5 space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  Rate a Dish, Log a Complaint or Suggest a Menu Item
                </h3>
                <form onSubmit={handleFeedbackSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Meal
                      </label>
                      <select
                        value={fbForm.meal_type}
                        onChange={(e) =>
                          setFbForm({ ...fbForm, meal_type: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white font-semibold"
                      >
                        <option>Breakfast</option>
                        <option>Lunch</option>
                        <option>Dinner</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Category
                      </label>
                      <select
                        value={fbForm.feedback_category}
                        onChange={(e) =>
                          setFbForm({
                            ...fbForm,
                            feedback_category: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white font-semibold"
                      >
                        <option value="review">Dish Review</option>
                        <option value="complaint">Kitchen Complaint</option>
                        <option value="suggestion">Menu Suggestion</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Dish Name (from Menu)
                    </label>
                    <input
                      type="text"
                      value={fbForm.dish_name}
                      onChange={(e) =>
                        setFbForm({ ...fbForm, dish_name: e.target.value })
                      }
                      placeholder="e.g., Palak Paneer / Rotis / Poha"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Star Rating (1 to 5)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFbForm({ ...fbForm, rating: star })}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            fbForm.rating >= star
                              ? 'bg-amber-50 border-amber-300 text-amber-500'
                              : 'bg-slate-50 border-slate-200 text-slate-300'
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Feedback / Suggestion *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={fbForm.comment}
                      onChange={(e) =>
                        setFbForm({ ...fbForm, comment: e.target.value })
                      }
                      placeholder="Share constructive feedback on taste, temperature, hygiene or new dishes..."
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full">
                    Submit Feedback to Mess Owner
                  </Button>
                </form>
              </Card>

              <Card className="lg:col-span-7 p-5 space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  Recent Campus Feedback &amp; Mess Owner Replies
                </h3>
                <div className="space-y-3">
                  {feedbackList.map((fb) => {
                    const body =
                      fb.comment || fb.review || fb.complaint || fb.suggestion;
                    return (
                      <div
                        key={fb.id}
                        className="p-4 rounded-xl bg-cream-50 border border-slate-200/80 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {fb.dish_name} ({fb.meal_type})
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-600">
                              {'★'.repeat(fb.rating)}
                            </span>
                            <Badge
                              variant={
                                fb.status === 'resolved' ? 'green' : 'amber'
                              }
                            >
                              {fb.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700">
                          &ldquo;{body}&rdquo;
                        </p>
                        {fb.owner_reply && (
                          <p className="text-xs text-brand-800 bg-brand-50 p-2.5 rounded-lg border border-brand-200 font-medium">
                            <strong>Mess Owner Reply:</strong> {fb.owner_reply}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* ================= 7. NOTIFICATIONS ================= */}
          {activeTab === 'notifications' && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Attendance Poll Alerts, Menu Updates &amp; Replies
                  </h3>
                  <p className="text-xs text-slate-500">
                    Receive notifications when your next meal attendance poll opens or when weekly menus are published.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={markAllNotificationsRead}
                >
                  Mark All Read
                </Button>
              </div>
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                      !n.is_read
                        ? 'bg-brand-50/70 border-brand-200'
                        : 'bg-white border-slate-200/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">
                        {n.title}
                      </p>
                      {!n.is_read && <Badge variant="green">New</Badge>}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ================= 8. STUDENT PROFILE ================= */}
          {activeTab === 'profile' && (
            <Card className="p-6 max-w-2xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    My Student Profile &amp; Dietary Preferences
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your meal entitlement is permanently active across all hostel meals
                  </p>
                </div>
                <Badge variant="green">Entitlement Active</Badge>
              </div>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          full_name: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Roll Number / Student ID
                    </label>
                    <input
                      type="text"
                      value={profileForm.roll_number}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          roll_number: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hostel Block &amp; Room
                    </label>
                    <input
                      type="text"
                      value={profileForm.hostel_name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          hostel_name: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Dietary Preference
                    </label>
                    <select
                      value={profileForm.dietary_preference}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          dietary_preference: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white font-semibold"
                    >
                      <option>Vegetarian</option>
                      <option>Jain</option>
                      <option>Eggetarian</option>
                      <option>Non-Vegetarian</option>
                      <option>Vegan</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" variant="primary">
                  Save Student Profile
                </Button>
              </form>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
