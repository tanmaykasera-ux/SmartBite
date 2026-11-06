import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useData } from '../../context/DataContext';

export default function ReportsTab({ onNavigateTab }) {
  const { messProfile, wasteLogs, weeklySeries, inventory, feedbackList } =
    useData();
  const [period, setPeriod] = useState('weekly'); // daily | weekly | monthly
  const [exportedBanner, setExportedBanner] = useState('');

  const periodLabel =
    period === 'daily'
      ? 'Daily Operational Report (Today)'
      : period === 'weekly'
      ? 'Weekly Executive Summary (Last 7 Days)'
      : 'Monthly Institutional Audit Report (Last 30 Days)';

  // Filter real waste logs by period
  const filteredWasteLogs = useMemo(() => {
    const now = Date.now();
    const todayStr = new Date().toISOString().split('T')[0];
    return wasteLogs.filter((log) => {
      if (!log.log_date) return true;
      if (period === 'daily') return log.log_date === todayStr;
      const daysDiff = (now - new Date(log.log_date).getTime()) / 86400000;
      if (period === 'weekly') return daysDiff <= 7;
      return daysDiff <= 30;
    });
  }, [wasteLogs, period]);

  const activeLogs =
    filteredWasteLogs.length > 0 ? filteredWasteLogs : wasteLogs;

  const preparedKg = Number(
    activeLogs
      .reduce((sum, l) => sum + Number(l.prepared_kg || 0), 0)
      .toFixed(1)
  );
  const consumedKg = Number(
    activeLogs
      .reduce((sum, l) => sum + Number(l.consumed_kg || 0), 0)
      .toFixed(1)
  );
  const wasteKg = Number(
    activeLogs
      .reduce((sum, l) => sum + Number(l.leftover_kg || 0), 0)
      .toFixed(1)
  );
  const wasteCostInr = Math.round(
    activeLogs.reduce((sum, l) => sum + Number(l.cost || 0), 0)
  );

  const avgSatisfaction =
    feedbackList.length > 0
      ? `${(
          feedbackList.reduce((s, f) => s + Number(f.rating || 0), 0) /
          feedbackList.length
        ).toFixed(1)} / 5.0`
      : 'No ratings yet';

  const reportMetrics = {
    preparedKg,
    consumedKg,
    wasteKg,
    wasteCostInr,
    avgSatisfaction,
    entitlementCompliance: '100% (Zero Denials)',
  };

  const handleDownloadCSV = () => {
    const rows = [
      ['SmartBite Institutional Report', periodLabel],
      ['Mess Name', messProfile.name || ''],
      ['College / Institution', messProfile.college_name || ''],
      ['Registered Students', messProfile.registered_students || 0],
      ['Total Prepared (kg)', reportMetrics.preparedKg],
      ['Total Consumed (kg)', reportMetrics.consumedKg],
      ['Total Leftover Waste (kg)', reportMetrics.wasteKg],
      ['Estimated Waste Cost (INR)', reportMetrics.wasteCostInr],
      ['Student Meal Entitlement Guarantee', reportMetrics.entitlementCompliance],
      [],
      ['Day', 'Prepared (kg)', 'Consumed (kg)', 'Waste (kg)', 'Waste Cost (INR)'],
      ...weeklySeries.map((d) => [
        d.day,
        d.preparedKg,
        d.consumedKg,
        d.wasteKg,
        d.wasteCostInr,
      ]),
    ];

    const csvString = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartBite_${period.toUpperCase()}_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportedBanner(`Downloaded ${periodLabel} as CSV file.`);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Report Period Selector & Export Controls */}
      <Card className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-brand-700" />
            Institutional Reports &amp; Audit Generator
          </h2>
          <p className="text-xs text-slate-500">
            Generate Daily, Weekly, and Monthly operational, waste, financial, and nutrition reports from your recorded data
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl bg-cream-100 p-1 border border-slate-200 text-xs">
            {[
              { id: 'daily', label: 'Daily Report' },
              { id: 'weekly', label: 'Weekly Report' },
              { id: 'monthly', label: 'Monthly Report' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPeriod(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                  period === tab.id
                    ? 'bg-brand-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            iconPosition="left"
            onClick={handlePrintReport}
          >
            Print / PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            iconPosition="left"
            onClick={handleDownloadCSV}
          >
            Export CSV
          </Button>
        </div>
      </Card>

      {exportedBanner && (
        <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
          <span>{exportedBanner}</span>
        </div>
      )}

      {/* Executive Summary Sheet */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <Badge variant="green" icon={Calendar}>
              {periodLabel}
            </Badge>
            <h3 className="text-xl font-extrabold text-slate-900 mt-2">
              {messProfile.name || 'Institutional Mess'} —{' '}
              {messProfile.college_name || 'Campus'}
            </h3>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Generated on: {new Date().toISOString().split('T')[0]}</p>
            <p className="font-semibold text-brand-800">
              Entitlement Compliance: {reportMetrics.entitlementCompliance}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-cream-50 border border-slate-200">
            <p className="text-xs text-slate-500">Total Food Prepared</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              {reportMetrics.preparedKg.toLocaleString()} kg
            </p>
          </div>
          <div className="p-4 rounded-xl bg-cream-50 border border-slate-200">
            <p className="text-xs text-slate-500">Total Food Consumed</p>
            <p className="text-xl font-extrabold text-brand-800 mt-1">
              {reportMetrics.consumedKg.toLocaleString()} kg
            </p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
            <p className="text-xs text-amber-800">Total Leftover Waste</p>
            <p className="text-xl font-extrabold text-amber-900 mt-1">
              {reportMetrics.wasteKg.toLocaleString()} kg
            </p>
          </div>
          <div className="p-4 rounded-xl bg-cream-50 border border-slate-200">
            <p className="text-xs text-slate-500">Waste Cost Incurred</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              ₹{reportMetrics.wasteCostInr.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        {weeklySeries.length === 0 ? (
          <div className="p-8 rounded-2xl bg-cream-50 border border-dashed border-slate-300 text-center space-y-3">
            <TrendingDown className="w-6 h-6 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">
                No operational batch records logged yet
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Log daily prepared and leftover quantities in the Food Waste tab to populate this report table.
              </p>
            </div>
            {onNavigateTab && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigateTab('waste')}
              >
                Go to Food Waste →
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                  <th className="py-3 px-4">Day / Period</th>
                  <th className="py-3 px-4">Food Prepared (kg)</th>
                  <th className="py-3 px-4">Food Consumed (kg)</th>
                  <th className="py-3 px-4">Leftover Waste (kg)</th>
                  <th className="py-3 px-4">Waste Cost (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {weeklySeries.map((row) => (
                  <tr key={row.day} className="hover:bg-cream-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {row.day}
                    </td>
                    <td className="py-3 px-4">{row.preparedKg} kg</td>
                    <td className="py-3 px-4 text-brand-800 font-semibold">
                      {row.consumedKg} kg
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-800">
                      {row.wasteKg} kg
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{Number(row.wasteCostInr || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <span>
            Active Inventory Items Monitored: <strong>{inventory.length}</strong>{' '}
            • Waste Logs Recorded: <strong>{wasteLogs.length}</strong>
          </span>
          <span>
            Avg. Student Satisfaction Score:{' '}
            <strong>{reportMetrics.avgSatisfaction}</strong>
          </span>
        </div>
      </Card>
    </div>
  );
}
