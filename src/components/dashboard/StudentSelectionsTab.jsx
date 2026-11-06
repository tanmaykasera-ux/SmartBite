import React, { useState } from 'react';
import {
  Users,
  CheckSquare,
  ShieldCheck,
  Search,
  BarChart3,
  Clock,
  Utensils,
  AlertTriangle,
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
import { useAuth } from '../../context/AuthContext';

export default function StudentSelectionsTab({ onNavigateTab }) {
  const { user, isDemoMode } = useAuth();
  const {
    messProfile,
    menus,
    messStudents,
    totalRegisteredStudents,
    studentsQueryError,
    forecasts,
    historicalSelections,
  } = useData();
  const [filterMode, setFilterMode] = useState('all'); // all | unsubmitted | submitted
  const [searchQuery, setSearchQuery] = useState('');

  // Uses shared messStudents & totalRegisteredStudents from DataContext (identical to Overview tab)
  const totalRegistered = totalRegisteredStudents;

  // Compute meal-wise selection statistics strictly from real menus & messStudents
  const mealStats = ['breakfast', 'lunch', 'dinner'].map((mealKey) => {
    const label = mealKey.charAt(0).toUpperCase() + mealKey.slice(1);
    const matchingMenu = menus.find(
      (m) => String(m.meal_type).toLowerCase() === mealKey
    );
    const maxDishSelected = (matchingMenu?.items || []).reduce(
      (max, item) => Math.max(max, Number(item.selected_count || 0)),
      0
    );
    const studentFlagCount = messStudents.filter(
      (s) => Boolean(s[`${mealKey}_selected`])
    ).length;

    const selectedCount = Math.max(maxDishSelected, studentFlagCount);
    const notSubmittedCount = Math.max(0, totalRegistered - selectedCount);

    const matchingForecast = forecasts.find(
      (f) => String(f.meal_type).toLowerCase() === mealKey
    );
    const walkInBuffer = Number(matchingForecast?.walk_in_buffer_count || 0);

    return {
      meal: label,
      selectedCount,
      notSubmittedCount,
      walkInBuffer,
    };
  });

  // Flatten all dishes across menus
  const dishSelections = menus
    .slice(0, 3)
    .flatMap((m) =>
      (m.items || []).map((item) => {
        const count = Number(item.selected_count || 0);
        return {
          id: item.id,
          name: item.name || item.dish_name || 'Dish',
          meal_type: m.meal_type,
          selected_count: count,
          pct:
            totalRegistered > 0
              ? Math.min(100, Math.round((count / totalRegistered) * 100))
              : 0,
        };
      })
    );

  // Filter student roster (only students belonging to this mess)
  const filteredStudents = messStudents.filter((s) => {
    const hasSubmittedAll =
      s.breakfast_selected || s.lunch_selected || s.dinner_selected;
    if (filterMode === 'unsubmitted' && hasSubmittedAll) return false;
    if (filterMode === 'submitted' && !hasSubmittedAll) return false;
    if (
      searchQuery &&
      !(s.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(s.student_roll_id || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

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

      {/* Entitlement Guarantee Notice */}
      <div className="p-4 rounded-2xl bg-brand-950 text-white border border-brand-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="text-white">
              Unconditional Meal Entitlement Policy:
            </strong>{' '}
            Student meal selections below help estimate demand. Students who have{' '}
            <em>not</em> submitted preferences retain 100% of their dining entitlement and are covered by the Walk-In Buffer.
          </div>
        </div>
        <Badge variant="dark">100% Entitled</Badge>
      </div>

      {/* Meal-Wise Selection Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {mealStats.map((stat) => {
          const pct =
            totalRegistered > 0
              ? Math.min(100, Math.round((stat.selectedCount / totalRegistered) * 100))
              : 0;
          return (
            <Card key={stat.meal} className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  {stat.meal} Selections
                </h3>
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
                Number of students selecting each dish from published menus
              </p>
            </div>
            <Badge variant="neutral">{dishSelections.length} Active Dishes</Badge>
          </div>

          {dishSelections.length === 0 ? (
            <div className="p-8 rounded-2xl bg-cream-50 border border-dashed border-slate-300 text-center space-y-3">
              <Utensils className="w-6 h-6 text-brand-700 mx-auto" />
              <p className="text-xs font-bold text-slate-800">
                No menus or dishes created yet
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Publish a menu first so students can select their preferred dishes.
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
            <div className="space-y-3">
              {dishSelections.map((dish) => (
                <div key={dish.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {dish.name}{' '}
                      <span className="text-[10px] uppercase text-slate-400 font-bold ml-1">
                        ({dish.meal_type})
                      </span>
                    </span>
                    <span className="font-bold text-brand-800">
                      {dish.selected_count} students ({dish.pct}%)
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
            <Badge variant={historicalSelections.length > 0 ? 'green' : 'neutral'}>
              {historicalSelections.length > 0 ? 'Historical Trend' : 'No History Yet'}
            </Badge>
          </div>

          {historicalSelections.length === 0 ? (
            <div className="h-72 w-full rounded-2xl bg-cream-50 border border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center space-y-2">
              <p className="text-xs font-bold text-slate-800">
                No historical selection records yet
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                As students submit daily preferences across meal sessions, historical trends will populate here automatically.
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

      {/* Student Roster & Students Who Have Not Submitted Preferences */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-700" />
              Student Preference Submission Tracker
            </h3>
            <p className="text-xs text-slate-500">
              Filter students who have submitted preferences vs. those who have not submitted yet
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
                { id: 'all', label: 'All Students' },
                { id: 'unsubmitted', label: 'Not Submitted Preferences' },
                { id: 'submitted', label: 'Submitted' },
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

        {students.length === 0 ? (
          <div className="p-8 rounded-2xl bg-cream-50 border border-dashed border-slate-300 text-center space-y-2">
            <Users className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-800">
              No students registered in this mess yet
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              When students register and link to your mess, their preference status and guaranteed meal entitlement will appear here.
            </p>
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
                {filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-cream-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {stu.full_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {stu.student_roll_id}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {stu.hostel_name}
                    </td>
                    <td className="py-3 px-4">
                      {stu.breakfast_selected ? (
                        <Badge variant="green">Selected</Badge>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" /> Not Submitted
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {stu.lunch_selected ? (
                        <Badge variant="green">Selected</Badge>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" /> Not Submitted
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {stu.dinner_selected ? (
                        <Badge variant="green">Selected</Badge>
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
