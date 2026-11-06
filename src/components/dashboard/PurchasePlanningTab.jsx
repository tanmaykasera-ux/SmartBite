import React, { useState } from 'react';
import {
  ClipboardList,
  Download,
  CheckCircle2,
  ShoppingCart,
  Sparkles,
  AlertTriangle,
  Clock,
  Package,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useData } from '../../context/DataContext';

export default function PurchasePlanningTab({ onNavigateTab }) {
  const {
    inventoryIntelligence,
    forecasts,
    dataSufficiency,
    recordInventoryTransaction,
  } = useData();
  const [orderedIds, setOrderedIds] = useState({});
  const [notice, setNotice] = useState('');

  const totalExpectedPlates =
    dataSufficiency?.isSufficient && forecasts.length > 0
      ? forecasts.reduce(
          (max, f) => Math.max(max, Number(f.expected_attendance || 0)),
          0
        )
      : 0;

  const suggestedPurchaseList = inventoryIntelligence?.purchasePlan || [];
  const lowStockWarnings = inventoryIntelligence?.lowStockWarnings || [];
  const expiringIngredients = inventoryIntelligence?.expiringIngredients || [];
  const totalPurchaseBudget =
    inventoryIntelligence?.totalEstimatedPurchaseCost || 0;

  const handleMarkPurchased = async (item) => {
    await recordInventoryTransaction({
      inventory_item_id: item.id,
      transaction_type: 'purchase',
      quantity: item.suggestedOrderQty || 10,
      reference_note: 'Auto-procured via SmartBite Purchase Planner',
    });
    setOrderedIds((prev) => ({ ...prev, [item.id]: true }));
    setNotice(
      `Procured +${item.suggestedOrderQty || 10} ${item.unit} of ${
        item.ingredient_name
      } and updated live inventory!`
    );
  };

  const handleExportPurchaseOrderCSV = () => {
    const headers = [
      'Ingredient,Category,Supplier,Current Stock,Minimum Stock,3-Day Menu Requirement,Suggested Order Qty,Unit,Unit Price (INR),Estimated Cost (INR),Days Until Expiry,Priority',
    ];
    const rows = suggestedPurchaseList.map((i) =>
      [
        `"${i.ingredient_name}"`,
        `"${i.category}"`,
        `"${i.supplier_name}"`,
        i.current_stock,
        i.minimum_stock,
        i.upcoming3DayRequirement,
        i.suggestedOrderQty,
        i.unit,
        i.unit_price,
        i.estimatedOrderCost,
        i.daysUntilExpiry ?? 'N/A',
        `"${i.priority}"`,
      ].join(',')
    );

    const blob = new Blob([[...headers, ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartBite_Purchase_Plan_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="p-5 bg-brand-950 text-white border-brand-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="dark" icon={Sparkles}>
            Inventory &amp; Procurement Intelligence
          </Badge>
          <h2 className="text-xl font-bold text-white pt-1">
            Automated Purchase Planning &amp; Shelf-Life Alerts
          </h2>
          <p className="text-xs text-brand-200">
            Analyzes upcoming scheduled menu dishes, current storeroom stock, expiry dates, and forecasted student attendance (
            {dataSufficiency?.isSufficient
              ? `${totalExpectedPlates} expected plates/meal`
              : 'Insufficient forecast history — calculating from minimum stock thresholds'}
            ).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-brand-900 border border-brand-800 text-right">
            <p className="text-[10px] uppercase text-brand-300">
              Est. Procurement Total
            </p>
            <p className="text-lg font-extrabold text-white">
              ₹{totalPurchaseBudget.toLocaleString('en-IN')}
            </p>
          </div>
          {suggestedPurchaseList.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              iconPosition="left"
              onClick={handleExportPurchaseOrderCSV}
            >
              Export Purchase List (CSV)
            </Button>
          )}
        </div>
      </Card>

      {/* Low Stock & Expiring Ingredient Warnings */}
      {(lowStockWarnings.length > 0 || expiringIngredients.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4 border-amber-200 bg-amber-50/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Low-Stock Warnings ({lowStockWarnings.length})
              </p>
              <Badge variant="amber">Immediate Reorder</Badge>
            </div>
            {lowStockWarnings.length === 0 ? (
              <p className="text-xs text-slate-600">
                All ingredients are above minimum threshold.
              </p>
            ) : (
              <div className="space-y-1.5">
                {lowStockWarnings.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">
                        {item.ingredient_name}
                      </span>
                      <span className="text-slate-500 ml-1.5">
                        ({item.supplier_name})
                      </span>
                    </div>
                    <span className="font-extrabold text-amber-800">
                      {item.current_stock} / {item.minimum_stock} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4 border-rose-200 bg-rose-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-600" />
                Expiring Ingredients Within 5 Days ({expiringIngredients.length})
              </p>
              <Badge variant="amber">Prioritize Usage</Badge>
            </div>
            {expiringIngredients.length === 0 ? (
              <p className="text-xs text-slate-600">
                No perishable batches expiring within 5 days.
              </p>
            ) : (
              <div className="space-y-1.5">
                {expiringIngredients.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-white border border-rose-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">
                        {item.ingredient_name}
                      </span>
                      <span className="text-slate-500 ml-1.5">
                        ({item.current_stock} {item.unit} in stock)
                      </span>
                    </div>
                    <span className="font-extrabold text-rose-700">
                      {item.daysUntilExpiry <= 0
                        ? 'Expires Today'
                        : `Expires in ${item.daysUntilExpiry}d (${item.expiry_date})`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {notice && (
        <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Suggested Purchase List Table */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-brand-700" />
            Suggested Ingredient Purchase List (Next 72 Hours)
          </h3>
          <Badge variant="green">
            {suggestedPurchaseList.length} Line Items
          </Badge>
        </div>

        {suggestedPurchaseList.length === 0 ? (
          <div className="p-10 rounded-2xl bg-cream-50 border border-dashed border-slate-300 text-center space-y-3">
            <Package className="w-6 h-6 text-brand-700 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                No inventory items yet to generate a purchase plan
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Add your storeroom ingredients and minimum stock levels in the Inventory tab so SmartBite can calculate required purchase quantities.
              </p>
            </div>
            {onNavigateTab && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigateTab('inventory')}
              >
                Go to Inventory →
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                  <th className="py-3.5 px-4">Ingredient &amp; Vendor</th>
                  <th className="py-3.5 px-4">Available Stock</th>
                  <th className="py-3.5 px-4">Upcoming Menu Demand</th>
                  <th className="py-3.5 px-4">Suggested Purchase Qty</th>
                  <th className="py-3.5 px-4">Shelf Life</th>
                  <th className="py-3.5 px-4">Est. Cost</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Procurement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suggestedPurchaseList.map((item) => {
                  const isOrdered = orderedIds[item.id];
                  return (
                    <tr key={item.id} className="hover:bg-cream-50/70">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">
                          {item.ingredient_name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.category} • {item.supplier_name}
                        </p>
                        {item.linkedDishes && item.linkedDishes.length > 0 && (
                          <p className="text-[10px] text-brand-700 font-medium mt-0.5">
                            Used in: {item.linkedDishes.slice(0, 2).join(', ')}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">
                          {item.current_stock} {item.unit}
                        </span>
                        <p className="text-[10px] text-slate-500">
                          Min: {item.minimum_stock} {item.unit}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        ~{item.upcoming3DayRequirement} {item.unit}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-extrabold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                          +{item.suggestedOrderQty} {item.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.daysUntilExpiry !== null &&
                        item.daysUntilExpiry !== undefined ? (
                          <span
                            className={`font-semibold ${
                              item.daysUntilExpiry <= 5
                                ? 'text-rose-600 font-bold'
                                : 'text-slate-600'
                            }`}
                          >
                            {item.daysUntilExpiry} days
                          </span>
                        ) : (
                          <span className="text-slate-400">Standard</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        ₹{item.estimatedOrderCost.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            item.priority.startsWith('Urgent')
                              ? 'amber'
                              : item.priority.startsWith('High')
                              ? 'green'
                              : 'neutral'
                          }
                        >
                          {item.priority}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {isOrdered ? (
                          <span className="inline-flex items-center gap-1 text-brand-800 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-brand-700" />{' '}
                            Stocked In
                          </span>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={ShoppingCart}
                            iconPosition="left"
                            onClick={() => handleMarkPurchased(item)}
                          >
                            Receive Stock
                          </Button>
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
    </div>
  );
}
