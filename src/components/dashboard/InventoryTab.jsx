import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  X,
  Scale,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function InventoryTab() {
  const {
    inventoryIntelligence,
    inventoryTransactions,
    addInventoryItem,
    updateInventoryPlateQuantity,
    recordInventoryTransaction,
  } = useData();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [txModalItem, setTxModalItem] = useState(null);
  const [txType, setTxType] = useState('purchase');
  const [txQuantity, setTxQuantity] = useState('');
  const [txNote, setTxNote] = useState('');
  const [toast, setToast] = useState('');

  const [newItemForm, setNewItemForm] = useState({
    ingredient_name: '',
    category: 'Grains & Pulses',
    current_stock: '',
    minimum_stock: '',
    unit: 'kg',
    unit_price: '',
    quantity_per_plate: '',
    plate_unit: 'g',
    expiry_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    supplier_name: '',
  });

  const handleAddItem = async (e) => {
    e.preventDefault();
    const added = await addInventoryItem(newItemForm);
    setAddModalOpen(false);
    setNewItemForm({
      ingredient_name: '',
      category: 'Grains & Pulses',
      current_stock: '',
      minimum_stock: '',
      unit: 'kg',
      unit_price: '',
      quantity_per_plate: '',
      plate_unit: 'g',
      expiry_date: new Date(Date.now() + 30 * 86400000)
        .toISOString()
        .split('T')[0],
      supplier_name: '',
    });
    setToast(`Added "${added.ingredient_name}" to inventory ledger!`);
    setTimeout(() => setToast(''), 3500);
  };

  const openTransactionModal = (item, type) => {
    setTxModalItem(item);
    setTxType(type);
    setTxQuantity('');
    setTxNote(
      type === 'purchase'
        ? 'Vendor Restock Invoice'
        : 'Daily Kitchen Batch Usage'
    );
  };

  const handleRecordTx = async (e) => {
    e.preventDefault();
    if (!txModalItem || !txQuantity) return;
    await recordInventoryTransaction({
      inventory_item_id: txModalItem.id,
      transaction_type: txType,
      quantity: Number(txQuantity),
      reference_note: txNote,
    });
    setToast(
      `Recorded ${txType.toUpperCase()} of ${txQuantity} ${txModalItem.unit} for ${txModalItem.ingredient_name}`
    );
    setTxModalItem(null);
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

      {/* Low-Stock & Expiry Alert Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border-l-4 border-l-rose-500 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-rose-700">
              <AlertTriangle className="w-4 h-4" />
              <span>
                Low-Stock Threshold Alerts (
                {inventoryIntelligence.lowStockAlerts.length})
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {inventoryIntelligence.lowStockAlerts.length > 0
                ? inventoryIntelligence.lowStockAlerts
                    .map(
                      (i) =>
                        `${i.ingredient_name} (${i.current_stock}/${i.minimum_stock} ${i.unit})`
                    )
                    .join(' • ')
                : 'All ingredients are above minimum threshold.'}
            </p>
          </div>
          <Badge variant="red">Action Needed</Badge>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-amber-800">
              <Clock className="w-4 h-4" />
              <span>
                Expiring Within 3 Days (
                {inventoryIntelligence.expiryAlerts.length})
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {inventoryIntelligence.expiryAlerts.length > 0
                ? inventoryIntelligence.expiryAlerts
                    .map(
                      (i) =>
                        `${i.ingredient_name} (${Math.max(0, i.daysToExpiry)}d left)`
                    )
                    .join(' • ')
                : 'No perishables expiring in the next 72 hours.'}
            </p>
          </div>
          <Badge variant="amber">Prioritize Usage</Badge>
        </Card>
      </div>

      {/* Main Inventory Table */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Raw Ingredient Inventory Ledger (kg, L &amp; pieces)
            </h3>
            <p className="text-xs text-slate-500">
              Track current stock (kg / L / pieces) and per-plate usage (`g`, `ml`, or `pieces` per plate) for automated purchase planning.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => setAddModalOpen(true)}
          >
            Add New Ingredient
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase bg-cream-50">
                <th className="py-3 px-3">Ingredient</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Current Stock</th>
                <th className="py-3 px-3">Min Threshold</th>
                <th className="py-3 px-3">Quantity per Plate</th>
                <th className="py-3 px-3">Unit Price</th>
                <th className="py-3 px-3">Expiry Status</th>
                <th className="py-3 px-3 text-right">Stock Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventoryIntelligence.enrichedInventory.map((item) => (
                <tr key={item.id} className="hover:bg-cream-50/60">
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-900">
                      {item.ingredient_name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {item.supplier_name}
                    </p>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 font-medium">
                    {item.category}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-sm font-extrabold ${
                        item.isLowStock ? 'text-rose-700' : 'text-slate-900'
                      }`}
                    >
                      {item.current_stock} {item.unit}
                    </span>
                    {item.isLowStock && (
                      <span className="ml-2">
                        <Badge variant="red">Low Stock</Badge>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 font-semibold">
                    {item.minimum_stock} {item.unit}
                  </td>
                  <td className="py-3.5 px-3">
                    {item.missingQuantityPerPlate ? (
                      <button
                        type="button"
                        onClick={() => {
                          const val = window.prompt(
                            `Enter quantity per plate for "${item.ingredient_name}" (in ${
                              item.unit === 'L'
                                ? 'ml'
                                : item.unit === 'pieces'
                                ? 'pieces'
                                : 'g'
                            }):`,
                            '50'
                          );
                          if (val && Number(val) > 0) {
                            updateInventoryPlateQuantity(
                              item.id,
                              Number(val),
                              item.unit === 'L'
                                ? 'ml'
                                : item.unit === 'pieces'
                                ? 'pieces'
                                : 'g',
                              item.ingredient_name
                            );
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Scale className="w-3 h-3" />
                        Add quantity per plate
                      </button>
                    ) : (
                      <span className="font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                        {item.quantity_per_plate} {item.plate_unit} / plate
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 font-semibold">
                    ₹{item.unit_price}/{item.unit}
                  </td>
                  <td className="py-3.5 px-3">
                    {item.isExpiringSoon ? (
                      <Badge variant="amber">
                        Expiring in {Math.max(0, item.daysToExpiry)}d
                      </Badge>
                    ) : (
                      <span className="text-slate-500">
                        {item.expiry_date} ({item.daysToExpiry}d)
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openTransactionModal(item, 'purchase')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" /> Restock
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openTransactionModal(item, 'consumption')
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowDownRight className="w-3.5 h-3.5" /> Consume
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Stock Transactions Log */}
      <Card className="p-5 space-y-3">
        <h3 className="text-base font-bold text-slate-900">
          Recent Stock Purchases &amp; Kitchen Consumption Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase bg-cream-50">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Ingredient</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Total Value</th>
                <th className="py-2.5 px-3">Reference Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventoryTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="py-2.5 px-3 text-slate-500">
                    {tx.transaction_date}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {tx.ingredient_name}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge
                      variant={
                        tx.transaction_type === 'purchase' ? 'green' : 'neutral'
                      }
                    >
                      {tx.transaction_type.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    {tx.transaction_type === 'purchase' ? '+' : '-'}
                    {tx.quantity} {tx.unit}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    ₹{Number(tx.total_cost).toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {tx.reference_note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Ingredient Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Add New Raw Ingredient
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  required
                  value={newItemForm.ingredient_name}
                  onChange={(e) =>
                    setNewItemForm({
                      ...newItemForm,
                      ingredient_name: e.target.value,
                    })
                  }
                  placeholder="e.g., Green Moong Dal"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newItemForm.category}
                    onChange={(e) =>
                      setNewItemForm({
                        ...newItemForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
                  >
                    <option>Grains &amp; Pulses</option>
                    <option>Dairy &amp; Protein</option>
                    <option>Fresh Produce</option>
                    <option>Oils &amp; Ghee</option>
                    <option>Spices &amp; Condiments</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Stock Unit
                  </label>
                  <select
                    value={newItemForm.unit}
                    onChange={(e) =>
                      setNewItemForm({
                        ...newItemForm,
                        unit: e.target.value,
                        plate_unit:
                          e.target.value === 'L'
                            ? 'ml'
                            : e.target.value === 'pieces'
                            ? 'pieces'
                            : 'g',
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
                  >
                    <option value="kg">kg</option>
                    <option value="L">L (litres)</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={newItemForm.current_stock}
                    onChange={(e) =>
                      setNewItemForm({
                        ...newItemForm,
                        current_stock: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Min Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={newItemForm.minimum_stock}
                    onChange={(e) =>
                      setNewItemForm({
                        ...newItemForm,
                        minimum_stock: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price (₹/{newItemForm.unit}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newItemForm.unit_price}
                    onChange={(e) =>
                      setNewItemForm({
                        ...newItemForm,
                        unit_price: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-cream-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantity per Plate
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newItemForm.quantity_per_plate}
                    onChange={(e) =>
                      setNewItemForm({
                        ...newItemForm,
                        quantity_per_plate: e.target.value,
                      })
                    }
                    placeholder="e.g., 60"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Per-Plate Unit
                  </label>
                  <select
                    value={newItemForm.plate_unit}
                    onChange={(e) =>
                      setNewItemForm({
                        ...newItemForm,
                        plate_unit: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold"
                  >
                    <option value="g">g (grams)</option>
                    <option value="ml">ml (millilitres)</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newItemForm.expiry_date}
                    onChange={(e) =>
                      setNewItemForm({
                        ...newItemForm,
                        expiry_date: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    value={newItemForm.supplier_name}
                    onChange={(e) =>
                      setNewItemForm({
                        ...newItemForm,
                        supplier_name: e.target.value,
                      })
                    }
                    placeholder="e.g., AgroPure Wholesale"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Ingredient
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Stock Transaction Modal */}
      {txModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {txType === 'purchase'
                  ? `Restock ${txModalItem.ingredient_name}`
                  : `Record Consumption: ${txModalItem.ingredient_name}`}
              </h3>
              <button
                type="button"
                onClick={() => setTxModalItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordTx} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity ({txModalItem.unit}) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={txQuantity}
                  onChange={(e) => setTxQuantity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reference Note
                </label>
                <input
                  type="text"
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setTxModalItem(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Confirm {txType === 'purchase' ? 'Restock' : 'Consumption'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
