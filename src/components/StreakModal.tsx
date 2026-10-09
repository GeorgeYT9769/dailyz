import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flame, X, Trophy, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, Award, Sparkles, Snowflake, Zap, Shield, Star } from 'lucide-react';
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
  const todayISO = getTodayISO();
  const [currentDate, setCurrentDate] = useState(() => new Date());

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

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-orange-500 shadow-sm">
              <Flame size={24} className="fill-orange-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Streak Map</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Activity & habit tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            aria-label="Close Streak Map"
          >
            <X size={20} />
          </button>
        </div>

        {/* Hero Streak Banner */}
        <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-5 text-white shadow-lg shadow-orange-500/20 mb-5 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-6 opacity-20 pointer-events-none">
            <Flame size={140} className="fill-white" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-100 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                {isTodayCompleted ? 'Active & Protected' : 'Active Streak'}
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black">{streak}</span>
                <span className="text-lg font-bold text-orange-100">{streak === 1 ? 'Day' : 'Days'}</span>
              </div>
              <p className="text-xs text-orange-100 mt-1 max-w-[200px]">
                {isTodayCompleted
                  ? "Quest completed today! Your streak is secured! 🔥"
                  : "Complete today's quest to extend your streak!"}
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center min-w-[80px]">
              <Trophy size={20} className="text-yellow-200 mb-1" />
              <span className="text-[10px] uppercase font-bold text-orange-100">Record</span>
              <span className="text-base font-black">{longestStreak} d</span>
            </div>
          </div>
        </div>

        {/* Streak Recovery Card (if broken streak exists) */}
        {userData.lastBrokenStreak && (
          <div className="mb-5 p-4 rounded-3xl bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-orange-500/15 border border-orange-300 dark:border-orange-800/80 animate-pop">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-orange-500" />
                <span className="font-bold text-sm text-gray-900 dark:text-white">Streak Recovery Available</span>
              </div>
              <span className="text-xs font-black text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-2.5 py-0.5 rounded-full">
                {userData.lastBrokenStreak.count} Days Lost
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
              Don't lose your progress! Recover your streak using 15 Stars or 1 Streak Freeze.
            </p>
            <button
              onClick={handleRecover}
              className="w-full py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap size={14} />
              <span>Restore {userData.lastBrokenStreak.count}-Day Streak Now</span>
            </button>
          </div>
        )}

        {/* Streak Freezes Protection Box */}
        <div className="mb-5 p-3.5 sm:p-4 rounded-3xl bg-cyan-50/80 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-900/60 flex items-center justify-center text-cyan-600 dark:text-cyan-300 shrink-0 shadow-xs">
              <Snowflake size={20} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-gray-900 dark:text-white">Streak Protection:</span>
                <span className="font-black text-xs text-cyan-700 dark:text-cyan-300">{userData.streakFreezes || 0} Freeze{(userData.streakFreezes || 0) === 1 ? '' : 's'}</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Automatically protects streak if you miss a day
              </p>
            </div>
          </div>
          <button
            onClick={handleBuyFreeze}
            disabled={userData.points < 25}
            className={`px-3 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0 ${
              userData.points >= 25
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            title="Buy 1 Streak Freeze for 25 Stars"
          >
            <Star size={12} className={userData.points >= 25 ? 'fill-yellow-300 text-yellow-300' : ''} />
            <span>+1 (25 ⭐)</span>
          </button>
        </div>

        {/* 7-Day Quick Strip */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Past 7 Days</span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {recentDays.filter(d => d.isDone || d.isFrozen).length} / 7 Active
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 bg-gray-50 dark:bg-gray-900/60 p-2 rounded-2xl border border-gray-100 dark:border-gray-700/60">
            {recentDays.map((d, i) => (
              <div
                key={i}
                className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                  d.isCurrent
                    ? 'ring-2 ring-orange-500 bg-white dark:bg-gray-800 shadow-sm'
                    : 'bg-transparent'
                }`}
              >
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1">{d.dayLabel}</span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                    d.isDone
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                      : d.isFrozen
                      ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/30'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }`}
                  title={d.isFrozen ? "Streak Protected by Freeze ❄️" : d.isDone ? "Quest Completed" : "Missed"}
                >
                  {d.isDone ? (
                    <Flame size={14} className="fill-white" />
                  ) : d.isFrozen ? (
                    <Snowflake size={13} className="text-white" />
                  ) : (
                    d.dayNum
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Calendar View */}
        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-3xl p-4 border border-gray-100 dark:border-gray-700 mb-6">
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <CalendarIcon size={16} className="text-orange-500" />
              <h3 className="font-bold text-sm">
                {monthNames[month]} {year}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                aria-label="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                aria-label="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
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
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold relative transition-all ${
                    completed
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                      : frozen
                      ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/20'
                      : current
                      ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 ring-2 ring-orange-400 font-black'
                      : 'bg-white dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                  }`}
                  title={frozen ? "Protected by Streak Freeze ❄️" : completed ? "Quest Done" : current ? "Today" : "Missed"}
                >
                  <span>{dayNum}</span>
                  {completed ? (
                    <Flame size={10} className="fill-white text-white absolute bottom-1" />
                  ) : frozen ? (
                    <Snowflake size={10} className="text-white absolute bottom-1" />
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700/60 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-orange-500 inline-block shadow-xs" />
              <span>Done</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-cyan-500 inline-block shadow-xs" />
              <span>Frozen ❄️</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md border-2 border-orange-400 bg-white dark:bg-gray-800 inline-block" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-gray-200 dark:bg-gray-700 inline-block" />
              <span>Missed</span>
            </div>
          </div>
        </div>

        {/* Milestones Roadmap */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Award size={14} className="text-orange-500" />
              Streak Milestones
            </h3>
            <span className="text-xs font-semibold text-orange-500">
              Next: {nextMilestone.days} Days
            </span>
          </div>

          {/* Progress to next milestone */}
          <div className="mb-4 bg-gray-100 dark:bg-gray-700/50 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="space-y-2">
            {MILESTONES.map((m) => {
              const reached = streak >= m.days;
              return (
                <div
                  key={m.days}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    reached
                      ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/40 text-gray-900 dark:text-gray-100'
                      : 'bg-white dark:bg-gray-800/60 border-gray-100 dark:border-gray-700/60 text-gray-400 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{m.icon}</span>
                    <div>
                      <p className="text-xs font-bold flex items-center gap-1.5">
                        {m.title}
                        {reached && <Sparkles size={12} className="text-orange-500" />}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{m.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-black ${reached ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>
                      {m.days}d
                    </span>
                    {reached ? (
                      <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        🔒
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-2xl font-bold text-sm transition-colors text-gray-800 dark:text-gray-200"
        >
          Close
        </button>

        {/* Toast Feedback */}
        {feedback && (
          <div className="mt-3 p-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold text-center shadow-lg animate-pop">
            {feedback}
          </div>
        )}
      </motion.div>
    </div>
  );
}
