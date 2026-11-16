import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Users,
  CheckCircle2,
  ClipboardList,
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
import { useData } from '../../context/DataContext';
import {
  getTodayDateStr,
  addDaysToDateStr,
  normalizeDateStr,
  formatHumanDate,
} from '../../lib/dateUtils';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

const MEAL_ORDER = { breakfast: 1, lunch: 2, dinner: 3 };

export default function ReportsTab() {
  const {
    messProfile,
    menus,
    totalRegisteredStudents,
    attendanceResponses,
    attendanceRecords,
    wasteLogs,
    forecasts,
  } = useData();

  const todayStr = getTodayDateStr();
  const [rangePreset, setRangePreset] = useState('weekly'); // 'daily' | 'weekly' | 'monthly'
  const [startDate, setStartDate] = useState(() => addDaysToDateStr(todayStr, -6));
  const [endDate, setEndDate] = useState(todayStr);
  const [downloadedMsg, setDownloadedMsg] = useState('');

  const handlePresetChange = (preset) => {
    setRangePreset(preset);
    if (preset === 'daily') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'weekly') {
      setStartDate(addDaysToDateStr(todayStr, -6));
      setEndDate(todayStr);
    } else if (preset === 'monthly') {
      setStartDate(addDaysToDateStr(todayStr, -29));
      setEndDate(todayStr);
    }
  };

  // Build real meal-by-meal attendance rows for the owner's mess within [startDate, endDate]
  const reportRows = useMemo(() => {
    const hasAnyMessActivity =
      menus.length > 0 ||
      attendanceResponses.length > 0 ||
      wasteLogs.length > 0 ||
      (attendanceRecords || []).length > 0;

    if (!hasAnyMessActivity) {
      return [];
    }

    const slotSet = new Set();

    // Collect real dates & meals from menus, poll responses, waste logs, and attendance records
    (menus || []).forEach((m) => {
      const d = normalizeDateStr(m.menu_date);
      const meal = String(m.meal_type || 'lunch').toLowerCase();
      if (d) slotSet.add(`${d}_${meal}`);
    });

    (attendanceResponses || []).forEach((r) => {
      const d = normalizeDateStr(r.meal_date || r.menu_date);
      const meal = String(r.meal_type || 'lunch').toLowerCase();
      if (d) slotSet.add(`${d}_${meal}`);
    });

    (wasteLogs || []).forEach((w) => {
      const d = normalizeDateStr(w.log_date);
      const meal = String(w.meal_type || 'lunch').toLowerCase();
      if (d) slotSet.add(`${d}_${meal}`);
    });

    (attendanceRecords || []).forEach((a) => {
      const d = normalizeDateStr(a.record_date);
      const meal = String(a.meal_type || 'lunch').toLowerCase();
      if (d) slotSet.add(`${d}_${meal}`);
    });

    const enrolledDefault = Number(totalRegisteredStudents || 0);
    const guestBufferPct = Number(
      messProfile.guest_buffer_pct ?? messProfile.walk_in_buffer_pct ?? 5
    );
    const safetyBufferPct = Number(messProfile.safety_buffer_pct ?? 5);

    const rows = [];

    Array.from(slotSet).forEach((key) => {
      const [dateStr, mealType] = key.split('_');
      if (!dateStr || !mealType) return;
      if (startDate && dateStr < startDate) return;
      if (endDate && dateStr > endDate) return;

      const matchingForecast = (forecasts || []).find(
        (f) =>
          normalizeDateStr(f.forecast_date) === dateStr &&
          String(f.meal_type || '').toLowerCase() === mealType
      );

      const matchingAttRec = (attendanceRecords || []).find(
        (a) =>
          normalizeDateStr(a.record_date) === dateStr &&
          String(a.meal_type || '').toLowerCase() === mealType
      );

      const matchingWasteLog = (wasteLogs || []).find(
        (w) =>
          normalizeDateStr(w.log_date) === dateStr &&
          String(w.meal_type || '').toLowerCase() === mealType
      );

      const pollNotComingCount = (attendanceResponses || []).filter(
        (r) =>
          normalizeDateStr(r.meal_date || r.menu_date) === dateStr &&
          String(r.meal_type || '').toLowerCase() === mealType &&
          (r.status === 'not_coming' || r.will_attend === false)
      ).length;

      const enrolled =
        matchingAttRec?.total_registered !== undefined &&
        Number(matchingAttRec.total_registered) > 0
          ? Number(matchingAttRec.total_registered)
          : enrolledDefault;

      const notComing =
        pollNotComingCount > 0
          ? pollNotComingCount
          : Number(matchingAttRec?.not_coming_count || 0);

      const guestBufferPlates = Math.round(enrolled * (guestBufferPct / 100));
      const expectedPlates =
        matchingForecast?.expected_plates ??
        (matchingAttRec?.expected_plates
          ? Number(matchingAttRec.expected_plates)
          : Math.max(0, enrolled - notComing + guestBufferPlates));

      const recommendedPrepPlates =
        matchingForecast?.overridden_prep_plates ??
        matchingForecast?.recommended_prep_plates ??
        Math.ceil(expectedPlates * (1 + safetyBufferPct / 100));

      const platesPrepared =
        matchingWasteLog?.plates_prepared !== undefined
          ? Number(matchingWasteLog.plates_prepared)
          : matchingAttRec?.plates_prepared
          ? Number(matchingAttRec.plates_prepared)
          : recommendedPrepPlates;

      const platesServedLogged =
        matchingWasteLog?.plates_served !== undefined &&
        Number(matchingWasteLog.plates_served) > 0
          ? Number(matchingWasteLog.plates_served)
          : matchingForecast?.actual_served_plates !== null &&
            matchingForecast?.actual_served_plates !== undefined
          ? Number(matchingForecast.actual_served_plates)
          : matchingAttRec?.plates_served && Number(matchingAttRec.plates_served) > 0
          ? Number(matchingAttRec.plates_served)
          : matchingAttRec?.actual_attended_count &&
            Number(matchingAttRec.actual_attended_count) > 0
          ? Number(matchingAttRec.actual_attended_count)
          : null;

      // Attendance rate: based on platesServedLogged if logged, else expected attending students (enrolled - notComing)
      const effectiveAttended =
        platesServedLogged !== null
          ? platesServedLogged
          : Math.max(0, enrolled - notComing);

      const attendanceRatePct =
        enrolled > 0
          ? Number(
              Math.min(100, (effectiveAttended / enrolled) * 100).toFixed(1)
            )
          : 0;

      const mealLabel =
        mealType.charAt(0).toUpperCase() + mealType.slice(1);

      rows.push({
        id: key,
        dateStr,
        humanDate: formatHumanDate(dateStr),
        mealType,
        mealLabel,
        chartLabel: `${dateStr.slice(5)} ${mealLabel.slice(0, 1)}`,
        enrolledStudents: enrolled,
        markedNotComing: notComing,
        expectedPlates,
        platesPrepared,
        platesServed: platesServedLogged,
        attendanceRatePct,
      });
    });

    return rows.sort((a, b) => {
      if (a.dateStr !== b.dateStr) return b.dateStr.localeCompare(a.dateStr);
      return (MEAL_ORDER[a.mealType] || 2) - (MEAL_ORDER[b.mealType] || 2);
    });
  }, [
    menus,
    attendanceResponses,
    attendanceRecords,
    wasteLogs,
    forecasts,
    totalRegisteredStudents,
    messProfile,
    startDate,
    endDate,
  ]);

  // Compute summary totals across filtered rows
  const summary = useMemo(() => {
    if (reportRows.length === 0) {
      return {
        avgEnrolled: 0,
        totalNotComing: 0,
        totalExpectedPlates: 0,
        totalPlatesPrepared: 0,
        totalPlatesServed: 0,
        loggedServedCount: 0,
        avgAttendanceRatePct: 0,
      };
    }

    const totalEnrolled = reportRows.reduce((s, r) => s + r.enrolledStudents, 0);
    const totalNotComing = reportRows.reduce((s, r) => s + r.markedNotComing, 0);
    const totalExpectedPlates = reportRows.reduce(
      (s, r) => s + r.expectedPlates,
      0
    );
    const totalPlatesPrepared = reportRows.reduce(
      (s, r) => s + r.platesPrepared,
      0
    );
    const loggedRows = reportRows.filter((r) => r.platesServed !== null);
    const totalPlatesServed = loggedRows.reduce(
      (s, r) => s + Number(r.platesServed || 0),
      0
    );
    const avgAttendanceRatePct = Number(
      (
        reportRows.reduce((s, r) => s + r.attendanceRatePct, 0) /
        reportRows.length
      ).toFixed(1)
    );

    return {
      avgEnrolled: Math.round(totalEnrolled / reportRows.length),
      totalNotComing,
      totalExpectedPlates,
      totalPlatesPrepared,
      totalPlatesServed,
      loggedServedCount: loggedRows.length,
      avgAttendanceRatePct,
    };
  }, [reportRows]);

  // Chart data in chronological order
  const chartData = useMemo(
    () =>
      reportRows
        .slice()
        .reverse()
        .map((r) => ({
          slot: r.chartLabel,
          expectedPlates: r.expectedPlates,
          platesPrepared: r.platesPrepared,
          platesServed: r.platesServed ?? 0,
        })),
    [reportRows]
  );

  const handleDownloadCsv = () => {
    if (reportRows.length === 0) return;

    const headers = [
      'Date',
      'Meal',
      'Enrolled Students',
      'Students Marked Not Coming',
      'Expected Plates',
      'Plates Prepared',
      'Plates Served',
      'Attendance Rate (%)',
    ];

    const dataLines = reportRows.map((r) => [
      r.dateStr,
      r.mealLabel,
      r.enrolledStudents,
      r.markedNotComing,
      r.expectedPlates,
      r.platesPrepared,
      r.platesServed !== null ? r.platesServed : 'Not logged',
      `${r.attendanceRatePct}%`,
    ]);

    const summaryLine = [
      'SUMMARY / TOTAL',
      `${reportRows.length} Meals`,
      summary.avgEnrolled,
      summary.totalNotComing,
      summary.totalExpectedPlates,
      summary.totalPlatesPrepared,
      summary.loggedServedCount > 0 ? summary.totalPlatesServed : 'Not logged',
      `${summary.avgAttendanceRatePct}%`,
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...dataLines.map((line) => line.join(',')),
        summaryLine.join(','),
      ].join('\n');

    const filename = `Mealwise_Attendance_Report_${startDate}_to_${endDate}.csv`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadedMsg(filename);
    setTimeout(() => setDownloadedMsg(''), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {downloadedMsg && (
        <div className="p-4 rounded-xl bg-brand-900 text-white text-xs font-semibold flex items-center gap-2 shadow-lg print:hidden">
          <CheckCircle2 className="w-4 h-4 text-brand-300" />
          <span>Downloaded Attendance Report CSV: {downloadedMsg}</span>
        </div>
      )}

      {/* Report Header & Controls */}
      <Card className="p-5 space-y-4 print:shadow-none print:border-slate-300">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Mess Attendance Report • {messProfile.name || 'Your Mess'}</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Meal Attendance &amp; Plate Turnout Report
            </h2>
            <p className="text-xs text-slate-500">
              Real attendance data for {messProfile.name || 'your mess'} showing enrolled students, &ldquo;Not Coming&rdquo; poll counts, expected plates, plates prepared, plates served, and attendance rate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button
              size="sm"
              variant="secondary"
              icon={Printer}
              disabled={reportRows.length === 0}
              onClick={handlePrint}
            >
              Print View
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Download}
              disabled={reportRows.length === 0}
              onClick={handleDownloadCsv}
            >
              Download CSV
            </Button>
          </div>
        </div>

        {/* Date Range Filter (Daily, Weekly, Monthly + Custom Dates) */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="inline-flex items-center gap-1.5 bg-cream-50 p-1 rounded-xl border border-slate-200">
            {[
              { id: 'daily', label: 'Daily View' },
              { id: 'weekly', label: 'Weekly View (7d)' },
              { id: 'monthly', label: 'Monthly View (30d)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handlePresetChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  rangePreset === tab.id
                    ? 'bg-brand-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-700" />
              <span className="font-semibold text-slate-600">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setRangePreset('custom');
                }}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-800"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setRangePreset('custom');
                }}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>
      </Card>

      {reportRows.length === 0 ? (
        /* Clear Empty State when there is no data yet */
        <Card className="p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mx-auto">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No Attendance Data for Selected Date Range
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            There are no scheduled meals, attendance poll responses, or logged plate batches for{' '}
            <strong>{messProfile.name || 'your mess'}</strong> between{' '}
            <strong>{startDate}</strong> and <strong>{endDate}</strong>. Publish a weekly menu or expand the date filter to view attendance records.
          </p>
        </Card>
      ) : (
        <>
          {/* Simple Attendance & Plates Chart */}
          <Card className="p-5 space-y-4 print:shadow-none print:border-slate-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Expected Plates vs. Plates Prepared &amp; Served
                </h3>
                <p className="text-xs text-slate-500">
                  Meal-by-meal plate comparison across {reportRows.length} meal session(s)
                </p>
              </div>
              <Badge variant="green">
                Avg Attendance Rate: {summary.avgAttendanceRatePct}%
              </Badge>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="slot"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#475569' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    formatter={(val, name) => [`${val} plates`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar
                    dataKey="expectedPlates"
                    name="Expected Plates"
                    fill="#1f5440"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="platesPrepared"
                    name="Plates Prepared"
                    fill="#64a88b"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="platesServed"
                    name="Plates Served (Logged)"
                    fill="#0f766e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Attendance Report Table with Summary Row */}
          <Card className="p-0 overflow-hidden print:shadow-none print:border-slate-300">
            <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Attendance Report Table ({startDate} to {endDate})
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {reportRows.length} meal session(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-cream-100 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Meal</th>
                    <th className="py-3 px-4">Enrolled Students</th>
                    <th className="py-3 px-4">Marked &ldquo;Not Coming&rdquo;</th>
                    <th className="py-3 px-4">Expected Plates</th>
                    <th className="py-3 px-4">Plates Prepared</th>
                    <th className="py-3 px-4">Plates Served</th>
                    <th className="py-3 px-4">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportRows.map((row) => (
                    <tr key={row.id} className="hover:bg-cream-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {row.humanDate}
                      </td>
                      <td className="py-3 px-4 font-bold uppercase text-brand-800">
                        {row.mealLabel}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {row.enrolledStudents.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-bold text-rose-700">
                        {row.markedNotComing.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-brand-900">
                        {row.expectedPlates.toLocaleString('en-IN')} plates
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {row.platesPrepared.toLocaleString('en-IN')} plates
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-800">
                        {row.platesServed !== null ? (
                          `${row.platesServed.toLocaleString('en-IN')} plates`
                        ) : (
                          <span className="text-slate-400 italic">Not logged</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            row.attendanceRatePct >= 85 ? 'green' : 'amber'
                          }
                        >
                          {row.attendanceRatePct}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-brand-50/90 border-t-2 border-brand-200 font-extrabold text-slate-900">
                    <td className="py-3.5 px-4" colSpan={2}>
                      SUMMARY ({reportRows.length} Meals)
                    </td>
                    <td className="py-3.5 px-4">
                      {summary.avgEnrolled.toLocaleString('en-IN')} avg
                    </td>
                    <td className="py-3.5 px-4 text-rose-800">
                      {summary.totalNotComing.toLocaleString('en-IN')} total
                    </td>
                    <td className="py-3.5 px-4 text-brand-900">
                      {summary.totalExpectedPlates.toLocaleString('en-IN')} plates
                    </td>
                    <td className="py-3.5 px-4">
                      {summary.totalPlatesPrepared.toLocaleString('en-IN')} plates
                    </td>
                    <td className="py-3.5 px-4 text-emerald-900">
                      {summary.loggedServedCount > 0
                        ? `${summary.totalPlatesServed.toLocaleString('en-IN')} plates`
                        : 'Not logged'}
                    </td>
                    <td className="py-3.5 px-4 text-brand-900">
                      {summary.avgAttendanceRatePct}% avg
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
