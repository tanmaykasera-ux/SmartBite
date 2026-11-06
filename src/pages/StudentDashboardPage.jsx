import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  CheckSquare,
  Apple,
  History,
  MessageSquare,
  Bell,
  User,
  Leaf,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Sparkles,
  Star,
  AlertCircle,
  ChevronRight,
  Flame,
  Calendar,
  Building2,
  KeyRound,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { supabase } from '../lib/supabase';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'menu', label: "Today's Menu", icon: UtensilsCrossed },
  { id: 'selection', label: 'Meal Selection', icon: CheckSquare },
  { id: 'nutrition', label: 'Nutrition Tracker', icon: Apple },
  { id: 'history', label: 'Meal History', icon: History },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'My Profile', icon: User },
];

const MACRO_COLORS = ['#166534', '#15803d', '#d97706'];

export default function StudentDashboardPage() {
  const { user, signOut, isDemoMode, linkStudentToMess } = useAuth();
  const {
    menus,
    messProfile,
    studentSelectionsMap,
    studentMealHistory,
    studentProfile,
    feedbackList,
    notifications,
    submitStudentMealSelection,
    submitStudentFeedback,
    updateStudentProfile,
    markNotificationRead,
    markAllNotificationsRead,
    refreshFromSupabase,
  } = useData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // One-time prompt state for existing student accounts with no mess link
  const needsMessLink =
    !isDemoMode && user?.role === 'student' && !user?.messId;
  const [availableMesses, setAvailableMesses] = useState([]);
  const [loadingMesses, setLoadingMesses] = useState(false);
  const [promptCollege, setPromptCollege] = useState('');
  const [promptMessId, setPromptMessId] = useState('');
  const [promptJoinCode, setPromptJoinCode] = useState('');
  const [promptHostelName, setPromptHostelName] = useState(
    user?.hostelName || ''
  );
  const [promptRollId, setPromptRollId] = useState(user?.studentId || '');
  const [linkingMess, setLinkingMess] = useState(false);
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
    if (!needsMessLink || !supabase) return;
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
        setAvailableMesses(rows);
        if (rows.length > 0) {
          const initialCol =
            rows.find(
              (r) =>
                (r.college_name || '').toLowerCase() ===
                (user?.collegeName || '').toLowerCase()
            )?.college_name || rows[0].college_name;
          setPromptCollege(initialCol || '');
        }
      })
      .finally(() => {
        if (mounted) setLoadingMesses(false);
      });
    return () => {
      mounted = false;
    };
  }, [needsMessLink, user?.collegeName]);

  const promptCollegeOptions = useMemo(() => {
    const set = new Set();
    availableMesses.forEach((m) => {
      if (m.college_name?.trim()) set.add(m.college_name.trim());
    });
    return Array.from(set);
  }, [availableMesses]);

  const promptMessesForCollege = useMemo(() => {
    if (!promptCollege) return availableMesses;
    return availableMesses.filter(
      (m) =>
        (m.college_name || '').trim().toLowerCase() ===
        promptCollege.trim().toLowerCase()
    );
  }, [availableMesses, promptCollege]);

  useEffect(() => {
    if (promptMessesForCollege.length > 0) {
      if (!promptMessesForCollege.some((m) => m.id === promptMessId)) {
        setPromptMessId(promptMessesForCollege[0].id);
      }
    } else {
      setPromptMessId('');
    }
  }, [promptCollege, promptMessesForCollege]);

  const handleConfirmMessLink = async (e) => {
    e.preventDefault();
    setLinkError('');
    if (!promptMessId && !promptJoinCode.trim()) {
      setLinkError(
        'Please select your active mess from the dropdown or enter your Mess Join Code.'
      );
      return;
    }
    setLinkingMess(true);
    try {
      await linkStudentToMess({
        messId: promptMessId,
        joinCode: promptJoinCode.trim().toUpperCase(),
        hostelName: promptHostelName,
        studentRollId: promptRollId,
      });
      await refreshFromSupabase();
    } catch (err) {
      setLinkError(err.message || 'Could not link to mess. Please try again.');
    } finally {
      setLinkingMess(false);
    }
  };

  // Today's Menu filter state
  const [menuMealFilter, setMenuMealFilter] = useState('All');
  const [menuSearch, setMenuSearch] = useState('');

  // Meal Selection state
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectionDraft, setSelectionDraft] = useState({});
  const [selectionSavedToast, setSelectionSavedToast] = useState('');
  const [submittingMeal, setSubmittingMeal] = useState('');

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    meal_type: 'Lunch',
    dish_name: '',
    feedback_category: 'dish_review',
    rating: 5,
    comment: '',
  });
  const [feedbackBanner, setFeedbackBanner] = useState('');

  // Profile form state
  const [profileForm, setProfileForm] = useState(null);
  const [profileBanner, setProfileBanner] = useState('');

  const studentDisplayName =
    studentProfile?.full_name || user?.full_name || user?.email?.split('@')[0] || 'Student';

  // Organize menus by meal_type (strictly published menus belonging to the student's mess)
  const menusByMealType = useMemo(() => {
    const map = { Breakfast: null, Lunch: null, Dinner: null };
    if (!isDemoMode && !user?.messId) {
      return map;
    }
    const publishedMenus = (menus || []).filter(
      (m) =>
        String(m.publish_status || 'published').toLowerCase() === 'published' &&
        (!user?.messId || !m.mess_id || m.mess_id === user.messId)
    );
    ['Breakfast', 'Lunch', 'Dinner'].forEach((type) => {
      const lowerType = type.toLowerCase();
      const exactMatch = publishedMenus.find(
        (m) =>
          String(m.meal_type || '').toLowerCase() === lowerType &&
          m.menu_date === selectedDate
      );
      const fallbackMatch = publishedMenus.find(
        (m) => String(m.meal_type || '').toLowerCase() === lowerType
      );
      const chosen = exactMatch || fallbackMatch || null;
      if (chosen) {
        map[type] = {
          ...chosen,
          items: (chosen.items || []).map((dish) => ({
            ...dish,
            dish_name: dish.dish_name || dish.name || 'Dish',
            name: dish.name || dish.dish_name || 'Dish',
          })),
        };
      }
    });
    return map;
  }, [menus, selectedDate, isDemoMode, user?.messId]);

  // All dishes across today's Breakfast, Lunch, Dinner
  const allTodayDishes = useMemo(() => {
    const list = [];
    ['Breakfast', 'Lunch', 'Dinner'].forEach((type) => {
      const menu = menusByMealType[type];
      if (menu && Array.isArray(menu.items)) {
        menu.items.forEach((dish) => {
          list.push({
            ...dish,
            meal_type: type,
            serving_time: menu.serving_time,
            cutoff_time: menu.cutoff_time,
            menu_date: menu.menu_date,
          });
        });
      }
    });
    return list;
  }, [menusByMealType]);

  // Helper to get active selected dish IDs for a meal type
  const getSelectedDishIdsForMeal = (mealType) => {
    const key = `${selectedDate}_${mealType}`;
    if (selectionDraft[key] !== undefined) {
      return selectionDraft[key].selectedDishIds;
    }
    const saved = studentSelectionsMap[key] || studentSelectionsMap[`${todayStr}_${mealType}`];
    if (saved && Array.isArray(saved.selectedDishIds)) {
      return saved.selectedDishIds;
    }
    return [];
  };

  const getAttendingStatusForMeal = (mealType) => {
    const key = `${selectedDate}_${mealType}`;
    if (selectionDraft[key] !== undefined) {
      return selectionDraft[key].will_attend;
    }
    const saved = studentSelectionsMap[key] || studentSelectionsMap[`${todayStr}_${mealType}`];
    if (saved && typeof saved.will_attend === 'boolean') {
      return saved.will_attend;
    }
    return true;
  };

  const toggleDishSelection = (mealType, dishId) => {
    const key = `${selectedDate}_${mealType}`;
    const currentIds = getSelectedDishIdsForMeal(mealType);
    const currentAttend = getAttendingStatusForMeal(mealType);
    const exists = currentIds.includes(dishId);
    const nextIds = exists
      ? currentIds.filter((id) => id !== dishId)
      : [...currentIds, dishId];

    setSelectionDraft((prev) => ({
      ...prev,
      [key]: {
        will_attend: nextIds.length > 0 ? true : currentAttend,
        selectedDishIds: nextIds,
      },
    }));
  };

  const handleSaveMealSelection = async (mealType) => {
    setSubmittingMeal(mealType);
    setSelectionSavedToast('');
    const dishIds = getSelectedDishIdsForMeal(mealType);
    const willAttend = getAttendingStatusForMeal(mealType);

    try {
      await submitStudentMealSelection({
        meal_date: selectedDate,
        meal_type: mealType,
        will_attend: willAttend,
        selectedDishIds: dishIds,
      });

      setSelectionSavedToast(
        `Your ${mealType} preference (${dishIds.length} dish${
          dishIds.length === 1 ? '' : 'es'
        }) for ${selectedDate} has been confirmed and shared with ${
          messProfile?.mess_name || 'the mess kitchen'
        }!`
      );
    } catch (err) {
      setSelectionSavedToast(err?.message || 'Unable to save selection.');
    } finally {
      setSubmittingMeal('');
    }
  };

  // Automatic Nutrition Calculation from Selected Dishes across Breakfast, Lunch, Dinner
  const nutritionSummary = useMemo(() => {
    const byMeal = {
      Breakfast: { calories: 0, protein: 0, carbs: 0, fats: 0, dishes: [] },
      Lunch: { calories: 0, protein: 0, carbs: 0, fats: 0, dishes: [] },
      Dinner: { calories: 0, protein: 0, carbs: 0, fats: 0, dishes: [] },
    };

    ['Breakfast', 'Lunch', 'Dinner'].forEach((mealType) => {
      const menu = menusByMealType[mealType];
      const selectedIds = getSelectedDishIdsForMeal(mealType);
      if (menu && Array.isArray(menu.items)) {
        menu.items.forEach((dish) => {
          if (selectedIds.includes(dish.id)) {
            byMeal[mealType].calories += Number(dish.calories || 0);
            byMeal[mealType].protein += Number(dish.protein || 0);
            byMeal[mealType].carbs += Number(dish.carbs || 0);
            byMeal[mealType].fats += Number(dish.fats || 0);
            byMeal[mealType].dishes.push(dish);
          }
        });
      }
      byMeal[mealType].protein = Number(byMeal[mealType].protein.toFixed(1));
      byMeal[mealType].carbs = Number(byMeal[mealType].carbs.toFixed(1));
      byMeal[mealType].fats = Number(byMeal[mealType].fats.toFixed(1));
    });

    const total = {
      calories:
        byMeal.Breakfast.calories + byMeal.Lunch.calories + byMeal.Dinner.calories,
      protein: Number(
        (
          byMeal.Breakfast.protein +
          byMeal.Lunch.protein +
          byMeal.Dinner.protein
        ).toFixed(1)
      ),
      carbs: Number(
        (byMeal.Breakfast.carbs + byMeal.Lunch.carbs + byMeal.Dinner.carbs).toFixed(
          1
        )
      ),
      fats: Number(
        (byMeal.Breakfast.fats + byMeal.Lunch.fats + byMeal.Dinner.fats).toFixed(1)
      ),
    };

    const mealChartData = ['Breakfast', 'Lunch', 'Dinner'].map((mealType) => ({
      meal: mealType,
      Calories: byMeal[mealType].calories,
      Protein: byMeal[mealType].protein,
      Carbs: byMeal[mealType].carbs,
      Fats: byMeal[mealType].fats,
    }));

    const macroPieData = [
      { name: 'Protein (g)', value: total.protein || 1 },
      { name: 'Carbohydrates (g)', value: total.carbs || 1 },
      { name: 'Fats (g)', value: total.fats || 1 },
    ];

    return { byMeal, total, mealChartData, macroPieData };
  }, [menusByMealType, studentSelectionsMap, selectionDraft, selectedDate]);

  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.comment.trim()) return;
    const dishName =
      feedbackForm.dish_name ||
      (feedbackForm.feedback_category === 'complaint'
        ? 'Kitchen & Hygiene Complaint'
        : feedbackForm.feedback_category === 'suggestion'
        ? 'Menu Improvement Suggestion'
        : 'General Mess Meal');

    await submitStudentFeedback({
      student_name: studentDisplayName,
      meal_type: feedbackForm.meal_type,
      dish_name: dishName,
      feedback_category: feedbackForm.feedback_category,
      rating: Number(feedbackForm.rating),
      comment: feedbackForm.comment.trim(),
    });

    setFeedbackForm((prev) => ({ ...prev, comment: '' }));
    setFeedbackBanner(
      'Thank you! Your feedback has been recorded and sent directly to the Mess Owner Dashboard.'
    );
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const nextProfile = profileForm || studentProfile;
    await updateStudentProfile(nextProfile);
    setProfileBanner('Student profile updated successfully!');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const activeProfileData = profileForm || studentProfile;

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col lg:flex-row">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-brand-950 text-white flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Brand Logo */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-800 border border-brand-700 flex items-center justify-center shadow-sm">
                <Leaf className="w-5 h-5 text-brand-300" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-white">
                  Smart<span className="text-brand-400">Bite</span>
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-brand-300">
                  Student Portal • Free
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

          {/* Mess & Entitlement Pill */}
          <div className="p-3.5 rounded-xl bg-brand-900/90 border border-brand-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300">
                Enrolled Dining Hall
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate">
              {messProfile?.mess_name || 'Campus Dining Hall'}
            </p>
            <p className="text-[11px] text-brand-200 truncate">
              {studentProfile?.hostel_name || 'Hostel not set'}
              {studentProfile?.room_number ? ` • Room ${studentProfile.room_number}` : ''}
            </p>
          </div>

          {/* 8 Sidebar Links */}
          <nav className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
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
                  {item.id === 'notifications' && unreadNotificationsCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-400 text-slate-950">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Guarantee + Logout */}
        <div className="p-4 border-t border-brand-900 space-y-3">
          <div className="p-3 rounded-xl bg-brand-900/60 border border-brand-800/80 text-[11px] text-brand-200 leading-relaxed">
            <p className="font-bold text-white flex items-center gap-1.5 mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              100% Meal Entitlement
            </p>
            Submitting preferences is optional and never affects your guaranteed dining access.
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
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
                {SIDEBAR_ITEMS.find((i) => i.id === activeTab)?.label ||
                  'Student Dashboard'}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Eat Smart. Waste Less. • Free Student Nutrition &amp; Meal Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isDemoMode && (
              <Badge variant="amber">
                Demo data
              </Badge>
            )}

            {user?.role === 'super_admin' && (
              <Link
                to="/admin-dashboard"
                className="text-xs font-bold text-brand-800 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200 hover:bg-brand-100"
              >
                Admin Console
              </Link>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-cream-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-700 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:bg-cream-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-brand-800 text-white font-bold text-xs flex items-center justify-center">
                {studentDisplayName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {studentDisplayName}
                </p>
                <p className="text-[10px] text-slate-500">
                  {studentProfile?.roll_number || 'Student Free Tier'}
                </p>
              </div>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* ONE-TIME PROMPT FOR EXISTING UNLINKED STUDENT ACCOUNTS */}
          {needsMessLink && (
            <Card className="p-6 border-2 border-brand-600 bg-brand-50/70 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="green">One-Time Setup Required</Badge>
                    <span className="text-xs font-semibold text-brand-900">
                      Link Your Account to Your Campus Mess
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Choose Your Mess to View Published Menus &amp; Submit Meal Preferences
                  </h2>
                  <p className="text-xs text-slate-600">
                    Your student account is not linked to a specific mess yet. Select your college and active mess below, or enter the unique Mess Join Code shared by your Mess Owner.
                  </p>
                </div>
              </div>

              {promptError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{promptError}</span>
                </div>
              )}

              <form onSubmit={handleConfirmMessLink} className="space-y-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      1. Select College / Institution
                    </label>
                    <select
                      value={promptCollege}
                      onChange={(e) => {
                        const nextCollege = e.target.value;
                        setPromptCollege(nextCollege);
                        const matching = availableMesses.filter(
                          (m) => (m.college_name || '').trim() === nextCollege
                        );
                        setPromptMessId(matching.length === 1 ? matching[0].id : '');
                      }}
                      disabled={Boolean(promptJoinCode.trim())}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-700"
                    >
                      <option value="">
                        {loadingMessList
                          ? 'Loading colleges...'
                          : uniquePromptColleges.length === 0
                          ? 'No active colleges found — use Join Code'
                          : 'Choose your college...'}
                      </option>
                      {uniquePromptColleges.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      2. Select Active Mess
                    </label>
                    <select
                      value={promptMessId}
                      onChange={(e) => setPromptMessId(e.target.value)}
                      disabled={Boolean(promptJoinCode.trim())}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-700"
                    >
                      <option value="">
                        {filteredPromptMesses.length === 0
                          ? 'No active messes found'
                          : 'Choose your mess...'}
                      </option>
                      {filteredPromptMesses.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.mess_name} ({m.college_name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      OR Enter Mess Join Code
                    </label>
                    <input
                      type="text"
                      value={promptJoinCode}
                      onChange={(e) => setPromptJoinCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SB-482910"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm font-mono uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-700"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={linkingMess}
                  >
                    {linkingMess ? 'Linking Your Mess...' : 'Save & Link My Mess'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* ==================== 1. DASHBOARD OVERVIEW ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Hero Card */}
              <Card className="p-6 bg-brand-950 text-white border-brand-900">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="dark" icon={Sparkles}>
                        Welcome Back, {studentDisplayName}
                      </Badge>
                      <span className="text-xs text-brand-200">
                        {new Date().toLocaleDateString('en-IN', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      Your Daily Campus Dining &amp; Macro Intelligence
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed">
                      Preview today&apos;s verified menu at{' '}
                      <strong className="text-white">
                        {messProfile?.mess_name}
                      </strong>
                      , customize your preferred dishes to help reduce kitchen waste, and track your real-time macro intake.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={CheckSquare}
                      iconPosition="left"
                      onClick={() => setActiveTab('selection')}
                    >
                      Select Today&apos;s Meals
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-brand-700 text-white hover:bg-brand-900"
                      onClick={() => setActiveTab('nutrition')}
                    >
                      View Macro Tracker
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Entitlement Guarantee Banner */}
              <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand-800 shrink-0 mt-0.5 sm:mt-0" />
                  <p className="text-xs text-brand-950 leading-relaxed">
                    <strong>Unconditional Meal Entitlement Guarantee:</strong> Meal selection is 100% optional. Even if you miss a cutoff or do not submit a preference, your full mess meal entitlement remains guaranteed.
                  </p>
                </div>
                <Badge variant="green">Guaranteed Access</Badge>
              </div>

              {/* KPI Summary Row: Selection Status & Daily Nutrition Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 space-y-1">
                  <span className="text-xs font-semibold text-slate-500">
                    Selected Calories Today
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {nutritionSummary.total.calories}{' '}
                    <span className="text-xs font-semibold text-slate-500">
                      / {studentProfile?.daily_calorie_goal || 2200} kcal
                    </span>
                  </p>
                  <p className="text-[11px] text-brand-700 font-semibold">
                    From verified serving sizes
                  </p>
                </Card>

                <Card className="p-5 space-y-1">
                  <span className="text-xs font-semibold text-slate-500">
                    Daily Protein Intake
                  </span>
                  <p className="text-2xl font-extrabold text-brand-800">
                    {nutritionSummary.total.protein}g
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Carbs: {nutritionSummary.total.carbs}g • Fats:{' '}
                    {nutritionSummary.total.fats}g
                  </p>
                </Card>

                <Card className="p-5 space-y-1">
                  <span className="text-xs font-semibold text-slate-500">
                    Meal Selection Status
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {
                      ['Breakfast', 'Lunch', 'Dinner'].filter(
                        (m) => getSelectedDishIdsForMeal(m).length > 0
                      ).length
                    }{' '}
                    / 3 Meals
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    Synced with Mess Kitchen
                  </p>
                </Card>

                <Card className="p-5 space-y-1">
                  <span className="text-xs font-semibold text-slate-500">
                    Dish Reviews Submitted
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {feedbackList.length}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Direct feedback to Mess Owner
                  </p>
                </Card>
              </div>

              {/* Today's Breakfast, Lunch, and Dinner Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-brand-700" />
                    Today&apos;s Breakfast, Lunch &amp; Dinner Schedule
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('menu')}
                    className="text-xs font-bold text-brand-800 hover:underline flex items-center gap-1"
                  >
                    Explore Full Dish Cards <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  {['Breakfast', 'Lunch', 'Dinner'].map((mealType) => {
                    const menu = menusByMealType[mealType];
                    const selectedIds = getSelectedDishIdsForMeal(mealType);
                    const mealNutrition = nutritionSummary.byMeal[mealType];

                    return (
                      <Card key={mealType} className="p-5 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge variant="green">{mealType}</Badge>
                              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {menu?.serving_time || 'Standard Hours'}
                              </p>
                            </div>
                            <span className="text-xs font-extrabold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                              {mealNutrition.calories} kcal
                            </span>
                          </div>

                          <div className="space-y-2">
                            {(menu?.items || []).length === 0 ? (
                              <div className="p-3 rounded-xl bg-cream-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                                No menu items published for {mealType} yet.
                              </div>
                            ) : (
                              (menu?.items || []).map((dish) => {
                                const isChosen = selectedIds.includes(dish.id);
                                return (
                                  <div
                                    key={dish.id}
                                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                                      isChosen
                                        ? 'bg-brand-50/70 border-brand-200'
                                        : 'bg-cream-50 border-slate-200/70'
                                    }`}
                                  >
                                    <div className="min-w-0">
                                      <p className="font-bold text-slate-900 truncate">
                                        {dish.dish_name}
                                      </p>
                                      <p className="text-[11px] text-slate-500">
                                        {dish.serving_size} • {dish.calories} kcal •{' '}
                                        {dish.protein}g P
                                      </p>
                                    </div>
                                    {isChosen ? (
                                      <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
                                    ) : (
                                      <span className="text-[10px] text-slate-400">
                                        Optional
                                      </span>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-600">
                            {selectedIds.length} dish
                            {selectedIds.length === 1 ? '' : 'es'} selected
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveTab('selection')}
                            className="text-xs font-bold text-brand-800 hover:text-brand-950"
                          >
                            Modify Selection →
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Meals & Recent Feedback Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-700" />
                      Upcoming Meals &amp; Selection Cutoffs
                    </h3>
                    <Badge variant="neutral">Live Schedule</Badge>
                  </div>

                  <div className="space-y-2.5">
                    {['Breakfast', 'Lunch', 'Dinner'].map((mealType) => {
                      const menu = menusByMealType[mealType];
                      const selectedCount = getSelectedDishIdsForMeal(mealType).length;
                      return (
                        <div
                          key={mealType}
                          className="p-3.5 rounded-xl bg-cream-50 border border-slate-200/80 flex items-center justify-between gap-3"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {mealType} ({menu?.serving_time || 'Scheduled'})
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Preference Cutoff: {menu?.cutoff_time || '2 hrs prior'} •{' '}
                              {(menu?.items || []).length} dishes on menu
                            </p>
                          </div>
                          <Badge variant={selectedCount > 0 ? 'green' : 'amber'}>
                            {selectedCount > 0
                              ? `${selectedCount} Selected`
                              : 'Default Entitled'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-brand-700" />
                      Recent Student Feedback
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('feedback')}
                      className="text-xs font-bold text-brand-800 hover:underline"
                    >
                      Rate a Dish →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {feedbackList.length === 0 ? (
                      <div className="p-4 rounded-xl bg-cream-50 border border-dashed border-slate-200 text-center space-y-2">
                        <p className="text-xs text-slate-500">
                          No dish reviews submitted yet.
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setActiveTab('feedback')}
                        >
                          Rate Your First Meal
                        </Button>
                      </div>
                    ) : (
                      feedbackList.slice(0, 3).map((fb) => (
                        <div
                          key={fb.id}
                          className="p-3.5 rounded-xl bg-cream-50 border border-slate-200/80 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">
                              {fb.dish_name} ({fb.meal_type})
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {fb.rating}/5
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">
                            &ldquo;{fb.comment}&rdquo;
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ==================== 2. TODAY'S MENU ==================== */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Today&apos;s Verified Mess Menu &amp; Dish Breakdown
                  </h2>
                  <p className="text-xs text-slate-500">
                    Every dish card displays serving-size-verified calories, macronutrients, and ingredients entered by your mess nutrition team.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {['All', 'Breakfast', 'Lunch', 'Dinner'].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setMenuMealFilter(filter)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        menuMealFilter === filter
                          ? 'bg-brand-800 text-white shadow-xs'
                          : 'bg-cream-100 text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Search bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search dishes by name or ingredient (e.g., Paneer, Oats, Dal)..."
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs focus:border-brand-600 focus:outline-hidden"
                />
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckSquare}
                  iconPosition="left"
                  onClick={() => setActiveTab('selection')}
                >
                  Go to Meal Selection
                </Button>
              </div>

              {/* Dish Cards Grid */}
              {allTodayDishes.length === 0 ? (
                <Card className="p-8 text-center bg-cream-50 border-dashed border-slate-200 space-y-3">
                  <p className="text-sm font-bold text-slate-800">
                    No menus yet. Your mess operator has not published a menu for today.
                  </p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Once your mess kitchen publishes Breakfast, Lunch, or Dinner menus, all dish cards with verified nutrition will appear here.
                  </p>
                  <div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveTab('dashboard')}
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </Card>
              ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTodayDishes
                  .filter(
                    (d) =>
                      menuMealFilter === 'All' || d.meal_type === menuMealFilter
                  )
                  .filter(
                    (d) =>
                      !menuSearch.trim() ||
                      d.dish_name
                        ?.toLowerCase()
                        .includes(menuSearch.toLowerCase()) ||
                      String(d.ingredients || '')
                        .toLowerCase()
                        .includes(menuSearch.toLowerCase())
                  )
                  .map((dish) => {
                    const isSelected = getSelectedDishIdsForMeal(
                      dish.meal_type
                    ).includes(dish.id);
                    return (
                      <Card
                        key={`${dish.meal_type}-${dish.id}`}
                        className="overflow-hidden flex flex-col justify-between border-slate-200/90 hover:shadow-md transition-shadow"
                      >
                        <div>
                          {/* Food Image */}
                          <div className="relative h-44 bg-slate-100 overflow-hidden">
                            <img
                              src={
                                dish.image_url ||
                                'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'
                              }
                              alt={dish.dish_name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              <Badge variant="dark">{dish.meal_type}</Badge>
                              <Badge variant="green">{dish.dietary_tag || 'Veg'}</Badge>
                            </div>
                            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-xs text-white text-xs font-extrabold flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-amber-400" />
                              {dish.calories} kcal
                            </div>
                          </div>

                          {/* Dish Details */}
                          <div className="p-5 space-y-3">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="text-base font-bold text-slate-900">
                                  {dish.dish_name}
                                </h3>
                                <span className="text-[11px] font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200 shrink-0">
                                  {dish.serving_size}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {dish.description ||
                                  'Freshly prepared institutional recipe with balanced spices and verified nutrition.'}
                              </p>
                            </div>

                            {/* Macros Grid */}
                            <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-cream-100 border border-slate-200/70 text-center">
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500">
                                  Calories
                                </p>
                                <p className="text-xs font-extrabold text-slate-900">
                                  {dish.calories}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500">
                                  Protein
                                </p>
                                <p className="text-xs font-extrabold text-brand-800">
                                  {dish.protein}g
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500">
                                  Carbs
                                </p>
                                <p className="text-xs font-extrabold text-slate-900">
                                  {dish.carbs}g
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500">
                                  Fats
                                </p>
                                <p className="text-xs font-extrabold text-slate-900">
                                  {dish.fats}g
                                </p>
                              </div>
                            </div>

                            {/* Ingredients */}
                            <div className="text-xs">
                              <span className="font-bold text-slate-700">
                                Ingredients:{' '}
                              </span>
                              <span className="text-slate-600">
                                {Array.isArray(dish.ingredients)
                                  ? dish.ingredients.join(', ')
                                  : dish.ingredients ||
                                    'Fresh seasonal produce, culinary herbs, cold-pressed oil'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="px-5 pb-5 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              toggleDishSelection(dish.meal_type, dish.id);
                              setActiveTab('selection');
                            }}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                              isSelected
                                ? 'bg-brand-50 text-brand-900 border border-brand-300'
                                : 'bg-brand-800 text-white hover:bg-brand-900'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {isSelected
                              ? 'Selected in Meal Plan (Customize)'
                              : `Add to ${dish.meal_type} Selection`}
                          </button>
                        </div>
                      </Card>
                    );
                  })}
              </div>
              )}
            </div>
          )}

          {/* ==================== 3. MEAL SELECTION ==================== */}
          {activeTab === 'selection' && (
            <div className="space-y-6">
              {/* Top Info & Date Picker */}
              <Card className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="green">Optional Preference Poll</Badge>
                    <span className="text-xs text-slate-500">
                      Helps {messProfile?.mess_name} cook the right quantities
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Select Your Preferred Dishes (Breakfast, Lunch &amp; Dinner)
                  </h2>
                  <p className="text-xs text-slate-600">
                    Select one or multiple dishes per meal before the cutoff deadline. Your meal entitlement is always preserved even if you do not submit a selection.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedDate(todayStr)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedDate === todayStr
                        ? 'bg-brand-800 text-white border-brand-800'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Today ({todayStr})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(tomorrowStr)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedDate === tomorrowStr
                        ? 'bg-brand-800 text-white border-brand-800'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Tomorrow ({tomorrowStr})
                  </button>
                </div>
              </Card>

              {selectionSavedToast && (
                <div className="p-4 rounded-2xl bg-brand-50 border border-brand-300 text-xs font-bold text-brand-950 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-brand-700 shrink-0" />
                    <span>{selectionSavedToast}</span>
                  </div>
                  <Badge variant="green">Confirmed &amp; Synced</Badge>
                </div>
              )}

              {/* Meal Selection Cards for Breakfast, Lunch, Dinner */}
              <div className="space-y-6">
                {['Breakfast', 'Lunch', 'Dinner'].map((mealType) => {
                  const menu = menusByMealType[mealType];
                  const selectedIds = getSelectedDishIdsForMeal(mealType);
                  const savedRecord =
                    studentSelectionsMap[`${selectedDate}_${mealType}`] ||
                    studentSelectionsMap[`${todayStr}_${mealType}`];
                  const mealMacro = nutritionSummary.byMeal[mealType];

                  return (
                    <Card key={mealType} className="p-6 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-lg font-extrabold text-slate-900">
                              {mealType}
                            </h3>
                            <Badge variant="green">
                              {menu?.serving_time || 'Scheduled'}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              Cutoff: {menu?.cutoff_time || '2 hours before meal'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Click multiple dishes below to include them in your preferred plate.
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="block text-[10px] uppercase font-bold text-slate-400">
                              Selected Meal Nutrition
                            </span>
                            <span className="text-xs font-extrabold text-brand-800">
                              {mealMacro.calories} kcal • {mealMacro.protein}g P •{' '}
                              {mealMacro.carbs}g C • {mealMacro.fats}g F
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Multi-select Dish Grid */}
                      {(menu?.items || []).length === 0 ? (
                        <div className="p-6 rounded-xl bg-cream-50 border border-dashed border-slate-200 text-center space-y-2">
                          <p className="text-xs font-semibold text-slate-700">
                            No menu published for {mealType} on {selectedDate} yet.
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Your meal entitlement remains 100% guaranteed. Check back once your mess publishes the {mealType} menu.
                          </p>
                        </div>
                      ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(menu?.items || []).map((dish) => {
                          const isChecked = selectedIds.includes(dish.id);
                          return (
                            <div
                              key={dish.id}
                              onClick={() => toggleDishSelection(mealType, dish.id)}
                              className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col justify-between gap-3 ${
                                isChecked
                                  ? 'border-brand-700 bg-brand-50/60 shadow-xs'
                                  : 'border-slate-200 bg-white hover:border-brand-300'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <img
                                  src={
                                    dish.image_url ||
                                    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80'
                                  }
                                  alt={dish.dish_name}
                                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-1">
                                    <p className="text-sm font-bold text-slate-900 leading-snug">
                                      {dish.dish_name}
                                    </p>
                                    <div
                                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                                        isChecked
                                          ? 'bg-brand-800 border-brand-800 text-white'
                                          : 'border-slate-300 bg-white'
                                      }`}
                                    >
                                      {isChecked && (
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    Serving: {dish.serving_size}
                                  </p>
                                  <p className="text-[11px] font-bold text-brand-800 mt-1">
                                    {dish.calories} kcal • {dish.protein}g Protein
                                  </p>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                                <span>
                                  Carbs: {dish.carbs}g • Fats: {dish.fats}g
                                </span>
                                <span className="font-bold text-brand-800">
                                  {isChecked ? 'Selected' : 'Click to select'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      )}

                      {/* Submit Row */}
                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-slate-600">
                          {savedRecord?.updated_at ? (
                            <span className="inline-flex items-center gap-1.5 text-brand-800 font-semibold">
                              <CheckCircle2 className="w-4 h-4 text-brand-700" />
                              Selection confirmed ({selectedIds.length} dishes) • Last updated{' '}
                              {new Date(savedRecord.updated_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          ) : (
                            <span>
                              {selectedIds.length} dish
                              {selectedIds.length === 1 ? '' : 'es'} currently selected for{' '}
                              {mealType}.
                            </span>
                          )}
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          disabled={
                            submittingMeal === mealType ||
                            !menu ||
                            (menu?.items || []).length === 0
                          }
                          onClick={() => handleSaveMealSelection(mealType)}
                        >
                          {submittingMeal === mealType
                            ? 'Saving Selection...'
                            : !menu || (menu?.items || []).length === 0
                            ? `No Published ${mealType} Menu Yet`
                            : `Confirm ${mealType} Selection (${selectedIds.length} Dishes)`}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== 4. NUTRITION TRACKER ==================== */}
          {activeTab === 'nutrition' && (
            <div className="space-y-6">
              {/* Top Summary Banner */}
              <Card className="p-6 bg-brand-950 text-white border-brand-900">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Badge variant="dark" icon={Apple}>
                      Automatic Serving-Size Macro Calculator
                    </Badge>
                    <h2 className="text-xl font-bold text-white pt-1">
                      Personal Daily Nutrition Tracker
                    </h2>
                    <p className="text-xs text-brand-200 max-w-2xl">
                      Calculated automatically by summing the verified serving-size nutritional values of your selected Breakfast, Lunch, and Dinner dishes.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveTab('selection')}
                  >
                    Adjust Selected Dishes
                  </Button>
                </div>
              </Card>

              {/* 4 Total Macro Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 space-y-1 border-brand-200 bg-brand-50/40">
                  <span className="text-xs font-bold uppercase text-brand-800">
                    Total Calories
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {nutritionSummary.total.calories} kcal
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Goal: {studentProfile?.daily_calorie_goal || 2200} kcal/day
                  </p>
                </Card>

                <Card className="p-5 space-y-1">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Total Protein
                  </span>
                  <p className="text-2xl font-extrabold text-brand-800">
                    {nutritionSummary.total.protein} g
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Muscle recovery &amp; satiety
                  </p>
                </Card>

                <Card className="p-5 space-y-1">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Total Carbohydrates
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {nutritionSummary.total.carbs} g
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Sustained campus energy
                  </p>
                </Card>

                <Card className="p-5 space-y-1">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Total Fats
                  </span>
                  <p className="text-2xl font-extrabold text-amber-700">
                    {nutritionSummary.total.fats} g
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Essential lipid profile
                  </p>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-5 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Meal-by-Meal Nutritional Breakdown
                    </h3>
                    <p className="text-xs text-slate-500">
                      Comparison of Calories, Protein, Carbohydrates, and Fats across Breakfast, Lunch, and Dinner
                    </p>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={nutritionSummary.mealChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="meal" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar
                          dataKey="Calories"
                          fill="#14532d"
                          radius={[6, 6, 0, 0]}
                        />
                        <Bar
                          dataKey="Protein"
                          fill="#16a34a"
                          radius={[6, 6, 0, 0]}
                        />
                        <Bar
                          dataKey="Carbs"
                          fill="#0d9488"
                          radius={[6, 6, 0, 0]}
                        />
                        <Bar
                          dataKey="Fats"
                          fill="#d97706"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Daily Macro Ratio (Grams)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Proportion of Protein, Carbs, and Fats in your selected meals
                    </p>
                  </div>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={nutritionSummary.macroPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={78}
                          paddingAngle={4}
                        >
                          {nutritionSummary.macroPieData.map((entry, idx) => (
                            <Cell
                              key={entry.name}
                              fill={MACRO_COLORS[idx % MACRO_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="p-3 rounded-xl bg-cream-100 text-[11px] text-slate-600">
                    All values are computed strictly from the serving sizes published by{' '}
                    <strong>{messProfile?.mess_name}</strong>.
                  </div>
                </Card>
              </div>

              {/* Breakfast, Lunch, Dinner & Total Nutrition Table */}
              <Card className="p-5 space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  Detailed Meal &amp; Dish Nutrition Ledger
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                        <th className="py-3.5 px-4">Meal / Selected Dishes</th>
                        <th className="py-3.5 px-4">Calories (kcal)</th>
                        <th className="py-3.5 px-4">Protein (g)</th>
                        <th className="py-3.5 px-4">Carbohydrates (g)</th>
                        <th className="py-3.5 px-4">Fats (g)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {['Breakfast', 'Lunch', 'Dinner'].map((mealType) => {
                        const row = nutritionSummary.byMeal[mealType];
                        return (
                          <tr key={mealType} className="hover:bg-cream-50/70">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-900 text-sm">
                                {mealType} Nutrition
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {row.dishes.length > 0
                                  ? row.dishes
                                      .map(
                                        (d) =>
                                          `${d.dish_name} (${d.serving_size})`
                                      )
                                      .join(' + ')
                                  : 'No dishes selected for this meal'}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              {row.calories} kcal
                            </td>
                            <td className="py-3.5 px-4 font-bold text-brand-800">
                              {row.protein} g
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-700">
                              {row.carbs} g
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-700">
                              {row.fats} g
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-brand-50/80 font-extrabold text-slate-900 border-t-2 border-brand-200">
                        <td className="py-4 px-4 text-sm">
                          Total Selected Meal Nutrition
                        </td>
                        <td className="py-4 px-4 text-sm text-brand-900">
                          {nutritionSummary.total.calories} kcal
                        </td>
                        <td className="py-4 px-4 text-sm text-brand-800">
                          {nutritionSummary.total.protein} g
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {nutritionSummary.total.carbs} g
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {nutritionSummary.total.fats} g
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ==================== 5. MEAL HISTORY ==================== */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Previously Selected Meals &amp; Nutritional Log
                  </h2>
                  <p className="text-xs text-slate-500">
                    Complete chronological history of your selected campus meals and their verified macro totals.
                  </p>
                </div>
                <Badge variant="green">
                  {studentMealHistory.length} Logged Meals
                </Badge>
              </Card>

              <Card className="p-5">
                {studentMealHistory.length === 0 ? (
                  <div className="p-8 rounded-xl bg-cream-50 border border-dashed border-slate-200 text-center space-y-3">
                    <p className="text-sm font-bold text-slate-800">
                      No meal selections logged yet.
                    </p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Select your preferred dishes in the Meal Selection tab to automatically build your historical nutrition log.
                    </p>
                    <div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveTab('selection')}
                      >
                        Go to Meal Selection
                      </Button>
                    </div>
                  </div>
                ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Meal Type</th>
                        <th className="py-3.5 px-4">Selected Dishes</th>
                        <th className="py-3.5 px-4">Calories</th>
                        <th className="py-3.5 px-4">Protein / Carbs / Fats</th>
                        <th className="py-3.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentMealHistory.map((entry) => (
                        <tr key={entry.id} className="hover:bg-cream-50/70">
                          <td className="py-3.5 px-4 font-semibold text-slate-700">
                            {entry.meal_date}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant="green">{entry.meal_type}</Badge>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {Array.isArray(entry.dishes)
                              ? entry.dishes.join(', ')
                              : entry.dishes}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-900">
                            {entry.calories} kcal
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <span className="font-bold text-brand-800">
                              {entry.protein}g P
                            </span>{' '}
                            • {entry.carbs}g C • {entry.fats}g F
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant="neutral">
                              {entry.status || 'Confirmed'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </Card>
            </div>
          )}

          {/* ==================== 6. FEEDBACK ==================== */}
          {activeTab === 'feedback' && (
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Submit Feedback / Complaint / Suggestion Form */}
              <Card className="lg:col-span-2 p-6 space-y-5">
                <div>
                  <Badge variant="green">Direct Kitchen Line</Badge>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    Rate Dishes, Submit Reviews or Suggest Improvements
                  </h2>
                  <p className="text-xs text-slate-500">
                    Your ratings and suggestions update the Mess Owner Dashboard in real time and influence future menu planning.
                  </p>
                </div>

                {feedbackBanner && (
                  <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
                    <span>{feedbackBanner}</span>
                  </div>
                )}

                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Feedback Category
                    </label>
                    <select
                      value={feedbackForm.feedback_category}
                      onChange={(e) =>
                        setFeedbackForm((prev) => ({
                          ...prev,
                          feedback_category: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:border-brand-600 focus:outline-hidden"
                    >
                      <option value="dish_review">Dish Rating &amp; Review</option>
                      <option value="complaint">Kitchen / Quality Complaint</option>
                      <option value="suggestion">Menu Improvement Suggestion</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Meal Type
                      </label>
                      <select
                        value={feedbackForm.meal_type}
                        onChange={(e) =>
                          setFeedbackForm((prev) => ({
                            ...prev,
                            meal_type: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:border-brand-600 focus:outline-hidden"
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Rating (Out of 5)
                      </label>
                      <select
                        value={feedbackForm.rating}
                        onChange={(e) =>
                          setFeedbackForm((prev) => ({
                            ...prev,
                            rating: Number(e.target.value),
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:border-brand-600 focus:outline-hidden"
                      >
                        <option value={5}>★★★★★ (5/5 Excellent)</option>
                        <option value={4}>★★★★☆ (4/5 Good)</option>
                        <option value={3}>★★★☆☆ (3/5 Average)</option>
                        <option value={2}>★★☆☆☆ (2/5 Below Avg)</option>
                        <option value={1}>★☆☆☆☆ (1/5 Poor)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Dish or Subject
                    </label>
                    <select
                      value={feedbackForm.dish_name}
                      onChange={(e) =>
                        setFeedbackForm((prev) => ({
                          ...prev,
                          dish_name: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:border-brand-600 focus:outline-hidden"
                    >
                      <option value="">-- Choose a dish from today&apos;s menu --</option>
                      {allTodayDishes.map((d) => (
                        <option key={d.id} value={d.dish_name}>
                          {d.dish_name} ({d.meal_type})
                        </option>
                      ))}
                      <option value="General Mess Suggestion / Hygiene">
                        General Mess Suggestion / Hygiene
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Review, Complaint, or Menu Suggestion
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={feedbackForm.comment}
                      onChange={(e) =>
                        setFeedbackForm((prev) => ({
                          ...prev,
                          comment: e.target.value,
                        }))
                      }
                      placeholder="Share specific details on taste, portion size, spice levels, or new dishes you'd like added..."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs focus:border-brand-600 focus:outline-hidden"
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full">
                    Submit Student Feedback
                  </Button>
                </form>
              </Card>

              {/* Submitted Reviews Feed */}
              <Card className="lg:col-span-3 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    Recent Campus Dish Reviews &amp; Suggestions ({feedbackList.length})
                  </h3>
                  <Badge variant="neutral">Live Feed</Badge>
                </div>

                <div className="space-y-3">
                  {feedbackList.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-cream-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                      No dish reviews or suggestions submitted yet. Use the form on the left to submit your first review!
                    </div>
                  ) : (
                  feedbackList.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-4 rounded-2xl bg-cream-50 border border-slate-200/80 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {fb.dish_name}
                          </span>
                          <Badge variant="green">{fb.meal_type}</Badge>
                          {fb.feedback_category && (
                            <Badge variant="neutral">
                              {fb.feedback_category.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3.5 h-3.5 ${
                                idx < Number(fb.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                          <span className="text-slate-700 ml-1">
                            {fb.rating}/5
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        &ldquo;{fb.comment}&rdquo;
                      </p>
                      <p className="text-[11px] text-slate-400">
                        By {fb.student_name || 'Verified Student'} •{' '}
                        {new Date(fb.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ))
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* ==================== 7. NOTIFICATIONS ==================== */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Dining Announcements, Cutoffs &amp; Menu Alerts
                  </h2>
                  <p className="text-xs text-slate-500">
                    Stay updated on new menu publications, selection deadline reminders, menu changes, and feedback updates.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllNotificationsRead}
                >
                  Mark All as Read
                </Button>
              </Card>

              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <Card className="p-8 text-center bg-cream-50 border-dashed border-slate-200 space-y-3">
                    <p className="text-sm font-bold text-slate-800">
                      No notifications or announcements yet.
                    </p>
                    <p className="text-xs text-slate-500">
                      You will receive real-time alerts here when your mess operator publishes new menus or announcements.
                    </p>
                    <div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveTab('menu')}
                      >
                        View Today&apos;s Menu
                      </Button>
                    </div>
                  </Card>
                ) : (
                notifications.map((notif) => (
                  <Card
                    key={notif.id}
                    className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      notif.is_read
                        ? 'bg-white border-slate-200/80'
                        : 'bg-brand-50/50 border-brand-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          notif.is_read
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-brand-800 text-white'
                        }`}
                      >
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {notif.title}
                          </h3>
                          {!notif.is_read && <Badge variant="green">New</Badge>}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(notif.created_at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {!notif.is_read && (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(notif.id)}
                        className="text-xs font-bold text-brand-800 hover:underline shrink-0"
                      >
                        Mark Read
                      </button>
                    )}
                  </Card>
                ))
                )}
              </div>
            </div>
          )}

          {/* ==================== 8. MY PROFILE ==================== */}
          {activeTab === 'profile' && (
            <div className="max-w-3xl space-y-6">
              <Card className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-brand-800 text-white font-extrabold text-lg flex items-center justify-center">
                      {studentDisplayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {studentDisplayName}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {activeProfileData?.college_name ||
                          messProfile?.college_name}{' '}
                        • Free Student Entitlement Account
                      </p>
                    </div>
                  </div>
                  <Badge variant="green">Verified Student</Badge>
                </div>

                {profileBanner && (
                  <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
                    <span>{profileBanner}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={activeProfileData?.full_name || ''}
                        onChange={(e) =>
                          setProfileForm({
                            ...activeProfileData,
                            full_name: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:border-brand-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Roll Number / University ID
                      </label>
                      <input
                        type="text"
                        value={activeProfileData?.roll_number || ''}
                        onChange={(e) =>
                          setProfileForm({
                            ...activeProfileData,
                            roll_number: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:border-brand-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={activeProfileData?.phone || ''}
                        onChange={(e) =>
                          setProfileForm({
                            ...activeProfileData,
                            phone: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:border-brand-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Hostel / Residence Block
                      </label>
                      <input
                        type="text"
                        value={activeProfileData?.hostel_name || ''}
                        onChange={(e) =>
                          setProfileForm({
                            ...activeProfileData,
                            hostel_name: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:border-brand-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Room Number
                      </label>
                      <input
                        type="text"
                        value={activeProfileData?.room_number || ''}
                        onChange={(e) =>
                          setProfileForm({
                            ...activeProfileData,
                            room_number: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:border-brand-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Dietary Preference
                      </label>
                      <select
                        value={activeProfileData?.dietary_preference || 'Vegetarian'}
                        onChange={(e) =>
                          setProfileForm({
                            ...activeProfileData,
                            dietary_preference: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:border-brand-600 focus:outline-hidden"
                      >
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="High-Protein Veg">High-Protein Veg</option>
                        <option value="Eggetarian">Eggetarian</option>
                        <option value="Non-Vegetarian">Non-Vegetarian</option>
                        <option value="Jain">Jain</option>
                        <option value="Vegan">Vegan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Daily Calorie Target (kcal)
                      </label>
                      <input
                        type="number"
                        min={1200}
                        max={4500}
                        value={activeProfileData?.daily_calorie_goal || 2200}
                        onChange={(e) =>
                          setProfileForm({
                            ...activeProfileData,
                            daily_calorie_goal: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:border-brand-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Food Allergies / Medical Note
                      </label>
                      <input
                        type="text"
                        value={activeProfileData?.allergies_note || ''}
                        onChange={(e) =>
                          setProfileForm({
                            ...activeProfileData,
                            allergies_note: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs focus:border-brand-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <Button type="submit" variant="primary">
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
