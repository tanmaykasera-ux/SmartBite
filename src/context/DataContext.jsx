import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth, generateJoinCode } from './AuthContext';
import {
  initialMessProfile,
  initialMenus,
  initialStudentsList,
  initialAttendanceResponses,
  initialHistoricalSelections,
  initialWasteLogs,
  weeklyConsumptionVsWasteSeries,
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
  generateSmartRecommendations,
} from '../lib/analyticsEngine';
import {
  getTodayDateStr,
  normalizeDateStr,
  formatHumanDate,
  getWeekStartDateStr,
  getWeekDays,
  addDaysToDateStr,
  getDayOfWeekIndex,
  getDayOfWeekName,
  computeMealPollWindow,
  getNextActivePollMeal,
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
    breakfast_start: '07:30',
    breakfast_end: '09:30',
    lunch_start: '12:30',
    lunch_end: '14:30',
    dinner_start: '19:30',
    dinner_end: '21:30',
    default_cutoff_hours: 2,
    cutoff_hours: 2,
    walk_in_buffer_pct: 5,
    guest_buffer_pct: 5,
    safety_buffer_pct: 5,
    cost_per_plate: 65,
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
  const notifiedPollsRef = useRef(new Set());

  // Shared Mess & Operational State
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
  const [attendanceResponses, setAttendanceResponses] = useState(() =>
    isDemoMode
      ? loadDemoLocal('sb_demo_attendance_responses', initialAttendanceResponses)
      : []
  );
  const [attendanceRecords, setAttendanceRecords] = useState([]);
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
    saveDemoLocal('sb_demo_attendance_responses', attendanceResponses);
    saveDemoLocal('sb_demo_hist_selections', historicalSelections);
    saveDemoLocal('sb_demo_forecast_overrides_map', forecastOverridesMap);
    saveDemoLocal('sb_demo_holidays_events', holidaysEvents);
    saveDemoLocal('sb_demo_waste_logs', wasteLogs);
    saveDemoLocal('sb_demo_weekly_series', weeklySeries);
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
    attendanceResponses,
    historicalSelections,
    forecastOverridesMap,
    holidaysEvents,
    wasteLogs,
    weeklySeries,
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
      setAttendanceResponses(
        loadDemoLocal('sb_demo_attendance_responses', initialAttendanceResponses)
      );
      setAttendanceRecords([]);
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
      setMessProfile(createEmptyMessProfile(user));
      setMenus([]);
      setStudents([]);
      setAttendanceResponses([]);
      setAttendanceRecords([]);
      setHistoricalSelections([]);
      setForecastOverridesMap({});
      setHolidaysEvents([]);
      setWasteLogs([]);
      setWeeklySeries([]);
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
        // Students must ONLY see menus from their own mess AND with publish_status = 'published'
        let menusQuery = supabase
          .from('menus')
          .select('id, mess_id, menu_date, meal_type, title, publish_status, selection_deadline, notes, week_start_date, day_of_week, day_name, menu_items(id, menu_id, mess_id, name, description, image_url)')
          .eq('mess_id', messId);

        if (user.role === 'student') {
          menusQuery = menusQuery.eq('publish_status', 'published');
        }

        const [
          messRes,
          menusRes,
          wasteRes,
          fbRes,
          notifRes,
          stuRes,
          holRes,
          attRes,
          pollRes,
          legacySelRes,
        ] = await Promise.all([
          supabase.from('messes').select('*').eq('id', messId).maybeSingle(),
          menusQuery.order('menu_date', { ascending: false }),
          supabase
            .from('food_waste_logs')
            .select('*')
            .eq('mess_id', messId)
            .order('log_date', { ascending: false }),
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
            .from('meal_attendance_responses')
            .select('*')
            .eq('mess_id', messId),
          supabase
            .from('meal_selections')
            .select('*')
            .eq('mess_id', messId),
        ]);

        // Fallback if week_start_date columns from 006 are not yet on menus
        let menuRowsData = menusRes.data;
        if (menusRes.error) {
          let fallbackMenusQuery = supabase
            .from('menus')
            .select('id, mess_id, menu_date, meal_type, title, publish_status, selection_deadline, notes, menu_items(id, menu_id, mess_id, name, description, image_url)')
            .eq('mess_id', messId);
          if (user.role === 'student') {
            fallbackMenusQuery = fallbackMenusQuery.eq('publish_status', 'published');
          }
          const retryMenus = await fallbackMenusQuery.order('menu_date', { ascending: false });
          menuRowsData = retryMenus.data || [];
        }

        // Only students whose mess_id matches this mess
        const realStudents = (stuRes.data || []).filter(
          (s) => s.mess_id === messId
        );
        const studentByProfileId = {};
        realStudents.forEach((s) => {
          if (s.profile_id) studentByProfileId[s.profile_id] = s;
          if (s.id) studentByProfileId[s.id] = s;
        });

        if (stuRes.error) {
          const errMsg = `Failed to load registered students from public.students (mess_id=${messId}): ${
            stuRes.error.message || JSON.stringify(stuRes.error)
          }${stuRes.error.code ? ` [Code: ${stuRes.error.code}]` : ''}. Please run migration 005_fix_owner_students_policy.sql in the Supabase SQL Editor.`;
          setStudentsQueryError(errMsg);
          setDataError(errMsg);
        }

        // Map menus by id for reference
        const menuById = {};
        (menuRowsData || []).forEach((m) => {
          menuById[m.id] = m;
        });

        // Merge attendance poll responses from `meal_attendance_responses` (and legacy `meal_selections` if table 006 is not yet created)
        const combinedPollMap = new Map();

        if (!legacySelRes.error && Array.isArray(legacySelRes.data)) {
          legacySelRes.data.forEach((sel) => {
            if (!sel || sel.mess_id !== messId) return;
            const mObj = menuById[sel.menu_id];
            const mDate =
              normalizeDateStr(mObj?.menu_date) ||
              (sel.submitted_at ? normalizeDateStr(sel.submitted_at) : '');
            const mType = String(mObj?.meal_type || 'lunch').toLowerCase();
            if (!mDate || !sel.student_id) return;
            const key = `${sel.student_id}_${mDate}_${mType}`;
            const matchedStu = studentByProfileId[sel.student_id];
            combinedPollMap.set(key, {
              id: sel.id,
              mess_id: messId,
              student_id: sel.student_id,
              menu_id: sel.menu_id || null,
              student_name: matchedStu?.full_name || 'Registered Student',
              student_roll_id: matchedStu?.student_roll_id || 'N/A',
              hostel_name: matchedStu?.hostel_name || 'N/A',
              meal_date: mDate,
              menu_date: mDate,
              meal_type: mType,
              status: sel.will_attend === false ? 'not_coming' : 'attending',
              will_attend: sel.will_attend !== false,
              responded_at: sel.submitted_at || new Date().toISOString(),
            });
          });
        }

        if (!pollRes.error && Array.isArray(pollRes.data)) {
          pollRes.data.forEach((row) => {
            if (!row || row.mess_id !== messId) return;
            const mDate = normalizeDateStr(row.meal_date);
            const mType = String(row.meal_type || 'lunch').toLowerCase();
            if (!mDate || !row.student_id) return;
            const key = `${row.student_id}_${mDate}_${mType}`;
            const matchedStu = studentByProfileId[row.student_id];
            const isNotComing =
              row.status === 'not_coming' || row.will_attend === false;
            combinedPollMap.set(key, {
              ...row,
              student_name: matchedStu?.full_name || 'Registered Student',
              student_roll_id: matchedStu?.student_roll_id || 'N/A',
              hostel_name: matchedStu?.hostel_name || 'N/A',
              meal_date: mDate,
              menu_date: mDate,
              meal_type: mType,
              status: isNotComing ? 'not_coming' : 'attending',
              will_attend: !isNotComing,
              responded_at:
                row.updated_at || row.responded_at || new Date().toISOString(),
            });
          });
        }

        const mergedPollResponses = Array.from(combinedPollMap.values());
        setAttendanceResponses(mergedPollResponses);
        setStudents(realStudents);

        const realRegisteredCount = realStudents.length;

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
            default_cutoff_hours: Number(
              dbMess.cutoff_hours ?? dbMess.default_cutoff_hours ?? 2
            ),
            cutoff_hours: Number(
              dbMess.cutoff_hours ?? dbMess.default_cutoff_hours ?? 2
            ),
            walk_in_buffer_pct: Number(
              dbMess.guest_buffer_pct ?? dbMess.walk_in_buffer_pct ?? 5
            ),
            guest_buffer_pct: Number(
              dbMess.guest_buffer_pct ?? dbMess.walk_in_buffer_pct ?? 5
            ),
            safety_buffer_pct: Number(dbMess.safety_buffer_pct ?? 5),
            cost_per_plate: Number(dbMess.cost_per_plate ?? 65),
          });
        } else {
          setMessProfile({
            ...createEmptyMessProfile(user),
            registered_students: realRegisteredCount,
          });
        }

        // Set Menus strictly from DB rows (students only see published menus from their own mess)
        const rawMenus = (menuRowsData || []).filter((m) => {
          if (m.mess_id !== messId) return false;
          if (
            user.role === 'student' &&
            String(m.publish_status || '').toLowerCase() !== 'published'
          ) {
            return false;
          }
          return true;
        });

        const mappedMenus = rawMenus.map((m) => {
          const cleanDate = normalizeDateStr(m.menu_date) || m.menu_date;
          return {
            id: m.id,
            mess_id: m.mess_id,
            menu_date: cleanDate,
            week_start_date:
              normalizeDateStr(m.week_start_date) ||
              getWeekStartDateStr(cleanDate),
            day_of_week:
              m.day_of_week !== undefined && m.day_of_week !== null
                ? Number(m.day_of_week)
                : getDayOfWeekIndex(cleanDate),
            day_name: m.day_name || getDayOfWeekName(cleanDate),
            meal_type: String(m.meal_type || 'lunch').toLowerCase(),
            title: m.title || '',
            publish_status: m.publish_status || 'draft',
            selection_deadline: m.selection_deadline || null,
            notes: m.notes || '',
            items: (m.menu_items || []).map((item) => ({
              id: item.id,
              menu_id: item.menu_id,
              mess_id: item.mess_id,
              name: item.name || item.dish_name || '',
              dish_name: item.name || item.dish_name || '',
              description: item.description || '',
              image_url: item.image_url || '',
            })),
          };
        });
        setMenus(mappedMenus);

        // Set Waste Logs & compute Weekly Series in PLATES strictly from DB rows
        const realWasteLogs = (wasteRes.data || [])
          .filter((log) => !log.mess_id || log.mess_id === messId)
          .map((log) => {
            const platesPrep = Math.round(
              Number(log.plates_prepared ?? log.prepared_kg ?? 0)
            );
            const platesServed = Math.round(
              Number(log.plates_served ?? log.consumed_kg ?? 0)
            );
            const leftoverPlates =
              log.leftover_plates !== undefined && log.leftover_plates !== null
                ? Math.round(Number(log.leftover_plates))
                : log.leftover_kg !== undefined && log.leftover_kg !== null
                ? Math.round(Number(log.leftover_kg))
                : Math.max(0, platesPrep - platesServed);
            const costPerPlate = Number(
              log.cost_per_plate ?? log.unit_cost_inr ?? 65
            );
            return {
              ...log,
              plates_prepared: platesPrep,
              plates_served: platesServed,
              leftover_plates: leftoverPlates,
              cost_per_plate: costPerPlate,
              cost:
                log.cost !== undefined && log.cost !== null
                  ? Number(log.cost)
                  : leftoverPlates * costPerPlate,
              waste_percentage:
                platesPrep > 0
                  ? Number(((leftoverPlates / platesPrep) * 100).toFixed(2))
                  : 0,
            };
          });
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
                  platesPrepared: 0,
                  platesServed: 0,
                  leftoverPlates: 0,
                  traditionalWastePlates: 0,
                  wasteCostInr: 0,
                };
              }
              groupedByDate[dKey].platesPrepared += Number(
                log.plates_prepared || 0
              );
              groupedByDate[dKey].platesServed += Number(
                log.plates_served || 0
              );
              groupedByDate[dKey].leftoverPlates += Number(
                log.leftover_plates || 0
              );
              groupedByDate[dKey].wasteCostInr = Math.round(
                groupedByDate[dKey].wasteCostInr + Number(log.cost || 0)
              );
            });
          setWeeklySeries(Object.values(groupedByDate).slice(-7));
        } else {
          setWeeklySeries([]);
        }

        // Set Feedback, Notifications, Holidays strictly from DB rows
        setFeedbackList(fbRes.data || []);
        setNotifications(notifRes.data || []);
        setHolidaysEvents(holRes.data || []);

        // Set Historical Attendance strictly from DB rows for this mess
        const realAttendance = (attRes.data || []).filter(
          (rec) => !rec.mess_id || rec.mess_id === messId
        );
        setAttendanceRecords(realAttendance);

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
            const servedOrExpected = Number(
              rec.plates_served || rec.expected_plates || rec.selected_count || 0
            );
            if (rec.meal_type === 'breakfast')
              histByDate[d].breakfastSelected = servedOrExpected;
            if (rec.meal_type === 'lunch')
              histByDate[d].lunchSelected = servedOrExpected;
            if (rec.meal_type === 'dinner')
              histByDate[d].dinnerSelected = servedOrExpected;
            histByDate[d].unpolledWalkIns += Number(
              rec.unselected_walkin_count || 0
            );
          });
          setHistoricalSelections(Object.values(histByDate));
        } else {
          setHistoricalSelections([]);
        }

        // Populate current Student's poll responses & meal history if role === 'student'
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

          const ownResponses = mergedPollResponses.filter(
            (r) => r.student_id === user.id
          );
          const nextSelMap = {};
          const nextHist = [];

          ownResponses.forEach((resp) => {
            const mDate = normalizeDateStr(resp.meal_date);
            const mTypeLower = String(resp.meal_type || 'lunch').toLowerCase();
            const mTypeCap =
              mTypeLower.charAt(0).toUpperCase() + mTypeLower.slice(1);
            const menuObj = mappedMenus.find(
              (m) =>
                normalizeDateStr(m.menu_date) === mDate &&
                String(m.meal_type || '').toLowerCase() === mTypeLower
            );

            const record = {
              menu_id: menuObj?.id || resp.menu_id || `${mDate}_${mTypeLower}`,
              meal_type: mTypeLower,
              meal_date: mDate,
              menu_date: mDate,
              status: resp.status,
              will_attend: resp.will_attend,
              entitlement_retained: true,
              updated_at: resp.responded_at,
            };

            nextSelMap[`${mDate}_${mTypeLower}`] = record;
            nextSelMap[`${mDate}_${mTypeCap}`] = record;
            if (menuObj?.id) {
              nextSelMap[menuObj.id] = record;
            }

            if (menuObj) {
              const allItems = menuObj.items || [];
              nextHist.push({
                id: resp.id || `hist-${mDate}-${mTypeLower}`,
                meal_date: mDate,
                meal_type: mTypeCap,
                title: menuObj.title || `${mTypeCap} Menu`,
                dishes: allItems.map((d) => d.name || d.dish_name).filter(Boolean),
                status: resp.will_attend
                  ? 'Attended'
                  : 'Skipped (Marked Not Coming)',
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

  // Shared student list and registered count used by Overview, Attendance Polls, Forecasting, and Reports
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

  // Surface an in-app notification for the student when their next meal's attendance poll is open
  useEffect(() => {
    if (!user || user.role !== 'student') return;
    const nextPoll = getNextActivePollMeal(messProfile);
    if (!nextPoll || nextPoll.isLocked) return;

    const pollKey = `${nextPoll.mealDate}_${nextPoll.mealType}`;
    if (notifiedPollsRef.current.has(pollKey)) return;
    notifiedPollsRef.current.add(pollKey);

    const mealLabel =
      nextPoll.mealType.charAt(0).toUpperCase() + nextPoll.mealType.slice(1);
    const notifTitle = `Attendance Poll Open: ${mealLabel} (${formatHumanDate(
      nextPoll.mealDate
    )})`;

    setNotifications((prev) => {
      if (prev.some((n) => n.title === notifTitle)) return prev;
      return [
        {
          id: `notif-poll-${pollKey}`,
          title: notifTitle,
          message: `Will you have ${nextPoll.mealType} on ${formatHumanDate(
            nextPoll.mealDate
          )}? Default is Attending. If you plan to skip, mark "I will NOT be coming" before ${
            nextPoll.closesAtFormatted
          }.`,
          notification_type: 'poll_open',
          recipient_role: 'student',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  }, [user, messProfile]);

  // ============================================================================
  // PLATE-BASED ANALYTICS ENGINE COMPUTATIONS
  // ============================================================================
  const { forecasts, dataSufficiency } = useMemo(
    () =>
      generateDemandForecasts({
        menus,
        messProfile,
        attendanceResponses,
        historicalSelections,
        wasteLogs,
        holidaysEvents,
        existingOverrides: forecastOverridesMap,
        totalRegisteredStudents,
      }),
    [
      menus,
      messProfile,
      attendanceResponses,
      historicalSelections,
      wasteLogs,
      holidaysEvents,
      forecastOverridesMap,
      totalRegisteredStudents,
    ]
  );

  const wasteAnalytics = useMemo(() => analyzeFoodWaste(wasteLogs), [wasteLogs]);

  const smartRecommendations = useMemo(
    () =>
      generateSmartRecommendations({
        wasteLogs,
      }),
    [wasteLogs]
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
  // 2. WEEKLY MENU & DISH MANAGEMENT (MONDAY–SUNDAY PLANNER)
  // ============================================================================
  const saveMenu = async (menuPayload) => {
    const normalizedMealType = String(
      menuPayload.meal_type || 'lunch'
    ).toLowerCase();
    const targetMenuDate =
      normalizeDateStr(menuPayload.menu_date) || getTodayDateStr();
    const weekStartDate = getWeekStartDateStr(targetMenuDate);
    const dayOfWeek = getDayOfWeekIndex(targetMenuDate);
    const dayName = getDayOfWeekName(targetMenuDate);

    // Match strictly by (menu_date, meal_type)
    const existingIndex = menus.findIndex(
      (m) =>
        normalizeDateStr(m.menu_date) === targetMenuDate &&
        String(m.meal_type || '').toLowerCase() === normalizedMealType
    );

    let recordId =
      existingIndex >= 0
        ? menus[existingIndex].id
        : menuPayload.id && !String(menuPayload.id).startsWith('menu-')
        ? menuPayload.id
        : `menu-${normalizedMealType}-${targetMenuDate}`;

    const currentItems =
      menuPayload.items ||
      (existingIndex >= 0 ? menus[existingIndex].items : []);

    if (isSupabaseConfigured && supabase && !isDemoMode && user?.messId) {
      const baseRow = {
        mess_id: user.messId,
        menu_date: targetMenuDate,
        meal_type: normalizedMealType,
        title:
          menuPayload.title ||
          `${dayName} ${
            normalizedMealType.charAt(0).toUpperCase() +
            normalizedMealType.slice(1)
          }`,
        publish_status: menuPayload.publish_status || 'draft',
        selection_deadline: menuPayload.selection_deadline || null,
        notes: menuPayload.notes || '',
      };

      // Try upserting with 006 weekly columns first; fallback if 006 not yet applied
      let { data: upsertedMenu, error: upsertErr } = await supabase
        .from('menus')
        .upsert(
          [
            {
              ...baseRow,
              week_start_date: weekStartDate,
              day_of_week: dayOfWeek,
              day_name: dayName,
            },
          ],
          { onConflict: 'mess_id,menu_date,meal_type' }
        )
        .select('id, mess_id, menu_date, meal_type, title, publish_status, selection_deadline, notes')
        .maybeSingle();

      if (upsertErr) {
        const retry = await supabase
          .from('menus')
          .upsert([baseRow], { onConflict: 'mess_id,menu_date,meal_type' })
          .select('id, mess_id, menu_date, meal_type, title, publish_status, selection_deadline, notes')
          .maybeSingle();
        upsertedMenu = retry.data;
      }

      if (upsertedMenu?.id) {
        recordId = upsertedMenu.id;
      }
    }

    const updatedMenu = {
      ...(existingIndex >= 0 ? menus[existingIndex] : {}),
      ...menuPayload,
      id: recordId,
      menu_date: targetMenuDate,
      week_start_date: weekStartDate,
      day_of_week: dayOfWeek,
      day_name: dayName,
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

    if (menuPayload.publish_status === 'published' && !menuPayload.silentNotify) {
      await addNotification({
        title: `Menu Published: ${normalizedMealType.toUpperCase()} (${formatHumanDate(
          targetMenuDate
        )})`,
        message: `${
          updatedMenu.title || 'Fixed Mess Menu'
        } for ${formatHumanDate(
          targetMenuDate
        )} is now live! Default attendance is Attending — mark "I will NOT be coming" before cutoff only if you plan to skip.`,
        notification_type: 'menu_published',
        recipient_role: 'student',
      });
    }

    return updatedMenu;
  };

  const addOrUpdateMenuItem = async (menuId, dish) => {
    let dishId = dish.id || `dish-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const dishName = String(dish.name || dish.dish_name || '').trim();

    if (isSupabaseConfigured && supabase && !isDemoMode && user?.messId) {
      const basePayload = {
        menu_id: menuId,
        mess_id: user.messId,
        name: dishName,
        description: dish.description || '',
        image_url: dish.image_url || '',
      };
      if (dish.id && !String(dish.id).startsWith('dish-')) {
        basePayload.id = dish.id;
      }

      const { data: savedDish } = await supabase
        .from('menu_items')
        .upsert([basePayload])
        .select('id, menu_id, mess_id, name, description, image_url')
        .maybeSingle();

      if (savedDish?.id) {
        dishId = savedDish.id;
      }
    }

    const normalizedDish = {
      id: dishId,
      menu_id: menuId,
      name: dishName,
      dish_name: dishName,
      description: dish.description || '',
      image_url: dish.image_url || '',
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

  /**
   * Weekly Planner Helper: Copy a single day's Breakfast, Lunch, and Dinner menus & dishes to another date.
   */
  const duplicateDayMenus = async (sourceDateStr, targetDateStr) => {
    const cleanSource = normalizeDateStr(sourceDateStr);
    const cleanTarget = normalizeDateStr(targetDateStr);
    if (!cleanSource || !cleanTarget || cleanSource === cleanTarget) return 0;

    let copiedCount = 0;
    for (const mealType of ['breakfast', 'lunch', 'dinner']) {
      const sourceMenu = menus.find(
        (m) =>
          normalizeDateStr(m.menu_date) === cleanSource &&
          String(m.meal_type || '').toLowerCase() === mealType
      );
      if (!sourceMenu || !(sourceMenu.items || []).length) continue;

      const createdMenu = await saveMenu({
        menu_date: cleanTarget,
        meal_type: mealType,
        title: sourceMenu.title,
        publish_status: 'draft',
        notes: sourceMenu.notes || '',
        items: [],
        silentNotify: true,
      });

      for (const item of sourceMenu.items || []) {
        await addOrUpdateMenuItem(createdMenu.id, {
          name: item.name || item.dish_name,
          description: item.description || '',
          image_url: item.image_url || '',
          id: `dish-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        });
      }
      copiedCount += 1;
    }
    return copiedCount;
  };

  /**
   * Weekly Planner Helper: Copy Last Week's Menu (Monday–Sunday) into targetWeekStartDateStr as Draft.
   */
  const copyLastWeekMenus = async (targetWeekStartDateStr) => {
    const targetMonday = getWeekStartDateStr(targetWeekStartDateStr);
    const prevMonday = addDaysToDateStr(targetMonday, -7);
    let totalSlotsCopied = 0;

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const srcDate = addDaysToDateStr(prevMonday, dayOffset);
      const dstDate = addDaysToDateStr(targetMonday, dayOffset);
      const count = await duplicateDayMenus(srcDate, dstDate);
      totalSlotsCopied += count;
    }
    return totalSlotsCopied;
  };

  /**
   * Weekly Planner Helper: Save entire week as Draft or Publish entire week.
   */
  const updateWeekMenusPublishStatus = async (
    weekStartDateStr,
    publishStatus = 'published'
  ) => {
    const weekDays = getWeekDays(weekStartDateStr);
    const dateSet = new Set(weekDays.map((d) => d.dateStr));
    const targetMenus = menus.filter((m) =>
      dateSet.has(normalizeDateStr(m.menu_date))
    );

    for (const m of targetMenus) {
      await saveMenu({
        ...m,
        publish_status: publishStatus,
        silentNotify: true,
      });
    }

    if (publishStatus === 'published' && targetMenus.length > 0) {
      await addNotification({
        title: `Weekly Menu Published (${weekDays[0].shortDate} – ${weekDays[6].shortDate})`,
        message: `The weekly mess menu for ${weekDays[0].humanDate} to ${weekDays[6].humanDate} is now published! View Today's Menu and This Week's Menu in your dashboard.`,
        notification_type: 'menu_published',
        recipient_role: 'student',
      });
    }

    return targetMenus.length;
  };

  // ============================================================================
  // 3. PER-MEAL ATTENDANCE POLLS (REPLACES DISH SELECTION)
  // ============================================================================
  const submitMealAttendancePoll = async ({
    mealDate,
    meal_date,
    menuDate,
    mealType,
    meal_type,
    status,
    willAttend,
    will_attend,
  }) => {
    const resolvedDate =
      normalizeDateStr(mealDate || meal_date || menuDate) || getTodayDateStr();
    const normalizedMealLower = String(
      mealType || meal_type || 'lunch'
    ).toLowerCase();
    const normalizedMealCap =
      normalizedMealLower.charAt(0).toUpperCase() +
      normalizedMealLower.slice(1);

    const resolvedStatus =
      status === 'not_coming' ||
      will_attend === false ||
      willAttend === false
        ? 'not_coming'
        : 'attending';
    const isAttending = resolvedStatus === 'attending';

    // Check poll cutoff window in Asia/Kolkata
    const pollWindow = computeMealPollWindow(
      resolvedDate,
      normalizedMealLower,
      messProfile
    );
    if (pollWindow.isLocked) {
      throw new Error(
        `This attendance poll closed at the cutoff time (${pollWindow.closesAtFormatted} IST). Your answer is locked, and your meal entitlement remains 100% active.`
      );
    }

    if (!isDemoMode && !user?.messId) {
      throw new Error(
        'Your account is not linked to a mess yet. Please link your mess before responding to attendance polls.'
      );
    }

    const matchingMenu = menus.find(
      (m) =>
        normalizeDateStr(m.menu_date) === resolvedDate &&
        String(m.meal_type || '').toLowerCase() === normalizedMealLower
    );

    const nowIso = new Date().toISOString();
    const studentId = user?.id || 'stu-1';
    const studentName =
      studentProfile.full_name || user?.fullName || 'Registered Student';
    const studentRoll =
      studentProfile.student_roll_id ||
      studentProfile.roll_number ||
      user?.studentId ||
      '2024CS101';
    const hostelName =
      studentProfile.hostel_name || user?.hostelName || 'Hostel Block A';

    const newRecord = {
      id: `poll-${studentId}-${resolvedDate}-${normalizedMealLower}`,
      mess_id: user?.messId || messProfile.id || 'mess-demo-001',
      student_id: studentId,
      menu_id: matchingMenu?.id || null,
      student_name: studentName,
      student_roll_id: studentRoll,
      hostel_name: hostelName,
      meal_date: resolvedDate,
      menu_date: resolvedDate,
      meal_type: normalizedMealLower,
      status: resolvedStatus,
      will_attend: isAttending,
      opens_at: pollWindow.opensAt.toISOString(),
      cutoff_at: pollWindow.closesAt.toISOString(),
      entitlement_retained: true,
      responded_at: nowIso,
      updated_at: nowIso,
    };

    // Update student local map
    setStudentSelectionsMap((prev) => ({
      ...prev,
      [`${resolvedDate}_${normalizedMealLower}`]: newRecord,
      [`${resolvedDate}_${normalizedMealCap}`]: newRecord,
      ...(matchingMenu?.id ? { [matchingMenu.id]: newRecord } : {}),
    }));

    // Update mess-wide attendanceResponses state
    setAttendanceResponses((prev) => {
      const filtered = prev.filter(
        (r) =>
          !(
            r.student_id === studentId &&
            normalizeDateStr(r.meal_date || r.menu_date) === resolvedDate &&
            String(r.meal_type || '').toLowerCase() === normalizedMealLower
          )
      );
      return [newRecord, ...filtered];
    });

    // Update student meal history
    if (matchingMenu) {
      const allItems = matchingMenu.items || [];
      const historyEntry = {
        id: `hist-${resolvedDate}-${normalizedMealLower}`,
        meal_date: resolvedDate,
        meal_type: normalizedMealCap,
        title: matchingMenu.title || `${normalizedMealCap} Menu`,
        dishes: allItems.map((d) => d.name || d.dish_name).filter(Boolean),
        status: isAttending
          ? 'Attended'
          : 'Skipped (Marked Not Coming)',
      };

      setStudentMealHistory((prev) => {
        const exists = prev.some((h) => h.id === historyEntry.id);
        return exists
          ? prev.map((h) => (h.id === historyEntry.id ? historyEntry : h))
          : [historyEntry, ...prev];
      });
    }

    // Persist to Supabase `meal_attendance_responses` (and mirror to `meal_selections` if matchingMenu exists for backwards compatibility)
    if (
      isSupabaseConfigured &&
      supabase &&
      !isDemoMode &&
      user?.id &&
      user?.messId
    ) {
      const { error: pollErr } = await supabase
        .from('meal_attendance_responses')
        .upsert(
          [
            {
              mess_id: user.messId,
              student_id: user.id,
              menu_id:
                matchingMenu?.id && !String(matchingMenu.id).startsWith('menu-')
                  ? matchingMenu.id
                  : null,
              meal_date: resolvedDate,
              meal_type: normalizedMealLower,
              status: resolvedStatus,
              will_attend: isAttending,
              opens_at: pollWindow.opensAt.toISOString(),
              cutoff_at: pollWindow.closesAt.toISOString(),
              entitlement_retained: true,
              responded_at: nowIso,
              updated_at: nowIso,
            },
          ],
          { onConflict: 'mess_id,student_id,meal_date,meal_type' }
        );

      if (
        matchingMenu?.id &&
        !String(matchingMenu.id).startsWith('menu-') &&
        String(matchingMenu.publish_status || '').toLowerCase() === 'published'
      ) {
        await supabase.from('meal_selections').upsert(
          [
            {
              menu_id: matchingMenu.id,
              mess_id: user.messId,
              student_id: user.id,
              will_attend: isAttending,
              portion_preference: 'regular',
              entitlement_retained: true,
              submitted_at: nowIso,
            },
          ],
          { onConflict: 'menu_id,student_id' }
        );
      } else if (pollErr) {
        throw new Error(
          pollErr.message ||
            'Could not save your attendance poll response. Please ensure migration 006_plate_based_attendance.sql has been executed in Supabase.'
        );
      }
    }

    return newRecord;
  };

  // Backwards-compatible alias
  const submitStudentMealSelection = submitMealAttendancePoll;

  // ============================================================================
  // 4. STUDENT FEEDBACK & PROFILE
  // ============================================================================
  const submitStudentFeedback = async (feedbackPayload) => {
    const resolvedType = feedbackPayload.complaint
      ? 'complaint'
      : feedbackPayload.suggestion
      ? 'suggestion'
      : feedbackPayload.feedback_type || 'review';

    const newFb = {
      id: 'fb-' + Date.now(),
      student_name: `${studentProfile.full_name} (${
        studentProfile.roll_number ||
        studentProfile.student_roll_id ||
        'Student'
      })`,
      meal_type: (feedbackPayload.meal_type || 'lunch').toLowerCase(),
      dish_name: feedbackPayload.dish_name,
      rating: Number(feedbackPayload.rating || 5),
      feedback_type: resolvedType,
      review: feedbackPayload.review || feedbackPayload.comment || '',
      complaint: feedbackPayload.complaint || '',
      suggestion: feedbackPayload.suggestion || '',
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
  // 5. PLATE FORECAST OVERRIDES, ACTUAL OUTCOMES & HOLIDAYS/EVENTS
  // ============================================================================
  const overrideForecast = async (forecastId, overriddenPrepPlates, reason) => {
    const target = forecasts.find((f) => f.id === forecastId);
    const key = target ? target.override_key : forecastId;

    setForecastOverridesMap((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        overridden_prep_plates: Math.round(Number(overriddenPrepPlates)),
        reason: reason || 'Chef manual plate adjustment',
      },
    }));
  };

  const recordActualForecastOutcome = async (forecastId, actualServedPlates) => {
    const target = forecasts.find((f) => f.id === forecastId);
    const key = target ? target.override_key : forecastId;
    const servedNum = Math.round(Number(actualServedPlates));

    setForecastOverridesMap((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        actual_served_plates: servedNum,
      },
    }));

    if (target) {
      setHistoricalSelections((prev) => [
        ...prev,
        {
          date: target.forecast_date,
          registered: target.enrolled_students,
          actualServedPlates: servedNum,
          breakfastSelected:
            target.meal_type === 'breakfast' ? servedNum : target.expected_plates,
          lunchSelected:
            target.meal_type === 'lunch' ? servedNum : target.expected_plates,
          dinnerSelected:
            target.meal_type === 'dinner' ? servedNum : target.expected_plates,
        },
      ]);

      const newAttRec = {
        id: `att-${target.forecast_date}-${target.meal_type}`,
        mess_id: user?.messId || messProfile.id,
        record_date: target.forecast_date,
        meal_type: target.meal_type,
        total_registered: target.enrolled_students,
        not_coming_count: target.not_coming_count,
        expected_plates: target.expected_plates,
        plates_prepared: Number(
          target.overridden_prep_plates ?? target.recommended_prep_plates ?? 0
        ),
        plates_served: servedNum,
        actual_attended_count: servedNum,
      };
      setAttendanceRecords((prev) => [
        newAttRec,
        ...prev.filter(
          (r) =>
            !(
              normalizeDateStr(r.record_date) === target.forecast_date &&
              String(r.meal_type || '').toLowerCase() === target.meal_type
            )
        ),
      ]);
    }
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
  // 6. PLATE-BASED FOOD WASTE LOGGING & MESS SETTINGS
  // ============================================================================
  const addFoodWasteLog = async (payload) => {
    const platesPrepared = Math.round(
      Number(payload.plates_prepared ?? payload.prepared_kg ?? 0)
    );
    const platesServed = Math.round(
      Number(payload.plates_served ?? payload.consumed_kg ?? 0)
    );
    const leftoverPlates =
      payload.leftover_plates !== undefined && payload.leftover_plates !== ''
        ? Math.round(Number(payload.leftover_plates))
        : Math.max(0, platesPrepared - platesServed);
    const costPerPlate = Number(
      payload.cost_per_plate ?? payload.unit_cost_inr ?? messProfile.cost_per_plate ?? 65
    );
    const totalWasteCost = Number((leftoverPlates * costPerPlate).toFixed(2));
    const wastePct =
      platesPrepared > 0
        ? Number(((leftoverPlates / platesPrepared) * 100).toFixed(2))
        : 0;

    const newLog = {
      id: 'waste-' + Date.now(),
      log_date: payload.log_date || getTodayDateStr(),
      meal_type: String(payload.meal_type || 'lunch').toLowerCase(),
      dish_name: payload.dish_name || 'Standard Meal Thali',
      plates_prepared: platesPrepared,
      plates_served: platesServed,
      leftover_plates: leftoverPlates,
      cost_per_plate: costPerPlate,
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
                platesPrepared: Number(d.platesPrepared || 0) + platesPrepared,
                platesServed: Number(d.platesServed || 0) + platesServed,
                leftoverPlates: Number(d.leftoverPlates || 0) + leftoverPlates,
                wasteCostInr: Math.round(
                  Number(d.wasteCostInr || 0) + totalWasteCost
                ),
              }
            : d
        );
      }
      return [
        ...prev,
        {
          day: newLog.log_date,
          platesPrepared,
          platesServed,
          leftoverPlates,
          traditionalWastePlates: 0,
          wasteCostInr: Math.round(totalWasteCost),
        },
      ].slice(-7);
    });

    if (isSupabaseConfigured && supabase && !isDemoMode && user?.messId) {
      const baseInsert = {
        mess_id: user.messId,
        log_date: newLog.log_date,
        meal_type: newLog.meal_type,
        dish_name: newLog.dish_name,
        prepared_kg: platesPrepared,
        consumed_kg: platesServed,
        leftover_kg: leftoverPlates,
        unit_cost_inr: costPerPlate,
        cost: newLog.cost,
        waste_percentage: newLog.waste_percentage,
        notes: newLog.notes,
      };
      const { error: wasteErr } = await supabase.from('food_waste_logs').insert([
        {
          ...baseInsert,
          plates_prepared: platesPrepared,
          plates_served: platesServed,
          leftover_plates: leftoverPlates,
          cost_per_plate: costPerPlate,
        },
      ]);
      if (wasteErr) {
        await supabase.from('food_waste_logs').insert([baseInsert]);
      }
    }

    return newLog;
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
      default_cutoff_hours: Number(
        updates.default_cutoff_hours ??
          updates.cutoff_hours ??
          messProfile.default_cutoff_hours ??
          2
      ),
      cutoff_hours: Number(
        updates.cutoff_hours ??
          updates.default_cutoff_hours ??
          messProfile.cutoff_hours ??
          2
      ),
      walk_in_buffer_pct: Number(
        updates.walk_in_buffer_pct ??
          updates.guest_buffer_pct ??
          messProfile.walk_in_buffer_pct ??
          5
      ),
      guest_buffer_pct: Number(
        updates.guest_buffer_pct ??
          updates.walk_in_buffer_pct ??
          messProfile.guest_buffer_pct ??
          5
      ),
      safety_buffer_pct: Number(
        updates.safety_buffer_pct ?? messProfile.safety_buffer_pct ?? 5
      ),
      cost_per_plate: Number(
        updates.cost_per_plate ?? messProfile.cost_per_plate ?? 65
      ),
    };
    setMessProfile(merged);
    if (isSupabaseConfigured && supabase && !isDemoMode && user?.messId) {
      const baseUpdate = {
        name: merged.name,
        college_name: merged.college_name,
        hostel_name: merged.hostel_name,
        contact_number: merged.contact_number,
        capacity: Number(merged.capacity || 0),
        breakfast_time: merged.breakfast_time,
        lunch_time: merged.lunch_time,
        dinner_time: merged.dinner_time,
        default_cutoff_hours: Number(merged.default_cutoff_hours || 2),
        walk_in_buffer_pct: Number(merged.walk_in_buffer_pct || 5),
      };
      const { error: profErr } = await supabase
        .from('messes')
        .update({
          ...baseUpdate,
          cutoff_hours: Number(merged.cutoff_hours || 2),
          guest_buffer_pct: Number(merged.guest_buffer_pct || 5),
          safety_buffer_pct: Number(merged.safety_buffer_pct || 5),
          cost_per_plate: Number(merged.cost_per_plate || 65),
        })
        .eq('id', user.messId);

      if (profErr) {
        await supabase.from('messes').update(baseUpdate).eq('id', user.messId);
      }
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
  // 7. SUPER ADMIN GOVERNANCE ACTIONS
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
      paid_at: getTodayDateStr(),
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
        attendanceResponses,
        attendanceRecords,
        mealSelectionsRows: attendanceResponses,
        historicalSelections,
        forecasts,
        dataSufficiency,
        wasteAnalytics,
        smartRecommendations,
        holidaysEvents,
        wasteLogs,
        weeklySeries,
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
        duplicateDayMenus,
        copyLastWeekMenus,
        updateWeekMenusPublishStatus,
        overrideForecast,
        recordActualForecastOutcome,
        addHolidayEvent,
        addFoodWasteLog,
        updateFeedbackStatus,
        updateMessProfile,
        regenerateMessJoinCode,
        // Student Actions
        submitMealAttendancePoll,
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
