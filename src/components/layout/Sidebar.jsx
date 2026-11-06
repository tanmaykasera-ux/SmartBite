import React from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  LayoutDashboard,
  TrendingUp,
  Utensils,
  Salad,
  Users,
  MessageSquareHeart,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  Sparkles,
  LogOut,
  ChevronRight,
} from 'lucide-react';

/**
 * Reusable Professional Sidebar Navigation for SmartBite Dashboards
 * Supports both Mess Operator (B2B Paying Customer) and Student (Free User) modes.
 */
export default function Sidebar({
  activeTab = 'overview',
  onSelectTab,
  role = 'mess_owner',
  onSwitchRole,
}) {
  const operatorNavItems = [
    { id: 'overview', label: 'Demand & Waste Overview', icon: LayoutDashboard, badge: 'Live' },
    { id: 'forecast', label: 'AI Batch Prep Calculator', icon: TrendingUp },
    { id: 'menu-nutrition', label: 'Menu & Macro Planner', icon: Salad },
    { id: 'entitlement', label: 'Student Poll & Buffer', icon: Users, badge: 'Protected' },
    { id: 'feedback', label: 'Taste & Waste Feedback', icon: MessageSquareHeart },
    { id: 'reports', label: 'ESG & Cost Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Kitchen Settings', icon: Settings },
  ];

  const studentNavItems = [
    { id: 'overview', label: 'Today’s Mess Menu', icon: Utensils, badge: 'Free' },
    { id: 'entitlement', label: 'My Meal Preferences', icon: Users, badge: 'Guaranteed' },
    { id: 'menu-nutrition', label: 'My Daily Nutrition & Macros', icon: Salad },
    { id: 'feedback', label: 'Rate Meals & Suggest', icon: MessageSquareHeart },
  ];

  const items = role === 'student' ? studentNavItems : operatorNavItems;

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-brand-950 text-brand-100 rounded-2xl lg:rounded-none lg:min-h-[calc(100vh-5rem)] flex flex-col justify-between border border-brand-900">
      <div className="p-5 space-y-6">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center text-white">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">
                {role === 'student' ? 'Student Portal' : 'Mess Command Center'}
              </p>
              <p className="text-[11px] text-brand-300">
                {role === 'student' ? '100% Free Student Access' : 'Institutional SaaS Pro'}
              </p>
            </div>
          </div>
        </div>

        {/* Role Switcher Pill */}
        {onSwitchRole && (
          <div className="bg-brand-900/90 p-1.5 rounded-xl border border-brand-800 grid grid-cols-2 gap-1 text-xs">
            <button
              type="button"
              onClick={() => onSwitchRole('mess_owner')}
              className={`py-2 px-2.5 rounded-lg font-semibold transition-all ${
                role === 'mess_owner'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-brand-300 hover:text-white'
              }`}
            >
              Mess Operator
            </button>
            <button
              type="button"
              onClick={() => onSwitchRole('student')}
              className={`py-2 px-2.5 rounded-lg font-semibold transition-all ${
                role === 'student'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-brand-300 hover:text-white'
              }`}
            >
              Student (Free)
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-brand-400 mb-2">
            Workspace Navigation
          </p>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab && onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-800 text-white shadow-sm border border-brand-700'
                    : 'text-brand-200/80 hover:bg-brand-900/70 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-300' : 'text-brand-400'}`} />
                  <span>{item.label}</span>
                </span>
                {item.badge ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-700/80 text-brand-100">
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Entitlement Assurance Card inside Sidebar */}
      <div className="p-5 space-y-4 border-t border-brand-900">
        <div className="rounded-xl bg-brand-900/70 border border-brand-800 p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-brand-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
            <span>Entitlement Guarantee</span>
          </div>
          <p className="text-[11px] text-brand-200/90 leading-relaxed">
            Student meal selections are strictly for AI demand estimation. Every enrolled student retains 100% dining access even without pre-selection.
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-brand-300 px-1">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Hostel Block A • Live
          </span>
          <Link to="/" className="hover:text-white inline-flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" /> Exit
          </Link>
        </div>
      </div>
    </aside>
  );
}
