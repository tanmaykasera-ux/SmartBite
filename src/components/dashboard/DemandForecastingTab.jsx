import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Scale,
  Edit3,
  CheckCircle2,
  ShieldCheck,
  Info,
  Lightbulb,
  CalendarPlus,
  AlertTriangle,
  Users,
  Utensils,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
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

export default function DemandForecastingTab({ onNavigateTab }) {
  const {
    menus,
    forecasts,
    dataSufficiency,
    smartRecommendations,
    holidaysEvents,
    overrideForecast,
    recordActualForecastOutcome,
    addHolidayEvent,
    historicalSelections,
  } = useData();

  const [mealFilter, setMealFilter] = useState('all');
  const [editingForecastId, setEditingForecastId] = useState(null);
  const [overrideVal, setOverrideVal] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [outcomeForecastId, setOutcomeForecastId] = useState(null);
  const [actualOutcomeVal, setActualOutcomeVal] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    event_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    event_name: '',
    event_type: 'exam_week',
    expected_attendance_impact_pct: -15,
  });
  const [savedBanner, setSavedBanner] = useState('');

  const filteredForecasts = forecasts.filter(
    (f) => mealFilter === 'all' || f.meal_type === mealFilter
  );

  const handleStartOverride = (fc) => {
    setEditingForecastId(fc.id);
    setOverrideVal(String(fc.overridden_prep_kg ?? fc.recommended_prep_kg));
    setOverrideReason(
      fc.override_reason || 'Chef batch adjustment for campus schedule'
    );
  };

  const handleSaveOverride = async (fcId) => {
    if (!overrideVal || Number(overrideVal) <= 0) return;
    await overrideForecast(fcId, Number(overrideVal), overrideReason);
    setEditingForecastId(null);
    setSavedBanner(
      'Chef preparation override saved and synced to Purchase Planning.'
    );
  };

  const handleSaveActualOutcome = async (fcId) => {
    if (!actualOutcomeVal || Number(actualOutcomeVal) < 0) return;
    await recordActualForecastOutcome(fcId, Number(actualOutcomeVal));
    setOutcomeForecastId(null);
    setActualOutcomeVal('');
    setSavedBanner(
      'Recorded actual consumption outcome! Future statistical forecasts are now calibrated with this data point.'
    );
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.event_name.trim()) return;
    await addHolidayEvent(eventForm);
    setShowEventForm(false);
    setEventForm({
      event_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      event_name: '',
      event_type: 'exam_week',
      expected_attendance_impact_pct: -15,
    });
    setSavedBanner(
      'Added campus holiday/event modifier to Demand Forecasting engine.'
    );
  };

  const historicalDemandSeries = historicalSelections.map((d) => ({
    day: d.date,
    selectedStudents: d.lunchSelected,
    nonResponderWalkIns: d.unpolledWalkIns,
    predictedAttendance: d.lunchSelected + d.unpolledWalkIns,
    registeredCapacity: d.registered,
  }));

  return (
    <div className="space-y-6">
      {/* Top Statistical Transparency & Data Sufficiency Banner */}
      <Card className="p-5 bg-brand-950 text-white border-brand-900 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="dark" icon={BrainCircuit}>
                Transparent Statistical Forecasting Engine
              </Badge>
              <Badge
                variant={dataSufficiency?.isSufficient ? 'green' : 'amber'}
                icon={Sparkles}
              >
                {dataSufficiency?.statusLabel || 'Insufficient data'}
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-white pt-1">
              Food Demand Prediction &amp; Non-Responding Student Estimator
            </h2>
            <p className="text-xs text-brand-200 max-w-3xl leading-relaxed">
              Analyzes previous meal selections, historical attendance (
              {dataSufficiency?.historyDays || 0} days), waste logs (
              {dataSufficiency?.wasteLogsCount || 0} batches), day-of-week factors, and campus events.{' '}
              <strong className="text-white">
                Missing student selections are never assumed to skip—walk-in attendance is statistically estimated so every student retains 100% meal entitlement.
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              icon={CalendarPlus}
              iconPosition="left"
              onClick={() => setShowEventForm(!showEventForm)}
            >
              + Holiday / Campus Event
            </Button>
            <div className="inline-flex rounded-xl bg-brand-900 p-1 border border-brand-800 text-xs">
              {['all', 'breakfast', 'lunch', 'dinner'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMealFilter(m)}
                  className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all ${
                    mealFilter === m
                      ? 'bg-brand-700 text-white'
                      : 'text-brand-300 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!dataSufficiency?.isSufficient && (
          <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <span>
                <strong>Insufficient data:</strong> Statistical demand forecasting requires registered students, published menus, and at least 5 historical batch/attendance records ({dataSufficiency?.totalDataPoints || 0}/5 recorded so far).
              </span>
            </div>
            {onNavigateTab && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigateTab('menus')}
                >
                  Create Menus
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigateTab('waste')}
                >
                  Log Batch History
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {savedBanner && (
        <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
          <span>{savedBanner}</span>
        </div>
      )}

      {/* Add Holiday / Special Event Modal Form */}
      {showEventForm && (
        <Card className="p-5 border-2 border-brand-700 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Add Holiday, Exam Week, or Campus Event Demand Modifier
          </h3>
          <form
            onSubmit={handleAddEvent}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={eventForm.event_date}
                onChange={(e) =>
                  setEventForm({ ...eventForm, event_date: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                required
                value={eventForm.event_name}
                onChange={(e) =>
                  setEventForm({ ...eventForm, event_name: e.target.value })
                }
                placeholder="e.g., Semester End Holiday"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Attendance Impact (%)
              </label>
              <input
                type="number"
                min={-80}
                max={50}
                value={eventForm.expected_attendance_impact_pct}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    expected_attendance_impact_pct: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full"
              >
                Apply Modifier
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowEventForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* FEATURE 5: Smart Operational Recommendations Panel */}
      <Card className="p-5 space-y-4 border-brand-200 bg-gradient-to-r from-brand-50/60 via-white to-cream-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-800 text-white flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Smart Operational Recommendations (Data-Driven Insights)
              </h3>
              <p className="text-[11px] text-slate-500">
                Generated automatically from your live inventory expiry dates, waste logs, and day-of-week consumption
              </p>
            </div>
          </div>
          <Badge variant="green">
            {smartRecommendations.length} Active Insights
          </Badge>
        </div>

        {smartRecommendations.length === 0 ? (
          <div className="p-6 rounded-xl bg-white border border-dashed border-slate-300 text-center text-xs text-slate-500">
            Insufficient operational data to generate recommendations yet. Add menus, inventory items, and waste logs to receive smart insights.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {smartRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2.5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant={
                        rec.severity === 'high'
                          ? 'amber'
                          : rec.severity === 'medium'
                          ? 'green'
                          : 'neutral'
                      }
                    >
                      {rec.category}
                    </Badge>
                    <span className="text-[11px] font-bold text-brand-800">
                      {rec.metric}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{rec.title}</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    &ldquo;{rec.suggestion}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Dish-Wise Forecast, Non-Responder Estimation & Override Table */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-brand-700" />
              Dish-Level Demand Prediction, Non-Responder Walk-In Buffer &amp; Overrides
            </h3>
            <p className="text-xs text-slate-500">
              Override recommended preparation quantities or record actual post-meal consumption to calibrate future predictions
            </p>
          </div>
          <Badge variant="green" icon={ShieldCheck}>
            Entitlement Safe
          </Badge>
        </div>

        {menus.length === 0 || filteredForecasts.length === 0 ? (
          <div className="p-10 rounded-2xl bg-cream-50 border border-dashed border-slate-300 text-center space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                Insufficient data — No menus or forecastable dishes yet
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Create your first menu and record at least 5 meal batches or attendance logs so SmartBite can compute dish-level demand forecasts.
              </p>
            </div>
            {onNavigateTab && (
              <Button
                variant="primary"
                size="sm"
                icon={Utensils}
                onClick={() => onNavigateTab('menus')}
              >
                Create Your First Menu
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                  <th className="py-3.5 px-4">Meal, Dish &amp; Assumptions</th>
                  <th className="py-3.5 px-4">Polled Selections</th>
                  <th className="py-3.5 px-4">Non-Responding Est.</th>
                  <th className="py-3.5 px-4">Expected Attendance</th>
                  <th className="py-3.5 px-4">Recommended Prep (kg)</th>
                  <th className="py-3.5 px-4">Confidence (± kg)</th>
                  <th className="py-3.5 px-4">Chef Override &amp; Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredForecasts.map((fc) => {
                  const isEditing = editingForecastId === fc.id;
                  const isRecordingOutcome = outcomeForecastId === fc.id;
                  const finalPrepKg =
                    fc.overridden_prep_kg ?? fc.recommended_prep_kg;
                  return (
                    <tr key={fc.id} className="hover:bg-cream-50/70">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-800 border border-brand-200">
                            {fc.meal_type}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {fc.forecast_date} ({fc.day_of_week_label})
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 mt-1 text-sm">
                          {fc.dish_name}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-start gap-1 mt-0.5">
                          <Info className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                          <span>{fc.assumptions}</span>
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">
                          {fc.student_selections_count}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Submitted Poll
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        {fc.insufficient_data ? (
                          <Badge variant="amber">Insufficient data</Badge>
                        ) : (
                          <>
                            <div className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Users className="w-3 h-3" /> +
                              {fc.walk_in_buffer_count} walk-ins
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              From {fc.non_responding_students} unpolled students
                            </p>
                          </>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {fc.insufficient_data ? (
                          <span className="text-xs font-bold text-amber-800">
                            Insufficient data
                          </span>
                        ) : (
                          <>
                            <p className="text-sm font-extrabold text-brand-900">
                              {fc.expected_attendance}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              of {fc.registered_students} entitled
                            </p>
                          </>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input
                              type="number"
                              step="0.5"
                              value={overrideVal}
                              onChange={(e) => setOverrideVal(e.target.value)}
                              className="w-24 px-2 py-1 rounded border border-brand-600 text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={overrideReason}
                              onChange={(e) =>
                                setOverrideReason(e.target.value)
                              }
                              placeholder="Reason..."
                              className="w-36 block px-2 py-1 rounded border border-slate-200 text-[11px]"
                            />
                          </div>
                        ) : fc.insufficient_data && !fc.overridden_prep_kg ? (
                          <Badge variant="amber">Insufficient data</Badge>
                        ) : (
                          <div>
                            <span className="text-sm font-extrabold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                              {finalPrepKg} kg
                            </span>
                            {!fc.insufficient_data && (
                              <p className="text-[10px] text-slate-500 mt-1">
                                Model Raw Demand: {fc.predicted_quantity_kg} kg
                              </p>
                            )}
                            {fc.overridden_prep_kg && (
                              <p className="text-[10px] text-amber-700 font-semibold">
                                Overridden ({fc.override_reason})
                              </p>
                            )}
                            {fc.actual_outcome_kg !== null && (
                              <p className="text-[10px] text-emerald-700 font-bold">
                                Actual Outcome: {fc.actual_outcome_kg} kg
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {fc.insufficient_data ? (
                          <Badge variant="neutral">Insufficient data</Badge>
                        ) : (
                          <>
                            <Badge variant="green">
                              {fc.confidence_score}% Conf.
                            </Badge>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Uncertainty: ±{fc.uncertainty_margin_kg} kg
                            </p>
                          </>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleSaveOverride(fc.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingForecastId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : isRecordingOutcome ? (
                          <div className="space-y-1.5">
                            <input
                              type="number"
                              step="0.5"
                              placeholder="Actual kg..."
                              value={actualOutcomeVal}
                              onChange={(e) =>
                                setActualOutcomeVal(e.target.value)
                              }
                              className="w-24 px-2 py-1 rounded border border-brand-600 text-xs font-bold"
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleSaveActualOutcome(fc.id)}
                              >
                                Log
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setOutcomeForecastId(null)}
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartOverride(fc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-brand-600 text-[11px] font-semibold text-slate-700 hover:text-brand-800"
                            >
                              <Edit3 className="w-3 h-3" /> Override Prep
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOutcomeForecastId(fc.id);
                                setActualOutcomeVal(
                                  String(fc.predicted_quantity_kg || 0)
                                );
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-brand-50 text-[11px] font-semibold text-brand-800"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Record Outcome
                            </button>
                          </div>
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

      {/* Historical Demand & Non-Responding Walk-In Chart */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Polled Selections vs. Non-Responding Student Walk-Ins
            </h3>
            <p className="text-xs text-slate-500">
              Visualizes how SmartBite combines active student selections with historical non-responder attendance
            </p>
          </div>
          {holidaysEvents.length > 0 && (
            <Badge variant="amber">
              {holidaysEvents.length} Upcoming Event Modifiers Active
            </Badge>
          )}
        </div>

        {historicalDemandSeries.length === 0 ? (
          <div className="h-64 w-full rounded-2xl bg-cream-50 border border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center space-y-2">
            <p className="text-xs font-bold text-slate-800">
              Insufficient historical attendance data
            </p>
            <p className="text-xs text-slate-500 max-w-md">
              This chart will populate automatically once daily attendance and meal selection history is recorded for your mess.
            </p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={historicalDemandSeries}
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
                  dataKey="selectedStudents"
                  stackId="a"
                  name="Students Who Selected Meal"
                  fill="#1f5440"
                />
                <Bar
                  dataKey="nonResponderWalkIns"
                  stackId="a"
                  name="Estimated Non-Responding Walk-Ins (Entitled)"
                  fill="#64a88b"
                  radius={[6, 6, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="registeredCapacity"
                  name="Total Registered Students"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
