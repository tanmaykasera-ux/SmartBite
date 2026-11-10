/**
 * SmartBite Calendar Date & Timezone Utilities (India Standard Time — Asia/Kolkata)
 * ---------------------------------------------------------------------------------
 * Ensures menu dates are always treated as strict calendar dates (YYYY-MM-DD)
 * in India Standard Time (Asia/Kolkata) without UTC midnight boundary shifts.
 */

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Returns today's calendar date in Asia/Kolkata (IST) formatted as YYYY-MM-DD.
 */
export function getTodayDateStr() {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const d = parts.find((p) => p.type === 'day')?.value;
    if (y && m && d) {
      return `${y}-${m}-${d}`;
    }
  } catch {
    // Fallback to local calendar date if Intl timeZone is unavailable
  }
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Normalizes any date string or timestamp to a 10-character YYYY-MM-DD calendar date.
 */
export function normalizeDateStr(val) {
  if (!val) return '';
  return String(val).trim().slice(0, 10);
}

/**
 * Adds a number of calendar days to a YYYY-MM-DD string without UTC conversion shifts.
 */
export function addDaysToDateStr(dateStr, days = 1) {
  const base = normalizeDateStr(dateStr) || getTodayDateStr();
  const [y, m, d] = base.split('-').map(Number);
  if (!y || !m || !d) return getTodayDateStr();

  const dt = new Date(y, m - 1, d + Number(days || 0));
  const ry = dt.getFullYear();
  const rm = String(dt.getMonth() + 1).padStart(2, '0');
  const rd = String(dt.getDate()).padStart(2, '0');
  return `${ry}-${rm}-${rd}`;
}

/**
 * Returns tomorrow's calendar date in Asia/Kolkata (IST) formatted as YYYY-MM-DD.
 */
export function getTomorrowDateStr() {
  return addDaysToDateStr(getTodayDateStr(), 1);
}

/**
 * Formats a YYYY-MM-DD string into a human-readable date such as "11 November 2026"
 * without parsing through UTC midnight.
 */
export function formatHumanDate(dateStr) {
  const clean = normalizeDateStr(dateStr);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  const [y, m, d] = clean.split('-').map(Number);
  const monthLabel = MONTH_NAMES[(m || 1) - 1] || '';
  return `${d} ${monthLabel} ${y}`;
}
