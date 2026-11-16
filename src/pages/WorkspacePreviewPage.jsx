import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  TrendingDown,
  Users,
  Salad,
  UtensilsCrossed,
  Star,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { WasteReductionAreaChart, MealDemandBarChart } from '../components/analytics/WasteReductionChart';
import DemandPredictionWidget from '../components/analytics/DemandPredictionWidget';
import { sampleTodayMenu } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export default function WorkspacePreviewPage() {
  const { user } = useAuth();
  const [role, setRole] = useState(user?.role || 'mess_owner');
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Reusable Professional Dashboard Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          role={role}
          onSwitchRole={setRole}
        />

        {/* Workspace Main Panel */}
        <div className="flex-1 w-full space-y-6">
          {/* Top Context Header */}
          <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="green" icon={Sparkles}>
                  {role === 'student'
                    ? 'Student Free Portal • Entitlement Guaranteed'
                    : 'Mess Operator SaaS Command Center'}
                </Badge>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-500">
                  Architecture Preview
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                {role === 'student'
                  ? 'My Hostel Weekly Menu & Meal Attendance Polls'
                  : 'Hostel Block A — Plate Demand & Waste Overview'}
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs bg-brand-50 text-brand-900 px-3.5 py-2 rounded-xl border border-brand-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0" />
              <span>100% Student Entitlement Active</span>
            </div>
          </Card>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{role === 'student' ? 'Today’s Attendance Status' : 'Predicted Dinner Turnout'}</span>
                <Users className="w-4 h-4 text-brand-700" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {role === 'student' ? '3 / 3 Meals Attending' : '1,026 Plates Expected'}
              </p>
              <p className="text-xs text-brand-700 font-semibold">
                {role === 'student'
                  ? 'Default state is Attending for every meal'
                  : 'Includes +36 Guest & Safety Buffer Plates'}
              </p>
            </Card>

            <Card className="p-5 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{role === 'student' ? 'My Dining Entitlement' : 'Leftover Plates Prevented (7d)'}</span>
                <TrendingDown className="w-4 h-4 text-brand-700" />
              </div>
              <p className="text-2xl font-extrabold text-brand-800">
                {role === 'student' ? 'Active & Unconditional' : '1,015 Plates Saved'}
              </p>
              <p className="text-xs text-slate-500">
                {role === 'student'
                  ? 'Not responding means you are counted as attending'
                  : '₹55,825 saved in leftover plate waste'}
              </p>
            </Card>

            <Card className="p-5 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{role === 'student' ? 'Your Cost' : 'Student Satisfaction Score'}</span>
                <Salad className="w-4 h-4 text-brand-700" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {role === 'student' ? '₹0 (Free Forever)' : '4.7 / 5.0 ★'}
              </p>
              <p className="text-xs text-brand-700 font-semibold">
                {role === 'student' ? 'Sponsored by Your Institution' : 'Based on 840 student dish ratings'}
              </p>
            </Card>
          </div>

          {/* Interactive Simulator Widget */}
          <DemandPredictionWidget />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Weekly Kitchen Prep (plates) vs. Actual Plates Served
              </h3>
              <WasteReductionAreaChart />
            </Card>
            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Attendance Poll Signals &amp; Buffer (plates)
              </h3>
              <MealDemandBarChart />
            </Card>
          </div>

          {/* Today's Menu Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-brand-700" />
                Today’s Institutional Menu &amp; Expected Plates
              </h3>
              <Badge variant="green">Sample Preview</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-cream-100 border-b border-slate-200 text-xs font-bold uppercase text-slate-600">
                    <th className="py-3 px-4">Meal</th>
                    <th className="py-3 px-4">Menu Items</th>
                    <th className="py-3 px-4">Serving Window</th>
                    <th className="py-3 px-4">Turnout Forecast</th>
                    <th className="py-3 px-4">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sampleTodayMenu.map((m) => (
                    <tr key={m.id}>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{m.mealType}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{m.items.join(' • ')}</td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-brand-800">
                        {m.timeWindow}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-slate-800">
                        {m.predictedTurnout}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-amber-600 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {m.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
