import React from 'react';
import {
  Users,
  UserCheck,
  CheckSquare,
  Scale,
  TrendingDown,
  IndianRupee,
  Utensils,
  AlertTriangle,
  Star,
  ArrowRight,
  Flame,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  getTodayDateStr,
  normalizeDateStr,
  formatHumanDate,
} from '../../lib/dateUtils';

export default function OverviewTab({ onNavigateTab }) {
  const { user, isDemoMode } = useAuth();
  const {
    messProfile,
    menus,
    messStudents,
    totalRegisteredStudents,
    studentsQueryError,
    forecasts,
    dataSufficiency,
    wasteLogs,
    weeklySeries,
    inventory,
    feedbackList,
  } = useData();

  const todayStr = getTodayDateStr();
  const todayMenus = menus.filter(
    (m) => normalizeDateStr(m.menu_date) === todayStr
  );
  const displayMenus = todayMenus;

  // Uses shared messStudents & totalRegisteredStudents from DataContext (identical to Student Selections page)
  const totalRegistered = totalRegisteredStudents;

  const expectedAttendanceToday =
    dataSufficiency?.isSufficient && forecasts.length > 0
      ? Math.max(...forecasts.map((f) => Number(f.expected_attendance || 0)), 0)
      : 0;

  const totalMealSelectionsToday = menus.reduce(
    (sum, m) =>
      sum +
      (m.items || []).reduce(
        (dSum, d) => dSum + Number(d.selected_count || 0),
        0
      ),
    0
  );

  const todayWasteLogs = wasteLogs.filter((w) => w.log_date === todayStr);
  const activeWasteSet = todayWasteLogs;

  const foodPreparedTodayKg = activeWasteSet.reduce(
    (sum, item) => sum + Number(item.prepared_kg || 0),
    0
  );
  const foodWasteTodayKg = activeWasteSet.reduce(
    (sum, item) => sum + Number(item.leftover_kg || 0),
    0
  );
  const estimatedWasteCostToday = activeWasteSet.reduce(
    (sum, item) => sum + Number(item.cost || 0),
    0
  );

  // Popular dishes across menus
  const allDishes = menus
    .flatMap((m) =>
      (m.items || []).map((item) => ({
        ...item,
        name: item.name || item.dish_name || 'Dish',
        meal_type: m.meal_type,
      }))
    )
    .sort(
      (a, b) => Number(b.selected_count || 0) - Number(a.selected_count || 0)
    )
    .slice(0, 5);

  // Low inventory items
  const lowInventoryItems = inventory.filter(
    (item) => Number(item.current_stock) < Number(item.minimum_stock)
  );

  const kpiCards = [
    {
      label: 'Total Registered Students',
      value: studentsQueryError ? 'Error' : totalRegistered.toLocaleString(),
      sub: studentsQueryError
        ? 'Failed to query public.students (check RLS policy)'
        : Number(messProfile.capacity || 0) > 0
        ? `Capacity: ${Number(messProfile.capacity).toLocaleString()} seats • 100% Entitled`
        : totalRegistered > 0
        ? '100% Meal Entitlement Active'
        : 'Share Join Code in Settings to onboard students',
      icon: Users,
      tone: studentsQueryError ? 'amber' : 'brand',
    },
    {
      label: 'Expected Attendance Today',
      value: dataSufficiency?.isSufficient
        ? expectedAttendanceToday.toLocaleString()
        : '0',
      sub: dataSufficiency?.isSufficient
        ? 'Statistical Attendance Forecast'
        : 'Insufficient data (Needs ≥5 history records)',
      icon: UserCheck,
      tone: 'brand',
    },
    {
      label: 'Total Meal Selections',
      value: totalMealSelectionsToday.toLocaleString(),
      sub:
        totalMealSelectionsToday > 0
          ? 'Across Breakfast, Lunch & Dinner'
          : 'No student selections submitted yet',
      icon: CheckSquare,
      tone: 'brand',
    },
    {
      label: 'Food Prepared Today',
      value: `${foodPreparedKgFormat(foodPreparedTodayKg)} kg`,
      sub:
        foodPreparedTodayKg > 0
          ? 'Logged across active meal batches'
          : 'No meal batches logged today',
      icon: Scale,
      tone: 'neutral',
    },
    {
      label: 'Food Waste Today',
      value: `${foodPreparedKgFormat(foodWasteTodayKg)} kg`,
      sub: `${
        foodPreparedTodayKg > 0
          ? ((foodWasteTodayKg / foodPreparedTodayKg) * 100).toFixed(1)
          : '0.0'
      }% of total prepared`,
      icon: TrendingDown,
      tone: 'amber',
    },
    {
      label: 'Estimated Waste Cost',
      value: `₹${Math.round(estimatedWasteCostToday).toLocaleString('en-IN')}`,
      sub:
        estimatedWasteCostToday > 0
          ? 'Today’s logged leftover cost'
          : '₹0 waste logged today',
      icon: IndianRupee,
      tone: 'amber',
    },
  ];

  return (
    <div className="space-y-6">
      {studentsQueryError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-900 space-y-1">
            <p className="font-bold">
              Database Query Error (Registered Students):
            </p>
            <p>{studentsQueryError}</p>
          </div>
        </div>
      )}

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className="p-4 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 leading-snug">
                  {kpi.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    kpi.tone === 'amber'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-brand-50 text-brand-800 border border-brand-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900">
                  {kpi.value}
                </p>
                <p className="text-[11px] font-medium text-brand-700 mt-0.5">
                  {kpi.sub}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Breakfast, Lunch & Dinner Summary */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-brand-700" />
              Today’s Breakfast, Lunch &amp; Dinner Summary ({formatHumanDate(todayStr)})
            </h2>
            <p className="text-xs text-slate-500">
              Live scheduled menus for {todayStr}, student selections, and walk-in entitlement buffers
            </p>
          </div>
          <Button
            variant="soft"
            size="sm"
            onClick={() => onNavigateTab('menus')}
            icon={ArrowRight}
          >
            Manage Menus
          </Button>
        </div>

        {todayMenus.length === 0 ? (
          <div className="p-8 rounded-2xl bg-cream-50 border border-dashed border-slate-300 text-center space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-800 flex items-center justify-center mx-auto">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                No menus scheduled for {formatHumanDate(todayStr)} yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Publish your Breakfast, Lunch, and Dinner dishes for today ({todayStr}) so students can view macros and submit meal preferences.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => onNavigateTab('menus')}
            >
              Schedule Today’s Menu
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['breakfast', 'lunch', 'dinner'].map((mealType) => {
              const menu = displayMenus.find(
                (m) => String(m.meal_type || '').toLowerCase() === mealType
              );

              if (!menu) {
                return (
                  <div
                    key={mealType}
                    className="p-4 rounded-2xl bg-cream-50 border border-dashed border-slate-300 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                          {mealType}
                        </span>
                        <Badge variant="neutral">Not Scheduled</Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        No {mealType} menu created for {formatHumanDate(todayStr)} yet.
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onNavigateTab('menus')}
                    >
                      Schedule {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </Button>
                  </div>
                );
              }

              const totalCals = (menu.items || []).reduce(
                (s, i) => s + Number(i.calories || 0),
                0
              );
              const totalProt = (menu.items || []).reduce(
                (s, i) => s + Number(i.protein || 0),
                0
              );
              const selectedCount = (menu.items || []).reduce(
                (max, i) => Math.max(max, Number(i.selected_count || 0)),
                0
              );
              const mealForecast = forecasts.find(
                (f) => f.menu_id === menu.id
              );
              const bufferCount = mealForecast?.walk_in_buffer_count || 0;

              return (
                <div
                  key={mealType}
                  className="p-4 rounded-2xl bg-cream-50 border border-slate-200/80 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-brand-800">
                        {mealType}
                      </span>
                      <Badge
                        variant={
                          menu.publish_status === 'published' ? 'green' : 'amber'
                        }
                      >
                        {menu.publish_status || 'draft'}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {menu.title || `${mealType} Menu`}
                    </h3>
                    {(menu.items || []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        No dishes added yet.
                      </p>
                    ) : (
                      <ul className="space-y-1 text-xs text-slate-600">
                        {(menu.items || []).map((dish) => (
                          <li key={dish.id} className="truncate">
                            • {dish.name || dish.dish_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/70 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Student Selections:</span>
                      <span className="font-bold text-slate-900">
                        {selectedCount} (+{bufferCount} walk-in buffer)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Nutritional Total:</span>
                      <span className="font-semibold text-brand-800">
                        {totalCals} kcal • {totalProt.toFixed(1)}g Protein
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Charts Row: Weekly Food Consumption & Food Waste Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Weekly Food Preparation vs. Consumption (kg)
              </h3>
              <p className="text-xs text-slate-500">
                Tracks daily batch accuracy across logged meal sessions
              </p>
            </div>
            <Badge variant={weeklySeries.length > 0 ? 'green' : 'neutral'}>
              {weeklySeries.length > 0 ? `${weeklySeries.length} Days Logged` : 'No Data Yet'}
            </Badge>
          </div>
          {weeklySeries.length === 0 ? (
            <div className="h-72 w-full rounded-2xl bg-cream-50 border border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <p className="text-xs font-bold text-slate-800">
                No food preparation or consumption logs yet
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                Log your daily prepared and consumed food quantities in the Food Waste tab to populate this chart.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigateTab('waste')}
              >
                Log First Meal Batch →
              </Button>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklySeries}
                  margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
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
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    unit=" kg"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar
                    dataKey="preparedKg"
                    name="Food Prepared (kg)"
                    fill="#1f5440"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="consumedKg"
                    name="Food Consumed (kg)"
                    fill="#64a88b"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Food Waste Trend (kg)
              </h3>
              <p className="text-xs text-slate-500">
                Daily kitchen leftover tracking from recorded waste logs
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab('waste')}
            >
              Log Waste →
            </Button>
          </div>
          {weeklySeries.length === 0 ? (
            <div className="h-72 w-full rounded-2xl bg-cream-50 border border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <p className="text-xs font-bold text-slate-800">
                No waste logs recorded yet
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                Record leftover food quantities after meal service to track your kitchen waste trend.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigateTab('waste')}
              >
                Go to Food Waste Tracker →
              </Button>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklySeries}
                  margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
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
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    unit=" kg"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="wasteKg"
                    name="Actual Logged Waste (kg)"
                    stroke="#1f5440"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom 3-Column Grid: Popular Dishes, Low Inventory Alerts, Recent Student Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Dishes */}
        <Card className="p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-brand-700" />
                Most Popular Student Dishes
              </h3>
              <Badge variant="green">Top Demand</Badge>
            </div>
            {allDishes.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-cream-50 rounded-xl space-y-2">
                <p>No dishes added yet.</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigateTab('menus')}
                >
                  Create Menu Dishes
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {allDishes.map((dish, idx) => (
                  <div
                    key={dish.id}
                    className="py-2.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {idx + 1}. {dish.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {dish.meal_type?.toUpperCase()} • {dish.calories} kcal •{' '}
                        {dish.protein}g P
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-bold shrink-0">
                      {dish.selected_count || 0} opted
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigateTab('selections')}
            className="w-full"
          >
            View All Dish Selections
          </Button>
        </Card>

        {/* Low Inventory Alerts */}
        <Card className="p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Low Inventory &amp; Expiry Alerts
              </h3>
              <Badge variant={lowInventoryItems.length > 0 ? 'amber' : 'green'}>
                {lowInventoryItems.length} Alerts
              </Badge>
            </div>

            {inventory.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-cream-50 rounded-xl space-y-2">
                <p>No inventory items added yet.</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigateTab('inventory')}
                >
                  Add First Ingredient
                </Button>
              </div>
            ) : lowInventoryItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-cream-50 rounded-xl">
                All storeroom ingredients are above minimum stock thresholds!
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowInventoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {item.ingredient_name}
                      </p>
                      <p className="text-[11px] text-amber-800">
                        Current:{' '}
                        <strong>
                          {item.current_stock} {item.unit}
                        </strong>{' '}
                        (Min: {item.minimum_stock} {item.unit})
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onNavigateTab('inventory')}
                    >
                      Restock
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigateTab('purchase')}
            className="w-full"
          >
            Open Purchase Planner
          </Button>
        </Card>

        {/* Recent Student Feedback */}
        <Card className="p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                Recent Student Feedback
              </h3>
              <Badge variant="neutral">{feedbackList.length} Entries</Badge>
            </div>

            {feedbackList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-cream-50 rounded-xl">
                No student feedback submitted yet. Ratings and reviews from students will appear here.
              </div>
            ) : (
              <div className="space-y-2.5">
                {feedbackList.slice(0, 3).map((fb) => (
                  <div
                    key={fb.id}
                    className="p-3 rounded-xl bg-cream-50 border border-slate-200/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {fb.dish_name}
                      </span>
                      <span className="text-xs font-bold text-amber-600">
                        {'★'.repeat(Number(fb.rating || 0))}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {fb.review || fb.complaint || fb.suggestion || fb.comment}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {fb.student_name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigateTab('feedback')}
            className="w-full"
          >
            Manage All Student Feedback
          </Button>
        </Card>
      </div>

      {/* Entitlement Compliance Footer Strip */}
      <div className="p-4 rounded-2xl bg-brand-50/90 border border-brand-200 flex flex-wrap items-center justify-between gap-3 text-xs text-brand-950">
        <span className="flex items-center gap-2 font-medium">
          <ShieldCheck className="w-4 h-4 text-brand-800 shrink-0" />
          <strong>Entitlement Charter Active:</strong> All{' '}
          {totalRegistered.toLocaleString()} registered students retain full dining hall entitlement regardless of whether they submit daily meal selections.
        </span>
        <button
          type="button"
          onClick={() => onNavigateTab('selections')}
          className="font-bold text-brand-800 hover:underline"
        >
          Inspect Walk-In Buffer →
        </button>
      </div>
    </div>
  );
}

function foodPreparedKgFormat(num) {
  return Number(num || 0).toFixed(1);
}
