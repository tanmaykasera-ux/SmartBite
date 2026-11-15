// Timezone-safe date, weekly planner, and poll timing utilities for SmartBite
// Standardized on India Standard Time (Asia/Kolkata, UTC+05:30)

export const IST_TIMEZONE = 'Asia/Kolkata';

const DAY_NAMES_FULL = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Formats a Date object or timestamp into 'YYYY-MM-DD' in Asia/Kolkata timezone.
 */
export function formatISTDate(dateInput = new Date()) {
  const dateObj = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(dateObj.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(dateObj);

  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;

  if (year && month && day) {
    return `${year}-${month}-${day}`;
  }
  return dateObj.toISOString().split('T')[0];
}

/**
 * Returns today's date string ('YYYY-MM-DD') in Asia/Kolkata.
 */
export function getTodayDateStr() {
  return formatISTDate(new Date());
}

/**
 * Adds `daysOffset` days to a 'YYYY-MM-DD' string and returns 'YYYY-MM-DD'.
 */
export function addDaysToDateStr(dateStr, daysOffset = 0) {
  const clean = normalizeDateStr(dateStr) || getTodayDateStr();
  const [y, m, d] = clean.split('-').map(Number);
  const utcNoon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  utcNoon.setUTCDate(utcNoon.getUTCDate() + Number(daysOffset || 0));
  return formatISTDate(utcNoon);
}

/**
 * Returns tomorrow's date string ('YYYY-MM-DD') in Asia/Kolkata.
 */
export function getTomorrowDateStr() {
  return addDaysToDateStr(getTodayDateStr(), 1);
}

/**
 * Normalizes any date string or Date object into 'YYYY-MM-DD'.
 */
export function normalizeDateStr(value) {
  if (!value) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
  }
  return formatISTDate(value);
}

/**
 * Formats a 'YYYY-MM-DD' string into a human-friendly label like '10 Nov 2026'.
 */
export function formatHumanDate(dateStr) {
  const clean = normalizeDateStr(dateStr);
  if (!clean) return '';
  const [y, m, d] = clean.split('-').map(Number);
  if (!y || !m || !d) return clean;
  const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return dateObj.toLocaleDateString('en-IN', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Returns the Monday..Sunday index (0 = Monday, ..., 6 = Sunday) for a 'YYYY-MM-DD' date.
 */
export function getDayOfWeekIndex(dateStr) {
  const clean = normalizeDateStr(dateStr) || getTodayDateStr();
  const [y, m, d] = clean.split('-').map(Number);
  const utcNoon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const jsDay = utcNoon.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function getDayOfWeekName(dateStr, short = false) {
  const idx = getDayOfWeekIndex(dateStr);
  return short ? DAY_NAMES_SHORT[idx] : DAY_NAMES_FULL[idx];
}

/**
 * Returns the Monday 'YYYY-MM-DD' of the week containing `dateStr`.
 */
export function getWeekStartDateStr(dateStr = getTodayDateStr()) {
  const clean = normalizeDateStr(dateStr) || getTodayDateStr();
  const dayIdx = getDayOfWeekIndex(clean);
  return addDaysToDateStr(clean, -dayIdx);
}

/**
 * Returns an array of 7 day descriptors (Monday through Sunday) for the week starting at `weekStartDateStr`.
 */
export function getWeekDays(weekStartDateStr = getWeekStartDateStr()) {
  const mondayStr = getWeekStartDateStr(weekStartDateStr);
  const todayStr = getTodayDateStr();
  return DAY_NAMES_FULL.map((dayName, idx) => {
    const dateStr = addDaysToDateStr(mondayStr, idx);
    return {
      dayIndex: idx,
      dayName,
      shortDay: DAY_NAMES_SHORT[idx],
      dateStr,
      humanDate: formatHumanDate(dateStr),
      shortDate: formatHumanDate(dateStr).replace(/ \d{4}$/, ''),
      isToday: dateStr === todayStr,
    };
  });
}

/**
 * Parses a single time token like "07:30 AM", "2:30 PM", or "19:30" into { hours, minutes } (24h).
 */
export function parseTimeTokenTo24h(token, fallback = { hours: 12, minutes: 0 }) {
  if (!token || typeof token !== 'string') return fallback;
  const cleaned = token.trim().toUpperCase();
  const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
  if (!match) return fallback;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3];
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return {
    hours: Math.min(23, Math.max(0, hours)),
    minutes: Math.min(59, Math.max(0, minutes)),
  };
}

/**
 * Parses a range like "07:30 AM - 09:30 AM" or explicit start/end fields into 24h { start, end }.
 */
export function parseMealTimings(messProfile = {}) {
  const parseRange = (rangeStr, startField, endField, defStart, defEnd) => {
    if (startField && endField) {
      return {
        start: parseTimeTokenTo24h(startField, defStart),
        end: parseTimeTokenTo24h(endField, defEnd),
      };
    }
    const parts = String(rangeStr || '').split(/[-–—to]+/i);
    return {
      start: parseTimeTokenTo24h(parts[0], defStart),
      end: parseTimeTokenTo24h(parts[1], defEnd),
    };
  };

  return {
    breakfast: parseRange(
      messProfile.breakfast_time,
      messProfile.breakfast_start,
      messProfile.breakfast_end,
      { hours: 7, minutes: 30 },
      { hours: 9, minutes: 30 }
    ),
    lunch: parseRange(
      messProfile.lunch_time,
      messProfile.lunch_start,
      messProfile.lunch_end,
      { hours: 12, minutes: 30 },
      { hours: 14, minutes: 30 }
    ),
    dinner: parseRange(
      messProfile.dinner_time,
      messProfile.dinner_start,
      messProfile.dinner_end,
      { hours: 19, minutes: 30 },
      { hours: 21, minutes: 30 }
    ),
    cutoffHours: Number(
      messProfile.cutoff_hours ?? messProfile.default_cutoff_hours ?? 2
    ),
  };
}

/**
 * Builds a Date object for a specific YYYY-MM-DD and { hours, minutes } in Asia/Kolkata (+05:30).
 */
export function buildISTTimestamp(dateStr, { hours, minutes }) {
  const clean = normalizeDateStr(dateStr) || getTodayDateStr();
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return new Date(`${clean}T${hh}:${mm}:00+05:30`);
}

export function formatISTTime(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Computes the poll open/close schedule and lock status for a given (mealDateStr, mealType) in Asia/Kolkata.
 *
 * Schedule rule:
 * - Breakfast on day D opens right after Dinner ends on day D-1.
 * - Lunch on day D opens right after Breakfast ends on day D.
 * - Dinner on day D opens right after Lunch ends on day D.
 * - Each poll closes at `cutoffHours` before its meal starts.
 */
export function computeMealPollWindow(
  mealDateStr,
  mealType,
  messProfile = {},
  nowDate = new Date()
) {
  const cleanDate = normalizeDateStr(mealDateStr) || getTodayDateStr();
  const typeLower = String(mealType || 'lunch').toLowerCase();
  const timings = parseMealTimings(messProfile);
  const mealWindow = timings[typeLower] || timings.lunch;

  const mealStartAt = buildISTTimestamp(cleanDate, mealWindow.start);
  const mealEndAt = buildISTTimestamp(cleanDate, mealWindow.end);

  let opensAt;
  let previousMealLabel = '';
  if (typeLower === 'breakfast') {
    const prevDay = addDaysToDateStr(cleanDate, -1);
    opensAt = buildISTTimestamp(prevDay, timings.dinner.end);
    previousMealLabel = 'previous night’s Dinner';
  } else if (typeLower === 'lunch') {
    opensAt = buildISTTimestamp(cleanDate, timings.breakfast.end);
    previousMealLabel = 'Breakfast';
  } else {
    opensAt = buildISTTimestamp(cleanDate, timings.lunch.end);
    previousMealLabel = 'Lunch';
  }

  const rawCutoffMs = Math.max(0.5, timings.cutoffHours) * 3600 * 1000;
  let closesAt = new Date(mealStartAt.getTime() - rawCutoffMs);

  // Ensure closesAt is always after opensAt (e.g. if cutoff_hours was configured larger than inter-meal gap)
  if (closesAt.getTime() <= opensAt.getTime() + 15 * 60 * 1000) {
    closesAt = new Date(
      Math.max(
        opensAt.getTime() + 30 * 60 * 1000,
        mealStartAt.getTime() - 60 * 60 * 1000
      )
    );
  }

  const nowMs = nowDate.getTime();
  const isBeforeOpen = nowMs < opensAt.getTime();
  const isAfterCutoff = nowMs > closesAt.getTime();
  const isActiveWindow = !isBeforeOpen && !isAfterCutoff;

  // Students can change their answer until the cutoff; after the cutoff the answer is locked.
  const isLocked = isAfterCutoff;

  let status = 'open';
  let statusBadge = '';
  if (isAfterCutoff) {
    status = 'closed';
    statusBadge = `Locked • Poll closed at ${formatISTTime(closesAt)}`;
  } else if (isActiveWindow) {
    status = 'open';
    statusBadge = `Poll Open • Closes at ${formatISTTime(closesAt)}`;
  } else {
    status = 'upcoming';
    statusBadge = `Opens at ${formatISTTime(opensAt)} (after ${previousMealLabel}) • Cutoff ${formatISTTime(closesAt)}`;
  }

  return {
    mealDate: cleanDate,
    mealType: typeLower,
    opensAt,
    closesAt,
    mealStartAt,
    mealEndAt,
    opensAtFormatted: formatISTTime(opensAt),
    closesAtFormatted: formatISTTime(closesAt),
    mealStartFormatted: formatISTTime(mealStartAt),
    mealEndFormatted: formatISTTime(mealEndAt),
    previousMealLabel,
    status, // 'open' | 'upcoming' | 'closed'
    isActiveWindow,
    isBeforeOpen,
    isAfterCutoff,
    isLocked,
    canRespond: !isLocked,
    statusBadge,
  };
}

/**
 * Determines the primary "Next Meal Poll" based on current IST time.
 * - After Breakfast ends -> Today's Lunch
 * - After Lunch ends -> Today's Dinner
 * - After Dinner ends -> Tomorrow's Breakfast
 * - Before Breakfast ends -> Today's Breakfast (if before cutoff) else Today's Lunch
 */
export function getNextActivePollMeal(messProfile = {}, nowDate = new Date()) {
  const todayStr = formatISTDate(nowDate);
  const tomorrowStr = addDaysToDateStr(todayStr, 1);

  const candidates = [
    computeMealPollWindow(todayStr, 'breakfast', messProfile, nowDate),
    computeMealPollWindow(todayStr, 'lunch', messProfile, nowDate),
    computeMealPollWindow(todayStr, 'dinner', messProfile, nowDate),
    computeMealPollWindow(tomorrowStr, 'breakfast', messProfile, nowDate),
    computeMealPollWindow(tomorrowStr, 'lunch', messProfile, nowDate),
  ];

  // First prefer a poll currently in its active window (opened after previous meal ended, before cutoff)
  const activeOpen = candidates.find((c) => c.isActiveWindow);
  if (activeOpen) return activeOpen;

  // Next prefer the earliest upcoming poll whose cutoff hasn't passed yet
  const nextUpcoming = candidates.find((c) => !c.isAfterCutoff);
  return nextUpcoming || candidates[0];
}
