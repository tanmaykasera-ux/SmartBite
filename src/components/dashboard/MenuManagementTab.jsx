import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Plus,
  Edit3,
  Trash2,
  Upload,
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  Save,
  Salad,
  X,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useData } from '../../context/DataContext';
import { uploadFoodImage } from '../../lib/supabase';
import {
  getTodayDateStr,
  getTomorrowDateStr,
  normalizeDateStr,
  formatHumanDate,
} from '../../lib/dateUtils';

const emptyDishForm = {
  id: '',
  name: '',
  description: '',
  image_url: '',
  serving_size: '1 Bowl (160g)',
  calories: 240,
  protein: 12,
  carbs: 32,
  fats: 8,
  ingredients: '',
};

export default function MenuManagementTab() {
  const { menus, saveMenu, addOrUpdateMenuItem, deleteMenuItem } = useData();

  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMealType, setSelectedMealType] = useState('lunch');

  // Find or initialize the active menu strictly for (selectedDate, selectedMealType)
  const existingMenuForDate = menus.find(
    (m) =>
      normalizeDateStr(m.menu_date) === normalizeDateStr(selectedDate) &&
      String(m.meal_type || '').toLowerCase() === selectedMealType
  );

  const activeMenu = existingMenuForDate || {
    id: `menu-${selectedMealType}-${selectedDate}`,
    menu_date: selectedDate,
    meal_type: selectedMealType,
    title: `${selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} Special Menu`,
    publish_status: 'draft',
    selection_deadline: `${selectedDate}T09:30`,
    notes: '',
    items: [],
  };

  const [menuTitle, setMenuTitle] = useState(activeMenu.title || '');
  const [deadline, setDeadline] = useState(
    activeMenu.selection_deadline
      ? activeMenu.selection_deadline.slice(0, 16)
      : `${selectedDate}T09:30`
  );
  const [notes, setNotes] = useState(activeMenu.notes || '');
  const [statusMessage, setStatusMessage] = useState('');

  // Dish Add/Edit Modal State
  const [showDishForm, setShowDishForm] = useState(false);
  const [dishForm, setDishForm] = useState(emptyDishForm);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Sync form fields whenever selectedDate, selectedMealType, or the underlying Supabase menu record changes
  useEffect(() => {
    const found = menus.find(
      (m) =>
        normalizeDateStr(m.menu_date) === normalizeDateStr(selectedDate) &&
        String(m.meal_type || '').toLowerCase() === selectedMealType
    );
    if (found) {
      setMenuTitle(found.title || '');
      setDeadline(
        found.selection_deadline
          ? found.selection_deadline.slice(0, 16)
          : `${selectedDate}T09:30`
      );
      setNotes(found.notes || '');
    } else {
      setMenuTitle(
        `${selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} Institutional Menu`
      );
      setDeadline(`${selectedDate}T09:30`);
      setNotes('');
    }
  }, [
    selectedDate,
    selectedMealType,
    existingMenuForDate?.id,
    existingMenuForDate?.title,
    existingMenuForDate?.selection_deadline,
    existingMenuForDate?.notes,
  ]);

  const handleSwitchSession = (dateVal, mealVal) => {
    const normalizedDate = normalizeDateStr(dateVal) || todayStr;
    setSelectedDate(normalizedDate);
    setSelectedMealType(mealVal);
    setShowDishForm(false);
    setStatusMessage('');
  };

  const handleSaveMenuStatus = async (publishStatus) => {
    const saved = await saveMenu({
      ...activeMenu,
      menu_date: selectedDate,
      meal_type: selectedMealType,
      title: menuTitle || `${selectedMealType.toUpperCase()} Menu`,
      selection_deadline: deadline,
      notes,
      publish_status: publishStatus,
      items: activeMenu.items || [],
    });

    setStatusMessage(
      publishStatus === 'published'
        ? `Menu published for ${saved.meal_type.toUpperCase()} on ${formatHumanDate(
            saved.menu_date
          )} (${saved.menu_date})! Instant notification sent to all registered students.`
        : `Draft saved for ${saved.meal_type.toUpperCase()} on ${formatHumanDate(
            saved.menu_date
          )} (${saved.menu_date}).`
    );
  };

  const handleOpenAddDish = () => {
    setDishForm(emptyDishForm);
    setShowDishForm(true);
  };

  const handleOpenEditDish = (dish) => {
    setDishForm({
      ...dish,
      ingredients: Array.isArray(dish.ingredients)
        ? dish.ingredients.join(', ')
        : dish.ingredients || '',
    });
    setShowDishForm(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const url = await uploadFoodImage(file);
      setDishForm((prev) => ({ ...prev, image_url: url }));
    } catch {
      // fallback
    } finally {
      setUploadingImg(false);
    }
  };

  const handleDishSubmit = async (e) => {
    e.preventDefault();
    if (!dishForm.name.trim()) return;

    // Ensure parent menu exists in state first
    const ensuredMenu = await saveMenu({
      ...activeMenu,
      menu_date: selectedDate,
      meal_type: selectedMealType,
      title: menuTitle || activeMenu.title,
      selection_deadline: deadline,
      notes,
    });

    await addOrUpdateMenuItem(ensuredMenu.id, dishForm);
    setShowDishForm(false);
    setDishForm(emptyDishForm);
    setStatusMessage(
      `Dish "${dishForm.name}" saved to ${selectedMealType.toUpperCase()} menu for ${formatHumanDate(
        selectedDate
      )} (${selectedDate}).`
    );
  };

  const handleDeleteDish = async (dishId, dishName) => {
    await deleteMenuItem(activeMenu.id, dishId);
    setStatusMessage(
      `Removed "${dishName}" from ${selectedMealType.toUpperCase()} menu (${selectedDate}).`
    );
  };

  const totalCalories = (activeMenu.items || []).reduce((s, i) => s + Number(i.calories || 0), 0);
  const totalProtein = (activeMenu.items || []).reduce((s, i) => s + Number(i.protein || 0), 0);
  const totalCarbs = (activeMenu.items || []).reduce((s, i) => s + Number(i.carbs || 0), 0);
  const totalFats = (activeMenu.items || []).reduce((s, i) => s + Number(i.fats || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Schedule & Meal Selector Bar */}
      <Card className="p-5 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-brand-700" />
              Menu Scheduling &amp; Dish Builder — {formatHumanDate(selectedDate)}
            </h2>
            <p className="text-xs text-slate-500">
              Schedule date-specific Breakfast, Lunch, and Dinner menus, set student selection deadlines, and publish with full nutrition transparency.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex rounded-xl bg-cream-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => handleSwitchSession(todayStr, selectedMealType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedDate === todayStr
                    ? 'bg-brand-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Today ({todayStr})
              </button>
              <button
                type="button"
                onClick={() => handleSwitchSession(tomorrowStr, selectedMealType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedDate === tomorrowStr
                    ? 'bg-brand-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tomorrow ({tomorrowStr})
              </button>
            </div>

            <div className="flex items-center gap-2 bg-cream-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Calendar className="w-4 h-4 text-brand-700" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleSwitchSession(e.target.value, selectedMealType)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
              />
            </div>

            <div className="inline-flex rounded-xl bg-cream-100 p-1 border border-slate-200">
              {['breakfast', 'lunch', 'dinner'].map((meal) => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => handleSwitchSession(selectedDate, meal)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    selectedMealType === meal
                      ? 'bg-brand-800 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-900 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
              {statusMessage}
            </span>
            <button
              type="button"
              onClick={() => setStatusMessage('')}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Menu Metadata Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Menu Theme / Title
            </label>
            <input
              type="text"
              value={menuTitle}
              onChange={(e) => setMenuTitle(e.target.value)}
              placeholder="e.g., High-Protein Wednesday Lunch Thali"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-700" />
              Student Selection Cutoff Deadline
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kitchen &amp; Dietary Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Jain counter available at Line 2"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
          </div>
        </div>

        {/* Macro Summary & Publish Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant={activeMenu.publish_status === 'published' ? 'green' : 'amber'}>
              Status: {(activeMenu.publish_status || 'draft').toUpperCase()}
            </Badge>
            <span className="px-3 py-1 rounded-full bg-cream-100 text-slate-800 font-semibold border border-slate-200">
              Total Calories: {totalCalories} kcal
            </span>
            <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-800 font-semibold border border-brand-200">
              Protein: {totalProtein.toFixed(1)}g
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
              Carbs: {totalCarbs.toFixed(1)}g
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-medium">
              Fats: {totalFats.toFixed(1)}g
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Plus}
              iconPosition="left"
              onClick={handleOpenAddDish}
            >
              Add Food Item
            </Button>
            <Button
              type="button"
              variant="soft"
              size="sm"
              icon={Save}
              iconPosition="left"
              onClick={() => handleSaveMenuStatus('draft')}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={Send}
              iconPosition="left"
              onClick={() => handleSaveMenuStatus('published')}
            >
              Publish &amp; Notify Students
            </Button>
          </div>
        </div>
      </Card>

      {/* Add / Edit Dish Modal Form */}
      {showDishForm && (
        <Card className="p-6 border-2 border-brand-700 shadow-elevated space-y-5 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Salad className="w-5 h-5 text-brand-700" />
              {dishForm.id ? `Edit Dish: ${dishForm.name}` : `Add New Dish to ${selectedMealType.toUpperCase()}`}
            </h3>
            <button
              type="button"
              onClick={() => setShowDishForm(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleDishSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={dishForm.name}
                  onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                  placeholder="e.g., Paneer Butter Masala / Masala Sprouts"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Serving Size *
                </label>
                <input
                  type="text"
                  required
                  value={dishForm.serving_size}
                  onChange={(e) => setDishForm({ ...dishForm, serving_size: e.target.value })}
                  placeholder="e.g., 1 Bowl (180g) / 3 Rotis"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dish Description
              </label>
              <input
                type="text"
                value={dishForm.description}
                onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                placeholder="Describe preparation style, tempering, and nutritional highlights..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Calories (kcal) *
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={dishForm.calories}
                  onChange={(e) => setDishForm({ ...dishForm, calories: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Protein (g) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  required
                  value={dishForm.protein}
                  onChange={(e) => setDishForm({ ...dishForm, protein: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Carbohydrates (g) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  required
                  value={dishForm.carbs}
                  onChange={(e) => setDishForm({ ...dishForm, carbs: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fats (g) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  required
                  value={dishForm.fats}
                  onChange={(e) => setDishForm({ ...dishForm, fats: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Ingredients (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={dishForm.ingredients}
                  onChange={(e) => setDishForm({ ...dishForm, ingredients: e.target.value })}
                  placeholder="e.g., Fresh Paneer, Spinach, Tomatoes, Cumin, Sunflower Oil"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Upload Food Image or Paste Image URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={dishForm.image_url}
                    onChange={(e) => setDishForm({ ...dishForm, image_url: e.target.value })}
                    placeholder="https://... or upload file →"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-700"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 text-xs font-semibold shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImg ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowDishForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                {dishForm.id ? 'Update Dish' : 'Add Dish to Menu'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Dish Cards Grid for Active Menu */}
      {(activeMenu.items || []).length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-800 flex items-center justify-center mx-auto">
            <Utensils className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              No Dishes Added for {selectedMealType.toUpperCase()} on {formatHumanDate(selectedDate)} ({selectedDate})
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click &ldquo;Add Food Item&rdquo; above to add dishes with ingredients, serving sizes, and macro-nutrients for {formatHumanDate(selectedDate)}.
            </p>
          </div>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAddDish}>
            Add First Food Item
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeMenu.items || []).map((dish) => (
            <Card key={dish.id} className="p-0 overflow-hidden flex flex-col justify-between">
              <div>
                <div className="h-44 w-full bg-cream-200 relative overflow-hidden">
                  {dish.image_url ? (
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Utensils className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-brand-950/85 text-white backdrop-blur-sm">
                      {dish.serving_size}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-brand-900 shadow-sm">
                      {dish.calories} kcal
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-slate-900">{dish.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {dish.description || 'Prepared fresh following institutional nutrition standards.'}
                  </p>

                  {/* Macros Pill Strip */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-lg bg-brand-50 border border-brand-100">
                      <p className="text-[10px] text-brand-700 font-semibold">Protein</p>
                      <p className="text-xs font-extrabold text-brand-900">{dish.protein}g</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                      <p className="text-[10px] text-slate-500 font-semibold">Carbs</p>
                      <p className="text-xs font-extrabold text-slate-800">{dish.carbs}g</p>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/60">
                      <p className="text-[10px] text-amber-800 font-semibold">Fats</p>
                      <p className="text-xs font-extrabold text-amber-900">{dish.fats}g</p>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Ingredients
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(dish.ingredients)
                        ? dish.ingredients
                        : String(dish.ingredients || '').split(',')
                      )
                        .filter(Boolean)
                        .map((ing) => (
                          <span
                            key={ing}
                            className="px-2 py-0.5 rounded bg-cream-100 text-slate-700 text-[11px] font-medium border border-slate-200/80"
                          >
                            {ing}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-cream-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-800">
                  {dish.selected_count || 0} student selections
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditDish(dish)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-brand-800 hover:bg-brand-50 transition-colors"
                    title="Edit Dish"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDish(dish.id, dish.name)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                    title="Delete Dish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
