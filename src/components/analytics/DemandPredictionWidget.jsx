import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Scale,
  Users,
  Salad,
  ThumbsUp,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

/**
 * Interactive simulator demonstrating how Student Meal Selection works
 * WITHOUT revoking student meal entitlement, while dynamically calculating
 * kitchen batch quantities for Mess Operators.
 */
export default function DemandPredictionWidget() {
  const [selectedIntent, setSelectedIntent] = useState('attending');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const baseEnrolled = 1200;
  const markedNotComing = selectedIntent === 'not_coming' ? 166 : 165;
  const silentNoShows = 45;
  const guestBuffer = 36;
  const expectedPlates = baseEnrolled - markedNotComing - silentNoShows + guestBuffer;
  const safetyBufferPlates = Math.round(expectedPlates * 0.05);
  const recommendedPlatesToPrepare = expectedPlates + safetyBufferPlates;
  const platesSaved = baseEnrolled - recommendedPlatesToPrepare;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Student View Card (Free User Experience) */}
      <Card className="lg:col-span-5 border-brand-200/80 bg-gradient-to-b from-white to-cream-50 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="green" icon={Users}>
              Student Attendance Poll • Sample Preview
            </Badge>
            <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
              Hostel Block B • Dinner
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Will you have dinner today?
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Menu: Paneer Tikka Masala, Dal Makhani &amp; Jeera Rice
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Standard Plate: 740 kcal • 26g Protein • 92g Carbs • 18g Fats
            </p>
          </div>

          {/* Non-restrictive attendance poll buttons */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Default Status: Attending (Only tap if you are NOT coming)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'attending', label: 'Attending (Default)', sub: '1 Plate Counted' },
                { id: 'not_coming', label: 'I will NOT be coming', sub: 'Saves 1 Plate' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedIntent(opt.id);
                    setFeedbackSubmitted(true);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedIntent === opt.id
                      ? 'bg-brand-800 text-white border-brand-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300'
                  }`}
                >
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      selectedIntent === opt.id ? 'text-brand-200' : 'text-slate-400'
                    }`}
                  >
                    {opt.sub}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Guaranteed Entitlement Notice */}
        <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-2">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-brand-50/90 border border-brand-200">
            <ShieldCheck className="w-5 h-5 text-brand-800 shrink-0 mt-0.5" />
            <div className="text-xs text-brand-900 leading-relaxed">
              <span className="font-bold">Meal Entitlement Active &amp; Guaranteed:</span> Not responding means you are counted as attending. You can undo your response anytime before cutoff, and your meal entitlement is <span className="underline font-semibold">never lost</span>.
            </div>
          </div>
          {feedbackSubmitted && (
            <p className="text-xs text-brand-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Poll response synced to Mess Owner Plate Forecast!
            </p>
          )}
        </div>
      </Card>

      {/* Mess Operator Plate Forecast Card */}
      <Card className="lg:col-span-7 bg-brand-950 text-white border-brand-900 flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-800/80 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300">
                <Sparkles className="w-3.5 h-3.5" /> Mess Owner Plate Forecast • Sample Preview
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                Tonight’s Recommended Plate Preparation
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-800 text-brand-200 border border-brand-700">
              Plate-Based Model
            </span>
          </div>

          {/* 4-Pillar Metric Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-brand-900/70 border border-brand-800">
              <p className="text-[11px] text-brand-300">Enrolled Students</p>
              <p className="text-2xl font-extrabold text-white mt-1">{baseEnrolled}</p>
              <p className="text-[10px] text-brand-400 mt-0.5">Default Attending</p>
            </div>
            <div className="p-3.5 rounded-xl bg-brand-900/70 border border-brand-800">
              <p className="text-[11px] text-brand-300">Marked Not Coming</p>
              <p className="text-2xl font-extrabold text-amber-300 mt-1">-{markedNotComing}</p>
              <p className="text-[10px] text-brand-400 mt-0.5">From Attendance Poll</p>
            </div>
            <div className="p-3.5 rounded-xl bg-brand-900/70 border border-brand-800">
              <p className="text-[11px] text-brand-300">Expected Plates</p>
              <p className="text-2xl font-extrabold text-brand-200 mt-1">{expectedPlates}</p>
              <p className="text-[10px] text-brand-400 mt-0.5">Includes +{guestBuffer} Guest Buffer</p>
            </div>
            <div className="p-3.5 rounded-xl bg-brand-800/90 border border-brand-600">
              <p className="text-[11px] text-brand-200 font-semibold">Recommended Prep</p>
              <p className="text-2xl font-extrabold text-white mt-1">{recommendedPlatesToPrepare} plates</p>
              <p className="text-[10px] text-brand-300 mt-0.5">+{safetyBufferPlates} Safety Buffer</p>
            </div>
          </div>

          {/* Purchase Planning Derivation Table */}
          <div className="rounded-xl bg-brand-900/50 border border-brand-800/90 overflow-hidden">
            <div className="px-4 py-2.5 bg-brand-900/90 border-b border-brand-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-brand-100 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-brand-300" /> Purchase Planning (Derived from {expectedPlates} Expected Plates)
              </span>
              <span className="text-brand-300">
                Quantity per Plate × Expected Plates
              </span>
            </div>
            <div className="divide-y divide-brand-800/60 text-xs">
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-brand-100 font-medium">Fresh Malai Paneer (80g / plate)</span>
                <span className="text-brand-300">
                  {expectedPlates} plates × 80g = <strong className="text-white">{((expectedPlates * 80) / 1000).toFixed(1)} kg</strong>
                </span>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-brand-100 font-medium">Urad Dal Dry Soak (40g / plate)</span>
                <span className="text-brand-300">
                  {expectedPlates} plates × 40g = <strong className="text-white">{((expectedPlates * 40) / 1000).toFixed(1)} kg</strong>
                </span>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-brand-100 font-medium">Basmati Rice (120g / plate)</span>
                <span className="text-brand-300">
                  {expectedPlates} plates × 120g = <strong className="text-white">{((expectedPlates * 120) / 1000).toFixed(1)} kg</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Savings Callout */}
        <div className="mt-5 pt-4 border-t border-brand-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-brand-200">
            <Salad className="w-4 h-4 text-brand-400 shrink-0" />
            <span>
              Estimated Leftover Prevented Tonight: <strong className="text-white">{platesSaved} plates saved</strong>
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-300">
            <ThumbsUp className="w-3.5 h-3.5" /> ₹{(platesSaved * 55).toLocaleString('en-IN')} Saved in a Single Meal
          </div>
        </div>
      </Card>
    </div>
  );
}
