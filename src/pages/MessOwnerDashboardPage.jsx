import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf,
  LayoutDashboard,
  Utensils,
  Users,
  BrainCircuit,
  TrendingDown,
  Package,
  ClipboardList,
  MessageSquareHeart,
  Salad,
  FileSpreadsheet,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  AlertCircle,
  CheckCheck,
  Menu,
  X,
  UserCircle,
  Home,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import OverviewTab from '../components/dashboard/OverviewTab';
import MenuManagementTab from '../components/dashboard/MenuManagementTab';
import StudentSelectionsTab from '../components/dashboard/StudentSelectionsTab';
import DemandForecastingTab from '../components/dashboard/DemandForecastingTab';
import FoodWasteTab from '../components/dashboard/FoodWasteTab';
import InventoryTab from '../components/dashboard/InventoryTab';
import PurchasePlanningTab from '../components/dashboard/PurchasePlanningTab';
import StudentFeedbackTab from '../components/dashboard/StudentFeedbackTab';
import NutritionAnalyticsTab from '../components/dashboard/NutritionAnalyticsTab';
import ReportsTab from '../components/dashboard/ReportsTab';
import SettingsTab from '../components/dashboard/SettingsTab';

const sidebarModules = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'menus', label: 'Menu Management', icon: Utensils },
  { id: 'selections', label: 'Student Selections', icon: Users },
  { id: 'forecasting', label: 'Demand Forecasting', icon: BrainCircuit },
  { id: 'waste', label: 'Food Waste', icon: TrendingDown },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'purchase', label: 'Purchase Planning', icon: ClipboardList },
  { id: 'feedback', label: 'Student Feedback', icon: MessageSquareHeart },
  { id: 'nutrition', label: 'Nutrition Analytics', icon: Salad },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function MessOwnerDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { user, logout, isDemoMode } = useAuth();
  const {
    messProfile,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useData();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const activeModuleMeta =
    sidebarModules.find((m) => m.id === activeTab) || sidebarModules[0];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab onNavigateTab={setActiveTab} />;
      case 'menus':
        return <MenuManagementTab onNavigateTab={setActiveTab} />;
      case 'selections':
        return <StudentSelectionsTab onNavigateTab={setActiveTab} />;
      case 'forecasting':
        return <DemandForecastingTab onNavigateTab={setActiveTab} />;
      case 'waste':
        return <FoodWasteTab onNavigateTab={setActiveTab} />;
      case 'inventory':
        return <InventoryTab onNavigateTab={setActiveTab} />;
      case 'purchase':
        return <PurchasePlanningTab onNavigateTab={setActiveTab} />;
      case 'feedback':
        return <StudentFeedbackTab onNavigateTab={setActiveTab} />;
      case 'nutrition':
        return <NutritionAnalyticsTab onNavigateTab={setActiveTab} />;
      case 'reports':
        return <ReportsTab onNavigateTab={setActiveTab} />;
      case 'settings':
        return <SettingsTab onNavigateTab={setActiveTab} />;
      default:
        return <OverviewTab onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-cream-50 text-slate-900">
      {/* ================= DESKTOP FIXED / COLLAPSIBLE SIDEBAR ================= */}
      <aside
        className={`hidden lg:flex flex-col justify-between bg-brand-950 text-brand-100 border-r border-brand-900 transition-all duration-200 shrink-0 ${
          sidebarCollapsed ? 'w-20' : 'w-68'
        }`}
        style={{ width: sidebarCollapsed ? '5rem' : '17rem' }}
      >
        <div className="p-4 space-y-5">
          {/* Brand Logo + Collapse Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-brand-900">
            <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center text-white shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              {!sidebarCollapsed && (
                <div className="truncate">
                  <span className="text-base font-extrabold text-white tracking-tight">
                    Smart<span className="text-brand-400">Bite</span>
                  </span>
                  <p className="text-[10px] text-brand-300 truncate">
                    Mess Owner Platform
                  </p>
                </div>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg bg-brand-900 hover:bg-brand-800 text-brand-200 hover:text-white"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* 11 Navigation Modules */}
          <nav className="space-y-1">
            {sidebarModules.map((mod, idx) => {
              const Icon = mod.icon;
              const isActive = activeTab === mod.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setActiveTab(mod.id)}
                  title={mod.label}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-800 text-white shadow-sm border border-brand-700'
                      : 'text-brand-200/80 hover:bg-brand-900/80 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-brand-300' : 'text-brand-400'
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <span className="truncate">
                      {idx + 1}. {mod.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Entitlement Charter & Public Home Link */}
        <div className="p-4 border-t border-brand-900 space-y-3">
          {!sidebarCollapsed && (
            <div className="p-3 rounded-xl bg-brand-900/70 border border-brand-800 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-300">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>Entitlement Guaranteed</span>
              </div>
              <p className="text-[10px] text-brand-200/85 leading-relaxed">
                All {messProfile.registered_students} students retain full meal entitlement with or without pre-selection.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-brand-300">
            <Link
              to="/"
              className="hover:text-white inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-brand-900"
              title="Back to Public Website"
            >
              <Home className="w-3.5 h-3.5" />
              {!sidebarCollapsed && <span>Website</span>}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="hover:text-white inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-brand-900"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE SIDEBAR DRAWER ================= */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative z-10 w-72 bg-brand-950 text-brand-100 h-full flex flex-col justify-between p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-brand-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center text-white">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <span className="text-base font-extrabold text-white">
                    Smart<span className="text-brand-400">Bite</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-brand-200 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {sidebarModules.map((mod, idx) => {
                  const Icon = mod.icon;
                  const isActive = activeTab === mod.id;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(mod.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-brand-800 text-white'
                          : 'text-brand-200 hover:bg-brand-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>
                        {idx + 1}. {mod.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-brand-900 flex items-center justify-between text-xs">
              <Link to="/" className="text-brand-200 hover:text-white">
                ← Public Home
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-brand-200 hover:text-white font-semibold"
              >
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                  {activeModuleMeta.label}
                </h1>
                <span className="hidden md:inline-block text-xs text-slate-400">•</span>
                <span className="hidden md:inline-block text-xs font-semibold text-brand-800 truncate">
                  {messProfile.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                {messProfile.college_name} ({messProfile.hostel_name})
              </p>
            </div>
          </div>

          {/* Right Topbar Controls: Mode Badge, Notifications Dropdown, Profile Dropdown */}
          <div className="flex items-center gap-3 relative">
            {/* Connection / Demo Mode Badge */}
            {isDemoMode ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                Demo data
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 text-brand-800 border border-brand-200 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Supabase Live
              </span>
            )}

            {/* Notifications Bell & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                }}
                className="relative p-2 rounded-xl bg-cream-50 hover:bg-cream-100 border border-slate-200 text-slate-700"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-800 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-elevated z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-cream-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Notifications ({unreadCount} unread)
                    </span>
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-semibold text-brand-800 hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3.5 cursor-pointer hover:bg-cream-50 transition-colors ${
                            !n.is_read ? 'bg-brand-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900">
                              {n.title}
                            </p>
                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-brand-700 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {n.created_at}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cream-50 hover:bg-cream-100 border border-slate-200 text-xs font-semibold text-slate-800"
              >
                <UserCircle className="w-4 h-4 text-brand-800" />
                <span className="hidden sm:inline truncate max-w-[130px]">
                  {user?.fullName || messProfile.owner_name}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-elevated z-50 p-3 space-y-2 text-xs">
                  <div className="pb-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">
                      {user?.fullName || messProfile.owner_name}
                    </p>
                    <p className="text-slate-500 truncate">
                      {user?.email || messProfile.owner_email}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-brand-50 text-brand-800 font-bold text-[10px] uppercase">
                      Role: {user?.role || 'mess_owner'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('settings');
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-cream-50 font-medium text-slate-700 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-brand-700" />
                    Mess &amp; Account Settings
                  </button>

                  <Link
                    to="/"
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-cream-50 font-medium text-slate-700 flex items-center gap-2"
                  >
                    <Home className="w-3.5 h-3.5 text-brand-700" />
                    Public Landing Page
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 font-semibold text-red-700 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Active Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveContent()}
        </main>
      </div>
    </div>
  );
}
