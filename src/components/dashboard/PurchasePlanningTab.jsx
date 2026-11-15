import React, { useState } from 'react';
import {
  ClipboardList,
  ShoppingCart,
  Download,
  CheckCircle2,
  X,
  Scale,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function PurchasePlanningTab() {
  const {
    inventoryIntelligence,
    recordInventoryTransaction,
    updateInventoryPlateQuantity,
  } = useData();
  const [toast, setToast] = useState('');
  const [editingPlateQtyItem, setEditingPlateQtyItem] = useState(null);
  const [plateQtyVal, setPlateQtyVal] = useState('');
  const [plateUnitVal, setPlateUnitVal] = useState('g');

  const handleOrderItem = async (item) => {
    const qtyToOrder =
      item.recommendedPurchaseQty > 0
        ? item.recommendedPurchaseQty
        : item.minimum_stock;
    await recordInventoryTransaction({
      inventory_item_id: item.id,
      transaction_type: 'purchase',
      quantity: qtyToOrder,
      reference_note:
        'Automated Weekly Purchase Order from Plate-Derived Planning',
    });
    setToast(
      `Purchase order logged & stock updated: +${qtyToOrder} ${item.unit} of ${item.ingredient_name}`
    );
    setTimeout(() => setToast(''), 3500);
  };

  const handleSavePlateQty = async (e) => {
    e.preventDefault();
    if (!editingPlateQtyItem || !plateQtyVal) return;
    await updateInventoryPlateQuantity(
      editingPlateQtyItem.id,
      Number(plateQtyVal),
      plateUnitVal,
      editingPlateQtyItem.ingredient_name
    );
    setToast(
      `Saved ${plateQtyVal}${plateUnitVal}/plate for ${editingPlateQtyItem.ingredient_name}!`
    );
    setEditingPlateQtyItem(null);
    setTimeout(() => setToast(''), 3500);
  };

  const handleExportPurchaseCSV = () => {
    const headers = [
      'Ingredient',
      'Category',
      'Weekly Menu Occurrences',
      'Expected Plates per Meal',
      'Quantity per Plate',
      'Current Stock',
      'Weekly Requirement (+Safety Buffer)',
      'Recommended Purchase Qty',
      'Unit',
      'Unit Price (INR)',
      'Estimated Cost (INR)',
      'Supplier',
    ];
    const rows = inventoryIntelligence.purchaseList.map((i) => [
      `"${i.ingredient_name}"`,
      `"${i.category}"`,
      i.weeklyOccurrences || 0,
      i.expectedPlatesPerMeal || 0,
      i.missingQuantityPerPlate
        ? '"Add quantity per plate"'
        : `"${i.quantity_per_plate} ${i.plate_unit}"`,
      i.current_stock,
      i.weeklyProjectedDemand,
      i.recommendedPurchaseQty,
      i.unit,
      i.unit_price,
      i.estimatedPurchaseCostInr,
      `"${i.supplier_name || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SmartBite_Purchase_Plan_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* Low-Stock & Expiry Alerts */}
      {(inventoryIntelligence.lowStockAlerts.length > 0 ||
        inventoryIntelligence.expiryAlerts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border-l-4 border-l-rose-500 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-extrabold uppercase text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Low-Stock Alerts ({inventoryIntelligence.lowStockAlerts.length})
              </p>
              <p className="text-xs text-slate-600">
                {inventoryIntelligence.lowStockAlerts
                  .map(
                    (i) =>
                      `${i.ingredient_name} (${i.current_stock}/${i.minimum_stock} ${i.unit})`
                  )
                  .join(' • ') || 'None'}
              </p>
            </div>
            <Badge variant="red">Restock</Badge>
          </Card>

          <Card className="p-4 border-l-4 border-l-amber-500 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-extrabold uppercase text-amber-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Expiry Alerts ({inventoryIntelligence.expiryAlerts.length})
              </p>
              <p className="text-xs text-slate-600">
                {inventoryIntelligence.expiryAlerts
                  .map(
                    (i) =>
                      `${i.ingredient_name} (${Math.max(0, i.daysToExpiry)}d left)`
                  )
                  .join(' • ') || 'No items expiring within 3 days'}
              </p>
            </div>
            <Badge variant="amber">FIFO</Badge>
          </Card>
        </div>
      )}

      {/* Top Formula Banner */}
      <Card className="p-5 bg-gradient-to-r from-brand-900 to-brand-800 text-white border-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-200">
              <ClipboardList className="w-4 h-4" />
              <span>Plate-Derived Procurement Engine (kg, L &amp; pieces)</span>
            </div>
            <h2 className="text-lg font-extrabold">
              Weekly Purchase Suggestions Derived from Expected Plates
            </h2>
            <p className="text-xs text-brand-100/90 max-w-2xl leading-relaxed">
              <strong>Purchase Suggestion</strong> = (Weekly Menu Occurrences &times; Expected Plates &times; Quantity per Plate, converted from g &rarr; kg and ml &rarr; L) + Safety Buffer &minus; Current Stock. If an ingredient lacks a per-plate quantity, SmartBite prompts you to add it instead of guessing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20">
              <p className="text-[10px] uppercase tracking-wider text-brand-200 font-semibold">
                Est. Weekly Procurement Budget
              </p>
              <p className="text-xl font-extrabold text-white">
                ₹
                {inventoryIntelligence.totalProcurementBudgetInr.toLocaleString(
                  'en-IN'
                )}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              icon={Download}
              onClick={handleExportPurchaseCSV}
            >
              Export Purchase Order CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Recommended Purchase Table */}
      <Card className="p-5 space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Recommended Ingredient Purchase Orders (
          {inventoryIntelligence.purchaseList.length} Items)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase bg-cream-50">
                <th className="py-3 px-3">Ingredient &amp; Dishes</th>
                <th className="py-3 px-3">Weekly Menu Occurrences</th>
                <th className="py-3 px-3">Quantity / Plate</th>
                <th className="py-3 px-3">Current Stock</th>
                <th className="py-3 px-3">Weekly Requirement (+Buffer)</th>
                <th className="py-3 px-3">Recommended Purchase</th>
                <th className="py-3 px-3">Estimated Cost</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventoryIntelligence.purchaseList.map((item) => (
                <tr key={item.id} className="hover:bg-cream-50/60">
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-900">
                      {item.ingredient_name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {item.dishesUsedIn?.length > 0
                        ? `Used in: ${item.dishesUsedIn.join(', ')}`
                        : item.supplier_name || item.category}
                    </p>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-800">
                      {item.weeklyOccurrences > 0
                        ? `${item.weeklyOccurrences} meal(s)/wk`
                        : 'Daily staple (7x/wk)'}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      ~{item.expectedPlatesPerMeal} expected plates/meal
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    {item.missingQuantityPerPlate ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPlateQtyItem(item);
                          setPlateQtyVal('');
                          setPlateUnitVal(
                            item.unit === 'L'
                              ? 'ml'
                              : item.unit === 'pieces'
                              ? 'pieces'
                              : 'g'
                          );
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        Add quantity per plate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPlateQtyItem(item);
                          setPlateQtyVal(String(item.quantity_per_plate));
                          setPlateUnitVal(item.plate_unit || 'g');
                        }}
                        className="font-bold text-brand-800 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg border border-brand-200 cursor-pointer"
                        title="Click to edit quantity per plate"
                      >
                        {item.quantity_per_plate} {item.plate_unit} / plate
                      </button>
                    )}
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-slate-700">
                    {item.current_stock} {item.unit}
                  </td>

                  <td className="py-3.5 px-3">
                    {item.missingQuantityPerPlate ? (
                      <span className="text-amber-700 font-semibold italic">
                        Add quantity per plate
                      </span>
                    ) : (
                      <div>
                        <span className="font-bold text-slate-800">
                          {item.weeklyProjectedDemand} {item.unit}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          Includes +{item.safetyBufferPct}% safety buffer
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    {item.missingQuantityPerPlate ? (
                      <Badge variant="amber">Add quantity per plate</Badge>
                    ) : (
                      <span className="text-sm font-extrabold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                        {item.recommendedPurchaseQty > 0
                          ? `${item.recommendedPurchaseQty} ${item.unit}`
                          : `${item.minimum_stock} ${item.unit} (Buffer)`}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 font-extrabold text-slate-900">
                    {item.missingQuantityPerPlate
                      ? '—'
                      : `₹${(
                          item.estimatedPurchaseCostInr ||
                          item.minimum_stock * item.unit_price
                        ).toLocaleString('en-IN')}`}
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    {item.missingQuantityPerPlate ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Scale}
                        onClick={() => {
                          setEditingPlateQtyItem(item);
                          setPlateQtyVal('');
                          setPlateUnitVal(
                            item.unit === 'L'
                              ? 'ml'
                              : item.unit === 'pieces'
                              ? 'pieces'
                              : 'g'
                          );
                        }}
                      >
                        Add Qty/Plate
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={ShoppingCart}
                        onClick={() => handleOrderItem(item)}
                      >
                        Approve &amp; Restock
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal to Add / Edit Quantity per Plate */}
      {editingPlateQtyItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Set Quantity per Plate: {editingPlateQtyItem.ingredient_name}
                </h3>
                <p className="text-xs text-slate-500">
                  Required to calculate weekly ingredient purchase quantities from expected plates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlateQtyItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePlateQty} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantity per Plate *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={plateQtyVal}
                    onChange={(e) => setPlateQtyVal(e.target.value)}
                    placeholder="e.g., 60"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit (g, ml, or pieces)
                  </label>
                  <select
                    value={plateUnitVal}
                    onChange={(e) => setPlateUnitVal(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold bg-white"
                  >
                    <option value="g">g (grams)</option>
                    <option value="ml">ml (millilitres)</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingPlateQtyItem(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Quantity per Plate
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
