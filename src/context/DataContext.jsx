import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth, generateJoinCode } from './AuthContext';
import {
  initialMessProfile,
  initialMenus,
  initialStudentsList,
  initialHistoricalSelections,
  initialWasteLogs,
  weeklyConsumptionVsWasteSeries,
  initialInventory,
  initialInventoryTransactions,
  initialFeedbackList,
  initialNotifications,
  initialStudentSelectionsMap,
  initialStudentMealHistory,
  initialHolidaysEvents,
  initialColleges,
  initialMessesList,
  initialPlatformUsers,
  pricingPlans,
  initialActiveSubscriptions,
  initialPaymentsList,
  initialSupportTickets,
  platformGrowthSeries as demoPlatformGrowthSeries,
} from '../data/mockData';
import {
  generateDemandForecasts,
  analyzeFoodWaste,
  analyzeInventoryIntelligence,
  generateSmartRecommendations,
  computeMessNutritionAnalytics,
} from '../lib/analyticsEngine';
import {
  getTodayDateStr,
  normalizeDateStr,
  formatHumanDate,
} from '../lib/dateUtils';

const DataContext = createContext(null);

function loadDemoLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveDemoLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

function createEmptyMessProfile(user) {
  return {
    id: user?.messId || '',
    name: user?.messName || '',
    mess_name: user?.messName || '',
    college_name: user?.collegeName || '',
    hostel_name: user?.hostelName || '',
    owner_name: user?.fullName || '',
    owner_email: user?.email || '',
    contact_number: user?.phone || '',
    join_code: '',
    capacity: 0,
    registered_students: 0,
    breakfast_time: '07:30 AM - 09:30 AM',
    lunch_time: '12:30 PM - 02:30 PM',
    dinner_time: '07:30 PM - 09:30 PM',
    default_cutoff_hours: 4,
    walk_in_buffer_pct: 8,
    status: 'active',
  };
}

function createEmptyStudentProfile(user) {
  return {
    full_name: user?.fullName || '',
    email: user?.email || '',
    student_roll_id: user?.studentId || '',
    roll_number: user?.studentId || '',
    college_name: user?.collegeName || '',
    hostel_name: user?.hostelName || '',
    room_number: '',
    dietary_preference: 'Vegetarian',
    daily_calorie_goal: 2200,
    allergies_note: '',
    phone: user?.phone || '',
    meal_entitlement_active: true,
  };
}

export function DataProvider({ children }) {
  const { user, isDemoMode } = useAuth();
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
  const [studentsQueryError, setStudentsQueryError] = useState('');
  const [selectionsQueryError, setSelectionsQueryError] = useState('');

  // Shared Mess & Operational State (Empty by default when Supabase is connected; sample data ONLY in Demo Mode)
  const [messProfile, setMessProfile] = useState(() =>
    isDemoMode
      ? loadDemoLocal('sb_demo_mess_profile', initialMessProfile)
      : createEmptyMessProfile(user)
  );
  const [menus, setMenus] = useState(() =>
    isDemoMode ? loadDemoLocal('sb_demo_menus', initialMenus) : []
  );
  const [students, setStudents] = useState(() =>
    isDemoMode ? loadDemoLocal('sb_demo_students', initialStudentsList) : []
  );
  const [mealSelectionsRows, setMealSelectionsRows] = useState([]);
  const [historicalSelections, setHistoricalSelections] = useState(() =>
    isDemoMode
      ? loadDemoLocal('sb_demo_hist_selections', initialHistoricalSelections)
      : []
  );
  const [forecastOverridesMap, setForecastOverridesMap] = useState(() =>
    isDemoMode ? loadDemoLocal('sb_demo_forecast_overrides_map', {}) : {}
  );
  const [holidaysEvents, setHolidaysEvents] = useState(() =>
    isDemoMode
      ? loadDemoLocal('sb_demo_holidays_events', initialHolidaysEvents)
      : []
  );
  const [wasteLogs, setWasteLogs] = useState(() =>
    isDemoMode ? loadDemoLocal('sb_demo_waste_logs', initialWasteLogs) : []
  );
  const [weeklySeries, setWeeklySeries] = useState(() =>
    isDemoMode
      ? loadDemoLocal('sb_demo_weekly_series', weeklyConsumptionVsWasteSeries)
      : []
  );
  const [inventory, setInventory] = useState(() =>
    isDemoMode ? loadDemoLocal('sb_demo_inventory', initialInventory) : []
  );
  const [inventoryTransactions, setInventoryTransactions] = useState(() =>
    isDemoMode
      ? loadDemoLocal('sb_demo_inventory_tx', initialInventoryTransactions)
      : []
  );
  const [feedbackList, setFeedbackList] = useState(() =>
    isDemoMode ? loadDemoLocal('sb_demo_feedback', initialFeedbackList) : []
  );
  const [notifications, setNotifications] = useState(() =>
    isDemoMode
      ? loadDemoLocal('sb_demo_notifications', initialNotifications)
      : []
  );

  // Student Portal State
  const [studentSelectionsMap, setStudentSelectionsMap] = useState(() =>
    isDemoMode
      ? loadDemoLocal('sb_demo_student_selections_map', initialStudentSelectionsMap)
      : {}
  );
  const [studentMealHistory, setStudentMealHistory] = useState(() =>
    isDemoMode
      ? loadDemoLocal('sb_demo_student_meal_history', initialStudentMealHistory)
      : []
  );
  const [studentProfile, setStudentProfile] = useState(() =>
    isDemoMode
      ? loadDemoLocal('sb_demo_student_profile', {
          full_name: 'Aarav Sharma',
          email: 'aarav.sharma@nit.edu.in',
          student_roll_id: '2024CS101',
          roll_number: '2024CS101',
          college_name: 'National Institute of Technology (NIT) Campus',
          hostel_name: 'Hostel Block A',
          room_number: 'A-304',
          dietary_preference: 'Vegetarian',
          daily_calorie_goal: 2200,
          allergies_note: 'None',
          phone: '+91 98451 10293',
          meal_entitlement_active: true,
        })
      : createEmptyStudentProfile(user)
  );

  // Super Admin State
  const [colleges, setColleges] = useState(() =>
    isDemoMode ? loadDemoLocal('sb_demo_colleges', initialColleges) : []
  );
  const [messesList, setMessesList] = useState(() =>
    isDemoMode ? loadDemoLocal('sb_demo_messes_list', initialMessesList) : []
  );
  const [platformUsers, setPlatformUsers] = useState(() =>
    isDemoMode
      ? loadDemoLocal('sb_demo_platform_users', initialPlatformUsers)
      : []
  );
  const [subscriptionPlans, setSubscriptionPlans] = useState(() =>
    isDemoMode ? loadDemoLocal('sb_demo_subscription_plans', pricingPlans) : []
  );
  const [activeSubscriptions, setActiveSubscriptions] = useState(() =>
    isDemoMode
      ? loadDemoLocal('sb_demo_active_subscriptions', initialActiveSubscriptions)
      : []
  );
  const [paymentRecords, setPaymentRecords] = useState(() =>
    isDemoMode ? loadDemoLocal('sb_demo_payment_records', initialPaymentsList) : []
  );
  const [supportTickets, setSupportTickets] = useState(() =>
    isDemoMode
      ? loadDemoLocal('sb_demo_support_tickets', initialSupportTickets)
      : []
  );
  const [platformGrowthSeries, setPlatformGrowthSeries] = useState(() =>
    isDemoMode ? demoPlatformGrowthSeries : []
  );

  // Persist to localStorage ONLY when in Demo Mode
  useEffect(() => {
    if (!isDemoMode) return;
    saveDemoLocal('sb_demo_mess_profile', messProfile);
    saveDemoLocal('sb_demo_menus', menus);
    saveDemoLocal('sb_demo_students', students);
    saveDemoLocal('sb_demo_hist_selections', historicalSelections);
    saveDemoLocal('sb_demo_forecast_overrides_map', forecastOverridesMap);
    saveDemoLocal('sb_demo_holidays_events', holidaysEvents);
    saveDemoLocal('sb_demo_waste_logs', wasteLogs);
    saveDemoLocal('sb_demo_weekly_series', weeklySeries);
    saveDemoLocal('sb_demo_inventory', inventory);
    saveDemoLocal('sb_demo_inventory_tx', inventoryTransactions);
    saveDemoLocal('sb_demo_feedback', feedbackList);
    saveDemoLocal('sb_demo_notifications', notifications);
    saveDemoLocal('sb_demo_student_selections_map', studentSelectionsMap);
    saveDemoLocal('sb_demo_student_meal_history', studentMealHistory);
    saveDemoLocal('sb_demo_student_profile', studentProfile);
    saveDemoLocal('sb_demo_colleges', colleges);
    saveDemoLocal('sb_demo_messes_list', messesList);
    saveDemoLocal('sb_demo_platform_users', platformUsers);
    saveDemoLocal('sb_demo_subscription_plans', subscriptionPlans);
    saveDemoLocal('sb_demo_active_subscriptions', activeSubscriptions);
    saveDemoLocal('sb_demo_payment_records', paymentRecords);
    saveDemoLocal('sb_demo_support_tickets', supportTickets);
  }, [
    isDemoMode,
    messProfile,
    menus,
    students,
    historicalSelections,
    forecastOverridesMap,
    holidaysEvents,
    wasteLogs,
    weeklySeries,
    inventory,
    inventoryTransactions,
    feedbackList,
    notifications,
    studentSelectionsMap,
    studentMealHistory,
    studentProfile,
    colleges,
    messesList,
    platformUsers,
    subscriptionPlans,
    activeSubscriptions,
    paymentRecords,
    supportTickets,
  ]);

  // Switch between Demo Mode and Live Supabase Mode cleanly when auth state changes
  useEffect(() => {
    if (isDemoMode) {
      setMessProfile(loadDemoLocal('sb_demo_mess_profile', initialMessProfile));
      setMenus(loadDemoLocal('sb_demo_menus', initialMenus));
      setStudents(loadDemoLocal('sb_demo_students', initialStudentsList));
      setHistoricalSelections(
        loadDemoLocal('sb_demo_hist_selections', initialHistoricalSelections)
      );
      setForecastOverridesMap(loadDemoLocal('sb_demo_forecast_overrides_map', {}));
      setHolidaysEvents(
        loadDemoLocal('sb_demo_holidays_events', initialHolidaysEvents)
      );
      setWasteLogs(loadDemoLocal('sb_demo_waste_logs', initialWasteLogs));
      setWeeklySeries(
        loadDemoLocal('sb_demo_weekly_series', weeklyConsumptionVsWasteSeries)
      );
      setInventory(loadDemoLocal('sb_demo_inventory', initialInventory));
      setInventoryTransactions(
        loadDemoLocal('sb_demo_inventory_tx', initialInventoryTransactions)
      );
      setFeedbackList(loadDemoLocal('sb_demo_feedback', initialFeedbackList));
      setNotifications(
        loadDemoLocal('sb_demo_notifications', initialNotifications)
      );
      setStudentSelectionsMap(
        loadDemoLocal(
          'sb_demo_student_selections_map',
          initialStudentSelectionsMap
        )
      );
      setStudentMealHistory(
        loadDemoLocal('sb_demo_student_meal_history', initialStudentMealHistory)
      );
      setColleges(loadDemoLocal('sb_demo_colleges', initialColleges));
      setMessesList(loadDemoLocal('sb_demo_messes_list', initialMessesList));
      setPlatformUsers(
        loadDemoLocal('sb_demo_platform_users', initialPlatformUsers)
      );
      setSubscriptionPlans(
        loadDemoLocal('sb_demo_subscription_plans', pricingPlans)
      );
      setActiveSubscriptions(
        loadDemoLocal(
          'sb_demo_active_subscriptions',
          initialActiveSubscriptions
        )
      );
      setPaymentRecords(
        loadDemoLocal('sb_demo_payment_records', initialPaymentsList)
      );
      setSupportTickets(
        loadDemoLocal('sb_demo_support_tickets', initialSupportTickets)
      );
      setPlatformGrowthSeries(demoPlatformGrowthSeries);
    } else {
      // Live Supabase Mode: Reset all state to empty/zero before loading real rows
      setMessProfile(createEmptyMessProfile(user));
      setMenus([]);
      setStudents([]);
      setMealSelectionsRows([]);
      setHistoricalSelections([]);
      setForecastOverridesMap({});
      setHolidaysEvents([]);
      setWasteLogs([]);
      setWeeklySeries([]);
      setInventory([]);
      setInventoryTransactions([]);
      setFeedbackList([]);
      setNotifications([]);
      setStudentSelectionsMap({});
      setStudentMealHistory([]);
      setStudentProfile(createEmptyStudentProfile(user));
      setColleges([]);
      setMessesList([]);
      setPlatformUsers([]);
      setSubscriptionPlans([]);
      setActiveSubscriptions([]);
      setPaymentRecords([]);
      setSupportTickets([]);
      setPlatformGrowthSeries([]);
    }
  }, [isDemoMode, user?.id]);

  // Fetch ONLY real rows from Supabase when connected and not in Demo Mode
  const refreshFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || isDemoMode || !user) return;
    setLoadingData(true);
    setDataError('');
    setStudentsQueryError('');
    setSelectionsQueryError('');
    try {
      const messId = user.messId;

      if (messId) {
        console.log(
          '[SmartBite][StudentsQuery] Executing query:',
          `supabase.from('students').select('*').eq('mess_id', '${messId}')`,
          {
            messId,
            ownerUserId: user.id,
            role: user.role,
            messName: user.messName,
          }
        );

        // Students must ONLY see menus from their own mess AND with publish_status = 'published'
        let menusQuery = supabase
          .from('menus')
          .select('*, menu_items(*)')
          .eq('mess_id', messId);

        if (user.role === 'student') {
          menusQuery = menusQuery.eq('publish_status', 'published');
        }

        const [
          messRes,
          menusRes,
          wasteRes,
          invRes,
          txRes,
          fbRes,
          notifRes,
          stuRes,
          holRes,
          attRes,
          selRes,
        ] = await Promise.all([
          supabase.from('messes').select('*').eq('id', messId).maybeSingle(),
          menusQuery.order('menu_date', { ascending: false }),
          supabase
            .from('food_waste_logs')
            .select('*')
            .eq('mess_id', messId)
            .order('log_date', { ascending: false }),
          supabase
            .from('inventory_items')
            .select('*')
            .eq('mess_id', messId)
            .order('ingredient_name'),
          supabase
            .from('inventory_transactions')
            .select('*, inventory_items(ingredient_name, unit)')
            .eq('mess_id', messId)
            .order('created_at', { ascending: false }),
          supabase
            .from('feedback')
            .select('*')
            .eq('mess_id', messId)
            .order('created_at', { ascending: false }),
          supabase
            .from('notifications')
            .select('*')
            .eq('mess_id', messId)
            .order('created_at', { ascending: false }),
          supabase.from('students').select('*').eq('mess_id', messId),
          supabase.from('holidays_events').select('*').eq('mess_id', messId),
          supabase
            .from('attendance_records')
            .select('*')
            .eq('mess_id', messId)
            .order('record_date', { ascending: true }),
          supabase
            .from('meal_selections')
            .select('*, selection_items(*)')
            .eq('mess_id', messId),
        ]);

        console.log('[SmartBite][StudentsQuery] Raw Supabase response:', {
          query: `SELECT * FROM public.students WHERE mess_id = '${messId}'`,
          messId,
          data: stuRes.data,
          error: stuRes.error,
          rowCount: Array.isArray(stuRes.data) ? stuRes.data.length : 0,
        });

        console.log('[SmartBite][MealSelectionsQuery] Raw Supabase response:', {
          query: `SELECT *, selection_items(*) FROM public.meal_selections WHERE mess_id = '${messId}'`,
          messId,
          data: selRes.data,
          error: selRes.error,
          rowCount: Array.isArray(selRes.data) ? selRes.data.length : 0,
        });

        // Only students whose mess_id matches this mess
        const realStudents = (stuRes.data || []).filter(
          (s) => s.mess_id === messId
        );
        const realStudentProfileIds = new Set(
          realStudents.map((s) => s.profile_id).filter(Boolean)
        );
        const studentByProfileId = {};
        realStudents.forEach((s) => {
          if (s.profile_id) studentByProfileId[s.profile_id] = s;
          if (s.id) studentByProfileId[s.id] = s;
        });

        // Deduplicate meal_selections by id (or menu_id + student_id) and scope strictly to messId
        const seenSelectionKeys = new Set();
        const realSelections = (selRes.data || []).filter((sel) => {
          if (!sel || sel.mess_id !== messId) return false;
          const dedupKey = sel.id || `${sel.menu_id}_${sel.student_id}`;
          if (seenSelectionKeys.has(dedupKey)) return false;
          seenSelectionKeys.add(dedupKey);
          return true;
        });

        if (selRes.error) {
          const selErrMsg = `Failed to load student meal selections from public.meal_selections (mess_id=${messId}): ${
            selRes.error.message || JSON.stringify(selRes.error)
          }${selRes.error.code ? ` [Code: ${selRes.error.code}]` : ''}.`;
          console.error('[SmartBite][MealSelectionsQuery] Query failed:', selErrMsg, selRes.error);
          setSelectionsQueryError(selErrMsg);
        }

        if (stuRes.error) {
          const errMsg = `Failed to load registered students from public.students (mess_id=${messId}): ${
            stuRes.error.message || JSON.stringify(stuRes.error)
          }${stuRes.error.code ? ` [Code: ${stuRes.error.code}]` : ''}. Please run migration 005_fix_owner_students_policy.sql in the Supabase SQL Editor.`;
          console.error('[SmartBite][StudentsQuery] Query failed:', errMsg, stuRes.error);
          setStudentsQueryError(errMsg);
          setDataError(errMsg);
        } else if (
          user.role === 'mess_owner' &&
          realStudents.length === 0 &&
          (realSelections.length > 0 || Number(messRes.data?.registered_students || 0) > 0)
        ) {
          const rlsWarning = `RLS policy blocked SELECT on public.students for mess_id=${messId} (0 student rows returned while ${
            realSelections.length || Number(messRes.data?.registered_students || 0)
          } student selection/registration record(s) exist). Please run supabase/migrations/005_fix_owner_students_policy.sql in the Supabase SQL Editor.`;
          console.error('[SmartBite][StudentsQuery] RLS block detected:', rlsWarning);
          setStudentsQueryError(rlsWarning);
          setDataError(rlsWarning);
        }

        // Count real dish selections per menu_item_id and student meal selection flags
        const dishSelectionCounts = {};
        const studentMealFlags = {}; // student_id -> { breakfast_selected, lunch_selected, dinner_selected, breakfast_dishes, lunch_dishes, dinner_dishes }
        const menuMealTypeById = {};
        const menuById = {};
        const menuItemById = {};

        (menusRes.data || []).forEach((m) => {
          menuById[m.id] = m;
          menuMealTypeById[m.id] = String(m.meal_type || '').toLowerCase();
          (m.menu_items || []).forEach((mi) => {
            menuItemById[mi.id] = mi;
          });
        });

        const enrichedSelections = [];

        realSelections.forEach((sel) => {
          // Only count selections from students belonging to this mess (or current student)
          if (
            realStudentProfileIds.size > 0 &&
            sel.student_id &&
            !realStudentProfileIds.has(sel.student_id)
          ) {
            return;
          }
          const mObj = menuById[sel.menu_id];
          const mType = menuMealTypeById[sel.menu_id] || '';
          const matchedStu = studentByProfileId[sel.student_id];

          // Deduplicate selection_items by menu_item_id
          const seenItemIds = new Set();
          const selectedDishesList = [];

          (sel.selection_items || []).forEach((si) => {
            if (!si || !si.selected || !si.menu_item_id) return;
            if (seenItemIds.has(si.menu_item_id)) return;
            seenItemIds.add(si.menu_item_id);

            if (sel.will_attend) {
              dishSelectionCounts[si.menu_item_id] =
                (dishSelectionCounts[si.menu_item_id] || 0) + 1;
            }

            const dishMeta = menuItemById[si.menu_item_id];
            selectedDishesList.push({
              id: si.menu_item_id,
              name: dishMeta?.name || dishMeta?.dish_name || 'Selected Dish',
              serving_size: dishMeta?.serving_size || '',
              calories: Number(dishMeta?.calories || 0),
              protein: Number(dishMeta?.protein || 0),
            });
          });

          if (sel.will_attend && mType && sel.student_id) {
            if (!studentMealFlags[sel.student_id]) {
              studentMealFlags[sel.student_id] = {
                breakfast_dishes: [],
                lunch_dishes: [],
                dinner_dishes: [],
              };
            }
            studentMealFlags[sel.student_id][`${mType}_selected`] = true;
            const dishNames = selectedDishesList.map((d) => d.name);
            if (dishNames.length > 0 && Array.isArray(studentMealFlags[sel.student_id][`${mType}_dishes`])) {
              const existingNames = new Set(studentMealFlags[sel.student_id][`${mType}_dishes`]);
              dishNames.forEach((n) => existingNames.add(n));
              studentMealFlags[sel.student_id][`${mType}_dishes`] = Array.from(existingNames);
            }
          }

          enrichedSelections.push({
            ...sel,
            student_name: matchedStu?.full_name || 'Registered Student',
            student_roll_id: matchedStu?.student_roll_id || 'N/A',
            hostel_name: matchedStu?.hostel_name || 'N/A',
            menu_date:
              normalizeDateStr(mObj?.menu_date) ||
              (sel.submitted_at ? normalizeDateStr(sel.submitted_at) : ''),
            meal_type: mType || 'lunch',
            menu_title: mObj?.title || '',
            selected_dishes: selectedDishesList,
            selected_dishes_count: selectedDishesList.length,
          });
        });

        setMealSelectionsRows(enrichedSelections);

        const enrichedStudents = realStudents.map((s) => ({
          ...s,
          breakfast_selected: Boolean(
            studentMealFlags[s.profile_id]?.breakfast_selected
          ),
          lunch_selected: Boolean(
            studentMealFlags[s.profile_id]?.lunch_selected
          ),
          dinner_selected: Boolean(
            studentMealFlags[s.profile_id]?.dinner_selected
          ),
          breakfast_dishes:
            studentMealFlags[s.profile_id]?.breakfast_dishes || [],
          lunch_dishes: studentMealFlags[s.profile_id]?.lunch_dishes || [],
          dinner_dishes: studentMealFlags[s.profile_id]?.dinner_dishes || [],
        }));
        setStudents(enrichedStudents);

        // Total Registered Students MUST be the real count from public.students where mess_id = messId
        const realRegisteredCount = enrichedStudents.length;

        // Set Mess Profile strictly from DB row
        if (messRes.data) {
          const dbMess = messRes.data;
          let activeJoinCode = dbMess.join_code || '';
          if (!activeJoinCode && user.role === 'mess_owner') {
            activeJoinCode = generateJoinCode();
            await supabase
              .from('messes')
              .update({ join_code: activeJoinCode })
              .eq('id', messId);
          }

          if (
            user.role === 'mess_owner' &&
            !stuRes.error &&
            realRegisteredCount > 0 &&
            Number(dbMess.registered_students) !== realRegisteredCount
          ) {
            await supabase
              .from('messes')
              .update({ registered_students: realRegisteredCount })
              .eq('id', messId);
          }

          setMessProfile({
            ...createEmptyMessProfile(user),
            ...dbMess,
            name: dbMess.name || user.messName || '',
            mess_name: dbMess.name || user.messName || '',
            college_name: dbMess.college_name || user.collegeName || '',
            hostel_name: dbMess.hostel_name || user.hostelName || '',
            owner_name: user.fullName || '',
            owner_email: user.email || '',
            join_code: activeJoinCode,
            capacity: Number(dbMess.capacity || 0),
            registered_students: realRegisteredCount,
          });
        } else {
          setMessProfile({
            ...createEmptyMessProfile(user),
            registered_students: realRegisteredCount,
          });
        }

        // Set Menus strictly from DB rows (students only see published menus from their own mess)
        const rawMenus = (menusRes.data || []).filter((m) => {
          if (m.mess_id !== messId) return false;
          if (
            user.role === 'student' &&
            String(m.publish_status || '').toLowerCase() !== 'published'
          ) {
            return false;
          }
          return true;
        });

        const mappedMenus = rawMenus.map((m) => ({
          ...m,
          menu_date: normalizeDateStr(m.menu_date) || m.menu_date,
          meal_type: String(m.meal_type || 'lunch').toLowerCase(),
          items: (m.menu_items || []).map((item) => ({
            ...item,
            name: item.name || item.dish_name || '',
            dish_name: item.name || item.dish_name || '',
            selected_count: dishSelectionCounts[item.id] || 0,
          })),
        }));
        setMenus(mappedMenus);

        // Set Waste Logs & compute Weekly Series strictly from DB rows
        const realWasteLogs = wasteRes.data || [];
        setWasteLogs(realWasteLogs);

        if (realWasteLogs.length > 0) {
          const groupedByDate = {};
          realWasteLogs
            .slice()
            .reverse()
            .forEach((log) => {
              const dKey = log.log_date;
              if (!groupedByDate[dKey]) {
                groupedByDate[dKey] = {
                  day: dKey,
                  preparedKg: 0,
                  consumedKg: 0,
                  wasteKg: 0,
                  traditionalWasteKg: 0,
                  wasteCostInr: 0,
                };
              }
              groupedByDate[dKey].preparedKg = Number(
                (groupedByDate[dKey].preparedKg + Number(log.prepared_kg || 0)).toFixed(1)
              );
              groupedByDate[dKey].consumedKg = Number(
                (groupedByDate[dKey].consumedKg + Number(log.consumed_kg || 0)).toFixed(1)
              );
              groupedByDate[dKey].wasteKg = Number(
                (groupedByDate[dKey].wasteKg + Number(log.leftover_kg || 0)).toFixed(1)
              );
              groupedByDate[dKey].wasteCostInr = Math.round(
                groupedByDate[dKey].wasteCostInr + Number(log.cost || 0)
              );
            });
          setWeeklySeries(Object.values(groupedByDate).slice(-7));
        } else {
          setWeeklySeries([]);
        }

        // Set Inventory & Transactions strictly from DB rows
        setInventory(invRes.data || []);
        setInventoryTransactions(
          (txRes.data || []).map((tx) => ({
            ...tx,
            ingredient_name:
              tx.inventory_items?.ingredient_name || tx.ingredient_name || 'Ingredient',
            unit: tx.inventory_items?.unit || tx.unit || 'kg',
          }))
        );

        // Set Feedback, Notifications, Holidays strictly from DB rows
        setFeedbackList(fbRes.data || []);
        setNotifications(notifRes.data || []);
        setHolidaysEvents(holRes.data || []);

        // Set Historical Attendance strictly from DB rows
        const realAttendance = attRes.data || [];
        if (realAttendance.length > 0) {
          const histByDate = {};
          realAttendance.forEach((rec) => {
            const d = rec.record_date;
            if (!histByDate[d]) {
              histByDate[d] = {
                date: d,
                breakfastSelected: 0,
                lunchSelected: 0,
                dinnerSelected: 0,
                unpolledWalkIns: 0,
                registered: Number(rec.total_registered || 0),
              };
            }
            if (rec.meal_type === 'breakfast')
              histByDate[d].breakfastSelected = Number(rec.selected_count || 0);
            if (rec.meal_type === 'lunch')
              histByDate[d].lunchSelected = Number(rec.selected_count || 0);
            if (rec.meal_type === 'dinner')
              histByDate[d].dinnerSelected = Number(rec.selected_count || 0);
            histByDate[d].unpolledWalkIns += Number(
              rec.unselected_walkin_count || 0
            );
          });
          setHistoricalSelections(Object.values(histByDate));
        } else {
          setHistoricalSelections([]);
        }

        // Populate current Student's selections & meal history if role === 'student'
        if (user.role === 'student') {
          const ownStudentRow = realStudents.find(
            (s) => s.profile_id === user.id || s.email === user.email
          );
          if (ownStudentRow) {
            setStudentProfile((prev) => ({
              ...prev,
              full_name: ownStudentRow.full_name || user.fullName || '',
              email: ownStudentRow.email || user.email || '',
              student_roll_id: ownStudentRow.student_roll_id || '',
              roll_number: ownStudentRow.student_roll_id || '',
              college_name: ownStudentRow.college_name || '',
              hostel_name: ownStudentRow.hostel_name || '',
              room_number: ownStudentRow.room_number || '',
              dietary_preference:
                ownStudentRow.dietary_preference || 'Vegetarian',
              meal_entitlement_active: true,
            }));
          }

          const ownSelections = realSelections.filter(
            (s) => s.student_id === user.id
          );
          const nextSelMap = {};
          const nextHist = [];

          ownSelections.forEach((sel) => {
            const menuObj =
              mappedMenus.find((m) => m.id === sel.menu_id) ||
              menuById[sel.menu_id];
            const mDate = normalizeDateStr(menuObj?.menu_date);
            const mTypeLower = String(menuObj?.meal_type || 'lunch').toLowerCase();
            const mTypeCap =
              mTypeLower.charAt(0).toUpperCase() + mTypeLower.slice(1);
            const dishIds = (sel.selection_items || [])
              .filter((si) => si.selected)
              .map((si) => si.menu_item_id);

            const record = {
              menu_id: sel.menu_id,
              meal_type: mTypeCap,
              menu_date: mDate,
              will_attend: sel.will_attend,
              portion_preference: sel.portion_preference || 'regular',
              selected_dish_ids: dishIds,
              selectedDishIds: dishIds,
              entitlement_retained: true,
              updated_at: sel.submitted_at,
            };

            nextSelMap[sel.menu_id] = record;
            if (mDate) {
              nextSelMap[`${mDate}_${mTypeCap}`] = record;
              nextSelMap[`${mDate}_${mTypeLower}`] = record;
            }

            if (menuObj) {
              const chosenDishes = (menuObj.items || []).filter((d) =>
                dishIds.includes(d.id)
              );
              const cals = chosenDishes.reduce(
                (s, d) => s + Number(d.calories || 0),
                0
              );
              const prot = chosenDishes.reduce(
                (s, d) => s + Number(d.protein || 0),
                0
              );
              const carbs = chosenDishes.reduce(
                (s, d) => s + Number(d.carbs || 0),
                0
              );
              const fats = chosenDishes.reduce(
                (s, d) => s + Number(d.fats || 0),
                0
              );

              nextHist.push({
                id: sel.id,
                meal_date: mDate,
                meal_type: mTypeCap,
                dishes: chosenDishes.map(
                  (d) => `${d.name} (${d.serving_size})`
                ),
                calories: cals,
                protein: Number(prot.toFixed(1)),
                carbs: Number(carbs.toFixed(1)),
                fats: Number(fats.toFixed(1)),
                status: sel.will_attend ? 'Confirmed' : 'Skipped (Entitled)',
              });
            }
          });

          setStudentSelectionsMap(nextSelMap);
          setStudentMealHistory(nextHist);
        }
      }

      // Super Admin Platform-Wide Queries
      if (user.role === 'super_admin') {
        const [
          colRes,
          allMessRes,
          profRes,
          plansRes,
          subRes,
          payRes,
          tktRes,
          demoReqRes,
          contactRes,
          allWasteRes,
        ] = await Promise.all([
          supabase
            .from('colleges')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('messes')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('subscription_plans')
            .select('*')
            .order('monthly_price_inr', { ascending: true }),
          supabase
            .from('subscriptions')
            .select('*, messes(name, college_name)')
            .order('created_at', { ascending: false }),
          supabase
            .from('payments')
            .select('*, messes(name, college_name)')
            .order('paid_at', { ascending: false }),
          supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('demo_requests')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('food_waste_logs')
            .select('*')
            .order('log_date', { ascending: false }),
        ]);

        const realProfiles = profRes.data || [];
        const realColleges = (colRes.data || []).map((c) => ({
          ...c,
          status: c.is_active ? 'active' : 'inactive',
          contact_person: c.contact_person || c.contact_email || 'Admin',
          total_hostels: c.total_hostels || 0,
        }));
        setColleges(realColleges);

        const realMesses = (allMessRes.data || []).map((m) => {
          const enrolledCount = realProfiles.filter(
            (p) => p.role === 'student' && p.mess_id === m.id
          ).length;
          const ownerProf = realProfiles.find((p) => p.id === m.owner_id);
          return {
            ...m,
            mess_name: m.name,
            owner_name: ownerProf?.full_name || 'Mess Operator',
            owner_email: ownerProf?.email || m.contact_number || '',
            enrolled_students:
              Number(m.registered_students || 0) || enrolledCount,
            student_capacity: Number(m.capacity || 0),
            subscription_tier: 'Standard',
            last_active: m.updated_at
              ? new Date(m.updated_at).toLocaleDateString('en-IN')
              : 'Active',
            monthly_waste_kg: 0,
          };
        });
        setMessesList(realMesses);

        setPlatformUsers(
          realProfiles.map((p) => ({
            ...p,
            status: p.is_active === false ? 'suspended' : 'active',
          }))
        );

        setSubscriptionPlans(
          (plansRes.data || []).map((p) => ({
            ...p,
            student_limit: p.max_students,
            features: Array.isArray(p.features) ? p.features : [],
          }))
        );

        setActiveSubscriptions(
          (subRes.data || []).map((s) => ({
            ...s,
            mess_name: s.messes?.name || 'Mess',
            college_name: s.messes?.college_name || 'College',
            monthly_amount_inr: Number(s.monthly_amount_inr || 0),
          }))
        );

        setPaymentRecords(
          (payRes.data || []).map((pay) => ({
            ...pay,
            mess_name: pay.messes?.name || 'Mess',
            college_name: pay.messes?.college_name || '',
            plan_name: pay.plan_name || 'Subscription',
            gateway_reference: pay.invoice_number || pay.id,
            paid_at: pay.paid_at
              ? new Date(pay.paid_at).toISOString().split('T')[0]
              : '',
          }))
        );

        const mappedTickets = [
          ...(tktRes.data || []).map((t) => ({
            ...t,
            ticket_type: 'support_ticket',
            requester_name: 'Registered User',
            requester_email: '',
            organization: 'Partner Mess',
            message: t.description,
          })),
          ...(demoReqRes.data || []).map((d) => ({
            id: d.id,
            ticket_type: 'demo_request',
            subject: `Demo Request – ${d.institution_name}`,
            requester_name: d.full_name,
            requester_email: d.work_email,
            organization: d.institution_name,
            priority: 'high',
            status: d.status === 'converted' ? 'resolved' : 'open',
            created_at: d.created_at,
            message:
              d.message ||
              `Daily meals served: ${d.daily_meals_served} (${d.phone})`,
          })),
          ...(contactRes.data || []).map((c) => ({
            id: c.id,
            ticket_type: 'contact_query',
            subject: c.topic || 'Contact Inquiry',
            requester_name: c.full_name,
            requester_email: c.email,
            organization: c.institution_name || 'Website Inquiry',
            priority: 'medium',
            status: c.status === 'replied' ? 'resolved' : 'open',
            created_at: c.created_at,
            message: c.message,
          })),
        ];
        setSupportTickets(mappedTickets);

        if (!messId) {
          setWasteLogs(allWasteRes.data || []);
        }
      }
    } catch (err) {
      setDataError(err.message || 'Error syncing with Supabase.');
    } finally {
      setLoadingData(false);
    }
  }, [isDemoMode, user]);

  useEffect(() => {
    refreshFromSupabase();
  }, [refreshFromSupabase]);

  // ============================================================================
  // PART B: LIVE AI & STATISTICAL ANALYTICS ENGINE COMPUTATIONS
  // ============================================================================
  const { forecasts, dataSufficiency } = useMemo(
    () =>
      generateDemandForecasts({
        menus,
        messProfile,
        historicalSelections,
        wasteLogs,
        holidaysEvents,
        existingOverrides: forecastOverridesMap,
      }),
    [
      menus,
      messProfile,
      historicalSelections,
      wasteLogs,
      holidaysEvents,
      forecastOverridesMap,
    ]
  );

  const wasteAnalytics = useMemo(() => analyzeFoodWaste(wasteLogs), [wasteLogs]);

  const inventoryIntelligence = useMemo(
    () =>
      analyzeInventoryIntelligence({
        inventory,
        menus,
        expectedAttendance:
          forecasts[0]?.expected_attendance ||
          Number(messProfile.registered_students || 0),
      }),
    [inventory, menus, forecasts, messProfile.registered_students]
  );

  const smartRecommendations = useMemo(
    () =>
      generateSmartRecommendations({
        inventory,
        wasteLogs,
        menus,
        historicalSelections,
      }),
    [inventory, wasteLogs, menus, historicalSelections]
  );

  const nutritionAnalytics = useMemo(
    () => computeMessNutritionAnalytics(menus),
    [menus]
  );

  // ============================================================================
  // 1. NOTIFICATIONS
  // ============================================================================
  const addNotification = async ({
    title,
    message,
    notification_type = 'system',
    recipient_role = 'all',
  }) => {
    const newNotif = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      title,
      message,
      notification_type,
      recipient_role,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (isSupabaseConfigured && supabase && !isDemoMode && user?.messId) {
      await supabase.from('notifications').insert([
        {
          mess_id: user.messId,
          recipient_role,
          title,
          message,
          notification_type,
        },
      ]);
    }
    return newNotif;
  };

  const markNotificationRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    if (isSupabaseConfigured && supabase && !isDemoMode) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    if (isSupabaseConfigured && supabase && !isDemoMode && user?.messId) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('mess_id', user.messId);
    }
  };

  // ============================================================================
  // 2. MESS OWNER MENU & DISH MANAGEMENT
  // ============================================================================
  const saveMenu = async (menuPayload) => {
    const normalizedMealType = String(
      menuPayload.meal_type || 'lunch'
    ).toLowerCase();
    const targetMenuDate =
      normalizeDateStr(menuPayload.menu_date) || getTodayDateStr();

    // Match strictly by (menu_date, meal_type) so a menu for one date never overwrites another date's menu
    const existingIndex = menus.findIndex(
      (m) =>
        normalizeDateStr(m.menu_date) === targetMenuDate &&
        String(m.meal_type || '').toLowerCase() === normalizedMealType
    );

    let recordId =
      existingIndex >= 0
        ? menus[existingIndex].id
        : menuPayload.id &&
          !String(menuPayload.id).startsWith('menu-')
        ? menuPayload.id
        : `menu-${normalizedMealType}-${targetMenuDate}`;

    const currentItems =
      menuPayload.items ||
      (existingIndex >= 0 ? menus[existingIndex].items : []);

    if (isSupabaseConfigured && supabase && !isDemoMode && user?.messId) {
      const totalCalories = currentItems.reduce(
        (s, i) => s + Number(i.calories || 0),
        0
      );
      const totalProtein = currentItems.reduce(
        (s, i) => s + Number(i.protein || 0),
        0
      );
      const totalCarbs = currentItems.reduce(
        (s, i) => s + Number(i.carbs || 0),
        0
      );
      const totalFats = currentItems.reduce(
        (s, i) => s + Number(i.fats || 0),
        0
      );

      const { data: upsertedMenu } = await supabase
        .from('menus')
        .upsert(
          [
            {
              mess_id: user.messId,
              menu_date: targetMenuDate,
              meal_type: normalizedMealType,
              title: menuPayload.title,
              publish_status: menuPayload.publish_status || 'draft',
              selection_deadline: menuPayload.selection_deadline || null,
              notes: menuPayload.notes || '',
              total_calories: totalCalories,
              total_protein: totalProtein,
              total_carbs: totalCarbs,
              total_fats: totalFats,
            },
          ],
          { onConflict: 'mess_id,menu_date,meal_type' }
        )
        .select()
        .maybeSingle();

      if (upsertedMenu?.id) {
        recordId = upsertedMenu.id;
      }
    }

    const updatedMenu = {
      ...(existingIndex >= 0 ? menus[existingIndex] : {}),
      ...menuPayload,
      id: recordId,
      menu_date: targetMenuDate,
      meal_type: normalizedMealType,
      items: currentItems,
    };

    setMenus((prev) => {
      const idx = prev.findIndex(
        (m) =>
          normalizeDateStr(m.menu_date) === targetMenuDate &&
          String(m.meal_type || '').toLowerCase() === normalizedMealType
      );
      if (idx >= 0) {
        return prev.map((m, i) => (i === idx ? updatedMenu : m));
      }
      return [updatedMenu, ...prev];
    });

    if (menuPayload.publish_status === 'published') {
      await addNotification({
        title: `New Menu Published: ${normalizedMealType.toUpperCase()} (${formatHumanDate(
          targetMenuDate
        )})`,
        message: `${
          updatedMenu.title || 'Daily Menu'
        } for ${formatHumanDate(
          targetMenuDate
        )} (${targetMenuDate}) is now live! Select your preferred dishes before the deadline. Your meal entitlement remains 100% guaranteed even if you do not submit a selection.`,
        notification_type: 'menu_published',
        recipient_role: 'student',
      });
    }

    return updatedMenu;
  };

  const addOrUpdateMenuItem = async (menuId, dish) => {
    let dishId = dish.id || `dish-${Date.now()}`;
    const dishName = dish.name || dish.dish_name || '';
    const ingredientsArray = Array.isArray(dish.ingredients)
      ? dish.ingredients
      : String(dish.ingredients || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    if (isSupabaseConfigured && supabase && !isDemoMode && user?.messId) {
      const payload = {
        menu_id: menuId,
        mess_id: user.messId,
        name: dishName,
        description: dish.description || '',
        image_url: dish.image_url || '',
        serving_size: dish.serving_size || '1 Serving',
        calories: Number(dish.calories || 0),
        protein: Number(dish.protein || 0),
        carbs: Number(dish.carbs || 0),
        fats: Number(dish.fats || 0),
        ingredients: ingredientsArray,
      };
      if (dish.id && !String(dish.id).startsWith('dish-')) {
        payload.id = dish.id;
      }
      const { data: savedDish } = await supabase
        .from('menu_items')
        .upsert([payload])
        .select()
        .maybeSingle();

      if (savedDish?.id) {
        dishId = savedDish.id;
      }
    }

    const normalizedDish = {
      ...dish,
      id: dishId,
      name: dishName,
      dish_name: dishName,
      calories: Number(dish.calories || 0),
      protein: Number(dish.protein || 0),
      carbs: Number(dish.carbs || 0),
      fats: Number(dish.fats || 0),
      ingredients: ingredientsArray,
      // Real new dishes start at 0 student selections (never a hardcoded percentage)
      selected_count: Number(dish.selected_count || 0),
      per_serving_raw_kg: Number(dish.per_serving_raw_kg || 0.115),
    };

    setMenus((prev) =>
      prev.map((m) => {
        if (m.id !== menuId) return m;
        const exists = (m.items || []).some(
          (item) => item.id === dishId || item.id === dish.id
        );
        const nextItems = exists
          ? m.items.map((item) =>
              item.id === dishId || item.id === dish.id ? normalizedDish : item
            )
          : [...(m.items || []), normalizedDish];
        return { ...m, items: nextItems };
      })
    );

    return normalizedDish;
  };

  const deleteMenuItem = async (menuId, dishId) => {
    setMenus((prev) =>
      prev.map((m) =>
        m.id === menuId
          ? { ...m, items: (m.items || []).filter((i) => i.id !== dishId) }
          : m
      )
    );
    if (isSupabaseConfigured && supabase && !isDemoMode) {
      await supabase.from('menu_items').delete().eq('id', dishId);
    }
  };

  // ============================================================================
  // 3. STUDENT MEAL SELECTION & SYNCHRONIZATION WITH MESS OWNER DASHBOARD
  // ============================================================================
  const submitStudentMealSelection = async ({
    menuId,
    mealType,
    meal_type,
    menuDate,
    meal_date,
    willAttend = true,
    will_attend = true,
    portionPreference = 'regular',
    selectedDishIds = [],
  }) => {
    const resolvedDate =
      normalizeDateStr(menuDate || meal_date) || getTodayDateStr();
    const rawMealType = mealType || meal_type || 'Lunch';
    const normalizedMealLower = String(rawMealType).toLowerCase();
    const normalizedMealCap =
      normalizedMealLower.charAt(0).toUpperCase() +
      normalizedMealLower.slice(1);
    const attending =
      will_attend !== undefined ? Boolean(will_attend) : Boolean(willAttend);

    // Match strictly by exact menu_date AND meal_type (never fall back to a menu from another date)
    const targetMenu =
      menus.find(
        (m) =>
          m.id === menuId &&
          normalizeDateStr(m.menu_date) === resolvedDate
      ) ||
      menus.find(
        (m) =>
          normalizeDateStr(m.menu_date) === resolvedDate &&
          String(m.meal_type || '').toLowerCase() === normalizedMealLower
      ) ||
      null;

    // Enforce: Students can only submit selections on published menus from their own mess for the exact date
    if (!isDemoMode) {
      if (!user?.messId) {
        throw new Error(
          'Your account is not linked to a mess yet. Please link your mess before submitting meal selections.'
        );
      }
      if (!targetMenu) {
        throw new Error(
          `No published ${normalizedMealCap} menu is available for ${formatHumanDate(
            resolvedDate
          )} yet.`
        );
      }
      if (
        String(targetMenu.publish_status || '').toLowerCase() !== 'published'
      ) {
        throw new Error(
          'Draft menus cannot accept student selections. Please wait until the mess owner publishes this menu.'
        );
      }
    }

    const resolvedMenuId =
      targetMenu?.id || menuId || `${resolvedDate}_${normalizedMealCap}`;
    const mapKeyDateMeal = `${resolvedDate}_${normalizedMealCap}`;
    const previousSelection =
      studentSelectionsMap[mapKeyDateMeal] ||
      studentSelectionsMap[resolvedMenuId];
    const previousDishIds =
      previousSelection?.selectedDishIds ||
      previousSelection?.selected_dish_ids ||
      [];

    const newSelectionRecord = {
      menu_id: resolvedMenuId,
      meal_type: normalizedMealCap,
      menu_date: resolvedDate,
      will_attend: attending,
      portion_preference: portionPreference,
      selected_dish_ids: attending ? selectedDishIds : [],
      selectedDishIds: attending ? selectedDishIds : [],
      entitlement_retained: true,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setStudentSelectionsMap((prev) => ({
      ...prev,
      [resolvedMenuId]: newSelectionRecord,
      [mapKeyDateMeal]: newSelectionRecord,
      [`${resolvedDate}_${normalizedMealLower}`]: newSelectionRecord,
    }));

    if (targetMenu) {
      setMenus((prev) =>
        prev.map((m) => {
          if (m.id !== targetMenu.id) return m;
          const updatedItems = (m.items || []).map((dish) => {
            const wasSelected = previousDishIds.includes(dish.id);
            const isNowSelected = attending && selectedDishIds.includes(dish.id);
            let nextCount = Number(dish.selected_count || 0);
            if (!wasSelected && isNowSelected) nextCount += 1;
            if (wasSelected && !isNowSelected)
              nextCount = Math.max(0, nextCount - 1);
            return { ...dish, selected_count: nextCount };
          });
          return { ...m, items: updatedItems };
        })
      );

      const mealField = `${normalizedMealLower}_selected`;
      setStudents((prev) =>
        prev.map((stu) =>
          stu.email === user?.email || stu.profile_id === user?.id
            ? { ...stu, [mealField]: attending }
            : stu
        )
      );

      const chosenDishes = (targetMenu.items || []).filter((d) =>
        selectedDishIds.includes(d.id)
      );
      const cals = chosenDishes.reduce((s, d) => s + Number(d.calories || 0), 0);
      const prot = chosenDishes.reduce((s, d) => s + Number(d.protein || 0), 0);
      const carbs = chosenDishes.reduce((s, d) => s + Number(d.carbs || 0), 0);
      const fats = chosenDishes.reduce((s, d) => s + Number(d.fats || 0), 0);

      const historyEntry = {
        id: `hist-${resolvedMenuId}`,
        meal_date: resolvedDate,
        meal_type: normalizedMealCap,
        dishes: chosenDishes.map(
          (d) => `${d.name || d.dish_name} (${d.serving_size})`
        ),
        calories: cals,
        protein: Number(prot.toFixed(1)),
        carbs: Number(carbs.toFixed(1)),
        fats: Number(fats.toFixed(1)),
        status: attending ? 'Confirmed' : 'Skipped (Entitled)',
      };

      setStudentMealHistory((prev) => {
        const exists = prev.some((h) => h.id === historyEntry.id);
        return exists
          ? prev.map((h) => (h.id === historyEntry.id ? historyEntry : h))
          : [historyEntry, ...prev];
      });
    }

    if (
      isSupabaseConfigured &&
      supabase &&
      !isDemoMode &&
      user?.id &&
      user?.messId &&
      targetMenu?.id
    ) {
      const { data: selData } = await supabase
        .from('meal_selections')
        .upsert(
          [
            {
              menu_id: targetMenu.id,
              mess_id: user.messId,
              student_id: user.id,
              will_attend: attending,
              portion_preference: portionPreference,
              entitlement_retained: true,
            },
          ],
          { onConflict: 'menu_id,student_id' }
        )
        .select()
        .maybeSingle();

      if (selData?.id) {
        await supabase
          .from('selection_items')
          .delete()
          .eq('meal_selection_id', selData.id);
        if (selectedDishIds.length > 0) {
          await supabase.from('selection_items').insert(
            selectedDishIds.map((dishId) => ({
              meal_selection_id: selData.id,
              menu_item_id: dishId,
              selected: true,
            }))
          );
        }
      }
    }

    return newSelectionRecord;
  };

  // ============================================================================
  // 4. STUDENT FEEDBACK SUBMISSION & OWNER REPLY
  // ============================================================================
  const submitStudentFeedback = async ({
    student_name,
    meal_type,
    dish_name,
    rating,
    feedback_type,
    feedback_category,
    comment,
    review,
    complaint,
    suggestion,
  }) => {
    const resolvedType =
      feedback_type ||
      (feedback_category === 'complaint'
        ? 'complaint'
        : feedback_category === 'suggestion'
        ? 'suggestion'
        : 'review');

    const textBody = comment || review || complaint || suggestion || '';

    const newFb = {
      id: 'fb-' + Date.now(),
      student_name:
        student_name ||
        studentProfile.full_name ||
        user?.fullName ||
        'Verified Student',
      meal_type: String(meal_type || 'lunch').toLowerCase(),
      dish_name: dish_name || 'Mess Meal',
      rating: Number(rating || 5),
      feedback_type: resolvedType,
      feedback_category: feedback_category || resolvedType,
      comment: textBody,
      review: resolvedType === 'review' ? textBody : review || '',
      complaint: resolvedType === 'complaint' ? textBody : complaint || '',
      suggestion: resolvedType === 'suggestion' ? textBody : suggestion || '',
      status: 'open',
      owner_reply: '',
      created_at: new Date().toISOString(),
    };

    setFeedbackList((prev) => [newFb, ...prev]);

    await addNotification({
      title: `New Student ${resolvedType.toUpperCase()}: ${newFb.dish_name}`,
      message: `${newFb.student_name} rated ${newFb.dish_name} ${newFb.rating}/5★.`,
      notification_type: 'feedback_alert',
      recipient_role: 'mess_owner',
    });

    if (isSupabaseConfigured && supabase && !isDemoMode && user?.messId) {
      await supabase.from('feedback').insert([
        {
          mess_id: user.messId,
          student_id: user?.id || null,
          student_name: newFb.student_name,
          meal_type: newFb.meal_type,
          dish_name: newFb.dish_name,
          rating: newFb.rating,
          feedback_type: resolvedType,
          review: newFb.review,
          complaint: newFb.complaint,
          suggestion: newFb.suggestion,
          status: 'open',
        },
      ]);
    }

    return newFb;
  };

  const updateFeedbackStatus = async (feedbackId, status, owner_reply) => {
    const targetFb = feedbackList.find((f) => f.id === feedbackId);
    setFeedbackList((prev) =>
      prev.map((fb) =>
        fb.id === feedbackId
          ? {
              ...fb,
              status: status || fb.status,
              owner_reply:
                owner_reply !== undefined ? owner_reply : fb.owner_reply,
            }
          : fb
      )
    );

    if (owner_reply && targetFb) {
      await addNotification({
        title: `Mess Owner Replied to Your Feedback on ${targetFb.dish_name}`,
        message: `Response: "${owner_reply}" (Status: ${status.toUpperCase()})`,
        notification_type: 'feedback_alert',
        recipient_role: 'student',
      });
    }

    if (isSupabaseConfigured && supabase && !isDemoMode) {
      await supabase
        .from('feedback')
        .update({ status, owner_reply })
        .eq('id', feedbackId);
    }
  };

  const updateStudentProfile = async (updates) => {
    const merged = {
      ...studentProfile,
      ...updates,
      meal_entitlement_active: true,
    };
    setStudentProfile(merged);
    if (isSupabaseConfigured && supabase && !isDemoMode && user?.id) {
      await supabase
        .from('profiles')
        .update({
          full_name: merged.full_name,
          college_name: merged.college_name,
          hostel_name: merged.hostel_name,
          student_id_code: merged.roll_number || merged.student_roll_id,
          phone: merged.phone,
        })
        .eq('id', user.id);
    }
    return merged;
  };

  // ============================================================================
  // 5. FORECAST OVERRIDES, ACTUAL OUTCOMES & HOLIDAYS/EVENTS
  // ============================================================================
  const overrideForecast = async (forecastId, overriddenPrepKg, reason) => {
    const target = forecasts.find((f) => f.id === forecastId);
    const key = target ? target.override_key : forecastId;

    setForecastOverridesMap((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        overridden_prep_kg: Number(overriddenPrepKg),
        reason: reason || 'Chef manual adjustment',
      },
    }));
  };

  const recordActualForecastOutcome = async (forecastId, actualKg) => {
    const target = forecasts.find((f) => f.id === forecastId);
    const key = target ? target.override_key : forecastId;

    setForecastOverridesMap((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        actual_outcome_kg: Number(actualKg),
      },
    }));
  };

  const addHolidayEvent = async ({
    event_date,
    event_name,
    event_type,
    expected_attendance_impact_pct,
  }) => {
    const ev = {
      id: 'ev-' + Date.now(),
      event_date,
      event_name,
      event_type: event_type || 'holiday',
      expected_attendance_impact_pct: Number(
        expected_attendance_impact_pct || -15
      ),
    };
    setHolidaysEvents((prev) => [ev, ...prev]);
    if (isSupabaseConfigured && supabase && !isDemoMode && user?.messId) {
      await supabase
        .from('holidays_events')
        .insert([{ mess_id: user.messId, ...ev, id: undefined }]);
    }
    return ev;
  };

  // ============================================================================
  // 6. FOOD WASTE LOGGING & INVENTORY MANAGEMENT
  // ============================================================================
  const addFoodWasteLog = async (payload) => {
    const preparedKg = Number(payload.prepared_kg || 0);
    const consumedKg = Number(payload.consumed_kg || 0);
    const leftoverKg =
      payload.leftover_kg !== undefined && payload.leftover_kg !== ''
        ? Number(payload.leftover_kg)
        : Math.max(0, Number((preparedKg - consumedKg).toFixed(2)));
    const unitCost = Number(payload.unit_cost_inr || 140);
    const totalWasteCost = Number((leftoverKg * unitCost).toFixed(2));
    const wastePct =
      preparedKg > 0
        ? Number(((leftoverKg / preparedKg) * 100).toFixed(2))
        : 0;

    const newLog = {
      id: 'waste-' + Date.now(),
      log_date: payload.log_date || new Date().toISOString().split('T')[0],
      meal_type: String(payload.meal_type || 'lunch').toLowerCase(),
      dish_name: payload.dish_name || 'Full Meal Batch',
      prepared_kg: preparedKg,
      consumed_kg: consumedKg,
      leftover_kg: leftoverKg,
      unit_cost_inr: unitCost,
      cost: totalWasteCost,
      waste_percentage: wastePct,
      notes: payload.notes || '',
    };

    setWasteLogs((prev) => [newLog, ...prev]);

    setWeeklySeries((prev) => {
      const existingIdx = prev.findIndex((d) => d.day === newLog.log_date);
      if (existingIdx >= 0) {
        return prev.map((d, idx) =>
          idx === existingIdx
            ? {
                ...d,
                preparedKg: Number((d.preparedKg + preparedKg).toFixed(1)),
                consumedKg: Number((d.consumedKg + consumedKg).toFixed(1)),
                wasteKg: Number((d.wasteKg + leftoverKg).toFixed(1)),
                wasteCostInr: Math.round(d.wasteCostInr + totalWasteCost),
              }
            : d
        );
      }
      return [
        ...prev,
        {
          day: newLog.log_date,
          preparedKg,
          consumedKg,
          wasteKg: leftoverKg,
          traditionalWasteKg: 0,
          wasteCostInr: Math.round(totalWasteCost),
        },
      ].slice(-7);
    });

    if (isSupabaseConfigured && supabase && !isDemoMode && user?.messId) {
      await supabase.from('food_waste_logs').insert([
        {
          mess_id: user.messId,
          log_date: newLog.log_date,
          meal_type: newLog.meal_type,
          dish_name: newLog.dish_name,
          prepared_kg: newLog.prepared_kg,
          consumed_kg: newLog.consumed_kg,
          leftover_kg: newLog.leftover_kg,
          unit_cost_inr: newLog.unit_cost_inr,
          cost: newLog.cost,
          waste_percentage: newLog.waste_percentage,
          notes: newLog.notes,
        },
      ]);
    }

    return newLog;
  };

  const addInventoryItem = async (itemPayload) => {
    let recordId = 'inv-' + Date.now();
    const newItem = {
      id: recordId,
      ingredient_name: itemPayload.ingredient_name,
      category: itemPayload.category || 'Grains & Pulses',
      current_stock: Number(itemPayload.current_stock || 0),
      minimum_stock: Number(itemPayload.minimum_stock || 10),
      unit: itemPayload.unit || 'kg',
      unit_price: Number(itemPayload.unit_price || 60),
      expiry_date: itemPayload.expiry_date || null,
      supplier_name: itemPayload.supplier_name || 'Vendor',
    };

    if (isSupabaseConfigured && supabase && !isDemoMode && user?.messId) {
      const { data: inserted } = await supabase
        .from('inventory_items')
        .insert([
          {
            mess_id: user.messId,
            ingredient_name: newItem.ingredient_name,
            category: newItem.category,
            current_stock: newItem.current_stock,
            minimum_stock: newItem.minimum_stock,
            unit: newItem.unit,
            unit_price: newItem.unit_price,
            expiry_date: newItem.expiry_date || null,
            supplier_name: newItem.supplier_name,
          },
        ])
        .select()
        .maybeSingle();

      if (inserted?.id) {
        newItem.id = inserted.id;
      }
    }

    setInventory((prev) => [newItem, ...prev]);

    if (newItem.current_stock < newItem.minimum_stock) {
      await addNotification({
        title: `Low Stock Alert: ${newItem.ingredient_name}`,
        message: `${newItem.ingredient_name} is at ${newItem.current_stock} ${newItem.unit} (minimum required: ${newItem.minimum_stock} ${newItem.unit}).`,
        notification_type: 'low_stock',
        recipient_role: 'mess_owner',
      });
    }

    return newItem;
  };

  const recordInventoryTransaction = async ({
    inventory_item_id,
    transaction_type,
    quantity,
    reference_note,
  }) => {
    const qty = Number(quantity || 0);
    const target = inventory.find((i) => i.id === inventory_item_id);
    if (!target || qty <= 0) return;

    const updatedStock =
      transaction_type === 'purchase'
        ? Number((target.current_stock + qty).toFixed(2))
        : Math.max(0, Number((target.current_stock - qty).toFixed(2)));

    setInventory((prev) =>
      prev.map((i) =>
        i.id === inventory_item_id ? { ...i, current_stock: updatedStock } : i
      )
    );

    const txRecord = {
      id: 'tx-' + Date.now(),
      inventory_item_id,
      ingredient_name: target.ingredient_name,
      transaction_type,
      quantity: qty,
      unit: target.unit,
      total_cost: Number((qty * target.unit_price).toFixed(2)),
      reference_note:
        reference_note ||
        (transaction_type === 'purchase'
          ? 'Stock Restock Purchase'
          : 'Kitchen Batch Consumption'),
      transaction_date: new Date().toISOString().split('T')[0],
    };

    setInventoryTransactions((prev) => [txRecord, ...prev]);

    if (updatedStock < target.minimum_stock) {
      await addNotification({
        title: `Low Stock Alert: ${target.ingredient_name}`,
        message: `Remaining stock is ${updatedStock} ${target.unit} (below minimum ${target.minimum_stock} ${target.unit}).`,
        notification_type: 'low_stock',
        recipient_role: 'mess_owner',
      });
    }

    if (isSupabaseConfigured && supabase && !isDemoMode && user?.messId) {
      await supabase
        .from('inventory_items')
        .update({ current_stock: updatedStock })
        .eq('id', inventory_item_id);
      await supabase.from('inventory_transactions').insert([
        {
          mess_id: user.messId,
          inventory_item_id,
          transaction_type,
          quantity: qty,
          unit_cost: target.unit_price,
          total_cost: txRecord.total_cost,
          reference_note: txRecord.reference_note,
        },
      ]);
    }

    return txRecord;
  };

  const updateMessProfile = async (updates) => {
    const liveStudentCount = isDemoMode
      ? Number(updates.registered_students ?? messProfile.registered_students ?? 0)
      : students.length;

    const merged = {
      ...messProfile,
      ...updates,
      mess_name: updates.name || messProfile.name,
      capacity: Number(updates.capacity ?? messProfile.capacity ?? 0),
      registered_students: liveStudentCount,
    };
    setMessProfile(merged);
    if (isSupabaseConfigured && supabase && !isDemoMode && user?.messId) {
      await supabase
        .from('messes')
        .update({
          name: merged.name,
          college_name: merged.college_name,
          hostel_name: merged.hostel_name,
          contact_number: merged.contact_number,
          capacity: Number(merged.capacity || 0),
          breakfast_time: merged.breakfast_time,
          lunch_time: merged.lunch_time,
          dinner_time: merged.dinner_time,
          default_cutoff_hours: Number(merged.default_cutoff_hours || 4),
          walk_in_buffer_pct: Number(merged.walk_in_buffer_pct || 8),
        })
        .eq('id', user.messId);
    }
    return merged;
  };

  const regenerateMessJoinCode = async () => {
    const newCode = generateJoinCode();
    setMessProfile((prev) => ({
      ...prev,
      join_code: newCode,
    }));
    if (isSupabaseConfigured && supabase && !isDemoMode && user?.messId) {
      await supabase
        .from('messes')
        .update({ join_code: newCode })
        .eq('id', user.messId);
    }
    return newCode;
  };

  // ============================================================================
  // 7. SUPER ADMIN GOVERNANCE ACTIONS (PART C)
  // ============================================================================
  const addOrUpdateCollege = async (collegePayload) => {
    const id = collegePayload.id || 'col-' + Date.now();
    const record = {
      id,
      name: collegePayload.name,
      code:
        collegePayload.code ||
        'CAMPUS-' + Math.floor(100 + Math.random() * 900),
      city: collegePayload.city || '',
      state: collegePayload.state || '',
      contact_person: collegePayload.contact_person || '',
      contact_email: collegePayload.contact_email || '',
      contact_phone: collegePayload.contact_phone || '',
      total_hostels: Number(collegePayload.total_hostels || 0),
      status: collegePayload.status || 'active',
      is_active: (collegePayload.status || 'active') === 'active',
    };

    setColleges((prev) => {
      const exists = prev.some((c) => c.id === id);
      return exists
        ? prev.map((c) => (c.id === id ? record : c))
        : [record, ...prev];
    });

    if (isSupabaseConfigured && supabase && !isDemoMode) {
      await supabase.from('colleges').upsert([
        {
          name: record.name,
          code: record.code,
          city: record.city,
          state: record.state,
          contact_email: record.contact_email,
          contact_phone: record.contact_phone,
          is_active: record.is_active,
        },
      ]);
    }
    return record;
  };

  const toggleCollegeStatus = async (collegeId, nextStatusOrUpdates) => {
    const nextStatus =
      typeof nextStatusOrUpdates === 'string'
        ? nextStatusOrUpdates
        : nextStatusOrUpdates?.status || 'active';
    const isActive = nextStatus === 'active';

    setColleges((prev) =>
      prev.map((c) =>
        c.id === collegeId ? { ...c, status: nextStatus, is_active: isActive } : c
      )
    );
    if (isSupabaseConfigured && supabase && !isDemoMode) {
      await supabase
        .from('colleges')
        .update({ is_active: isActive })
        .eq('id', collegeId);
    }
  };

  const updateMessAdminStatus = async (messId, nextStatusOrUpdates) => {
    const nextStatus =
      typeof nextStatusOrUpdates === 'string'
        ? nextStatusOrUpdates
        : nextStatusOrUpdates?.status || 'active';

    setMessesList((prev) =>
      prev.map((m) => (m.id === messId ? { ...m, status: nextStatus } : m))
    );
    if (isSupabaseConfigured && supabase && !isDemoMode) {
      const dbStatus = nextStatus === 'rejected' ? 'suspended' : 'active';
      await supabase
        .from('messes')
        .update({ status: dbStatus })
        .eq('id', messId);
    }
  };

  const updatePlatformUser = async (userId, updates) => {
    setPlatformUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
    if (isSupabaseConfigured && supabase && !isDemoMode) {
      const dbUpdates = {};
      if (updates.role) dbUpdates.role = updates.role;
      if (updates.status) dbUpdates.is_active = updates.status === 'active';
      await supabase.from('profiles').update(dbUpdates).eq('id', userId);
    }
  };

  const createSubscriptionPlan = async (planPayload) => {
    const monthlyPriceNum = Number(
      planPayload.monthly_price_inr || planPayload.monthlyPrice || 0
    );
    const maxStu = Number(
      planPayload.student_limit || planPayload.maxStudents || 500
    );
    const newPlan = {
      id: planPayload.id || 'plan-' + Date.now(),
      name: planPayload.name,
      monthly_price_inr: monthlyPriceNum,
      student_limit: maxStu,
      features: Array.isArray(planPayload.features)
        ? planPayload.features
        : String(planPayload.features || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
    };
    setSubscriptionPlans((prev) => [...prev, newPlan]);

    if (isSupabaseConfigured && supabase && !isDemoMode) {
      await supabase.from('subscription_plans').insert([
        {
          code: newPlan.name.toLowerCase().replace(/\s+/g, '_'),
          name: newPlan.name,
          monthly_price_inr: monthlyPriceNum,
          annual_price_inr: Math.round(monthlyPriceNum * 0.85),
          max_students: maxStu,
          features: newPlan.features,
        },
      ]);
    }
    return newPlan;
  };

  const updateSubscriptionRecord = async (subId, updates) => {
    setActiveSubscriptions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, ...updates } : s))
    );
    if (isSupabaseConfigured && supabase && !isDemoMode && updates.status) {
      await supabase
        .from('subscriptions')
        .update({ status: updates.status })
        .eq('id', subId);
    }
  };

  const recordPlatformPayment = async (paymentPayload) => {
    const newPay = {
      id: 'pay-' + Date.now(),
      gateway_reference:
        paymentPayload.gateway_reference || `INV-${Date.now().toString().slice(-6)}`,
      mess_name: paymentPayload.mess_name,
      college_name: paymentPayload.college_name || '',
      plan_name: paymentPayload.plan_name || 'Standard',
      amount_inr: Number(paymentPayload.amount_inr || 0),
      payment_method: paymentPayload.payment_method || 'Institutional NEFT',
      payment_status: paymentPayload.payment_status || 'succeeded',
      paid_at: new Date().toISOString().split('T')[0],
    };
    setPaymentRecords((prev) => [newPay, ...prev]);
    return newPay;
  };

  const updateSupportTicket = async (ticketId, updates) => {
    setSupportTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, ...updates } : t))
    );
    if (isSupabaseConfigured && supabase && !isDemoMode) {
      await supabase.from('support_tickets').update(updates).eq('id', ticketId);
    }
  };

  // Shared student list and registered count used by both Overview and Student Selections tabs
  const messStudents = useMemo(() => {
    if (isDemoMode) return students;
    if (!user?.messId) return [];
    return students.filter((s) => s.mess_id === user.messId);
  }, [isDemoMode, students, user?.messId]);

  const totalRegisteredStudents = useMemo(() => {
    if (isDemoMode) {
      return Number(messProfile.registered_students || messStudents.length || 0);
    }
    return messStudents.length;
  }, [isDemoMode, messProfile.registered_students, messStudents.length]);

  return (
    <DataContext.Provider
      value={{
        loadingData,
        dataError,
        studentsQueryError,
        selectionsQueryError,
        messProfile,
        menus,
        students,
        messStudents,
        totalRegisteredStudents,
        mealSelectionsRows,
        historicalSelections,
        forecasts,
        dataSufficiency,
        wasteAnalytics,
        inventoryIntelligence,
        smartRecommendations,
        nutritionAnalytics,
        holidaysEvents,
        wasteLogs,
        weeklySeries,
        inventory,
        inventoryTransactions,
        feedbackList,
        notifications,
        studentSelectionsMap,
        studentMealHistory,
        studentProfile,
        colleges,
        messesList,
        platformUsers,
        subscriptionPlans,
        activeSubscriptions,
        paymentRecords,
        supportTickets,
        platformGrowthSeries,
        // Mess Owner Actions
        saveMenu,
        addOrUpdateMenuItem,
        deleteMenuItem,
        overrideForecast,
        recordActualForecastOutcome,
        addHolidayEvent,
        addFoodWasteLog,
        addInventoryItem,
        recordInventoryTransaction,
        updateFeedbackStatus,
        updateMessProfile,
        regenerateMessJoinCode,
        // Student Actions
        submitStudentMealSelection,
        submitStudentFeedback,
        updateStudentProfile,
        // Super Admin Actions
        addOrUpdateCollege,
        toggleCollegeStatus,
        updateMessAdminStatus,
        updatePlatformUser,
        createSubscriptionPlan,
        updateSubscriptionRecord,
        recordPlatformPayment,
        updateSupportTicket,
        // Shared Notifications
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        refreshFromSupabase,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
