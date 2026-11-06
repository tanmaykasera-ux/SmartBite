import React, { useState } from 'react';
import {
  TrendingDown,
  Scale,
  IndianRupee,
  Plus,
  CheckCircle2,
  Percent,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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

export default function FoodWasteTab() {
  const { wasteLogs, wasteAnalytics, weeklySeries, addFoodWasteLog } = useData();
  const todayStr = new Date().toISOString().split('T')[0];

  const [logDate, setLogDate] = useState(todayStr);
  const [mealType, setMealType] = useState('lunch');
  const [dishName, setDishName] = useState('');
  const [preparedKg, setPreparedKg] = useState('');
  const [consumedKg, setConsumedKg] = useState('');
  const [leftoverKg, setLeftoverKg] = useState('');
  const [unitCostInr, setUnitCostInr] = useState('140');
  const [notes, setNotes] = useState('');
  const [savedNotice, setSavedNotice] = useState('');

  const handlePreparedChange = (val) => {
    setPreparedKg(val);
    const prep = Number(val || 0);
    const cons = Number(consumedKg || 0);
    if (val !== '' && consumedKg !== '' && prep >= cons) {
      setLeftoverKg(String(Number((prep - cons).toFixed(2))));
    }
  };

  const handleConsumedChange = (val) => {
    setConsumedKg(val);
    const prep = Number(preparedKg || 0);
    const cons = Number(val || 0);
    if (preparedKg !== '' && val !== '' && prep >= cons) {
      setLeftoverKg(String(Number((prep - cons).toFixed(2))));
    }
  };

  const livePrepared = Number(preparedKg || 0);
  const liveLeftover = Number(leftoverKg || 0);
  const liveUnitCost = Number(unitCostInr || 0);
  const liveWastePercentage =
    livePrepared > 0
      ? ((liveLeftover / livePrepared) * 100).toFixed(2)
      : '0.00';
  const liveEstimatedWasteCost = Math.round(liveLeftover * liveUnitCost);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (livePrepared <= 0) return;

    await addFoodWasteLog({
      log_date: logDate,
      meal_type: mealType,
      dish_name: dishName.trim() || `${mealType.toUpperCase()} Full Batch`,
      prepared_kg: livePrepared,
      consumed_kg: Number(consumedKg || 0),
      leftover_kg: liveLeftover,
      unit_cost_inr: liveUnitCost,
      notes,
    });

    setSavedNotice(
      `Logged ${liveLeftover} kg leftover (${liveWastePercentage}% waste, ₹${liveEstimatedWasteCost.toLocaleString(
        'en-IN'
      )}) for ${mealType.toUpperCase()}.`
    );
    setDishName('');
    setPreparedKg('');
    setConsumedKg('');
    setLeftoverKg('');
    setNotes('');
  };

  const {
    totalPreparedKg = 0,
    totalLeftoverKg = 0,
    totalFinancialLossInr = 0,
    overallWastePct = 0,
    dishWasteRanking = [],
    highWasteDishes = [],
  } = wasteAnalytics || {};

  return (
    <div className="space-y-6">
      {/* Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-brand-700" /> Total Prepared Logged
          </span>
          <p className="text-2xl font-extrabold text-slate-900">
            {totalPreparedKg.toFixed(1)} kg
          </p>
          <p className="text-[11px] text-brand-700 font-semibold">
            Across {wasteLogs.length} recorded meal batches
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-amber-600" /> Total Leftover
            Waste
          </span>
          <p className="text-2xl font-extrabold text-slate-900">
            {totalLeftoverKg.toFixed(1)} kg
          </p>
          <p className="text-[11px] text-slate-500">
            Wet-bin &amp; counter leftovers
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-brand-700" /> Overall Waste
            Percentage
          </span>
          <p className="text-2xl font-extrabold text-brand-800">
            {overallWastePct}%
          </p>
          <p className="text-[11px] text-brand-700 font-semibold">
            Target &lt; 5.0% of prepared food
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-amber-700" /> Estimated
            Financial Loss
          </span>
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{totalFinancialLossInr.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500">
            Calculated from ingredient unit costs
          </p>
        </Card>
      </div>

      {/* High-Waste Dish Identification Banner (FEATURE 3) */}
      {highWasteDishes.length > 0 && (
        <Card className="p-4 bg-amber-50/80 border-amber-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              Waste Analytics: Dishes Generating Excess Leftovers (&ge;4.5%
              Waste)
            </span>
            <Badge variant="amber">{highWasteDishes.length} Flagged</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {highWasteDishes.map((d) => (
              <div
                key={d.dish_name}
                className="p-3 rounded-xl bg-white border border-amber-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{d.dish_name}</p>
                  <p className="text-[11px] text-slate-500">
                    {d.leftover_kg.toFixed(1)} kg leftover out of{' '}
                    {d.prepared_kg.toFixed(1)} kg prepared
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-amber-800">
                    {d.waste_pct}% Waste
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Loss: ₹{Math.round(d.total_cost_inr).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Staff Waste Entry Form + Daily/Weekly Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-5 p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-brand-700" />
              Log Daily Kitchen Food Waste
            </h2>
            <p className="text-xs text-slate-500">
              Enter prepared, consumed, and leftover kilograms to auto-compute waste % and financial loss
            </p>
          </div>

          {savedNotice && (
            <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
              <span>{savedNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meal Session *
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-700"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dish or Batch Name
              </label>
              <input
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="e.g., Palak Paneer, Dal & Jeera Rice Batch"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prepared (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0.1}
                  required
                  placeholder="0.0"
                  value={preparedKg}
                  onChange={(e) => handlePreparedChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consumed (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  required
                  placeholder="0.0"
                  value={consumedKg}
                  onChange={(e) => handleConsumedChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Leftover (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  required
                  placeholder="0.0"
                  value={leftoverKg}
                  onChange={(e) => setLeftoverKg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/40 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Food / Ingredient Cost per Kg (₹/kg) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={unitCostInr}
                onChange={(e) => setUnitCostInr(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>

            {/* Live Automatic Calculation Preview Box */}
            <div className="p-3.5 rounded-xl bg-brand-950 text-white grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-brand-300">
                  Auto Waste Percentage
                </p>
                <p className="text-xl font-extrabold text-white mt-0.5">
                  {liveWastePercentage}%
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-brand-300">
                  Auto Estimated Financial Loss
                </p>
                <p className="text-xl font-extrabold text-amber-300 mt-0.5">
                  ₹{liveEstimatedWasteCost.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Staff Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional note on why leftover occurred..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              icon={Plus}
            >
              Record Waste Log &amp; Update Analytics
            </Button>
          </form>
        </Card>

        {/* Right Column: Daily & Weekly Waste Trend Charts */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Weekly Waste Quantity (kg)
                </h3>
                <p className="text-xs text-slate-500">
                  Automatically updates as kitchen staff log daily meal batches
                </p>
              </div>
              <Badge variant={weeklySeries.length > 0 ? 'green' : 'neutral'}>
                {weeklySeries.length > 0 ? 'Live Analytics' : 'No Logs Yet'}
              </Badge>
            </div>
            {weeklySeries.length === 0 ? (
              <div className="h-64 w-full rounded-2xl bg-cream-50 border border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center space-y-2">
                <p className="text-xs font-bold text-slate-800">
                  No food waste logs recorded yet
                </p>
                <p className="text-xs text-slate-500 max-w-xs">
                  Use the form on the left to record your first meal batch and view weekly waste trends.
                </p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
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
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      unit=" kg"
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area
                      type="monotone"
                      dataKey="wasteKg"
                      name="Actual Logged Waste (kg)"
                      stroke="#1f5440"
                      fill="#c1dfd0"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Daily Waste Financial Loss Breakdown (₹ INR)
            </h3>
            {weeklySeries.length === 0 ? (
              <div className="h-52 w-full rounded-2xl bg-cream-50 border border-dashed border-slate-300 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-xs text-slate-500">
                  Financial loss bars will appear once waste batches are recorded.
                </p>
              </div>
            ) : (
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklySeries}
                    margin={{ top: 5, right: 12, left: 0, bottom: 0 }}
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
                    <Bar
                      dataKey="wasteCostInr"
                      name="Estimated Waste Loss (₹)"
                      fill="#2f7057"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Logged Food Waste Ledger Table */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Recorded Food Waste Ledger ({dishWasteRanking.length} Distinct
            Batches)
          </h3>
          <Badge variant="neutral">{wasteLogs.length} Total Entries</Badge>
        </div>

        {wasteLogs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-cream-50 border border-dashed border-slate-300 text-center space-y-2">
            <TrendingDown className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-800">
              No food waste logs yet
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Submit your first daily kitchen waste log using the form above to track prepared vs. leftover food and financial impact.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                  <th className="py-3 px-4">Date &amp; Meal</th>
                  <th className="py-3 px-4">Dish / Batch</th>
                  <th className="py-3 px-4">Prepared (kg)</th>
                  <th className="py-3 px-4">Consumed (kg)</th>
                  <th className="py-3 px-4">Leftover (kg)</th>
                  <th className="py-3 px-4">Waste %</th>
                  <th className="py-3 px-4">Financial Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wasteLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-cream-50/70">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">
                        {log.log_date}
                      </span>
                      <span className="ml-2 uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-800">
                        {log.meal_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {log.dish_name}
                      {log.notes && (
                        <p className="text-[11px] text-slate-500 font-normal">
                          {log.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {log.prepared_kg} kg
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {log.consumed_kg} kg
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-800">
                      {log.leftover_kg} kg
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          Number(log.waste_percentage) < 4.5 ? 'green' : 'amber'
                        }
                      >
                        {log.waste_percentage}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      ₹{Math.round(Number(log.cost || 0)).toLocaleString('en-IN')}
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
