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
  const [portionPreference, setPortionPreference] = useState('standard');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const baseEnrolled = 1200;
  const currentOptIn = selectedIntent === 'attending' ? 942 : selectedIntent === 'light' ? 941 : 940;
  const currentSkipping = selectedIntent === 'skipping' ? 166 : 165;
  const nonResponders = baseEnrolled - currentOptIn - currentSkipping; // 94 or 95
  const aiWalkInBuffer = Math.round(nonResponders * 0.62); // Historical walk-in rate of non-responders
  const recommendedMealsToPrepare = currentOptIn + aiWalkInBuffer;
  const mealsSaved = baseEnrolled - recommendedMealsToPrepare;
  const kgSavedToday = Math.round(mealsSaved * 0.42);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Student View Card (Free User Experience) */}
      <Card className="lg:col-span-5 border-brand-200/80 bg-gradient-to-b from-white to-cream-50 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="green" icon={Users}>
              Student View • 100% Free
            </Badge>
            <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
              Hostel Block B • Dinner
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Tonight’s Dinner: Paneer Tikka Masala, Dal Makhani & Jeera Rice
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              740 kcal • 26g Protein • 92g Complex Carbs • 18g Fats
            </p>
          </div>

          {/* Non-restrictive selection buttons */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              1. Share Your Dining Intent (Helps Reduce Mess Waste)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'attending', label: 'Eating in Mess', sub: 'Full Portion' },
                { id: 'light', label: 'Light Portion', sub: 'Low Carb / Half' },
                { id: 'skipping', label: 'Eating Out', sub: 'Skip Tonight' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedIntent(opt.id);
                    setFeedbackSubmitted(true);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
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

          {/* Preferred Item Emphasis */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              2. Preferred Macro Focus
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'standard', label: 'Balanced Thali' },
                { id: 'high-protein', label: '+ Extra Paneer / Dal' },
                { id: 'rotis', label: 'Roti Only (No Rice)' },
              ].map((pref) => (
                <button
                  key={pref.id}
                  type="button"
                  onClick={() => setPortionPreference(pref.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    portionPreference === pref.id
                      ? 'bg-brand-100 text-brand-900 border-brand-300 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {pref.label}
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
              <span className="font-bold">Meal Entitlement Active & Guaranteed:</span> Even if you forget to submit a selection—or change your mind after selecting &ldquo;Eating Out&rdquo;—your mess meal access is <span className="underline font-semibold">never blocked or penalized</span>.
            </div>
          </div>
          {feedbackSubmitted && (
            <p className="text-xs text-brand-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Preference synced to Mess Operator AI Forecast!
            </p>
          )}
        </div>
      </Card>

      {/* Mess Operator AI Forecast Card (B2B Paying Customer View) */}
      <Card className="lg:col-span-7 bg-brand-950 text-white border-brand-900 flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-800/80 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300">
                <Sparkles className="w-3.5 h-3.5" /> Mess Operator Live AI Engine (Paying Customer View)
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                Tonight’s Batch Preparation & Entitlement Buffer
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-800 text-brand-200 border border-brand-700">
              96.8% Confidence
            </span>
          </div>

          {/* 4-Pillar Metric Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-brand-900/70 border border-brand-800">
              <p className="text-[11px] text-brand-300">Total Enrolled</p>
              <p className="text-2xl font-extrabold text-white mt-1">{baseEnrolled}</p>
              <p className="text-[10px] text-brand-400 mt-0.5">100% Entitled</p>
            </div>
            <div className="p-3.5 rounded-xl bg-brand-900/70 border border-brand-800">
              <p className="text-[11px] text-brand-300">Confirmed Dining</p>
              <p className="text-2xl font-extrabold text-brand-200 mt-1">{currentOptIn}</p>
              <p className="text-[10px] text-brand-400 mt-0.5">Student Poll Signal</p>
            </div>
            <div className="p-3.5 rounded-xl bg-brand-900/70 border border-brand-800">
              <p className="text-[11px] text-brand-300">Walk-In Buffer</p>
              <p className="text-2xl font-extrabold text-amber-300 mt-1">+{aiWalkInBuffer}</p>
              <p className="text-[10px] text-brand-400 mt-0.5">For {nonResponders} unpolled</p>
            </div>
            <div className="p-3.5 rounded-xl bg-brand-800/90 border border-brand-600">
              <p className="text-[11px] text-brand-200 font-semibold">AI Recommended Prep</p>
              <p className="text-2xl font-extrabold text-white mt-1">{recommendedMealsToPrepare}</p>
              <p className="text-[10px] text-brand-300 mt-0.5">Zero-Shortage Safe</p>
            </div>
          </div>

          {/* Ingredient-level Batch Recommendation Table */}
          <div className="rounded-xl bg-brand-900/50 border border-brand-800/90 overflow-hidden">
            <div className="px-4 py-2.5 bg-brand-900/90 border-b border-brand-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-brand-100 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-brand-300" /> Automated Raw Ingredient Sheet
              </span>
              <span className="text-brand-300">
                Macro Focus: {portionPreference === 'high-protein' ? '+8% Protein Batch' : portionPreference === 'rotis' ? '+12% Whole Wheat Atta' : 'Standard ICMR Ratio'}
              </span>
            </div>
            <div className="divide-y divide-brand-800/60 text-xs">
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-brand-100 font-medium">Fresh Malai Paneer & Gravy Base</span>
                <span className="text-brand-300">
                  Traditional: 96 kg → <strong className="text-white">SmartBite AI: {portionPreference === 'high-protein' ? '84 kg' : '80 kg'}</strong>
                </span>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-brand-100 font-medium">Whole Black Urad Dal (Dry Soak)</span>
                <span className="text-brand-300">
                  Traditional: 48 kg → <strong className="text-white">SmartBite AI: 40.5 kg</strong>
                </span>
              </div>
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-brand-100 font-medium">Basmati & Brown Jeera Rice</span>
                <span className="text-brand-300">
                  Traditional: 90 kg → <strong className="text-white">SmartBite AI: {portionPreference === 'rotis' ? '68 kg' : '74 kg'}</strong>
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
              Estimated Waste Prevented Tonight: <strong className="text-white">{kgSavedToday} kg ({mealsSaved} unused plates)</strong>
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-300">
            <ThumbsUp className="w-3.5 h-3.5" /> ₹8,450 Saved in a Single Meal
          </div>
        </div>
      </Card>
    </div>
  );
}
