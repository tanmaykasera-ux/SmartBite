/**
 * Mealwise (SmartBite) Plate-Based Analytics & Forecasting Engine
 *
 * Key Institutional Rules:
 * 1. A mess cooks a fixed menu for everyone enrolled. Everything is counted in PLATES per meal.
 * 2. Default state for every enrolled student is Attending. Poll data ONLY counts students who marked "not coming".
 * 3. Expected plates per meal = Enrolled Students - Marked "Not Coming" (Poll) - Estimated Silent No-Shows (from history) + Guest Buffer.
 * 4. Recommended preparation (plates) = Expected Plates + Safety Buffer %.
 * 5. Never fabricate data or fake AI claims: when < 5 historical meal records exist, surface "Insufficient data".
 */

import {
  getTodayDateStr,
  getTomorrowDateStr,
  normalizeDateStr,
  getDayOfWeekName,
} from './dateUtils';

const MEAL_ORDER = { breakfast: 1, lunch: 2, dinner: 3 };

/**
 * 1. PLATE-BASED DEMAND FORECASTING ENGINE
 * Generates meal-level plate forecasts (Breakfast, Lunch, Dinner) with transparent formula inputs.
 */
export function generateDemandForecasts({
  menus = [],
  messProfile = {},
  attendanceResponses = [],
  historicalSelections = [],
  wasteLogs = [],
  holidaysEvents = [],
  existingOverrides = {},
  totalRegisteredStudents = 0,
}) {
  const enrolledStudents = Math.max(
    0,
    Number(totalRegisteredStudents || messProfile.registered_students || 0)
  );
  const guestBufferPct = Number(
    messProfile.guest_buffer_pct ?? messProfile.walk_in_buffer_pct ?? 5
  );
  const safetyBufferPct = Number(messProfile.safety_buffer_pct ?? 5);

  // Count historical meal records with actual plates served
  const validHistoryLogs = (wasteLogs || []).filter(
    (w) => Number(w.plates_served || w.consumed_kg || 0) > 0
  );
  const historicalAttendanceCount =
    (historicalSelections || []).length + validHistoryLogs.length;
  const hasSufficientHistory = historicalAttendanceCount >= 5;

  const dataSufficiency = {
    isSufficient: hasSufficientHistory,
    historicalDaysCount: historicalAttendanceCount,
    minimumRequiredDays: 5,
    statusLabel: hasSufficientHistory
      ? `Calibrated (${historicalAttendanceCount} historical records)`
      : `Insufficient data (${historicalAttendanceCount}/5 records — silent no-show estimate disabled)`,
  };

  if (enrolledStudents === 0 && menus.length === 0) {
    return { forecasts: [], dataSufficiency };
  }

  // Compute historical silent no-show rate per meal type among non-responders ONLY when sufficient history exists
  const computeSilentNoShowEstimate = (mealType, nonRespondersCount) => {
    if (!hasSufficientHistory || nonRespondersCount <= 0) {
      return { silentNoShows: 0, silentRatePct: 0 };
    }
    const mealKey =
      mealType === 'breakfast'
        ? 'breakfastSelected'
        : mealType === 'lunch'
        ? 'lunchSelected'
        : 'dinnerSelected';

    const relevantHist = (historicalSelections || []).filter(
      (h) => Number(h.registered || enrolledStudents) > 0
    );

    if (relevantHist.length > 0) {
      const ratios = relevantHist.map((h) => {
        const reg = Number(h.registered || enrolledStudents);
        const actualServed = Number(
          h.actualServedPlates || h[mealKey] || reg * 0.92
        );
        const unannouncedSkip = Math.max(0, reg - actualServed);
        return Math.min(0.18, unannouncedSkip / reg);
      });
      const avgSilentRate =
        ratios.reduce((a, b) => a + b, 0) / ratios.length;
      const silentNoShows = Math.round(nonRespondersCount * avgSilentRate);
      return {
        silentNoShows,
        silentRatePct: Number((avgSilentRate * 100).toFixed(1)),
      };
    }

    return { silentNoShows: 0, silentRatePct: 0 };
  };

  // Build list of target (date, meal_type) slots from published/draft menus or Today + Tomorrow defaults
  const todayStr = getTodayDateStr();
  const tomorrowStr = getTomorrowDateStr();

  const slotMap = new Map();

  [todayStr, tomorrowStr].forEach((dStr) => {
    ['breakfast', 'lunch', 'dinner'].forEach((mType) => {
      const key = `${dStr}_${mType}`;
      slotMap.set(key, {
        forecast_date: dStr,
        meal_type: mType,
        menu: null,
      });
    });
  });

  (menus || []).forEach((menu) => {
    const dStr = normalizeDateStr(menu.menu_date);
    const mType = String(menu.meal_type || 'lunch').toLowerCase();
    if (!dStr) return;
    const key = `${dStr}_${mType}`;
    slotMap.set(key, {
      forecast_date: dStr,
      meal_type: mType,
      menu,
    });
  });

  const forecasts = [];

  Array.from(slotMap.values())
    .sort((a, b) => {
      if (a.forecast_date !== b.forecast_date) {
        return a.forecast_date.localeCompare(b.forecast_date);
      }
      return (MEAL_ORDER[a.meal_type] || 2) - (MEAL_ORDER[b.meal_type] || 2);
    })
    .forEach((slot) => {
      const { forecast_date, meal_type, menu } = slot;
      const overrideKey = `${forecast_date}_${meal_type}`;
      const savedOverride = existingOverrides[overrideKey] || null;

      // Count students who explicitly marked "not_coming" for this (date, meal_type)
      const notComingResponses = (attendanceResponses || []).filter(
        (r) =>
          normalizeDateStr(r.meal_date || r.menu_date) === forecast_date &&
          String(r.meal_type || '').toLowerCase() === meal_type &&
          (r.status === 'not_coming' || r.will_attend === false)
      );
      const notComingCount = notComingResponses.length;

      // Non-responders (or those who kept Attending) default to attending
      const attendingDefaultCount = Math.max(
        0,
        enrolledStudents - notComingCount
      );

      // Estimated silent no-shows among non-responders (0 if < 5 historical records)
      const { silentNoShows, silentRatePct } = computeSilentNoShowEstimate(
        meal_type,
        attendingDefaultCount
      );

      // Holiday / Campus Event adjustment if configured for this date
      const matchingEvent = (holidaysEvents || []).find(
        (ev) => normalizeDateStr(ev.event_date) === forecast_date
      );
      const eventImpactPct = matchingEvent
        ? Number(matchingEvent.expected_attendance_impact_pct || 0)
        : 0;
      const eventDeltaPlates = matchingEvent
        ? Math.round(attendingDefaultCount * (eventImpactPct / 100))
        : 0;

      // Walk-in / Guest buffer plates (from Settings)
      const guestBufferPlates = Math.round(
        enrolledStudents * (guestBufferPct / 100)
      );

      // Expected plates per meal = Enrolled - Not Coming - Silent No-Shows + Guest Buffer (+ Event adjustment)
      const expectedPlates = Math.max(
        0,
        enrolledStudents -
          notComingCount -
          silentNoShows +
          guestBufferPlates +
          eventDeltaPlates
      );

      // Recommended preparation (plates) = Expected Plates + Safety Buffer %
      const safetyBufferPlates = Math.ceil(
        expectedPlates * (safetyBufferPct / 100)
      );
      const recommendedPrepPlates = expectedPlates + safetyBufferPlates;

      // Confidence range (± plates)
      const uncertaintyMarginPlates = hasSufficientHistory
        ? Math.max(2, Math.round(expectedPlates * 0.035))
        : Math.max(3, Math.round(expectedPlates * 0.08));

      const overriddenPrepPlates =
        savedOverride?.overridden_prep_plates ??
        savedOverride?.overridden_prep_kg ??
        null;
      const actualServedPlates =
        savedOverride?.actual_served_plates ??
        savedOverride?.actual_outcome_kg ??
        null;

      const accuracyPct =
        actualServedPlates !== null && expectedPlates > 0
          ? Number(
              Math.max(
                0,
                100 -
                  (Math.abs(actualServedPlates - expectedPlates) /
                    Math.max(1, actualServedPlates)) *
                    100
              ).toFixed(1)
            )
          : null;

      const menuDishes = (menu?.items || [])
        .map((d) => d.name || d.dish_name)
        .filter(Boolean);

      const assumptionsParts = [
        `${enrolledStudents} enrolled`,
        `${notComingCount} marked "Not Coming"`,
        hasSufficientHistory
          ? `${silentNoShows} est. silent no-shows (${silentRatePct}% historical rate)`
          : `Insufficient data (<5 records) for silent no-show deduction`,
        `+${guestBufferPlates} guest buffer (${guestBufferPct}%)`,
        `+${safetyBufferPlates} safety buffer (${safetyBufferPct}%)`,
      ];
      if (matchingEvent) {
        assumptionsParts.push(
          `Event: ${matchingEvent.event_name} (${eventImpactPct > 0 ? '+' : ''}${eventImpactPct}%)`
        );
      }

      forecasts.push({
        id: `fc-${forecast_date}-${meal_type}`,
        override_key: overrideKey,
        forecast_date,
        day_name: getDayOfWeekName(forecast_date),
        meal_type,
        menu_title:
          menu?.title ||
          `${meal_type.charAt(0).toUpperCase() + meal_type.slice(1)} Menu`,
        menu_dishes: menuDishes,
        publish_status: menu?.publish_status || 'not_created',
        enrolled_students: enrolledStudents,
        not_coming_count: notComingCount,
        attending_default_count: attendingDefaultCount,
        silent_no_shows_est: silentNoShows,
        silent_no_show_rate_pct: silentRatePct,
        guest_buffer_pct: guestBufferPct,
        guest_buffer_plates: guestBufferPlates,
        safety_buffer_pct: safetyBufferPct,
        safety_buffer_plates: safetyBufferPlates,
        expected_plates: expectedPlates,
        recommended_prep_plates: recommendedPrepPlates,
        overridden_prep_plates: overriddenPrepPlates,
        override_reason: savedOverride?.reason || '',
        actual_served_plates: actualServedPlates,
        forecast_accuracy_pct: accuracyPct,
        uncertainty_margin_plates: uncertaintyMarginPlates,
        confidence_range_label: `${Math.max(
          0,
          expectedPlates - uncertaintyMarginPlates
        )} – ${expectedPlates + uncertaintyMarginPlates} plates (±${uncertaintyMarginPlates})`,
        insufficient_data: !hasSufficientHistory,
        assumptions: assumptionsParts.join(' • '),
      });
    });

  return { forecasts, dataSufficiency };
}

/**
 * 2. PLATE-BASED FOOD WASTE ANALYTICS ENGINE
 * Computes waste %, financial loss (INR), and daily/meal breakdown strictly in PLATES.
 */
export function analyzeFoodWaste(wasteLogs = []) {
  if (!wasteLogs.length) {
    return {
      totalPreparedPlates: 0,
      totalServedPlates: 0,
      totalLeftoverPlates: 0,
      overallWastePct: 0,
      totalFinancialLossInr: 0,
      avgCostPerPlate: 65,
      mealTypeWasteBreakdown: [],
      dailyTrendPlates: [],
    };
  }

  let totalPreparedPlates = 0;
  let totalServedPlates = 0;
  let totalLeftoverPlates = 0;
  let totalFinancialLossInr = 0;

  const byMealType = {
    breakfast: { prepared: 0, served: 0, leftover: 0, cost: 0 },
    lunch: { prepared: 0, served: 0, leftover: 0, cost: 0 },
    dinner: { prepared: 0, served: 0, leftover: 0, cost: 0 },
  };

  const byDate = {};

  wasteLogs.forEach((log) => {
    const prep = Math.round(
      Number(log.plates_prepared ?? log.prepared_kg ?? 0)
    );
    const served = Math.round(
      Number(log.plates_served ?? log.consumed_kg ?? 0)
    );
    const leftover =
      log.leftover_plates !== undefined && log.leftover_plates !== null
        ? Math.round(Number(log.leftover_plates))
        : log.leftover_kg !== undefined && log.leftover_kg !== null
        ? Math.round(Number(log.leftover_kg))
        : Math.max(0, prep - served);

    const costPerPlate = Number(
      log.cost_per_plate ?? log.unit_cost_inr ?? 65
    );
    const loss =
      log.cost !== undefined && log.cost !== null
        ? Number(log.cost)
        : leftover * costPerPlate;

    totalPreparedPlates += prep;
    totalServedPlates += served;
    totalLeftoverPlates += leftover;
    totalFinancialLossInr += loss;

    const mType = String(log.meal_type || 'lunch').toLowerCase();
    if (byMealType[mType]) {
      byMealType[mType].prepared += prep;
      byMealType[mType].served += served;
      byMealType[mType].leftover += leftover;
      byMealType[mType].cost += loss;
    }

    const dKey = normalizeDateStr(log.log_date) || log.log_date;
    if (!byDate[dKey]) {
      byDate[dKey] = {
        date: dKey,
        platesPrepared: 0,
        platesServed: 0,
        leftoverPlates: 0,
        wasteCostInr: 0,
      };
    }
    byDate[dKey].platesPrepared += prep;
    byDate[dKey].platesServed += served;
    byDate[dKey].leftoverPlates += leftover;
    byDate[dKey].wasteCostInr += Math.round(loss);
  });

  const overallWastePct =
    totalPreparedPlates > 0
      ? Number(((totalLeftoverPlates / totalPreparedPlates) * 100).toFixed(2))
      : 0;

  const mealTypeWasteBreakdown = Object.entries(byMealType).map(
    ([meal, stats]) => ({
      meal: meal.charAt(0).toUpperCase() + meal.slice(1),
      platesPrepared: stats.prepared,
      platesServed: stats.served,
      leftoverPlates: stats.leftover,
      wastePct:
        stats.prepared > 0
          ? Number(((stats.leftover / stats.prepared) * 100).toFixed(1))
          : 0,
      lossInr: Math.round(stats.cost),
    })
  );

  const dailyTrendPlates = Object.values(byDate)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(-7)
    .map((d) => ({
      ...d,
      wastePct:
        d.platesPrepared > 0
          ? Number(((d.leftoverPlates / d.platesPrepared) * 100).toFixed(1))
          : 0,
    }));

  return {
    totalPreparedPlates,
    totalServedPlates,
    totalLeftoverPlates,
    overallWastePct,
    totalFinancialLossInr: Math.round(totalFinancialLossInr),
    mealTypeWasteBreakdown,
    dailyTrendPlates,
  };
}

/**
 * 3. OPERATIONAL RECOMMENDATIONS (PLATE-BASED WASTE REDUCTION)
 */
export function generateSmartRecommendations({ wasteLogs = [] } = {}) {
  const recommendations = [];

  if (!wasteLogs || wasteLogs.length === 0) {
    return recommendations;
  }

  wasteLogs.forEach((w) => {
    const prep = Number(w.plates_prepared ?? w.prepared_kg ?? 0);
    const left = Number(w.leftover_plates ?? w.leftover_kg ?? 0);
    const pct = prep > 0 ? (left / prep) * 100 : 0;
    if (pct > 5.0) {
      recommendations.push({
        id: `rec-waste-${w.id}`,
        type: 'portion_batch_tuning',
        priority: 'medium',
        title: `Reduce ${w.meal_type.toUpperCase()} batch size (${pct.toFixed(
          1
        )}% leftover plates)`,
        description: `${left} plates remained unserved out of ${prep} plates prepared on ${w.log_date}. Check attendance poll opt-outs before final batch cooking.`,
        impactBadge: `Saves ₹${Math.round(
          Number(w.cost || left * 65)
        ).toLocaleString('en-IN')}/meal`,
      });
    }
  });

  return recommendations;
}
