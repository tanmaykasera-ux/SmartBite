import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Send,
  Save,
  Clock,
  Utensils,
  CheckCircle2,
  X,
  Calendar,
  Copy,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import {
  getTodayDateStr,
  normalizeDateStr,
  formatHumanDate,
  getWeekStartDateStr,
  getWeekDays,
  addDaysToDateStr,
  computeMealPollWindow,
} from '../../lib/dateUtils';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

const emptyDishForm = {
  id: '',
  name: '',
  description: '',
  image_url:
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80',
};

export default function MenuManagementTab() {
  const {
    menus,
    messProfile,
    saveMenu,
    addOrUpdateMenuItem,
    deleteMenuItem,
    duplicateDayMenus,
    copyLastWeekMenus,
    updateWeekMenusPublishStatus,
  } = useData();

  const todayStr = getTodayDateStr();
  const [weekStartDate, setWeekStartDate] = useState(() =>
    getWeekStartDateStr(todayStr)
  );
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMeal, setSelectedMeal] = useState('lunch');

  const weekDays = useMemo(() => getWeekDays(weekStartDate), [weekStartDate]);

  // Keep selectedDate inside the active week when navigating weeks
  useEffect(() => {
    const inWeek = weekDays.some((d) => d.dateStr === selectedDate);
    if (!inWeek && weekDays.length > 0) {
      const todayInWeek = weekDays.find((d) => d.dateStr === todayStr);
      setSelectedDate(todayInWeek ? todayInWeek.dateStr : weekDays[0].dateStr);
    }
  }, [weekStartDate, weekDays, selectedDate, todayStr]);

  // Match strictly by BOTH menu_date AND meal_type
  const currentMenu = useMemo(
    () =>
      menus.find(
        (m) =>
          normalizeDateStr(m.menu_date) === normalizeDateStr(selectedDate) &&
          String(m.meal_type || '').toLowerCase() === selectedMeal
      ) || null,
    [menus, selectedDate, selectedMeal]
  );

  const [menuMeta, setMenuMeta] = useState({
    title: '',
    menu_date: selectedDate,
    notes: '',
  });

  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [dishForm, setDishForm] = useState(emptyDishForm);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [dupSourceDate, setDupSourceDate] = useState(todayStr);
  const [dupTargetDate, setDupTargetDate] = useState(
    addDaysToDateStr(todayStr, 1)
  );
  const [toastMsg, setToastMsg] = useState('');
  const [busyAction, setBusyAction] = useState(false);

  useEffect(() => {
    const dayObj = weekDays.find((d) => d.dateStr === selectedDate);
    const defaultTitle = `${dayObj?.dayName || ''} ${
      selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)
    } Fixed Menu`.trim();

    if (currentMenu) {
      setMenuMeta({
        title: currentMenu.title || defaultTitle,
        menu_date: normalizeDateStr(currentMenu.menu_date) || selectedDate,
        notes: currentMenu.notes || '',
      });
    } else {
      setMenuMeta({
        title: defaultTitle,
        menu_date: selectedDate,
        notes: 'Fixed institutional menu served to all enrolled students.',
      });
    }
  }, [selectedMeal, selectedDate, currentMenu?.id, weekDays]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleSaveSlot = async (publishStatus) => {
    setBusyAction(true);
    try {
      await saveMenu({
        id: currentMenu?.id,
        meal_type: selectedMeal,
        menu_date: selectedDate,
        title:
          menuMeta.title ||
          `${selectedMeal.toUpperCase()} Menu (${formatHumanDate(selectedDate)})`,
        notes: menuMeta.notes,
        publish_status: publishStatus,
        items: currentMenu?.items || [],
      });
      showToast(
        publishStatus === 'published'
          ? `${selectedMeal.toUpperCase()} menu for ${formatHumanDate(
              selectedDate
            )} published!`
          : `${selectedMeal.toUpperCase()} menu for ${formatHumanDate(
              selectedDate
            )} saved as draft.`
      );
    } finally {
      setBusyAction(false);
    }
  };

  const handleWeekStatusChange = async (publishStatus) => {
    setBusyAction(true);
    try {
      const count = await updateWeekMenusPublishStatus(
        weekStartDate,
        publishStatus
      );
      if (count === 0) {
        showToast(
          'No menus exist in this week yet. Add dishes to at least one day first.'
        );
      } else {
        showToast(
          publishStatus === 'published'
            ? `Published ${count} meal menu(s) for the week (${weekDays[0].shortDate} – ${weekDays[6].shortDate})!`
            : `Saved ${count} meal menu(s) in this week as Draft.`
        );
      }
    } finally {
      setBusyAction(false);
    }
  };

  const handleCopyLastWeek = async () => {
    setBusyAction(true);
    try {
      const copied = await copyLastWeekMenus(weekStartDate);
      if (copied > 0) {
        showToast(
          `Copied ${copied} meal slot(s) from last week into ${weekDays[0].shortDate} – ${weekDays[6].shortDate} as Draft.`
        );
      } else {
        showToast(
          'No menus found in the previous week to copy. You can use "Duplicate a Day" to copy any existing day across the week.'
        );
      }
    } finally {
      setBusyAction(false);
    }
  };

  const handleDuplicateDaySubmit = async (e) => {
    e.preventDefault();
    setBusyAction(true);
    try {
      const copied = await duplicateDayMenus(dupSourceDate, dupTargetDate);
      setDuplicateModalOpen(false);
      if (copied > 0) {
        setSelectedDate(dupTargetDate);
        setWeekStartDate(getWeekStartDateStr(dupTargetDate));
        showToast(
          `Duplicated ${copied} meal(s) from ${formatHumanDate(
            dupSourceDate
          )} to ${formatHumanDate(dupTargetDate)} as Draft.`
        );
      } else {
        showToast(
          `No dishes found on ${formatHumanDate(dupSourceDate)} to duplicate.`
        );
      }
    } finally {
      setBusyAction(false);
    }
  };

  const openAddDish = () => {
    setDishForm({
      ...emptyDishForm,
      id: '',
    });
    setDishModalOpen(true);
  };

  const openEditDish = (dish) => {
    setDishForm({
      id: dish.id || '',
      name: dish.name || dish.dish_name || '',
      description: dish.description || '',
      image_url: dish.image_url || emptyDishForm.image_url,
    });
    setDishModalOpen(true);
  };

  const handleDishSubmit = async (e) => {
    e.preventDefault();
    let targetMenuId = currentMenu?.id;
    if (!targetMenuId) {
      const created = await saveMenu({
        meal_type: selectedMeal,
        menu_date: selectedDate,
        title:
          menuMeta.title ||
          `${selectedMeal.toUpperCase()} Menu (${formatHumanDate(selectedDate)})`,
        notes: menuMeta.notes,
        publish_status: 'draft',
        items: [],
      });
      targetMenuId = created.id;
    }

    await addOrUpdateMenuItem(targetMenuId, {
      id: dishForm.id,
      name: dishForm.name,
      description: dishForm.description,
      image_url: dishForm.image_url,
    });
    setDishModalOpen(false);
    showToast(
      `Dish "${dishForm.name}" saved to ${formatHumanDate(
        selectedDate
      )} (${selectedMeal.toUpperCase()})!`
    );
  };

  const handleDeleteDish = async (dishId, dishName) => {
    if (!currentMenu) return;
    await deleteMenuItem(currentMenu.id, dishId);
    showToast(`Removed "${dishName}" from ${formatHumanDate(selectedDate)}.`);
  };

  const items = currentMenu?.items || [];
  const pollWin = computeMealPollWindow(selectedDate, selectedMeal, messProfile);

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="p-4 rounded-xl bg-brand-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-300 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button type="button" onClick={() => setToastMsg('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Weekly Planner Header & Week Actions */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
              <Calendar className="w-3.5 h-3.5" />
              <span>Monday – Sunday Weekly Menu Planner</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
              Week of {weekDays[0]?.humanDate} – {weekDays[6]?.humanDate}
            </h2>
            <p className="text-xs text-slate-500">
              Plan fixed menus for Breakfast, Lunch, and Dinner across the week. Only published menus are visible to students.
            </p>
          </div>

          {/* Week Navigation + Weekly Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-cream-50 p-1">
              <button
                type="button"
                onClick={() =>
                  setWeekStartDate(addDaysToDateStr(weekStartDate, -7))
                }
                className="p-1.5 rounded-lg hover:bg-white text-slate-700"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setWeekStartDate(getWeekStartDateStr(todayStr))}
                className="px-2.5 py-1 text-xs font-bold text-brand-900 hover:bg-white rounded-lg"
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() =>
                  setWeekStartDate(addDaysToDateStr(weekStartDate, 7))
                }
                className="p-1.5 rounded-lg hover:bg-white text-slate-700"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Button
              size="sm"
              variant="secondary"
              icon={Copy}
              disabled={busyAction}
              onClick={handleCopyLastWeek}
            >
              Copy Last Week’s Menu
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={Layers}
              disabled={busyAction}
              onClick={() => {
                setDupSourceDate(selectedDate);
                setDupTargetDate(addDaysToDateStr(selectedDate, 1));
                setDuplicateModalOpen(true);
              }}
            >
              Duplicate a Day
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={Save}
              disabled={busyAction}
              onClick={() => handleWeekStatusChange('draft')}
            >
              Save Week as Draft
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Send}
              disabled={busyAction}
              onClick={() => handleWeekStatusChange('published')}
            >
              Publish Week
            </Button>
          </div>
        </div>

        {/* Monday to Sunday × Breakfast, Lunch, Dinner Grid */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[860px]">
            <thead>
              <tr className="border-b border-slate-200 bg-cream-100/70">
                <th className="py-2.5 px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 w-28">
                  Meal
                </th>
                {weekDays.map((day) => {
                  const isSelectedDay = day.dateStr === selectedDate;
                  return (
                    <th
                      key={day.dateStr}
                      onClick={() => setSelectedDate(day.dateStr)}
                      className={`py-2.5 px-2.5 text-xs cursor-pointer transition-colors border-l border-slate-200/70 ${
                        isSelectedDay
                          ? 'bg-brand-900 text-white'
                          : day.isToday
                          ? 'bg-brand-50 text-brand-950'
                          : 'hover:bg-cream-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold">{day.shortDay}</span>
                        {day.isToday && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase bg-brand-700 text-white">
                            Today
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[10px] font-medium mt-0.5 ${
                          isSelectedDay ? 'text-brand-200' : 'text-slate-500'
                        }`}
                      >
                        {day.shortDate}
                      </p>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                <tr key={mealType}>
                  <td className="py-3 px-3 bg-cream-50 font-extrabold text-xs uppercase tracking-wider text-brand-900 align-top">
                    {mealType}
                  </td>
                  {weekDays.map((day) => {
                    const cellMenu = menus.find(
                      (m) =>
                        normalizeDateStr(m.menu_date) === day.dateStr &&
                        String(m.meal_type || '').toLowerCase() === mealType
                    );
                    const isSelectedCell =
                      day.dateStr === selectedDate && mealType === selectedMeal;
                    const dishList = cellMenu?.items || [];
                    const isPublished =
                      cellMenu?.publish_status === 'published';

                    return (
                      <td
                        key={`${day.dateStr}_${mealType}`}
                        onClick={() => {
                          setSelectedDate(day.dateStr);
                          setSelectedMeal(mealType);
                        }}
                        className={`p-2.5 align-top border-l border-slate-200/70 cursor-pointer transition-all ${
                          isSelectedCell
                            ? 'bg-brand-50/90 ring-2 ring-inset ring-brand-700'
                            : 'hover:bg-cream-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          {cellMenu ? (
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                isPublished
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isPublished ? 'Published' : 'Draft'}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              Empty
                            </span>
                          )}
                          {dishList.length > 0 && (
                            <span className="text-[10px] font-semibold text-slate-500">
                              {dishList.length} dish{dishList.length === 1 ? '' : 'es'}
                            </span>
                          )}
                        </div>

                        {dishList.length > 0 ? (
                          <ul className="space-y-0.5">
                            {dishList.slice(0, 3).map((d) => (
                              <li
                                key={d.id}
                                className="text-[11px] font-semibold text-slate-800 truncate"
                              >
                                • {d.name}
                              </li>
                            ))}
                            {dishList.length > 3 && (
                              <li className="text-[10px] text-brand-700 font-bold">
                                +{dishList.length - 3} more
                              </li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-[10px] text-slate-400 mt-1">
                            Click to add dishes
                          </p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Active Slot Editor (Selected Day & Meal) */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  currentMenu?.publish_status === 'published'
                    ? 'green'
                    : 'amber'
                }
              >
                {currentMenu?.publish_status === 'published'
                  ? 'Published to Students'
                  : 'Draft Slot (Hidden from Students)'}
              </Badge>
              <span className="text-xs font-bold text-brand-800">
                {formatHumanDate(selectedDate)} • {selectedMeal.toUpperCase()}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-700" />
                {pollWin.statusBadge}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {menuMeta.title || 'Fixed Meal Menu'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              size="sm"
              variant="secondary"
              icon={Save}
              disabled={busyAction}
              onClick={() => handleSaveSlot('draft')}
            >
              Save Slot as Draft
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Send}
              disabled={busyAction}
              onClick={() => handleSaveSlot('published')}
            >
              Publish This Meal
            </Button>
            <Button
              size="sm"
              variant="accent"
              icon={Plus}
              onClick={openAddDish}
            >
              Add Dish to {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}
            </Button>
          </div>
        </div>

        {/* Editable Slot Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Meal Title ({formatHumanDate(selectedDate)})
            </label>
            <input
              type="text"
              value={menuMeta.title}
              onChange={(e) =>
                setMenuMeta({ ...menuMeta, title: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kitchen &amp; Counter Notes
            </label>
            <input
              type="text"
              value={menuMeta.notes}
              onChange={(e) =>
                setMenuMeta({ ...menuMeta, notes: e.target.value })
              }
              placeholder="e.g., Jain counter at Counter 2; fresh curd included."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-600"
            />
          </div>
        </div>
      </Card>

      {/* Dish Cards Grid for Selected Slot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((dish) => (
          <Card
            key={dish.id}
            className="overflow-hidden flex flex-col justify-between p-0"
          >
            <div>
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={dish.image_url}
                  alt={dish.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-xs inline-flex items-center gap-1">
                    <Utensils className="w-3 h-3" /> Fixed Menu Dish
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditDish(dish)}
                    className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 shadow-xs"
                    title="Edit Dish"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDish(dish.id, dish.name)}
                    className="p-1.5 rounded-lg bg-white/90 hover:bg-rose-50 text-rose-600 shadow-xs"
                    title="Delete Dish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {dish.name}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {dish.description || 'Included in the fixed meal thali for all enrolled students.'}
                </p>
              </div>
            </div>
          </Card>
        ))}

        {/* Add Dish Card */}
        <button
          type="button"
          onClick={openAddDish}
          className="min-h-[240px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-600 bg-cream-50/50 hover:bg-brand-50/30 flex flex-col items-center justify-center p-6 text-center transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-900">
            Add Dish to {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} ({formatHumanDate(selectedDate)})
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Enter dish name, description, and image for the weekly menu schedule.
          </p>
        </button>
      </div>

      {/* Duplicate a Day Modal */}
      {duplicateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Duplicate a Day’s Menu (Breakfast, Lunch &amp; Dinner)
              </h3>
              <button
                type="button"
                onClick={() => setDuplicateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleDuplicateDaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Copy From Date (Source Day)
                </label>
                <input
                  type="date"
                  required
                  value={dupSourceDate}
                  onChange={(e) => setDupSourceDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Copy To Date (Target Day)
                </label>
                <input
                  type="date"
                  required
                  value={dupTargetDate}
                  onChange={(e) => setDupTargetDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDuplicateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" icon={Layers}>
                  Duplicate Day as Draft
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      {dishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <Card className="w-full max-w-lg p-6 space-y-5 bg-white my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {dishForm.id ? 'Edit Dish' : 'Add Dish to Fixed Menu'}
                </h3>
                <p className="text-xs text-slate-500">
                  {formatHumanDate(selectedDate)} • {selectedMeal.toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDishModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDishSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={dishForm.name}
                  onChange={(e) =>
                    setDishForm({ ...dishForm, name: e.target.value })
                  }
                  placeholder="e.g., Palak Paneer / Methi Chaman"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={dishForm.description}
                  onChange={(e) =>
                    setDishForm({ ...dishForm, description: e.target.value })
                  }
                  placeholder="Describe preparation method, tempering and accompaniments..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dish Image URL
                </label>
                <input
                  type="url"
                  value={dishForm.image_url}
                  onChange={(e) =>
                    setDishForm({ ...dishForm, image_url: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDishModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" icon={Save}>
                  Save Dish to Slot
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
