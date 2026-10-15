import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, X, Trophy, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Award, Sparkles, Snowflake, Zap, Star, Check } from 'lucide-react';
import { getTodayISO } from '../utils/dateUtils';
import { useAppContext } from '../context/AppContext';
import { triggerHaptic } from '../utils/haptics';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  longestStreak: number;
  completedDays: string[];
}

const MILESTONES = [
  { days: 3, title: 'Spark Starter', icon: '⚡', desc: 'Light the habit spark' },
  { days: 7, title: 'Week Warrior', icon: '🛡️', desc: '1 full week of consistency' },
  { days: 14, title: 'Fortnight Blaze', icon: '🔥', desc: '2 consecutive weeks strong' },
  { days: 30, title: 'Monthly Master', icon: '👑', desc: 'A full month of discipline' },
  { days: 60, title: 'Inferno Legend', icon: '🏆', desc: 'Unshakable dedication' },
  { days: 100, title: 'Centurion', icon: '🌟', desc: 'Century of daily quests' },
];

export default function StreakModal({
  isOpen,
  onClose,
  streak,
  longestStreak,
  completedDays,
}: StreakModalProps) {
  const { userData, buyStreakFreeze, recoverStreak } = useAppContext();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'milestones'>('calendar');
  const todayISO = getTodayISO();
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleBuyFreeze = () => {
    if (userData.points < 25) {
      triggerToast("Need 25 stars to buy a Streak Freeze.");
      return;
    }
    triggerHaptic('success', userData.vibrationEnabled);
    const success = buyStreakFreeze(1, 25);
    if (success) {
      triggerToast("❄️ Streak Freeze equipped!");
    }
  };

  const handleRecover = () => {
    triggerHaptic('success', userData.vibrationEnabled);
    const res = recoverStreak();
    triggerToast(res.message);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (dayNum: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return formatted === todayISO;
  };

  const isDayCompleted = (dayNum: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return completedDays.includes(formatted);
  };

  const isDayFrozen = (dayNum: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return userData.usedStreakFreezes?.includes(formatted);
  };

  const isTodayCompleted = completedDays.includes(todayISO);

  // Next upcoming milestone
  const nextMilestone = MILESTONES.find(m => m.days > streak) || MILESTONES[MILESTONES.length - 1];
  const prevMilestoneDays = MILESTONES.filter(m => m.days <= streak).pop()?.days || 0;
  const progressPercent = nextMilestone.days === prevMilestoneDays 
    ? 100 
    : Math.min(100, Math.round(((streak - prevMilestoneDays) / (nextMilestone.days - prevMilestoneDays)) * 100));

  // Generate last 7 days for quick streak strip
  const recentDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const isDone = completedDays.includes(iso);
    const isFrozen = userData.usedStreakFreezes?.includes(iso);
    const isCurrent = iso === todayISO;
    return { iso, dayLabel, isDone, isFrozen, isCurrent, dayNum: d.getDate() };
  });

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 overflow-hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 6 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        style={{ willChange: 'transform, opacity' }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700/80 max-h-[85vh] sm:max-h-[82vh] flex flex-col overflow-hidden"
      >
        {/* Sticky Pinned Header */}
        <div className="flex justify-between items-center px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-orange-500 shadow-xs">
              <Flame size={20} className="fill-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Streak Map</h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Activity & habit tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
            aria-label="Close Streak Map"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4">
          {/* Compact Hero Streak Card */}
          <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-md shadow-orange-500/20 relative overflow-hidden">
            <div className="absolute -right-3 -bottom-5 opacity-15 pointer-events-none">
              <Flame size={110} className="fill-white" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-100 bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  {isTodayCompleted ? 'Active & Protected 🔥' : 'Active Streak'}
                </span>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-xl px-2 py-0.5 text-orange-100 text-[11px] font-bold">
                  <Trophy size={13} className="text-yellow-200" />
                  <span>Best: {longestStreak}d</span>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black">{streak}</span>
                <span className="text-base font-bold text-orange-100">{streak === 1 ? 'Day' : 'Days'}</span>
                <span className="text-xs text-orange-100/90 ml-auto">
                  {isTodayCompleted ? 'Completed today!' : 'Extend it today!'}
                </span>
              </div>

              {/* Integrated Streak Freeze Quick Status */}
              <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-orange-100 font-medium">
                  <Snowflake size={14} className="text-cyan-200" />
                  <span>{userData.streakFreezes || 0} Streak Freeze{(userData.streakFreezes || 0) === 1 ? '' : 's'}</span>
                </div>
                <button
                  onClick={handleBuyFreeze}
                  disabled={userData.points < 25}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                    userData.points >= 25
                      ? 'bg-white text-orange-600 hover:bg-orange-50 shadow-xs'
                      : 'bg-white/20 text-orange-200/60 cursor-not-allowed'
                  }`}
                  title="Buy 1 Streak Freeze for 25 Stars"
                >
                  <Star size={11} className={userData.points >= 25 ? 'fill-amber-400 text-amber-400' : ''} />
                  <span>+1 (25 ⭐)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Streak Recovery Banner (if broken streak exists) */}
          {userData.lastBrokenStreak && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-orange-500/15 border border-orange-300 dark:border-orange-800/80 animate-pop">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-orange-500" />
                  <span className="font-bold text-xs text-gray-900 dark:text-white">Streak Recovery</span>
                </div>
                <span className="text-[11px] font-black text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-full">
                  {userData.lastBrokenStreak.count} Days Lost
                </span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 mb-2">
                Restore your streak using 15 Stars or 1 Streak Freeze.
              </p>
              <button
                onClick={handleRecover}
                className="w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap size={13} />
                <span>Restore {userData.lastBrokenStreak.count}-Day Streak</span>
              </button>
            </div>
          )}

          {/* Past 7 Days Quick Strip */}
          <div className="bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700/60">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Past 7 Days</span>
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                {recentDays.filter(d => d.isDone || d.isFrozen).length}/7 Active
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {recentDays.map((d, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center py-1.5 px-0.5 rounded-xl transition-all ${
                    d.isCurrent
                      ? 'ring-2 ring-orange-500 bg-white dark:bg-gray-800 shadow-xs'
                      : 'bg-transparent'
                  }`}
                >
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1">{d.dayLabel}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-colors ${
                      d.isDone
                        ? 'bg-orange-500 text-white shadow-xs shadow-orange-500/30'
                        : d.isFrozen
                        ? 'bg-cyan-500 text-white shadow-xs shadow-cyan-500/30'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}
                    title={d.isFrozen ? "Streak Protected by Freeze ❄️" : d.isDone ? "Quest Completed" : "Missed"}
                  >
                    {d.isDone ? (
                      <Flame size={12} className="fill-white" />
                    ) : d.isFrozen ? (
                      <Snowflake size={11} className="text-white" />
                    ) : (
                      d.dayNum
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Segmented Tab Switch: Calendar vs Milestones */}
          <div className="flex rounded-xl bg-gray-100 dark:bg-gray-900/80 p-1 border border-gray-200 dark:border-gray-700/60">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <CalendarIcon size={14} />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'milestones'
                  ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Award size={14} />
              <span>Milestones ({streak}/{nextMilestone.days}d)</span>
            </button>
          </div>

          {/* View Tab 1: Calendar View */}
          {activeTab === 'calendar' && (
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-700">
              {/* Calendar Month Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={15} className="text-orange-500" />
                  <h3 className="font-bold text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                    {monthNames[month]} {year}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={prevMonth}
                    className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors cursor-pointer"
                    aria-label="Previous Month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors cursor-pointer"
                    aria-label="Next Month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Days of week */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
                  <span key={idx} className="text-[10px] font-bold text-gray-400 uppercase">
                    {day}
                  </span>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Blank padding */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`blank-${i}`} className="aspect-square" />
                ))}

                {/* Month days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const completed = isDayCompleted(dayNum);
                  const frozen = isDayFrozen(dayNum);
                  const current = isToday(dayNum);

                  return (
                    <div
                      key={`day-${dayNum}`}
                      className={`aspect-square rounded-lg sm:rounded-xl flex flex-col items-center justify-center text-[11px] font-bold relative transition-all ${
                        completed
                          ? 'bg-orange-500 text-white shadow-xs shadow-orange-500/20'
                          : frozen
                          ? 'bg-cyan-500 text-white shadow-xs shadow-cyan-500/20'
                          : current
                          ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 ring-2 ring-orange-400 font-black'
                          : 'bg-white dark:bg-gray-800/80 text-gray-700 dark:text-gray-300'
                      }`}
                      title={frozen ? "Protected by Streak Freeze ❄️" : completed ? "Quest Done" : current ? "Today" : "Missed"}
                    >
                      <span>{dayNum}</span>
                      {completed ? (
                        <Flame size={8} className="fill-white text-white absolute bottom-0.5" />
                      ) : frozen ? (
                        <Snowflake size={8} className="text-white absolute bottom-0.5" />
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* Compact Legend */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-3 pt-2.5 border-t border-gray-200 dark:border-gray-700/60 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block" />
                  <span>Done</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
                  <span>Frozen ❄️</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm border-2 border-orange-400 bg-white dark:bg-gray-800 inline-block" />
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-gray-200 dark:bg-gray-700 inline-block" />
                  <span>Missed</span>
                </div>
              </div>
            </div>
          )}

          {/* View Tab 2: Milestones Roadmap */}
          {activeTab === 'milestones' && (
            <div className="space-y-3">
              {/* Progress to next milestone */}
              <div className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-700/60">
                <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                  <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <Sparkles size={13} className="text-orange-500" />
                    Next: {nextMilestone.title} ({nextMilestone.days}d)
                  </span>
                  <span className="text-orange-600 dark:text-orange-400">{progressPercent}%</span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Milestones list */}
              <div className="space-y-1.5">
                {MILESTONES.map((m) => {
                  const reached = streak >= m.days;
                  return (
                    <div
                      key={m.days}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        reached
                          ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/40 text-gray-900 dark:text-gray-100'
                          : 'bg-white dark:bg-gray-800/60 border-gray-100 dark:border-gray-700/60 text-gray-400 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{m.icon}</span>
                        <div>
                          <p className="text-xs font-bold flex items-center gap-1">
                            {m.title}
                            {reached && <Sparkles size={11} className="text-orange-500" />}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{m.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black ${reached ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>
                          {m.days}d
                        </span>
                        {reached ? (
                          <div className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[8px] font-bold text-gray-400">
                            🔒
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Toast Feedback */}
          {feedback && (
            <div className="p-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold text-center shadow-lg animate-pop">
              {feedback}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
