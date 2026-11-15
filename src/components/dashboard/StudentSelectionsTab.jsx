import React, { useState, useMemo } from 'react';
import {
  Users,
  ShieldCheck,
  Search,
  UserMinus,
  AlertCircle,
  Clock,
  Utensils,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import {
  getTodayDateStr,
  getTomorrowDateStr,
  normalizeDateStr,
  formatHumanDate,
  computeMealPollWindow,
} from '../../lib/dateUtils';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function StudentSelectionsTab() {
  const {
    messStudents = [],
    totalRegisteredStudents = 0,
    messProfile = {},
    menus = [],
    attendanceResponses = [],
    forecasts = [],
    studentsQueryError = '',
    refreshFromSupabase,
  } = useData();

  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMealFilter, setSelectedMealFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Build per-meal attendance poll summary for Breakfast, Lunch, Dinner on `selectedDate`
  const mealPollSummaries = useMemo(() => {
    return ['breakfast', 'lunch', 'dinner'].map((mealType) => {
      const pollWin = computeMealPollWindow(
        selectedDate,
        mealType,
        messProfile
      );
      const menuObj = menus.find(
        (m) =>
          normalizeDateStr(m.menu_date) === normalizeDateStr(selectedDate) &&
          String(m.meal_type || '').toLowerCase() === mealType
      );
      const mealForecast = forecasts.find(
        (f) =>
          normalizeDateStr(f.forecast_date) ===
            normalizeDateStr(selectedDate) && f.meal_type === mealType
      );

      // Students who marked "Not Coming" for this (date, mealType)
      const notComingList = (attendanceResponses || []).filter(
        (r) =>
          normalizeDateStr(r.meal_date || r.menu_date) ===
            normalizeDateStr(selectedDate) &&
          String(r.meal_type || '').toLowerCase() === mealType &&
          (r.status === 'not_coming' || r.will_attend === false)
      );

      const notComingCount = notComingList.length;
      const responseRatePct =
        totalRegisteredStudents > 0
          ? Number(
              ((notComingCount / totalRegisteredStudents) * 100).toFixed(1)
            )
          : 0;

      const expectedPlates =
        mealForecast?.expected_plates ??
        Math.max(0, totalRegisteredStudents - notComingCount);
      const recommendedPrepPlates =
        mealForecast?.overridden_prep_plates ??
        mealForecast?.recommended_prep_plates ??
        expectedPlates;

      return {
        mealType,
        label: mealType.charAt(0).toUpperCase() + mealType.slice(1),
        pollWin,
        menuObj,
        enrolled: totalRegisteredStudents,
        notComingCount,
        notComingList,
        responseRatePct,
        expectedPlates,
        recommendedPrepPlates,
      };
    });
  }, [
    selectedDate,
    messProfile,
    menus,
    forecasts,
    attendanceResponses,
    totalRegisteredStudents,
  ]);

  // Flatten students who marked "Not Coming" on `selectedDate` for the table below
  const filteredNotComingRows = useMemo(() => {
    const rows = [];
    mealPollSummaries.forEach((summary) => {
      if (
        selectedMealFilter !== 'all' &&
        summary.mealType !== selectedMealFilter
      ) {
        return;
      }
      summary.notComingList.forEach((resp) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !q ||
          String(resp.student_name || '')
            .toLowerCase()
            .includes(q) ||
          String(resp.student_roll_id || '')
            .toLowerCase()
            .includes(q) ||
          String(resp.hostel_name || '')
            .toLowerCase()
            .includes(q);
        if (matchesQuery) {
          rows.push({
            ...resp,
            mealLabel: summary.label,
            pollStatus: summary.pollWin.statusBadge,
            expectedPlatesForMeal: summary.expectedPlates,
          });
        }
      });
    });
    return rows;
  }, [mealPollSummaries, selectedMealFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Error Banner if RLS or query failed */}
      {studentsQueryError && (
        <Card className="p-4 bg-rose-50 border-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-rose-800">
                Supabase Query Error Detected
              </p>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                {studentsQueryError}
              </p>
            </div>
          </div>
          {refreshFromSupabase && (
            <Button
              size="sm"
              variant="secondary"
              onClick={refreshFromSupabase}
              className="shrink-0"
            >
              Retry Sync
            </Button>
          )}
        </Card>
      )}

      {/* Top Policy & Date Filter Banner */}
      <Card className="p-5 bg-gradient-to-r from-brand-900 to-brand-800 text-white border-none">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-200">
              <ShieldCheck className="w-4 h-4 text-brand-300" />
              <span>Plate-Based Attendance Polls • Default Status is Attending</span>
            </div>
            <h2 className="text-lg font-extrabold">
              Per-Meal Opt-Out Polls &amp; Expected Plates ({formatHumanDate(selectedDate)})
            </h2>
            <p className="text-xs text-brand-100/90 max-w-2xl leading-relaxed">
              Every enrolled student is counted as <strong>Attending by default</strong>. Polls only count students who explicitly mark <strong>&ldquo;I will NOT be coming&rdquo;</strong> before the meal cutoff. Non-response means the student is attending, and no student ever loses their meal entitlement.
            </p>
          </div>

          {/* Date Selector (Today / Tomorrow / Custom Date) */}
          <div className="flex flex-wrap items-center gap-2 bg-white/10 p-2 rounded-2xl border border-white/15">
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDate === todayStr
                  ? 'bg-white text-brand-900 shadow-xs'
                  : 'text-brand-100 hover:bg-white/10'
              }`}
            >
              Today ({formatHumanDate(todayStr)})
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(tomorrowStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDate === tomorrowStr
                  ? 'bg-white text-brand-900 shadow-xs'
                  : 'text-brand-100 hover:bg-white/10'
              }`}
            >
              Tomorrow ({formatHumanDate(tomorrowStr)})
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(normalizeDateStr(e.target.value) || todayStr)
              }
              className="rounded-xl bg-white/15 text-white border border-white/25 px-2.5 py-1 text-xs font-bold focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {/* 3 Meal Poll Summary Cards (Breakfast, Lunch, Dinner) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {mealPollSummaries.map((meal) => (
          <Card key={meal.mealType} className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-brand-800">
                  {meal.label} Poll
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  {meal.menuObj?.title || `${meal.label} Fixed Menu`}
                </h3>
              </div>
              <Badge
                variant={
                  meal.pollWin.status === 'open'
                    ? 'green'
                    : meal.pollWin.status === 'closed'
                    ? 'neutral'
                    : 'amber'
                }
              >
                {meal.pollWin.status === 'open'
                  ? 'Open'
                  : meal.pollWin.status === 'closed'
                  ? 'Closed'
                  : 'Upcoming'}
              </Badge>
            </div>

            {/* Poll Schedule & Cutoff Window */}
            <div className="p-3 rounded-xl bg-cream-50 border border-slate-200/80 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                <span>{meal.pollWin.statusBadge}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Opens at {meal.pollWin.opensAtFormatted} (after{' '}
                {meal.pollWin.previousMealLabel}) • Cutoff at{' '}
                {meal.pollWin.closesAtFormatted} • Meal served{' '}
                {meal.pollWin.mealStartFormatted} –{' '}
                {meal.pollWin.mealEndFormatted}
              </p>
            </div>

            {/* Key Metrics Grid: Enrolled, Marked Not Coming, Opt-Out Rate, Plates Expected */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                <p className="text-[11px] font-semibold text-slate-500">
                  Enrolled Students
                </p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {meal.enrolled.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  Default: Attending
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
                <p className="text-[11px] font-semibold text-rose-800">
                  Marked &ldquo;Not Coming&rdquo;
                </p>
                <p className="text-xl font-extrabold text-rose-900 mt-0.5">
                  {meal.notComingCount.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-rose-700 font-semibold mt-0.5">
                  Opt-out rate: {meal.responseRatePct}%
                </p>
              </div>
            </div>

            {/* Plates Expected Highlight Box right next to Not Coming */}
            <div className="p-3.5 rounded-xl bg-brand-900 text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-200">
                  Plates Expected ({meal.label})
                </p>
                <p className="text-2xl font-black text-white">
                  {meal.expectedPlates.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-semibold text-brand-200">
                    plates
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-brand-200 font-semibold">
                  Recommended Prep
                </p>
                <p className="text-sm font-extrabold text-brand-100">
                  {meal.recommendedPrepPlates.toLocaleString('en-IN')} plates
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* List of Students Who Marked "Not Coming" */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserMinus className="w-4 h-4 text-rose-600" />
              <span>
                Students Who Marked &ldquo;Not Coming&rdquo; on{' '}
                {formatHumanDate(selectedDate)} ({filteredNotComingRows.length})
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              All other enrolled students ({totalRegisteredStudents} total) are counted as attending by default.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl bg-cream-100 p-1 border border-slate-200">
              {['all', 'breakfast', 'lunch', 'dinner'].map((mFilter) => (
                <button
                  key={mFilter}
                  type="button"
                  onClick={() => setSelectedMealFilter(mFilter)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    selectedMealFilter === mFilter
                      ? 'bg-brand-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mFilter}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or roll ID..."
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brand-600"
              />
            </div>
          </div>
        </div>

        {filteredNotComingRows.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-cream-50 border border-dashed border-slate-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-brand-700 mx-auto" />
            <p className="text-sm font-bold text-slate-800">
              0 Students Marked &ldquo;Not Coming&rdquo; for This Selection
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All {totalRegisteredStudents} enrolled students are currently counted as attending for {formatHumanDate(selectedDate)}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase bg-cream-50">
                  <th className="py-3 px-3">Student Name &amp; Roll ID</th>
                  <th className="py-3 px-3">Hostel</th>
                  <th className="py-3 px-3">Meal</th>
                  <th className="py-3 px-3">Poll Response</th>
                  <th className="py-3 px-3">Plates Expected (Meal)</th>
                  <th className="py-3 px-3">Responded At</th>
                  <th className="py-3 px-3">Entitlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNotComingRows.map((row) => (
                  <tr
                    key={`${row.id}_${row.meal_type}`}
                    className="hover:bg-cream-50/60"
                  >
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">
                        {row.student_name || 'Registered Student'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {row.student_roll_id || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {row.hostel_name || 'Hostel'}
                    </td>
                    <td className="py-3 px-3 font-extrabold uppercase text-brand-900">
                      {row.mealLabel}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="red">Marked Not Coming</Badge>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-brand-900">
                      {row.expectedPlatesForMeal} plates
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {row.responded_at
                        ? new Date(row.responded_at).toLocaleTimeString(
                            'en-IN',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : 'Before cutoff'}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="green">100% Entitled</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Enrolled Hostel Roster (Real Database Count) */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-700" />
              <span>
                Enrolled Mess Students ({messStudents.length} Registered)
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Live roster from <code className="font-mono">public.students</code> for this mess. Every student defaults to Attending unless they mark &ldquo;Not Coming&rdquo; on a meal poll.
            </p>
          </div>
          <Badge variant="green">
            {totalRegisteredStudents} Enrolled
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase bg-cream-50">
                <th className="py-3 px-3">Student Name &amp; Roll ID</th>
                <th className="py-3 px-3">Hostel</th>
                <th className="py-3 px-3">Dietary Preference</th>
                <th className="py-3 px-3">Breakfast ({formatHumanDate(selectedDate)})</th>
                <th className="py-3 px-3">Lunch ({formatHumanDate(selectedDate)})</th>
                <th className="py-3 px-3">Dinner ({formatHumanDate(selectedDate)})</th>
                <th className="py-3 px-3">Meal Entitlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {messStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-slate-400 italic"
                  >
                    No students enrolled in this mess yet. Share your Mess Join Code from the Overview tab so students can join.
                  </td>
                </tr>
              ) : (
                messStudents.map((stu) => {
                  const stuId = stu.profile_id || stu.id;
                  const getStatusForMeal = (mType) => {
                    const optedOut = (attendanceResponses || []).some(
                      (r) =>
                        r.student_id === stuId &&
                        normalizeDateStr(r.meal_date || r.menu_date) ===
                          normalizeDateStr(selectedDate) &&
                        String(r.meal_type || '').toLowerCase() === mType &&
                        (r.status === 'not_coming' || r.will_attend === false)
                    );
                    return optedOut ? 'not_coming' : 'attending';
                  };

                  return (
                    <tr key={stu.id} className="hover:bg-cream-50/60">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">
                          {stu.full_name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {stu.student_roll_id}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {stu.hostel_name}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="neutral">
                          {stu.dietary_preference || 'Vegetarian'}
                        </Badge>
                      </td>
                      {['breakfast', 'lunch', 'dinner'].map((mType) => {
                        const st = getStatusForMeal(mType);
                        return (
                          <td key={mType} className="py-3 px-3">
                            {st === 'not_coming' ? (
                              <Badge variant="red">Marked Not Coming</Badge>
                            ) : (
                              <Badge variant="green">Attending (Default)</Badge>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 px-3">
                        <Badge variant="green">Active &amp; Guaranteed</Badge>
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
  );
}
