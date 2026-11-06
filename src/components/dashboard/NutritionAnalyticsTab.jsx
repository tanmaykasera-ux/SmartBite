import React from 'react';
import {
  Salad,
  Flame,
  CheckCircle2,
  Sparkles,
  Scale,
  Utensils,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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

const MACRO_COLORS = ['#1f5440', '#64a88b', '#d97706'];

export default function NutritionAnalyticsTab({ onNavigateTab }) {
  const { menus, nutritionAnalytics } = useData();

  const {
    mealAverages = [],
    totalDailyCalories = 0,
    totalDailyProtein = 0,
    totalDailyCarbs = 0,
    totalDailyFats = 0,
    avgCaloriesPerMeal = 0,
    avgProteinPerMeal = 0,
    weeklyNutritionSeries = [],
    dishComparisons = [],
  } = nutritionAnalytics || {};

  const macroPieData = [
    { name: 'Protein (g)', value: totalDailyProtein },
    { name: 'Carbohydrates (g)', value: totalDailyCarbs },
    { name: 'Fats (g)', value: totalDailyFats },
  ];

  const hasMacros =
    totalDailyProtein > 0 || totalDailyCarbs > 0 || totalDailyFats > 0;

  return (
    <div className="space-y-6">
      {/* 4 Required KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Average Calories per Meal</span>
            <Flame className="w-4 h-4 text-brand-700" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {avgCaloriesPerMeal} kcal
          </p>
          <p className="text-[11px] text-brand-700 font-semibold">
            Daily Total: {totalDailyCalories} kcal
          </p>
        </Card>

        <Card className="p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Average Protein per Meal</span>
            <Salad className="w-4 h-4 text-brand-700" />
          </div>
          <p className="text-2xl font-extrabold text-brand-800">
            {avgProteinPerMeal} g
          </p>
          <p className="text-[11px] text-brand-700 font-semibold">
            Daily Total: {totalDailyProtein}g Protein
          </p>
        </Card>

        <Card className="p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Carbohydrate Breakdown</span>
            <Sparkles className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {totalDailyCarbs} g / day
          </p>
          <p className="text-[11px] text-slate-500">
            Avg {(totalDailyCarbs / 3).toFixed(1)}g per meal session
          </p>
        </Card>

        <Card className="p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Healthy Fat Breakdown</span>
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {totalDailyFats} g / day
          </p>
          <p className="text-[11px] text-slate-500">
            Avg {(totalDailyFats / 3).toFixed(1)}g per meal session
          </p>
        </Card>
      </div>

      {menus.length === 0 || dishComparisons.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-800 flex items-center justify-center mx-auto">
            <Utensils className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              No menus yet. Create your first menu
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Add dishes with serving sizes, calories, protein, carbs, and fats in Menu Management to unlock real-time nutritional analytics.
            </p>
          </div>
          {onNavigateTab && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigateTab('menus')}
            >
              Go to Menu Management →
            </Button>
          )}
        </Card>
      ) : (
        <>
          {/* Charts Row: Weekly Nutrition Trends & Macro Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-7 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Scheduled Menu Nutrition Trends (Protein, Carbs &amp; Fats in Grams)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Computed directly from serving-size nutritional values of scheduled mess menus
                  </p>
                </div>
                <Badge variant="green">Serving-Size Verified</Badge>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyNutritionSeries}
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
                      unit="g"
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar
                      dataKey="protein"
                      name="Protein (g)"
                      fill="#1f5440"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="carbs"
                      name="Carbohydrates (g)"
                      fill="#64a88b"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="fats"
                      name="Fats (g)"
                      fill="#d97706"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="lg:col-span-5 p-5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Carbohydrate, Protein &amp; Fat Ratio
                </h3>
                <p className="text-xs text-slate-500">
                  Daily macronutrient distribution across scheduled meals
                </p>
              </div>

              {!hasMacros ? (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                  No macronutrient values entered yet.
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={82}
                        paddingAngle={4}
                      >
                        {macroPieData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={MACRO_COLORS[index % MACRO_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          {/* Meal-by-Meal Summary Table */}
          <Card className="p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Meal-by-Meal Nutritional Composition
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                    <th className="py-3.5 px-4">Meal Session</th>
                    <th className="py-3.5 px-4">Dishes Count</th>
                    <th className="py-3.5 px-4">Total Calories</th>
                    <th className="py-3.5 px-4">Protein (g)</th>
                    <th className="py-3.5 px-4">Carbohydrates (g)</th>
                    <th className="py-3.5 px-4">Fats (g)</th>
                    <th className="py-3.5 px-4">Nutritional Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mealAverages.map((row) => (
                    <tr key={row.meal} className="hover:bg-cream-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {row.meal}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {row.dishesCount} dishes
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {row.calories} kcal
                      </td>
                      <td className="py-3.5 px-4 font-bold text-brand-800">
                        {row.protein} g
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {row.carbs} g
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {row.fats} g
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={row.dishesCount > 0 ? 'green' : 'neutral'}
                        >
                          {row.dishesCount > 0
                            ? 'Verified Macros'
                            : 'Not Scheduled'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Dish-Wise Nutritional Comparisons Table */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-brand-700" />
                  Dish-Wise Nutritional Comparisons (Serving-Size Based)
                </h3>
                <p className="text-xs text-slate-500">
                  Compares energy and protein density across every scheduled dish
                </p>
              </div>
              <Badge variant="neutral">
                {dishComparisons.length} Dishes Analyzed
              </Badge>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                    <th className="py-3 px-4">Dish Name</th>
                    <th className="py-3 px-4">Meal</th>
                    <th className="py-3 px-4">Serving Size</th>
                    <th className="py-3 px-4">Calories</th>
                    <th className="py-3 px-4">Protein</th>
                    <th className="py-3 px-4">Carbs</th>
                    <th className="py-3 px-4">Fats</th>
                    <th className="py-3 px-4">
                      Protein Density (per 100 kcal)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dishComparisons.map((d) => (
                    <tr key={d.id} className="hover:bg-cream-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {d.name}
                      </td>
                      <td className="py-3 px-4 uppercase text-[10px] font-bold text-brand-800">
                        {d.meal_type}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {d.serving_size}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {d.calories} kcal
                      </td>
                      <td className="py-3 px-4 font-bold text-brand-800">
                        {d.protein} g
                      </td>
                      <td className="py-3 px-4 text-slate-700">{d.carbs} g</td>
                      <td className="py-3 px-4 text-slate-700">{d.fats} g</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            d.proteinPer100Kcal >= 4.5 ? 'green' : 'neutral'
                          }
                        >
                          {d.proteinPer100Kcal}g / 100 kcal
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
