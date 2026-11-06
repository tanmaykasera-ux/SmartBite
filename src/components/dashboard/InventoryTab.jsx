import React, { useState } from 'react';
import {
  Package,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Search,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useData } from '../../context/DataContext';

export default function InventoryTab() {
  const {
    inventory,
    inventoryTransactions,
    addInventoryItem,
    recordInventoryTransaction,
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowOnly, setFilterLowOnly] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [txModalItem, setTxModalItem] = useState(null);
  const [txType, setTxType] = useState('purchase');
  const [txQty, setTxQty] = useState('25');
  const [txNote, setTxNote] = useState('');
  const [notice, setNotice] = useState('');

  // New ingredient form state
  const [newItem, setNewItem] = useState({
    ingredient_name: '',
    category: 'Grains & Pulses',
    current_stock: 50,
    minimum_stock: 25,
    unit: 'kg',
    unit_price: 85,
    expiry_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    supplier_name: 'Campus Approved Supplier',
  });

  const lowStockCount = inventory.filter(
    (i) => Number(i.current_stock) < Number(i.minimum_stock)
  ).length;

  const filteredInventory = inventory.filter((item) => {
    const isLow = Number(item.current_stock) < Number(item.minimum_stock);
    if (filterLowOnly && !isLow) return false;
    if (
      searchQuery &&
      !item.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!newItem.ingredient_name.trim()) return;
    await addInventoryItem(newItem);
    setShowAddForm(false);
    setNotice(`Added ingredient "${newItem.ingredient_name}" to inventory.`);
    setNewItem({
      ingredient_name: '',
      category: 'Grains & Pulses',
      current_stock: 50,
      minimum_stock: 25,
      unit: 'kg',
      unit_price: 85,
      expiry_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      supplier_name: 'Campus Approved Supplier',
    });
  };

  const handleOpenTx = (item, type) => {
    setTxModalItem(item);
    setTxType(type);
    setTxQty(type === 'purchase' ? '50' : '15');
    setTxNote(
      type === 'purchase'
        ? `Restock order from ${item.supplier_name || 'Vendor'}`
        : 'Daily kitchen batch consumption'
    );
  };

  const handleRecordTx = async (e) => {
    e.preventDefault();
    if (!txModalItem || Number(txQty) <= 0) return;
    await recordInventoryTransaction({
      inventory_item_id: txModalItem.id,
      transaction_type: txType,
      quantity: Number(txQty),
      reference_note: txNote,
    });
    setNotice(
      `Recorded ${txType === 'purchase' ? '+' : '-'}${txQty} ${txModalItem.unit} for ${txModalItem.ingredient_name}.`
    );
    setTxModalItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Low Stock Alert Strip */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="text-xs text-amber-950">
              <strong>Low-Stock Alert ({lowStockCount} items):</strong> Certain raw ingredients have fallen below their minimum threshold. Record a stock purchase or open Purchase Planning.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFilterLowOnly(!filterLowOnly)}
            className="px-3 py-1.5 rounded-xl bg-amber-800 text-white text-xs font-bold shrink-0"
          >
            {filterLowOnly ? 'Show All Ingredients' : 'Filter Low-Stock Only'}
          </button>
        </div>
      )}

      {notice && (
        <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Top Controls Bar */}
      <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-700" />
            Storeroom Inventory &amp; Expiry Tracker
          </h2>
          <p className="text-xs text-slate-500">
            Add ingredients, set minimum stock levels, record purchases/consumption, and track expiry dates
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ingredient..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            iconPosition="left"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            Add Ingredient
          </Button>
        </div>
      </Card>

      {/* Add New Ingredient Form */}
      {showAddForm && (
        <Card className="p-6 border-2 border-brand-700 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Add New Storeroom Ingredient
          </h3>
          <form onSubmit={handleAddIngredient} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  required
                  value={newItem.ingredient_name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, ingredient_name: e.target.value })
                  }
                  placeholder="e.g., Green Moong Dal"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option>Grains &amp; Pulses</option>
                  <option>Dairy &amp; Protein</option>
                  <option>Fresh Produce</option>
                  <option>Oils &amp; Ghee</option>
                  <option>Spices &amp; Condiments</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supplier Name
                </label>
                <input
                  type="text"
                  value={newItem.supplier_name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, supplier_name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Stock *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={newItem.current_stock}
                  onChange={(e) =>
                    setNewItem({ ...newItem, current_stock: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Min Stock Level *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={newItem.minimum_stock}
                  onChange={(e) =>
                    setNewItem({ ...newItem, minimum_stock: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit
                </label>
                <select
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="kg">kg</option>
                  <option value="L">Liters (L)</option>
                  <option value="packs">Packs</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit Price (₹)
                </label>
                <input
                  type="number"
                  required
                  value={newItem.unit_price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, unit_price: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={newItem.expiry_date}
                  onChange={(e) =>
                    setNewItem({ ...newItem, expiry_date: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Ingredient
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Record Stock Purchase / Consumption Modal Card */}
      {txModalItem && (
        <Card className="p-5 border-2 border-brand-800 bg-brand-50/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {txType === 'purchase'
                ? `Record Stock Purchase (+ In): ${txModalItem.ingredient_name}`
                : `Record Kitchen Consumption (- Out): ${txModalItem.ingredient_name}`}
            </h3>
            <Badge variant={txType === 'purchase' ? 'green' : 'amber'}>
              Current: {txModalItem.current_stock} {txModalItem.unit}
            </Badge>
          </div>

          <form onSubmit={handleRecordTx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity ({txModalItem.unit}) *
              </label>
              <input
                type="number"
                step="0.5"
                min={0.5}
                required
                value={txQty}
                onChange={(e) => setTxQty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reference / Batch Note
              </label>
              <input
                type="text"
                value={txNote}
                onChange={(e) => setTxNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" size="sm" className="w-full">
                Confirm
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setTxModalItem(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Inventory Table */}
      {inventory.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-800 flex items-center justify-center mx-auto">
            <Package className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              No inventory items yet. Add your first storeroom ingredient
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Track stock quantities, minimum safety thresholds, unit costs, and expiry dates for your mess kitchen.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowAddForm(true)}
          >
            Add First Ingredient
          </Button>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                  <th className="py-3.5 px-4">Ingredient &amp; Supplier</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Current Stock</th>
                  <th className="py-3.5 px-4">Min Threshold</th>
                  <th className="py-3.5 px-4">Unit Price</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Stock Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => {
                  const isLow =
                    Number(item.current_stock) < Number(item.minimum_stock);
                  const daysToExpiry = item.expiry_date
                    ? Math.ceil(
                        (new Date(item.expiry_date).getTime() - Date.now()) /
                          86400000
                      )
                    : 99;

                  return (
                    <tr key={item.id} className="hover:bg-cream-50/70">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">
                          {item.ingredient_name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.supplier_name}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-sm font-extrabold ${
                            isLow ? 'text-amber-800' : 'text-slate-900'
                          }`}
                        >
                          {item.current_stock} {item.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.minimum_stock} {item.unit}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        ₹{item.unit_price}/{item.unit}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span
                            className={
                              daysToExpiry <= 3
                                ? 'font-bold text-amber-800'
                                : 'text-slate-700'
                            }
                          >
                            {item.expiry_date || 'N/A'}
                          </span>
                        </div>
                        {daysToExpiry <= 3 && (
                          <span className="text-[10px] font-bold text-amber-700">
                            Expires in {daysToExpiry}d
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isLow ? (
                          <Badge variant="amber">Low Stock</Badge>
                        ) : (
                          <Badge variant="green">Healthy</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenTx(item, 'purchase')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 font-bold"
                            title="Record Stock Purchase"
                          >
                            <ArrowUpCircle className="w-3.5 h-3.5" /> + Purchase
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenTx(item, 'consumption')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                            title="Record Kitchen Consumption"
                          >
                            <ArrowDownCircle className="w-3.5 h-3.5" /> - Consume
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Recent Stock Transactions Log */}
      <Card className="p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Recent Stock Purchases &amp; Kitchen Consumption Ledger
        </h3>
        {inventoryTransactions.length === 0 ? (
          <div className="p-6 rounded-xl bg-cream-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
            No stock purchase or consumption transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Ingredient</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Quantity</th>
                  <th className="py-2.5 px-4">Value</th>
                  <th className="py-2.5 px-4">Reference Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-2.5 px-4 text-slate-600">
                      {tx.transaction_date}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {tx.ingredient_name}
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge
                        variant={
                          tx.transaction_type === 'purchase'
                            ? 'green'
                            : 'neutral'
                        }
                      >
                        {tx.transaction_type.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 font-bold">
                      {tx.transaction_type === 'purchase' ? '+' : '-'}
                      {tx.quantity} {tx.unit}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      ₹{Number(tx.total_cost || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">
                      {tx.reference_note}
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
