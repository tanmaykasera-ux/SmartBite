import React, { useState } from 'react';
import {
  BrainCircuit,
  Sliders,
  CheckCircle2,
  Info,
  X,
  Save,
  CalendarPlus,
  ClipboardCheck,
  AlertTriangle,
  Calculator,
  Utensils,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import {
  getTodayDateStr,
  formatHumanDate,
  normalizeDateStr,
} from '../../lib/dateUtils';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function DemandForecastingTab({ onNavigateTab }) {
  const {
    forecasts,
    dataSufficiency,
    messProfile,
    totalRegisteredStudents,
    overrideForecast,
    recordActualForecastOutcome,
    holidaysEvents,
    addHolidayEvent,
  } = useData();

  const [selectedMealFilter, setSelectedMealFilter] = useState('all');
  const [editingForecast, setEditingForecast] = useState(null);
  const [overridePlates, setOverridePlates] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  const [actualModalForecast, setActualModalForecast] = useState(null);
  const [actualPlatesValue, setActualPlatesValue] = useState('');

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    event_date: getTodayDateStr(),
    event_name: '',
    event_type: 'exam_week',
    expected_attendance_impact_pct: -12,
  });

  const [toast, setToast] = useState('');

  const filteredForecasts = (forecasts || []).filter(
    (f) => selectedMealFilter === 'all' || f.meal_type === selectedMealFilter
  );

  const openOverrideModal = (fc) => {
    setEditingForecast(fc);
    setOverridePlates(fc.overridden_prep_plates ?? fc.recommended_prep_plates);
    setOverrideReason(
      fc.override_reason || 'Chef manual plate adjustment for campus schedule'
    );
  };

  const handleSaveOverride = async (e) => {
    e.preventDefault();
    if (!editingForecast) return;
    await overrideForecast(
      editingForecast.id,
      Number(overridePlates),
      overrideReason
    );
    setToast(
      `Override saved for ${editingForecast.meal_type.toUpperCase()} (${formatHumanDate(
        editingForecast.forecast_date
      )}): ${overridePlates} plates`
    );
    setEditingForecast(null);
    setTimeout(() => setToast(''), 3500);
  };

  const openActualModal = (fc) => {
    setActualModalForecast(fc);
    setActualPlatesValue(
      fc.actual_served_plates ??
        fc.overridden_prep_plates ??
        fc.expected_plates
    );
  };

  const handleSaveActual = async (e) => {
    e.preventDefault();
    if (!actualModalForecast) return;
    await recordActualForecastOutcome(
      actualModalForecast.id,
      Number(actualPlatesValue)
    );
    setToast(
      `Recorded actual outcome (${actualPlatesValue} plates served) for ${actualModalForecast.meal_type.toUpperCase()} (${formatHumanDate(
        actualModalForecast.forecast_date
      )})`
    );
    setActualModalForecast(null);
    setTimeout(() => setToast(''), 3500);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    await addHolidayEvent(eventForm);
    setEventModalOpen(false);
    setToast(
      `Added schedule modifier "${eventForm.event_name}" (${eventForm.expected_attendance_impact_pct}% plate adjustment)`
    );
    setTimeout(() => setToast(''), 3500);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-4 rounded-xl bg-brand-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-300" />
            <span>{toast}</span>
          </div>
          <button type="button" onClick={() => setToast('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Insufficient Data / Historical Calibration Notice */}
      {!dataSufficiency.isSufficient && (
        <Card className="p-4 bg-amber-50 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                Insufficient Data for Historical Silent No-Show Deduction ({dataSufficiency.historicalDaysCount} / {dataSufficiency.minimumRequiredDays} Records)
              </p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                SmartBite never fabricates AI predictions when historical data is insufficient. Until at least {dataSufficiency.minimumRequiredDays} past meal records with actual plates served are logged, silent no-show deductions are set to <strong>0 plates</strong> and forecasts rely strictly on enrolled students minus poll opt-outs plus configured buffers.
              </p>
            </div>
          </div>
          <Badge variant="amber">Insufficient Data</Badge>
        </Card>
      )}

      {/* Formula & Model Banner */}
      <Card className="p-5 bg-gradient-to-r from-brand-950 via-brand-900 to-brand-800 text-white border-none">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-300">
              <Calculator className="w-4 h-4" />
              <span>Transparent Plate-Based Forecasting Formula</span>
            </div>
            <h2 className="text-lg font-extrabold">
              Meal-Level Plate Demand &amp; Recommended Preparation (Plates)
            </h2>
            <p className="text-xs text-brand-100/90 max-w-3xl leading-relaxed">
              <strong>Expected Plates per Meal</strong> = Enrolled Students ({totalRegisteredStudents}) &minus; Marked &ldquo;Not Coming&rdquo; (Poll) &minus; Estimated Silent No-Shows (from historical actual plates served vs. expected) + Guest Buffer ({messProfile.guest_buffer_pct ?? messProfile.walk_in_buffer_pct ?? 5}%).
              <br />
              <strong>Recommended Preparation (Plates)</strong> = Expected Plates + Safety Buffer ({messProfile.safety_buffer_pct ?? 5}%).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Badge
              variant={dataSufficiency.isSufficient ? 'green' : 'amber'}
            >
              {dataSufficiency.isSufficient
                ? `Calibrated (${dataSufficiency.historicalDaysCount} records)`
                : 'Insufficient Data (<5 records)'}
            </Badge>
            <Button
              size="sm"
              variant="secondary"
              icon={CalendarPlus}
              onClick={() => setEventModalOpen(true)}
            >
              Add Holiday / Exam Event
            </Button>
            {onNavigateTab && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onNavigateTab('reports')}
              >
                Attendance Report →
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Active Holidays & Campus Events Bar */}
      {holidaysEvents.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500">
            Active Schedule Modifiers:
          </span>
          {holidaysEvents.map((ev) => (
            <span
              key={ev.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold"
            >
              <span>
                {ev.event_name} ({formatHumanDate(ev.event_date)}):{' '}
                {ev.expected_attendance_impact_pct > 0 ? '+' : ''}
                {ev.expected_attendance_impact_pct}% plates
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200 shadow-2xs">
          {['all', 'breakfast', 'lunch', 'dinner'].map((meal) => (
            <button
              key={meal}
              type="button"
              onClick={() => setSelectedMealFilter(meal)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                selectedMealFilter === meal
                  ? 'bg-brand-800 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {meal === 'all' ? 'All Meals' : meal}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Info className="w-4 h-4 text-brand-700" />
          <span>
            Override recommended plates or log actual plates served after service to calibrate future forecasts.
          </span>
        </div>
      </div>

      {/* Plate Forecasting Table */}
      <Card className="p-0 overflow-hidden">
        {filteredForecasts.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Utensils className="w-10 h-10 text-brand-700 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900">
              No Enrolled Students or Scheduled Meals Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Once students enroll in your mess or you schedule menus in the Weekly Menu tab, meal-level plate forecasts will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream-100 border-b border-slate-200 text-slate-600 uppercase font-bold">
                  <th className="py-3.5 px-4">Date &amp; Meal</th>
                  <th className="py-3.5 px-4">Enrolled</th>
                  <th className="py-3.5 px-4">Marked Not Coming</th>
                  <th className="py-3.5 px-4">Est. Silent No-Shows</th>
                  <th className="py-3.5 px-4">Guest Buffer</th>
                  <th className="py-3.5 px-4">Expected Plates</th>
                  <th className="py-3.5 px-4">Confidence Range</th>
                  <th className="py-3.5 px-4">Recommended Prep (Plates)</th>
                  <th className="py-3.5 px-4">Actual Served</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredForecasts.map((fc) => {
                  const finalPrepPlates =
                    fc.overridden_prep_plates ?? fc.recommended_prep_plates;
                  return (
                    <tr key={fc.id} className="hover:bg-cream-50/70">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold uppercase text-brand-900">
                            {fc.meal_type}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {formatHumanDate(fc.forecast_date)} ({fc.day_name})
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 mt-0.5">
                          {fc.menu_title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs">
                          {fc.assumptions}
                        </p>
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-800">
                        {fc.enrolled_students}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-extrabold text-rose-700">
                          &minus;{fc.not_coming_count}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          Poll opt-outs
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {fc.insufficient_data ? (
                          <div>
                            <Badge variant="amber">Insufficient data</Badge>
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              0 deducted (&lt;5 records)
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-amber-800">
                              &minus;{fc.silent_no_shows_est} plates
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              ({fc.silent_no_show_rate_pct}% of non-responders)
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-brand-700">
                          +{fc.guest_buffer_plates} plates
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          ({fc.guest_buffer_pct}% walk-in/guest)
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-sm font-extrabold text-slate-900">
                          {fc.expected_plates} plates
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-700">
                          {fc.confidence_range_label}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-brand-900 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                            {finalPrepPlates} plates
                          </span>
                          {fc.overridden_prep_plates !== null && (
                            <Badge variant="amber">Overridden</Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Includes +{fc.safety_buffer_plates} safety buffer ({fc.safety_buffer_pct}%)
                        </p>
                        {fc.override_reason && (
                          <p className="text-[10px] text-amber-700 mt-0.5 font-medium">
                            Note: {fc.override_reason}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {fc.actual_served_plates !== null &&
                        fc.actual_served_plates !== undefined ? (
                          <div>
                            <span className="font-extrabold text-emerald-800">
                              {fc.actual_served_plates} plates
                            </span>
                            {fc.forecast_accuracy_pct !== null && (
                              <span className="block text-[10px] font-bold text-emerald-600">
                                {fc.forecast_accuracy_pct}% accuracy
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Not recorded
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={Sliders}
                            onClick={() => openOverrideModal(fc)}
                          >
                            Override
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={ClipboardCheck}
                            onClick={() => openActualModal(fc)}
                            title="Record Actual Plates Served"
                          >
                            Log Actual
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Override Prep Plates Modal */}
      {editingForecast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Override Recommended Preparation (Plates)
                </h3>
                <p className="text-xs text-slate-500">
                  {editingForecast.meal_type.toUpperCase()} •{' '}
                  {formatHumanDate(editingForecast.forecast_date)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingForecast(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOverride} className="space-y-4">
              <div className="p-3 rounded-xl bg-cream-50 border border-slate-200 text-xs flex justify-between">
                <span className="text-slate-600">
                  Formula Recommended Preparation:
                </span>
                <strong className="text-brand-800">
                  {editingForecast.recommended_prep_plates} plates
                </strong>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chef Override Quantity (Plates) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={overridePlates}
                  onChange={(e) => setOverridePlates(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Override Reason / Kitchen Note
                </label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingForecast(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" icon={Save}>
                  Confirm Plate Override
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Record Actual Plates Served Modal */}
      {actualModalForecast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Record Actual Plates Served
                </h3>
                <p className="text-xs text-slate-500">
                  {actualModalForecast.meal_type.toUpperCase()} •{' '}
                  {formatHumanDate(actualModalForecast.forecast_date)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActualModalForecast(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActual} className="space-y-4">
              <div className="p-3 rounded-xl bg-cream-50 border border-slate-200 text-xs flex justify-between">
                <span className="text-slate-600">Expected Plates:</span>
                <strong className="text-brand-800">
                  {actualModalForecast.expected_plates} plates
                </strong>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Actual Plates Served (Plates) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={actualPlatesValue}
                  onChange={(e) => setActualPlatesValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-900"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Recording actual plates served calibrates the silent no-show rate for future forecasts.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActualModalForecast(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" icon={Save}>
                  Save Actual Plates
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Holiday / Exam Event Modal */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Add Holiday / Campus Event Plate Modifier
              </h3>
              <button
                type="button"
                onClick={() => setEventModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event / Schedule Name *
                </label>
                <input
                  type="text"
                  required
                  value={eventForm.event_name}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, event_name: e.target.value })
                  }
                  placeholder="e.g., Long Weekend Exodus / Semester Exams"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={eventForm.event_date}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        event_date: normalizeDateStr(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Plate Turnout Impact (%)
                  </label>
                  <input
                    type="number"
                    required
                    value={eventForm.expected_attendance_impact_pct}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        expected_attendance_impact_pct: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEventModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Apply Schedule Modifier
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
