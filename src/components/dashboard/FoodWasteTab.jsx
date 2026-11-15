import React, { useState } from 'react';
import {
  TrendingDown,
  Plus,
  IndianRupee,
  Utensils,
  CheckCircle2,
  X,
  ClipboardCheck,
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
import { getTodayDateStr, formatHumanDate } from '../../lib/dateUtils';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function FoodWasteTab() {
  const {
    wasteLogs,
    wasteAnalytics,
    weeklySeries,
    messProfile,
    addFoodWasteLog,
  } = useData();

  const [form, setForm] = useState({
    log_date: getTodayDateStr(),
    meal_type: 'lunch',
    dish_name: 'Standard Meal Thali Batch',
    plates_prepared: '',
    plates_served: '',
    leftover_plates: '',
    cost_per_plate: messProfile.cost_per_plate || 65,
    notes: '',
  });
  const [toast, setToast] = useState('');

  const preparedNum = Math.round(Number(form.plates_prepared || 0));
  const servedNum = Math.round(Number(form.plates_served || 0));
  const autoLeftoverPlates =
    form.leftover_plates !== ''
      ? Math.round(Number(form.leftover_plates))
      : Math.max(0, preparedNum - servedNum);
  const costPerPlateNum = Number(form.cost_per_plate || 65);
  const autoWasteCost = Math.round(autoLeftoverPlates * costPerPlateNum);
  const autoWastePct =
    preparedNum > 0
      ? ((autoLeftoverPlates / preparedNum) * 100).toFixed(2)
      : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.plates_prepared) return;

    const created = await addFoodWasteLog({
      ...form,
      plates_prepared: preparedNum,
      plates_served: servedNum,
      leftover_plates: autoLeftoverPlates,
      cost_per_plate: costPerPlateNum,
    });
    setForm({
      log_date: getTodayDateStr(),
      meal_type: 'lunch',
      dish_name: 'Standard Meal Thali Batch',
      plates_prepared: '',
      plates_served: '',
      leftover_plates: '',
      cost_per_plate: messProfile.cost_per_plate || 65,
      notes: '',
    });
    setToast(
      `Logged ${created.meal_type.toUpperCase()} batch: ${
        created.plates_prepared
      } plates prepared, ${created.plates_served} served, ${
        created.leftover_plates
      } leftover plates (${created.waste_percentage}% waste • ₹${created.cost})`
    );
    setTimeout(() => setToast(''), 4000);
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

      {/* Summary KPI Cards in Plates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Plates Prepared</span>
            <Utensils className="w-4 h-4 text-brand-700" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {wasteAnalytics.totalPreparedPlates.toLocaleString('en-IN')}{' '}
            <span className="text-sm font-bold text-slate-500">plates</span>
          </p>
          <p className="text-xs text-slate-500">Total logged kitchen prep</p>
        </Card>

        <Card className="p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Plates Served</span>
            <ClipboardCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-800">
            {wasteAnalytics.totalServedPlates.toLocaleString('en-IN')}{' '}
            <span className="text-sm font-bold text-slate-500">plates</span>
          </p>
          <p className="text-xs text-emerald-700 font-semibold">
            Actual plates consumed by students
          </p>
        </Card>

        <Card className="p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Leftover Plates &amp; Waste %</span>
            <TrendingDown className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {wasteAnalytics.totalLeftoverPlates.toLocaleString('en-IN')}{' '}
            <span className="text-sm font-bold text-slate-500">plates</span>{' '}
            <span className="text-sm font-bold text-amber-700">
              ({wasteAnalytics.overallWastePct}%)
            </span>
          </p>
          <p className="text-xs text-slate-500">
            Waste % = Leftover Plates &divide; Plates Prepared
          </p>
        </Card>

        <Card className="p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Waste Cost</span>
            <IndianRupee className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-700">
            ₹{wasteAnalytics.totalFinancialLossInr.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500">
            Leftover Plates &times; Cost per Plate
          </p>
        </Card>
      </div>

      {/* Main Split: Log New Meal Plate Batch Form + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Card */}
        <Card className="lg:col-span-5 p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Log Daily Kitchen Batch &amp; Leftover Plates
            </h3>
            <p className="text-xs text-slate-500">
              Enter plates prepared, plates served, leftover plates, and cost per plate.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={form.log_date}
                  onChange={(e) =>
                    setForm({ ...form, log_date: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meal Type
                </label>
                <select
                  value={form.meal_type}
                  onChange={(e) =>
                    setForm({ ...form, meal_type: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold capitalize bg-white"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Meal Batch Label
              </label>
              <input
                type="text"
                required
                value={form.dish_name}
                onChange={(e) =>
                  setForm({ ...form, dish_name: e.target.value })
                }
                placeholder="e.g., Standard Lunch Thali Batch"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Plates Prepared *
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={form.plates_prepared}
                  onChange={(e) =>
                    setForm({ ...form, plates_prepared: e.target.value })
                  }
                  placeholder="1050"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Plates Served *
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={form.plates_served}
                  onChange={(e) =>
                    setForm({ ...form, plates_served: e.target.value })
                  }
                  placeholder="1015"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Leftover Plates
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={form.leftover_plates}
                  onChange={(e) =>
                    setForm({ ...form, leftover_plates: e.target.value })
                  }
                  placeholder={`${autoLeftoverPlates} (Auto)`}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold bg-cream-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cost per Plate (₹ / plate)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.cost_per_plate}
                onChange={(e) =>
                  setForm({ ...form, cost_per_plate: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Root-Cause / Kitchen Notes
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g., Rainy evening slightly reduced dinner walk-ins"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
              />
            </div>

            {/* Live Computed Preview Box */}
            <div className="p-3 rounded-xl bg-brand-50/80 border border-brand-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-600">Calculated Waste Rate: </span>
                <strong className="text-brand-900">
                  {autoWastePct}% ({autoLeftoverPlates} leftover plates)
                </strong>
              </div>
              <div>
                <span className="text-slate-600">Waste Cost: </span>
                <strong className="text-rose-700">₹{autoWasteCost}</strong>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Plus}
              className="w-full"
            >
              Record Plate Waste Entry
            </Button>
          </form>
        </Card>

        {/* Charts Column in Plates */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Weekly Kitchen Prep vs. Leftover Plates (plates)
                </h3>
                <p className="text-xs text-slate-500">
                  Daily plates prepared, plates served, and leftover plates
                </p>
              </div>
              <Badge variant="green">Plates</Badge>
            </div>
            <div className="h-60 w-full">
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
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(val, name) => [`${val} plates`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar
                    dataKey="platesPrepared"
                    name="Plates Prepared"
                    fill="#1f5440"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="platesServed"
                    name="Plates Served"
                    fill="#418c6e"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="leftoverPlates"
                    name="Leftover Plates"
                    fill="#d97706"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              Meal-Wise Plate Waste Breakdown (Breakfast vs. Lunch vs. Dinner)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {wasteAnalytics.mealTypeWasteBreakdown.map((m) => (
                <div
                  key={m.meal}
                  className="p-3.5 rounded-xl bg-cream-50 border border-slate-200/80 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-brand-900">
                      {m.meal}
                    </span>
                    <Badge variant={m.wastePct <= 5 ? 'green' : 'amber'}>
                      {m.wastePct}% waste
                    </Badge>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900">
                    {m.leftoverPlates} plates{' '}
                    <span className="text-xs font-normal text-slate-500">
                      / {m.platesPrepared} prep
                    </span>
                  </p>
                  <p className="text-xs text-rose-700 font-semibold">
                    Loss: ₹{m.lossInr.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Historical Plate Waste Logs Table */}
      <Card className="p-5 space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Historical Kitchen Plate &amp; Waste Ledger ({wasteLogs.length} Records)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase bg-cream-50">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Meal</th>
                <th className="py-3 px-3">Batch Description</th>
                <th className="py-3 px-3">Plates Prepared</th>
                <th className="py-3 px-3">Plates Served</th>
                <th className="py-3 px-3">Leftover Plates</th>
                <th className="py-3 px-3">Cost / Plate</th>
                <th className="py-3 px-3">Waste %</th>
                <th className="py-3 px-3">Waste Cost</th>
                <th className="py-3 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wasteLogs.map((log) => {
                const prep = Math.round(
                  Number(log.plates_prepared ?? log.prepared_kg ?? 0)
                );
                const served = Math.round(
                  Number(log.plates_served ?? log.consumed_kg ?? 0)
                );
                const left = Math.round(
                  Number(log.leftover_plates ?? log.leftover_kg ?? 0)
                );
                const cpp = Number(
                  log.cost_per_plate ?? log.unit_cost_inr ?? 65
                );
                return (
                  <tr key={log.id} className="hover:bg-cream-50/60">
                    <td className="py-3 px-3 font-medium text-slate-600">
                      {formatHumanDate(log.log_date)}
                    </td>
                    <td className="py-3 px-3 font-bold uppercase text-brand-800">
                      {log.meal_type}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {log.dish_name}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {prep} plates
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-800">
                      {served} plates
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-800">
                      {left} plates
                    </td>
                    <td className="py-3 px-3 text-slate-600">₹{cpp}/plate</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          Number(log.waste_percentage) <= 5 ? 'green' : 'amber'
                        }
                      >
                        {log.waste_percentage}%
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-rose-700">
                      ₹{Number(log.cost).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{log.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
