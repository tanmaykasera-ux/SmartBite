import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  TrendingDown,
  Users,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function ReportsTab() {
  const {
    messProfile,
    wasteLogs,
    wasteAnalytics,
    forecasts,
    inventoryIntelligence,
    historicalSelections,
  } = useData();
  const [downloadedReport, setDownloadedReport] = useState('');

  const triggerDownload = (filename, headers, rows) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadedReport(filename);
    setTimeout(() => setDownloadedReport(''), 3500);
  };

  const exportDailyWasteReport = () => {
    const headers = [
      'Date',
      'Meal Type',
      'Meal Batch',
      'Plates Prepared',
      'Plates Served',
      'Leftover Plates',
      'Cost Per Plate (INR)',
      'Waste %',
      'Waste Cost (INR)',
      'Notes',
    ];
    const rows = wasteLogs.map((w) => [
      w.log_date,
      w.meal_type,
      `"${w.dish_name}"`,
      Math.round(Number(w.plates_prepared ?? w.prepared_kg ?? 0)),
      Math.round(Number(w.plates_served ?? w.consumed_kg ?? 0)),
      Math.round(Number(w.leftover_plates ?? w.leftover_kg ?? 0)),
      Number(w.cost_per_plate ?? w.unit_cost_inr ?? 65),
      w.waste_percentage,
      w.cost,
      `"${w.notes || ''}"`,
    ]);
    triggerDownload(
      `SmartBite_Daily_Plate_Waste_Report_${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows
    );
  };

  const exportWeeklyForecastReport = () => {
    const headers = [
      'Date',
      'Day',
      'Meal Type',
      'Menu Title',
      'Enrolled Students',
      'Marked Not Coming (Poll)',
      'Estimated Silent No-Shows',
      'Guest Buffer Plates',
      'Expected Plates',
      'Recommended Prep Plates',
      'Confidence Range',
    ];
    const rows = forecasts.map((f) => [
      f.forecast_date,
      f.day_name || '',
      f.meal_type,
      `"${f.menu_title}"`,
      f.enrolled_students,
      f.not_coming_count,
      f.insufficient_data ? '"Insufficient data"' : f.silent_no_shows_est,
      f.guest_buffer_plates,
      f.expected_plates,
      f.overridden_prep_plates ?? f.recommended_prep_plates,
      `"${f.confidence_range_label}"`,
    ]);
    triggerDownload(
      `SmartBite_Weekly_Plate_Forecast_Report_${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows
    );
  };

  const exportMonthlyExecutiveReport = () => {
    const headers = [
      'Day / Period',
      'Enrolled Students',
      'Breakfast Plates Served',
      'Lunch Plates Served',
      'Dinner Plates Served',
      'Guest / Walk-In Plates',
    ];
    const rows = historicalSelections.map((h) => [
      h.date,
      h.registered,
      h.breakfastSelected,
      h.lunchSelected,
      h.dinnerSelected,
      h.unpolledWalkIns,
    ]);
    triggerDownload(
      `SmartBite_Monthly_Plate_Attendance_Summary_${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows
    );
  };

  const exportInventoryProcurementReport = () => {
    const headers = [
      'Ingredient',
      'Category',
      'Current Stock',
      'Min Stock',
      'Unit',
      'Quantity Per Plate',
      'Weekly Requirement',
      'Recommended Purchase',
      'Unit Cost (INR)',
      'Supplier',
    ];
    const rows = inventoryIntelligence.enrichedInventory.map((i) => [
      `"${i.ingredient_name}"`,
      `"${i.category}"`,
      i.current_stock,
      i.minimum_stock,
      i.unit,
      i.missingQuantityPerPlate
        ? '"Add quantity per plate"'
        : `"${i.quantity_per_plate} ${i.plate_unit}"`,
      i.weeklyProjectedDemand,
      i.recommendedPurchaseQty,
      i.unit_price,
      `"${i.supplier_name || ''}"`,
    ]);
    triggerDownload(
      `SmartBite_Inventory_Procurement_Report_${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows
    );
  };

  const reportCards = [
    {
      title: 'Daily Kitchen Plate Prep & Leftover Report',
      subtitle: 'Meal-wise plates prepared, plates served, leftover plates & waste cost',
      icon: TrendingDown,
      metrics: `${wasteLogs.length} logged batches • ${wasteAnalytics.overallWastePct}% leftover rate`,
      action: exportDailyWasteReport,
      btnText: 'Download Daily Plate CSV',
    },
    {
      title: 'Weekly Attendance Poll & Plate Forecast Report',
      subtitle: 'Enrolled students, "Not Coming" poll counts, buffers & recommended plates',
      icon: Users,
      metrics: `${forecasts.length} meal forecasts • ${messProfile.registered_students} enrolled students`,
      action: exportWeeklyForecastReport,
      btnText: 'Download Weekly Forecast CSV',
    },
    {
      title: 'Monthly Institutional Plate Attendance Summary',
      subtitle: 'Consolidated Breakfast, Lunch & Dinner plates served across the hostel',
      icon: Calendar,
      metrics: `Institution: ${messProfile.college_name || messProfile.name}`,
      action: exportMonthlyExecutiveReport,
      btnText: 'Download Monthly Summary CSV',
    },
    {
      title: 'Inventory & Plate-Derived Purchase Report',
      subtitle: 'Current ingredient stock (kg/L/pieces), per-plate quantities & purchase orders',
      icon: Package,
      metrics: `${inventoryIntelligence.enrichedInventory.length} items • ₹${inventoryIntelligence.totalProcurementBudgetInr.toLocaleString('en-IN')} est. order`,
      action: exportInventoryProcurementReport,
      btnText: 'Download Inventory CSV',
    },
  ];

  return (
    <div className="space-y-6">
      {downloadedReport && (
        <div className="p-4 rounded-xl bg-brand-900 text-white text-xs font-semibold flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-brand-300" />
          <span>Exported CSV report: {downloadedReport}</span>
        </div>
      )}

      <Card className="p-5 bg-gradient-to-r from-brand-950 to-brand-800 text-white border-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-300">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Audit-Ready Plate &amp; Procurement Exports</span>
            </div>
            <h2 className="text-lg font-extrabold">
              Daily, Weekly &amp; Monthly Plate Operational Reports
            </h2>
            <p className="text-xs text-brand-100/90 max-w-2xl">
              Export kitchen preparation, served plates, leftover plates, attendance poll opt-outs, and ingredient purchase plans as clean CSV spreadsheets.
            </p>
          </div>
          <Badge variant="green">CSV Export Ready</Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reportCards.map((rep) => {
          const Icon = rep.icon;
          return (
            <Card
              key={rep.title}
              className="p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-800 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="neutral">CSV Format</Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {rep.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {rep.subtitle}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-brand-800">
                  {rep.metrics}
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  icon={Download}
                  onClick={rep.action}
                >
                  {rep.btnText}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
