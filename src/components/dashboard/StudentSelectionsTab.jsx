import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckSquare,
  ShieldCheck,
  Search,
  BarChart3,
  Clock,
  Utensils,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Filter,
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
} from 'recharts';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useData } from '../../context/DataContext';

export default function StudentSelectionsTab({ onNavigateTab }) {
  const {
    menus = [],
    messStudents = [],
    totalRegisteredStudents = 0,
    mealSelectionsRows = [],
    studentsQueryError = '',
    selectionsQueryError = '',
    forecasts = [],
    historicalSelections = [],
  } = useData();

  const [filterMode, setFilterMode] = useState('all'); // all | unsubmitted | submitted
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [selectedMealFilter, setSelectedMealFilter] = useState('all');

  // Shared registered student count from DataContext (identical to Overview tab)
  const totalRegistered = Number(totalRegisteredStudents || 0);

  // Collect available menu/selection dates for filtering
  const availableDates = useMemo(() => {
    const dateSet = new Set();
    (menus || []).forEach((m) => {
      if (m?.menu_date) dateSet.add(m.menu_date);
    });
    (mealSelectionsRows || []).forEach((sel) => {
      if (sel?.menu_date) dateSet.add(sel.menu_date);
    });
    return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  }, [menus, mealSelectionsRows]);

  // Menus filtered by selectedDateFilter
  const dateFilteredMenus = useMemo(() => {
    if (selectedDateFilter === 'all') return menus || [];
    return (menus || []).filter((m) => m?.menu_date === selectedDateFilter);
  }, [menus, selectedDateFilter]);

  // Meal selection rows filtered by date, meal type, and search query
  const filteredSelectionRows = useMemo(() => {
    return (mealSelectionsRows || []).filter((sel) => {
      if (!sel) return false;
      if (selectedDateFilter !== 'all' && sel.menu_date !== selectedDateFilter) {
        return false;
      }
      if (
        selectedMealFilter !== 'all' &&
        String(sel.meal_type || '').toLowerCase() !== selectedMealFilter
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = String(sel.student_name || '')
          .toLowerCase()
          .includes(q);
        const matchRoll = String(sel.student_roll_id || '')
          .toLowerCase()
          .includes(q);
        const matchDish = (sel.selected_dishes || []).some((d) =>
          String(d?.name || '')
            .toLowerCase()
            .includes(q)
        );
        if (!matchName && !matchRoll && !matchDish) return false;
      }
      return true;
    });
  }, [mealSelectionsRows, selectedDateFilter, selectedMealFilter, searchQuery]);

  // Total dish selections across filtered menus (matches OverviewTab's Total Meal Selections calculation when selectedDateFilter === 'all')
  const totalDishSelections = useMemo(() => {
    return dateFilteredMenus.reduce(
      (sum, m) =>
        sum +
        (m?.items || []).reduce(
          (dSum, d) => dSum + Number(d?.selected_count || 0),
          0
        ),
      0
    );
  }, [dateFilteredMenus]);

  // Count students who have submitted at least one meal preference
  const studentsSubmittedCount = useMemo(() => {
    return (messStudents || []).filter(
      (s) => s?.breakfast_selected || s?.lunch_selected || s?.dinner_selected
    ).length;
  }, [messStudents]);

  // Compute meal-wise selection statistics across all matching menus for each meal type
  const mealStats = useMemo(() => {
    return ['breakfast', 'lunch', 'dinner'].map((mealKey) => {
      const label = mealKey.charAt(0).toUpperCase() + mealKey.slice(1);
      const matchingMenus = dateFilteredMenus.filter(
        (m) => String(m?.meal_type || '').toLowerCase() === mealKey
      );

      const maxDishSelected = matchingMenus.reduce((menuMax, m) => {
        const dishMax = (m?.items || []).reduce(
          (max, item) => Math.max(max, Number(item?.selected_count || 0)),
          0
        );
        return Math.max(menuMax, dishMax);
      }, 0);

      const totalMealDishSelections = matchingMenus.reduce(
        (sum, m) =>
          sum +
          (m?.items || []).reduce(
            (dSum, item) => dSum + Number(item?.selected_count || 0),
            0
          ),
        0
      );

      const studentFlagCount = (messStudents || []).filter((s) =>
        Boolean(s?.[`${mealKey}_selected`])
      ).length;

      const distinctStudentsFromRows = new Set(
        (mealSelectionsRows || [])
          .filter(
            (sel) =>
              sel?.will_attend &&
              String(sel?.meal_type || '').toLowerCase() === mealKey &&
              (selectedDateFilter === 'all' ||
                sel?.menu_date === selectedDateFilter)
          )
          .map((sel) => sel.student_id)
          .filter(Boolean)
      ).size;

      const selectedCount = Math.max(
        maxDishSelected,
        studentFlagCount,
        distinctStudentsFromRows
      );
      const notSubmittedCount = Math.max(0, totalRegistered - selectedCount);

      const matchingForecast = (forecasts || []).find(
        (f) => String(f?.meal_type || '').toLowerCase() === mealKey
      );
      const walkInBuffer = Number(matchingForecast?.walk_in_buffer_count || 0);

      return {
        mealKey,
        meal: label,
        selectedCount,
        totalMealDishSelections,
        notSubmittedCount,
        walkInBuffer,
      };
    });
  }, [
    dateFilteredMenus,
    messStudents,
    mealSelectionsRows,
    selectedDateFilter,
    totalRegistered,
    forecasts,
  ]);

  // Flatten all dishes across matching menus (without artificial .slice(0, 3) truncation)
  const dishSelections = useMemo(() => {
    return dateFilteredMenus
      .filter(
        (m) =>
          selectedMealFilter === 'all' ||
          String(m?.meal_type || '').toLowerCase() === selectedMealFilter
      )
      .flatMap((m, mIdx) =>
        (m?.items || []).map((item, iIdx) => {
          const count = Number(item?.selected_count || 0);
          return {
            uniqueKey: `${m?.id || mIdx}-${item?.id || iIdx}`,
            id: item?.id || `dish-${mIdx}-${iIdx}`,
            name: item?.name || item?.dish_name || 'Dish',
            meal_type: String(m?.meal_type || 'meal').toLowerCase(),
            menu_date: m?.menu_date || '',
            publish_status: m?.publish_status || 'published',
            selected_count: count,
            pct:
              totalRegistered > 0
                ? Math.min(100, Math.round((count / totalRegistered) * 100))
                : 0,
          };
        })
      );
  }, [dateFilteredMenus, selectedMealFilter, totalRegistered]);

  // Filter student roster (only students belonging to this mess)
  const filteredStudents = useMemo(() => {
    return (messStudents || []).filter((s) => {
      if (!s) return false;
      const hasSubmittedAny = Boolean(
        s.breakfast_selected || s.lunch_selected || s.dinner_selected
      );
      if (filterMode === 'unsubmitted' && hasSubmittedAny) return false;
      if (filterMode === 'submitted' && !hasSubmittedAny) return false;
      if (
        searchQuery.trim() &&
        !String(s.full_name || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) &&
        !String(s.student_roll_id || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) &&
        !String(s.hostel_name || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [messStudents, filterMode, searchQuery]);

  return (
    <div className="space-y-6">
      {(studentsQueryError || selectionsQueryError) && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-900 space-y-1">
            <p className="font-bold">Database Query Error:</p>
            {studentsQueryError && <p>{studentsQueryError}</p>}
            {selectionsQueryError && <p>{selectionsQueryError}</p>}
          </div>
        </div>
      )}

      {/* Entitlement Guarantee Notice */}
      <div className="p-4 rounded-2xl bg-brand-950 text-white border border-brand-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="text-white">
              Unconditional Meal Entitlement Policy:
            </strong>{' '}
            Student meal selections below help estimate demand. Students who have{' '}
            <em>not</em> submitted preferences retain 100% of their dining
            entitlement and are covered by the Walk-In Buffer.
          </div>
        </div>
        <Badge variant="dark">100% Entitled</Badge>
      </div>

      {/* Live Overview Consistency Summary & Filter Bar */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
            <div className="p-3 rounded-xl bg-cream-50 border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-500">
                Registered Students
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {totalRegistered.toLocaleString()}
              </p>
              <p className="text-[10px] text-brand-700 font-semibold">
                Linked to your mess
              </p>
            </div>

            <div className="p-3 rounded-xl bg-brand-50/70 border border-brand-200">
              <p className="text-[11px] font-semibold text-brand-800">
                Total Meal Selections
              </p>
              <p className="text-xl font-extrabold text-brand-900 mt-0.5">
                {totalDishSelections.toLocaleString()}
              </p>
              <p className="text-[10px] text-brand-700 font-semibold">
                Dish selections across menus
              </p>
            </div>

            <div className="p-3 rounded-xl bg-cream-50 border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-500">
                Students Responded
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {studentsSubmittedCount} / {totalRegistered}
              </p>
              <p className="text-[10px] text-slate-500">
                Submitted meal preference
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
              <p className="text-[11px] font-semibold text-amber-800">
                Not Yet Submitted
              </p>
              <p className="text-xl font-extrabold text-amber-900 mt-0.5">
                {Math.max(0, totalRegistered - studentsSubmittedCount)}
              </p>
              <p className="text-[10px] text-amber-800 font-semibold">
                100% dining entitlement active
              </p>
            </div>
          </div>

          {/* Date & Meal Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-50 border border-slate-200 text-xs">
              <Calendar className="w-3.5 h-3.5 text-brand-700" />
              <select
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                aria-label="Filter by menu date"
                className="bg-transparent font-semibold text-slate-800 focus:outline-none"
              >
                <option value="all">All Menu Dates</option>
                {availableDates.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-50 border border-slate-200 text-xs">
              <Filter className="w-3.5 h-3.5 text-brand-700" />
              <select
                value={selectedMealFilter}
                onChange={(e) => setSelectedMealFilter(e.target.value)}
                aria-label="Filter by meal type"
                className="bg-transparent font-semibold text-slate-800 focus:outline-none"
              >
                <option value="all">All Meals</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Meal-Wise Selection Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {mealStats.map((stat) => {
          const pct =
            totalRegistered > 0
              ? Math.min(
                  100,
                  Math.round((stat.selectedCount / totalRegistered) * 100)
                )
              : 0;
          return (
            <Card key={stat.meal} className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {stat.meal} Selections
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {stat.totalMealDishSelections} total dish selection
                    {stat.totalMealDishSelections === 1 ? '' : 's'}
                  </p>
                </div>
                <Badge variant="green">{pct}% Opted In</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-200">
                  <p className="text-[10px] font-semibold text-brand-800">
                    Selected Meal
                  </p>
                  <p className="text-xl font-extrabold text-brand-900 mt-0.5">
                    {stat.selectedCount}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-cream-100 border border-slate-200">
                  <p className="text-[10px] font-semibold text-slate-600">
                    Not Submitted
                  </p>
                  <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {stat.notSubmittedCount}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-[10px] font-semibold text-amber-800">
                    Walk-In Buffer
                  </p>
                  <p className="text-xl font-extrabold text-amber-900 mt-0.5">
                    +{stat.walkInBuffer}
                  </p>
                </div>
              </div>

              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-800 h-full rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Total Recommended Plates:{' '}
                <strong className="text-slate-900">
                  {stat.selectedCount + stat.walkInBuffer}
                </strong>{' '}
                (Out of {totalRegistered} registered)
              </p>
            </Card>
          );
        })}
      </div>

      {/* Dish-Wise Selections + Historical Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Individual Dish Selection Counts */}
        <Card className="lg:col-span-6 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-brand-700" />
                Individual Dish Selection Counts
              </h3>
              <p className="text-xs text-slate-500">
                Number of students selecting each dish from scheduled menus
              </p>
            </div>
            <Badge variant="neutral">{dishSelections.length} Active Dishes</Badge>
          </div>

          {dishSelections.length === 0 ? (
            <div className="p-8 rounded-2xl bg-cream-50 border border-dashed border-slate-300 text-center space-y-3">
              <Utensils className="w-6 h-6 text-brand-700 mx-auto" />
              <p className="text-xs font-bold text-slate-800">
                No menus or dishes found for the selected filter
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Publish a menu so students can select their preferred dishes.
              </p>
              {onNavigateTab && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigateTab('menus')}
                >
                  Create Menu →
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {dishSelections.map((dish) => (
                <div key={dish.uniqueKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-semibold text-slate-800 truncate">
                      {dish.name}{' '}
                      <span className="text-[10px] uppercase text-slate-400 font-bold ml-1">
                        ({dish.meal_type}
                        {dish.menu_date ? ` • ${dish.menu_date}` : ''})
                      </span>
                    </span>
                    <span className="font-bold text-brand-800 shrink-0">
                      {dish.selected_count} student
                      {dish.selected_count === 1 ? '' : 's'} ({dish.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-700 h-full rounded-full"
                      style={{ width: `${dish.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Historical Selection Data Chart */}
        <Card className="lg:col-span-6 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-700" />
                Historical Meal Selection Data
              </h3>
              <p className="text-xs text-slate-500">
                Breakfast, Lunch &amp; Dinner selections vs. unpolled walk-ins
              </p>
            </div>
            <Badge
              variant={historicalSelections.length > 0 ? 'green' : 'neutral'}
            >
              {historicalSelections.length > 0
                ? 'Historical Trend'
                : 'No History Yet'}
            </Badge>
          </div>

          {historicalSelections.length === 0 ? (
            <div className="h-72 w-full rounded-2xl bg-cream-50 border border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center space-y-2">
              <p className="text-xs font-bold text-slate-800">
                No historical selection records yet
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                As students submit daily preferences across meal sessions,
                historical trends will populate here automatically.
              </p>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={historicalSelections}
                  margin={{ top: 10, right: 10, left: -12, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar
                    dataKey="breakfastSelected"
                    name="Breakfast Selected"
                    fill="#64a88b"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="lunchSelected"
                    name="Lunch Selected"
                    fill="#1f5440"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="dinnerSelected"
                    name="Dinner Selected"
                    fill="#418c6e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Submitted Student Meal Selection Records (Direct from public.meal_selections & selection_items) */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-700" />
              Submitted Student Meal Selections Log
            </h3>
            <p className="text-xs text-slate-500">
              Individual meal preference submissions with selected dishes, meal
              dates, and portion preferences
            </p>
          </div>
          <Badge
            variant={filteredSelectionRows.length > 0 ? 'green' : 'neutral'}
          >
            {filteredSelectionRows.length} Selection Record
            {filteredSelectionRows.length === 1 ? '' : 's'}
          </Badge>
        </div>

        {filteredSelectionRows.length === 0 ? (
          <div className="p-6 rounded-2xl bg-cream-50 border border-dashed border-slate-300 text-center space-y-1.5">
            <p className="text-xs font-bold text-slate-800">
              No individual meal selection records found for the current filter
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              When students submit their Breakfast, Lunch, or Dinner dish
              preferences from the Student Portal, each submission appears here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Roll / Student ID</th>
                  <th className="py-3 px-4">Meal Date &amp; Session</th>
                  <th className="py-3 px-4">Selected Dishes</th>
                  <th className="py-3 px-4">Portion</th>
                  <th className="py-3 px-4">Selection Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSelectionRows.map((sel, idx) => {
                  const dishes = Array.isArray(sel.selected_dishes)
                    ? sel.selected_dishes
                    : [];
                  return (
                    <tr
                      key={sel.id || `${sel.menu_id}-${sel.student_id}-${idx}`}
                      className="hover:bg-cream-50/70"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {sel.student_name || 'Registered Student'}
                        {sel.hostel_name && sel.hostel_name !== 'N/A' && (
                          <span className="block text-[10px] font-normal text-slate-500">
                            {sel.hostel_name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {sel.student_roll_id || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">
                          {sel.menu_date || 'Scheduled'}
                        </span>
                        <span className="ml-2 uppercase text-[10px] font-extrabold px-2 py-0.5 rounded bg-brand-50 text-brand-800 border border-brand-200">
                          {sel.meal_type || 'meal'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {dishes.length === 0 ? (
                          <span className="text-slate-500">
                            {sel.will_attend
                              ? 'General Meal Attendance'
                              : 'No dishes selected'}
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {dishes.map((d) => (
                              <span
                                key={d.id || d.name}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-50 text-brand-900 border border-brand-200 font-semibold text-[11px]"
                              >
                                {d.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-700 font-medium">
                        {sel.portion_preference || 'regular'}
                      </td>
                      <td className="py-3 px-4">
                        {sel.will_attend ? (
                          <Badge variant="green">
                            Confirmed ({dishes.length} dish
                            {dishes.length === 1 ? '' : 'es'})
                          </Badge>
                        ) : (
                          <Badge variant="amber">
                            Skipping (Entitlement Retained)
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Student Roster & Students Who Have Not Submitted Preferences */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-700" />
              Student Preference Submission Tracker
            </h3>
            <p className="text-xs text-slate-500">
              Filter students who have submitted preferences vs. those who have
              not submitted yet
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or ID..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>

            <div className="inline-flex rounded-xl bg-cream-100 p-1 border border-slate-200 text-xs">
              {[
                { id: 'all', label: `All Students (${messStudents.length})` },
                {
                  id: 'unsubmitted',
                  label: `Not Submitted Preferences (${Math.max(
                    0,
                    messStudents.length - studentsSubmittedCount
                  )})`,
                },
                {
                  id: 'submitted',
                  label: `Submitted (${studentsSubmittedCount})`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    filterMode === tab.id
                      ? 'bg-brand-800 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {messStudents.length === 0 ? (
          <div className="p-8 rounded-2xl bg-cream-50 border border-dashed border-slate-300 text-center space-y-2">
            <Users className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-800">
              No students registered in this mess yet
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              When students register and link to your mess, their preference
              status and guaranteed meal entitlement will appear here.
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 rounded-2xl bg-cream-50 border border-dashed border-slate-300 text-center space-y-3">
            <Users className="w-6 h-6 text-brand-700 mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">
                No students match the current filter
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {filterMode === 'unsubmitted'
                  ? 'All registered students in your mess have already submitted their meal preferences.'
                  : filterMode === 'submitted'
                  ? 'No students have submitted meal preferences yet.'
                  : 'No registered students match your search query.'}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFilterMode('all');
                setSearchQuery('');
              }}
            >
              Show All Registered Students
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Roll / Student ID</th>
                  <th className="py-3 px-4">Hostel</th>
                  <th className="py-3 px-4">Breakfast</th>
                  <th className="py-3 px-4">Lunch</th>
                  <th className="py-3 px-4">Dinner</th>
                  <th className="py-3 px-4">Meal Entitlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((stu, idx) => (
                  <tr
                    key={stu.id || stu.profile_id || stu.email || idx}
                    className="hover:bg-cream-50/70"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {stu.full_name || 'Registered Student'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {stu.student_roll_id || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {stu.hostel_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      {stu.breakfast_selected ? (
                        <div className="space-y-1">
                          <Badge variant="green">Selected</Badge>
                          {Array.isArray(stu.breakfast_dishes) &&
                            stu.breakfast_dishes.length > 0 && (
                              <p className="text-[10px] text-slate-600">
                                {stu.breakfast_dishes.join(', ')}
                              </p>
                            )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" /> Not Submitted
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {stu.lunch_selected ? (
                        <div className="space-y-1">
                          <Badge variant="green">Selected</Badge>
                          {Array.isArray(stu.lunch_dishes) &&
                            stu.lunch_dishes.length > 0 && (
                              <p className="text-[10px] text-slate-600">
                                {stu.lunch_dishes.join(', ')}
                              </p>
                            )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" /> Not Submitted
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {stu.dinner_selected ? (
                        <div className="space-y-1">
                          <Badge variant="green">Selected</Badge>
                          {Array.isArray(stu.dinner_dishes) &&
                            stu.dinner_dishes.length > 0 && (
                              <p className="text-[10px] text-slate-600">
                                {stu.dinner_dishes.join(', ')}
                              </p>
                            )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" /> Not Submitted
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                        <ShieldCheck className="w-3.5 h-3.5" /> Entitlement
                        Retained
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
