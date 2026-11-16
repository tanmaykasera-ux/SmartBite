import React, { useState } from 'react';
import {
  Users,
  Utensils,
  TrendingDown,
  IndianRupee,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  RefreshCw,
  KeyRound,
  AlertCircle,
  ClipboardCheck,
  UtensilsCrossed,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  getTodayDateStr,
  normalizeDateStr,
  formatHumanDate,
  computeMealPollWindow,
} from '../../lib/dateUtils';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function OverviewTab({ onNavigateTab }) {
  const { isDemoMode } = useAuth();
  const {
    messProfile,
    menus,
    totalRegisteredStudents,
    attendanceResponses,
    forecasts,
    wasteAnalytics,
    smartRecommendations,
    weeklySeries,
    regenerateMessJoinCode,
    studentsQueryError,
    refreshFromSupabase,
  } = useData();

  const [copiedCode, setCopiedCode] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleCopyJoinCode = () => {
    if (!messProfile.join_code) return;
    navigator.clipboard.writeText(messProfile.join_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRegenerateCode = async () => {
    setRegenerating(true);
    try {
      await regenerateMessJoinCode();
    } finally {
      setRegenerating(false);
    }
  };

  const todayStr = getTodayDateStr();

  // Compute Plates Expected Today across Breakfast, Lunch, Dinner
  const todayForecasts = (forecasts || []).filter(
    (f) => normalizeDateStr(f.forecast_date) === todayStr
  );
  const platesExpectedToday =
    todayForecasts.length > 0
      ? todayForecasts.reduce(
          (sum, f) =>
            sum +
            Number(
              f.overridden_prep_plates ??
                f.expected_plates ??
                totalRegisteredStudents
            ),
          0
        )
      : totalRegisteredStudents * 3;

  // Plates Prepared, Plates Served, Leftover Plates, Waste Cost from wasteAnalytics
  const platesPreparedTotal = wasteAnalytics.totalPreparedPlates || 0;
  const platesServedTotal = wasteAnalytics.totalServedPlates || 0;
  const leftoverPlatesTotal = wasteAnalytics.totalLeftoverPlates || 0;
  const wasteCostTotal = wasteAnalytics.totalFinancialLossInr || 0;

  return (
    <div className="space-y-6">
      {/* RLS / Students Query Error Banner */}
      {studentsQueryError && (
        <Card className="p-4 bg-rose-50 border-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-rose-800">
                Supabase Students Query Blocked or Failed
              </p>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                {studentsQueryError}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={refreshFromSupabase}
            className="shrink-0"
          >
            Retry Sync
          </Button>
        </Card>
      )}

      {/* Mess Join Code Card (For Students to Link to this Mess) */}
      <Card className="p-5 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 text-white border-none shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-200">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Student Enrollment Code • Share with Your Hostel Students</span>
            </div>
            <h2 className="text-lg font-extrabold text-white">
              {messProfile.name || 'Your Hostel Mess'} — Student Join Code
            </h2>
            <p className="text-xs text-brand-100/90 max-w-xl">
              Students enter this code during signup (or in their dashboard) to link their account to your mess, view the weekly menu, and mark meals they will skip.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/15">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-brand-200 font-semibold">
                Active Mess Code
              </p>
              <p className="text-xl font-black tracking-widest font-mono text-white">
                {messProfile.join_code || (isDemoMode ? 'SB-DEMO01' : 'GENERATING...')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyJoinCode}
              className="px-3 py-2 rounded-xl bg-white text-brand-900 hover:bg-brand-50 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedCode ? 'Copied!' : 'Copy Code'}
            </button>
            {!isDemoMode && (
              <button
                type="button"
                onClick={handleRegenerateCode}
                disabled={regenerating}
                title="Generate a new Join Code"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`}
                />
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Top 6 Plate-Based KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Registered Students</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {totalRegisteredStudents.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Capacity: {Number(messProfile.capacity || 0).toLocaleString('en-IN')}
            </span>
            <Badge variant="green">100% Entitled</Badge>
          </div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Plates Expected Today</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-brand-900">
            {platesExpectedToday.toLocaleString('en-IN')}{' '}
            <span className="text-sm font-bold text-slate-500">plates</span>
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-brand-700 font-semibold">
              Across B • L • D Today
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('selections')}
              className="text-brand-700 hover:underline font-bold"
            >
              Polls →
            </button>
          </div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Plates Prepared</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {platesPreparedTotal.toLocaleString('en-IN')}{' '}
            <span className="text-sm font-bold text-slate-500">plates</span>
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Logged kitchen batches</span>
            <Badge variant="neutral">Plates</Badge>
          </div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Plates Served</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-800">
            {platesServedTotal.toLocaleString('en-IN')}{' '}
            <span className="text-sm font-bold text-slate-500">plates</span>
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-semibold">
              Actual plates eaten
            </span>
            <Badge variant="green">Verified</Badge>
          </div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Leftover Plates</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {leftoverPlatesTotal.toLocaleString('en-IN')}{' '}
            <span className="text-sm font-bold text-slate-500">plates</span>
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Waste rate: {wasteAnalytics.overallWastePct}%
            </span>
            <Badge
              variant={wasteAnalytics.overallWastePct <= 5 ? 'green' : 'amber'}
            >
              {wasteAnalytics.overallWastePct <= 5 ? 'Optimal' : 'Monitor'}
            </Badge>
          </div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Waste Cost</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{wasteCostTotal.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Rate: ₹{Number(messProfile.cost_per_plate || 65)}/plate
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('waste')}
              className="text-brand-700 hover:underline font-bold"
            >
              Log Waste →
            </button>
          </div>
        </Card>
      </div>

      {/* Charts Row: Weekly Kitchen Prep (plates) & Daily Leftover Plates Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Weekly Kitchen Prep (plates)
              </h3>
              <p className="text-xs text-slate-500">
                Daily plates prepared vs. plates served across the mess
              </p>
            </div>
            <Badge variant="green">Plates / Day</Badge>
          </div>

          {weeklySeries.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-cream-50 rounded-xl border border-dashed border-slate-200">
              <TrendingDown className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-700">
                No Kitchen Plate Logs Yet
              </p>
              <p className="text-xs text-slate-500 max-w-xs mt-1 mb-3">
                Log your daily plates prepared, plates served, and leftover plates in the Food Waste tab to populate this chart.
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onNavigateTab('waste')}
              >
                Log Plates in Food Waste Tab
              </Button>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklySeries}
                  margin={{ top: 10, right: 12, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="prepPlatesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1f5440" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1f5440" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#475569' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip
                    formatter={(val, name) => [`${val} plates`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="platesPrepared"
                    name="Plates Prepared"
                    stroke="#1f5440"
                    strokeWidth={2.5}
                    fill="url(#prepPlatesGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="platesServed"
                    name="Plates Served"
                    stroke="#418c6e"
                    strokeWidth={2}
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Daily Leftover Plates Trend
              </h3>
              <p className="text-xs text-slate-500">
                Unserved leftover plates per day
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onNavigateTab('waste')}
            >
              Open Waste Log
            </Button>
          </div>

          {weeklySeries.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-cream-50 rounded-xl border border-dashed border-slate-200">
              <Utensils className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-700">
                No Leftover Plates Recorded Yet
              </p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Once daily meal batches are logged in plates, your leftover plates trend will appear here.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklySeries}
                  margin={{ top: 10, right: 12, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#475569' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip
                    formatter={(val, name) => [`${val} plates`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar
                    dataKey="leftoverPlates"
                    name="Leftover Plates"
                    fill="#1f5440"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Today's 3-Meal Attendance Poll & Plate Forecast Summary */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Today’s Meal Schedule, Attendance Polls &amp; Expected Plates ({formatHumanDate(todayStr)})
            </h3>
            <p className="text-xs text-slate-500">
              Default status for every student is Attending. Poll counts show students who marked &ldquo;Not Coming&rdquo;.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onNavigateTab('selections')}
            >
              View Attendance Polls
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => onNavigateTab('menus')}
            >
              Open Weekly Menu
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['breakfast', 'lunch', 'dinner'].map((mealType) => {
            const menu = menus.find(
              (m) =>
                normalizeDateStr(m.menu_date) === todayStr &&
                String(m.meal_type || '').toLowerCase() === mealType
            );
            const mealFc = todayForecasts.find((f) => f.meal_type === mealType);
            const pollWin = computeMealPollWindow(
              todayStr,
              mealType,
              messProfile
            );
            const notComingCount = (attendanceResponses || []).filter(
              (r) =>
                normalizeDateStr(r.meal_date || r.menu_date) === todayStr &&
                String(r.meal_type || '').toLowerCase() === mealType &&
                (r.status === 'not_coming' || r.will_attend === false)
            ).length;
            const expectedPlates =
              mealFc?.expected_plates ??
              Math.max(0, totalRegisteredStudents - notComingCount);

            return (
              <div
                key={mealType}
                className="p-4 rounded-2xl bg-cream-50 border border-slate-200/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-brand-800">
                    {mealType}
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
                      ? 'Poll Closed'
                      : 'Poll Upcoming'}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {menu ? menu.title : `No ${mealType} menu published for today`}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-brand-700" />
                    {pollWin.statusBadge}
                  </p>
                </div>

                {menu && (menu.items || []).length > 0 && (
                  <ul className="space-y-1 text-xs text-slate-600">
                    {(menu.items || []).map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <span className="truncate pr-2">• {item.name}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="pt-2 border-t border-slate-200/70 grid grid-cols-3 gap-2 text-center">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200/70">
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Enrolled
                    </p>
                    <p className="text-xs font-extrabold text-slate-900">
                      {totalRegisteredStudents}
                    </p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-rose-50/70 border border-rose-200/70">
                    <p className="text-[10px] text-rose-700 font-semibold">
                      Not Coming
                    </p>
                    <p className="text-xs font-extrabold text-rose-800">
                      {notComingCount}
                    </p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-brand-50 border border-brand-200">
                    <p className="text-[10px] text-brand-800 font-semibold">
                      Plates Expected
                    </p>
                    <p className="text-xs font-extrabold text-brand-900">
                      {expectedPlates}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Bottom Row: Operational Recommendations */}
      {smartRecommendations.length > 0 && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-700" />
              <h3 className="text-base font-bold text-slate-900">
                Operational Recommendations
              </h3>
            </div>
            <Badge variant="green">{smartRecommendations.length} Active</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {smartRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl bg-cream-50 border border-slate-200/80 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        rec.priority === 'high'
                          ? 'red'
                          : rec.priority === 'medium'
                          ? 'amber'
                          : 'green'
                      }
                    >
                      {rec.priority.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-bold text-slate-900">
                      {rec.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
                <span className="text-xs font-extrabold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200 shrink-0">
                  {rec.impactBadge}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
