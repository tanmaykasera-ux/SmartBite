import React, { useState } from 'react';
import {
  MessageSquareHeart,
  Star,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Send,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useData } from '../../context/DataContext';

export default function StudentFeedbackTab() {
  const { feedbackList, updateFeedbackStatus } = useData();
  const [typeFilter, setTypeFilter] = useState('all'); // all | review | complaint | suggestion
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const filteredFeedback = feedbackList.filter(
    (fb) => typeFilter === 'all' || fb.feedback_type === typeFilter
  );

  // Compute dish-wise satisfaction averages strictly from real feedbackList
  const dishMap = {};
  feedbackList.forEach((fb) => {
    if (!dishMap[fb.dish_name]) {
      dishMap[fb.dish_name] = {
        dish: fb.dish_name,
        meal: fb.meal_type,
        total: 0,
        count: 0,
      };
    }
    dishMap[fb.dish_name].total += Number(fb.rating || 0);
    dishMap[fb.dish_name].count += 1;
  });
  const dishSatisfaction = Object.values(dishMap).map((d) => ({
    ...d,
    avg: d.count > 0 ? (d.total / d.count).toFixed(1) : '0.0',
  }));

  const overallAverageRating =
    feedbackList.length > 0
      ? (
          feedbackList.reduce((s, f) => s + Number(f.rating || 0), 0) /
          feedbackList.length
        ).toFixed(1)
      : '0.0';

  const handleSaveReply = async (fbId) => {
    await updateFeedbackStatus(fbId, 'resolved', replyText);
    setReplyingId(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Dish-Wise Satisfaction Scorecards */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              Dish-Wise Student Satisfaction Ratings
            </h2>
            <p className="text-xs text-slate-500">
              Aggregated 5-star dish ratings submitted by hostel students
            </p>
          </div>
          <Badge variant={feedbackList.length > 0 ? 'green' : 'neutral'}>
            {feedbackList.length > 0
              ? `Avg. ${overallAverageRating} / 5.0 ★`
              : '0 Ratings'}
          </Badge>
        </div>

        {dishSatisfaction.length === 0 ? (
          <div className="p-6 rounded-xl bg-cream-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
            No dish ratings submitted by students yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dishSatisfaction.map((item) => (
              <div
                key={item.dish}
                className="p-4 rounded-xl bg-cream-50 border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-brand-800 bg-brand-50 px-2 py-0.5 rounded">
                    {item.meal}
                  </span>
                  <span className="text-sm font-extrabold text-amber-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {item.avg} / 5
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900">{item.dish}</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-700 h-full rounded-full"
                    style={{ width: `${(Number(item.avg) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Filter Bar & Feedback Stream */}
      <Card className="p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquareHeart className="w-4 h-4 text-brand-700" />
              Student Reviews, Complaints &amp; Menu Suggestions
            </h3>
            <p className="text-xs text-slate-500">
              Respond directly to student feedback and resolve kitchen service issues
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-cream-100 p-1 border border-slate-200 text-xs">
            {[
              { id: 'all', label: 'All Feedback' },
              { id: 'review', label: 'Reviews' },
              { id: 'complaint', label: 'Complaints' },
              { id: 'suggestion', label: 'Suggestions' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  typeFilter === tab.id
                    ? 'bg-brand-800 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredFeedback.length === 0 ? (
          <div className="p-8 rounded-2xl bg-cream-50 border border-dashed border-slate-300 text-center space-y-2">
            <MessageSquareHeart className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-800">
              No student feedback entries found
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              When students submit dish ratings, reviews, complaints, or menu suggestions from their Student Portal, they will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((fb) => (
              <div
                key={fb.id}
                className="p-4 rounded-2xl border border-slate-200/90 bg-white space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Badge
                      variant={
                        fb.feedback_type === 'complaint'
                          ? 'amber'
                          : fb.feedback_type === 'suggestion'
                          ? 'blue'
                          : 'green'
                      }
                      icon={
                        fb.feedback_type === 'complaint'
                          ? AlertCircle
                          : fb.feedback_type === 'suggestion'
                          ? Lightbulb
                          : Star
                      }
                    >
                      {(fb.feedback_type || 'review').toUpperCase()}
                    </Badge>
                    <span className="text-sm font-bold text-slate-900">
                      {fb.dish_name}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({(fb.meal_type || 'meal').toUpperCase()})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-amber-500">
                      {'★'.repeat(Number(fb.rating || 0))}
                      {'☆'.repeat(Math.max(0, 5 - Number(fb.rating || 0)))}
                    </span>
                    <Badge
                      variant={fb.status === 'resolved' ? 'green' : 'amber'}
                    >
                      {(fb.status || 'open').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {(fb.review || fb.comment) && (
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>Review:</strong> &ldquo;{fb.review || fb.comment}&rdquo;
                  </p>
                )}
                {fb.complaint && (
                  <p className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    <strong>Complaint:</strong> {fb.complaint}
                  </p>
                )}
                {fb.suggestion && (
                  <p className="text-xs text-brand-900 bg-brand-50/70 p-2.5 rounded-xl border border-brand-200">
                    <strong>Suggestion:</strong> {fb.suggestion}
                  </p>
                )}

                {fb.owner_reply && (
                  <div className="p-3 rounded-xl bg-cream-100 border border-slate-200 text-xs text-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-brand-900">
                        Mess Owner Response:
                      </strong>{' '}
                      {fb.owner_reply}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>Submitted by {fb.student_name}</span>
                  {replyingId === fb.id ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write response to student..."
                        className="flex-1 sm:w-64 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900"
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Send}
                        onClick={() => handleSaveReply(fb.id)}
                      >
                        Send &amp; Resolve
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingId(fb.id);
                        setReplyText(fb.owner_reply || '');
                      }}
                      className="font-bold text-brand-800 hover:underline"
                    >
                      {fb.owner_reply
                        ? 'Edit Response'
                        : 'Reply & Mark Resolved →'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
