import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, Star, Sparkles, CheckCircle2, Lock, ArrowRight, 
  ChevronLeft, Award, Palette, Clock, Dices, X, Compass,
  Calendar, Check, Zap, Shield, Heart, Bell
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { triggerHaptic } from '../utils/haptics';
import { getRandomInterestingName } from '../utils/nameGenerator';
import { requestNotificationPermission, scheduleDailyReminder } from '../utils/notificationUtils';

interface OnboardingProps {
  onClose?: () => void;
}

const BASIC_COLORS = [
  { id: '#3b82f6', name: 'Blue', color: '#3b82f6' },
  { id: '#10b981', name: 'Green', color: '#10b981' },
  { id: '#8b5cf6', name: 'Purple', color: '#8b5cf6' },
  { id: '#ef4444', name: 'Red', color: '#ef4444' },
  { id: '#f97316', name: 'Orange', color: '#f97316' },
  { id: '#eab308', name: 'Yellow', color: '#eab308' },
  { id: '#ec4899', name: 'Pink', color: '#ec4899' },
  { id: '#06b6d4', name: 'Cyan', color: '#06b6d4' },
];

export default function Onboarding({ onClose }: OnboardingProps) {
  const { userData, updateSettings, closeOnboarding } = useAppContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [customName, setCustomName] = useState(userData.name || 'Cosmic Wanderer');
  const [selectedColor, setSelectedColor] = useState(userData.accentColor || '#3b82f6');
  const [remindersEnabled, setRemindersEnabled] = useState(userData.notificationsEnabled ?? false);
  const [reminderTime, setReminderTime] = useState(userData.notificationTime || '09:00');

  // Swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const TOTAL_SLIDES = 6;

  const handleFinish = () => {
    triggerHaptic('success', userData.vibrationEnabled);
    if (remindersEnabled) {
      scheduleDailyReminder(reminderTime, true);
    }
    // Persist customized name, accent color, and notifications settings
    updateSettings({
      name: customName.trim() || userData.name || 'Cosmic Wanderer',
      accentColor: selectedColor,
      notificationsEnabled: remindersEnabled,
      notificationTime: reminderTime,
      hasSeenOnboarding: true,
    });
    if (onClose) {
      onClose();
    } else {
      closeOnboarding();
    }
  };

  const handleSkip = () => {
    triggerHaptic('light', userData.vibrationEnabled);
    updateSettings({ hasSeenOnboarding: true });
    if (onClose) {
      onClose();
    } else {
      closeOnboarding();
    }
  };

  const goToSlide = (newIndex: number) => {
    if (newIndex === currentSlide) return;
    setDirection(newIndex > currentSlide ? 1 : -1);
    setCurrentSlide(newIndex);
    triggerHaptic('selection', userData.vibrationEnabled);
  };

  const handleNext = () => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      goToSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    // Only swipe if horizontal motion was significant and greater than vertical
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0 && currentSlide < TOTAL_SLIDES - 1) {
        handleNext();
      } else if (diffX < 0 && currentSlide > 0) {
        handleBack();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentSlide < TOTAL_SLIDES - 1) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentSlide > 0) {
        handleBack();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[120] flex flex-col justify-between bg-gray-900/95 dark:bg-gray-950/95 backdrop-blur-2xl text-white select-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        paddingTop: 'max(1.25rem, env(safe-area-inset-top, 1.25rem))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))',
      }}
    >
      {/* Background ambient lighting */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[130px] opacity-25 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: selectedColor }}
      />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="px-6 py-2 flex items-center justify-between shrink-0 relative z-10 max-w-lg mx-auto w-full">
        {/* Brand & Step Tag */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center p-1.5 ring-1 ring-white/15">
            <Compass size={18} className="text-white" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-gray-300 flex items-center gap-1.5">
              <span>Dailyz Tour</span>
              <span className="w-1 h-1 rounded-full bg-gray-400" />
              <span className="text-[11px] font-mono text-gray-400">{currentSlide + 1}/{TOTAL_SLIDES}</span>
            </div>
          </div>
        </div>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-gray-300 hover:text-white transition-all cursor-pointer ring-1 ring-white/10"
        >
          Skip
        </button>
      </header>

      {/* Slide Carousel Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full relative z-10 my-auto">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex flex-col items-center text-center"
          >
            {/* SLIDE 1: Welcome & Daily Quests */}
            {currentSlide === 0 && (
              <div className="w-full flex flex-col items-center">
                {/* Visual Showcase Card */}
                <div className="relative mb-8 w-full max-w-[300px]">
                  <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="p-5 rounded-3xl bg-gray-800/80 border border-white/10 shadow-2xl backdrop-blur-md relative overflow-hidden text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <img 
                          src="/icon.png" 
                          alt="Dailyz" 
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-white/20"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Today's Quest</span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Easy
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-white mb-2 line-clamp-2">
                      Take a 15-minute nature walk without checking your phone
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star size={14} className="fill-amber-400" />
                        <span>+20 Stars</span>
                      </div>
                      <div className="flex items-center gap-1 text-orange-400 font-bold">
                        <Flame size={14} className="fill-orange-400 animate-pulse" />
                        <span>Streak Active</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating floating elements */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="absolute -top-3 -right-3 bg-amber-500 text-gray-950 font-black text-xs px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 rotate-6 ring-2 ring-gray-900"
                  >
                    <Sparkles size={12} />
                    <span>Daily Reset</span>
                  </motion.div>
                </div>

                {/* Text Content */}
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2.5">
                  Small Habits. <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Epic Momentum.</span>
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed max-w-xs mb-6">
                  Every 24 hours brings one meaningful micro-quest designed to spark action without overwhelming your schedule.
                </p>

                {/* Quick feature tags */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/10">
                    ⚡ 1 Quest Daily
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/10">
                    🔥 Unbroken Streaks
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/10">
                    ⭐ Earn Stars
                  </span>
                </div>
              </div>
            )}

            {/* SLIDE 2: Merged Full-Page Quests & Midnight Swap */}
            {currentSlide === 1 && (
              <div className="w-full flex flex-col items-center">
                {/* Visual Showcase Card */}
                <div className="relative mb-8 w-full max-w-[300px]">
                  <div className="p-5 rounded-3xl bg-gray-800/80 border border-white/10 shadow-2xl backdrop-blur-md relative overflow-hidden text-left">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 size={15} />
                        </div>
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Completed Today</span>
                      </div>
                      <span className="text-[11px] font-mono text-gray-400">Done</span>
                    </div>

                    {/* Transition arrow box */}
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 my-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                        <Clock size={13} className="text-blue-400" />
                        <span>Swaps to Tomorrow's Quest</span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 font-mono">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span>Live countdown to midnight</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 text-gray-400">
                      <span>Tomorrow unlocks in:</span>
                      <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">
                        14h 28m
                      </span>
                    </div>
                  </div>

                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className="absolute -bottom-2.5 right-4 bg-blue-600 text-white font-bold text-[11px] px-3 py-1 rounded-full shadow-lg flex items-center gap-1"
                  >
                    <span>Instant Swap</span>
                    <ArrowRight size={12} />
                  </motion.div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2.5">
                  Single-Card Focus. <span className="text-blue-400">Midnight Swap.</span>
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed max-w-xs mb-6">
                  No clutter. Focus completely on today's quest. Once completed, your screen smoothly transitions to tomorrow's preview and live countdown!
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/10">
                    🎯 Zero Distractions
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/10">
                    ⏳ Live Countdown
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/10">
                    🔄 Seamless Swap
                  </span>
                </div>
              </div>
            )}

            {/* SLIDE 3: Tomorrow's Mystery Quest */}
            {currentSlide === 2 && (
              <div className="w-full flex flex-col items-center">
                {/* Visual Showcase Card */}
                <div className="relative mb-8 w-full max-w-[300px]">
                  <div className="p-5 rounded-3xl bg-gray-800/80 border border-white/10 shadow-2xl backdrop-blur-md relative overflow-hidden text-left">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <Lock size={13} />
                        </div>
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Tomorrow's Quest</span>
                      </div>
                      <span className="text-[11px] font-bold text-gray-400">Locked</span>
                    </div>

                    {/* Mystery blurred representation */}
                    <div className="relative p-3 bg-gray-900/60 rounded-2xl border border-white/5 my-2 overflow-hidden">
                      <div className="filter blur-sm select-none text-xs text-gray-300">
                        Secret challenge: Read 10 pages of a book before bed...
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-950/40">
                        <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/40">
                          <Lock size={11} />
                          <span>Mystery Challenge</span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-300">Unlock early:</span>
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span>20 Stars</span>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 font-black text-xs px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 ring-2 ring-gray-900"
                  >
                    <span>Peek Ahead!</span>
                  </motion.div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2.5">
                  Peek Into <span className="text-amber-400">Tomorrow.</span>
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed max-w-xs mb-6">
                  Can't wait until midnight? Spend 20 earned stars to reveal tomorrow's mystery quest early and get a head start!
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/10">
                    🔮 Early Reveal
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/10">
                    ⭐ Star Powered
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/10">
                    🗓️ Plan Ahead
                  </span>
                </div>
              </div>
            )}

            {/* SLIDE 4: Daily Reminders & Local Notifications */}
            {currentSlide === 3 && (
              <div className="w-full flex flex-col items-center">
                {/* Visual Showcase Card: Notification preview */}
                <div className="relative mb-6 w-full max-w-[310px]">
                  <div className="p-4 sm:p-5 rounded-3xl bg-gray-800/90 border border-white/10 shadow-2xl backdrop-blur-md relative overflow-hidden text-left">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                          <Bell size={14} />
                        </div>
                        <span className="text-xs font-bold text-gray-200">Daily Reminder</span>
                      </div>
                      <span className="text-[11px] font-mono text-gray-400">{reminderTime}</span>
                    </div>

                    {/* Notification Toast Mockup */}
                    <div className="p-3 bg-white/10 rounded-2xl border border-white/10 my-2">
                      <div className="flex items-center gap-2 mb-1">
                        <img 
                          src="/icon.png" 
                          alt="Dailyz" 
                          className="w-4 h-4 rounded-md object-cover" 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="text-xs font-bold text-white">Dailyz • Action Time! ⚡</span>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-snug">
                        Your micro-quest is waiting. Complete it to earn stars and keep your streak burning!
                      </p>
                    </div>

                    {/* Preset selection pills */}
                    <div className="mt-3">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                        Choose Reminder Time
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { time: '08:00', label: '08:00 AM', desc: 'Early Bird' },
                          { time: '09:00', label: '09:00 AM', desc: 'Morning' },
                          { time: '13:00', label: '01:00 PM', desc: 'Midday' },
                          { time: '20:00', label: '08:00 PM', desc: 'Evening' },
                        ].map((t) => (
                          <button
                            key={t.time}
                            type="button"
                            onClick={() => {
                              triggerHaptic('selection', userData.vibrationEnabled);
                              setReminderTime(t.time);
                            }}
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                              reminderTime === t.time
                                ? 'bg-blue-600/30 border-blue-400 text-white font-bold ring-1 ring-blue-400/50'
                                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                            }`}
                          >
                            <div className="font-semibold text-xs">{t.label}</div>
                            <div className="text-[10px] text-gray-400">{t.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Enable reminder toggle button */}
                  <div className="mt-3 flex justify-center">
                    <button
                      type="button"
                      onClick={async () => {
                        triggerHaptic('medium', userData.vibrationEnabled);
                        if (!remindersEnabled) {
                          const granted = await requestNotificationPermission();
                          setRemindersEnabled(granted);
                        } else {
                          setRemindersEnabled(false);
                        }
                      }}
                      className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                        remindersEnabled
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/30'
                          : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
                      }`}
                    >
                      <Bell size={14} className={remindersEnabled ? "text-emerald-400 fill-emerald-400" : ""} />
                      <span>{remindersEnabled ? "Daily Reminders Active ✓" : "Enable Daily Reminders"}</span>
                    </button>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                  Never Miss <span className="text-blue-400">Your Streak.</span>
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed max-w-xs mb-4">
                  Habits stick when they have an anchor. Choose a time that fits your day for a polite, offline reminder.
                </p>
              </div>
            )}

            {/* SLIDE 5: Profile & Rewards Shop */}
            {currentSlide === 4 && (
              <div className="w-full flex flex-col items-center">
                {/* Visual Showcase Card */}
                <div className="relative mb-8 w-full max-w-[300px]">
                  <div className="p-5 rounded-3xl bg-gray-800/80 border border-white/10 shadow-2xl backdrop-blur-md relative overflow-hidden text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5 shadow-lg">
                        <div className="w-full h-full rounded-[14px] bg-gray-900 flex items-center justify-center text-xl">
                          🚀
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-gray-950 flex items-center justify-center text-[10px] font-black">
                          ★
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">Grandmaster</div>
                        <div className="text-[11px] text-purple-400 font-semibold flex items-center gap-1">
                          <Award size={12} />
                          <span>Prestige Rank</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs my-2">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-gray-400 text-[10px] uppercase">Unlocked Ranks</div>
                        <div className="font-bold text-white mt-0.5">8 Available</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-gray-400 text-[10px] uppercase">Profile Frames</div>
                        <div className="font-bold text-white mt-0.5">Neon & Gold</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-300">
                      <span>Rewards Shop:</span>
                      <span className="text-amber-400 font-bold">100% Free via Stars</span>
                    </div>
                  </div>

                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-3 -left-2 bg-purple-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 ring-2 ring-gray-900"
                  >
                    <Award size={12} />
                    <span>Level Up</span>
                  </motion.div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2.5">
                  Prestige Ranks & <span className="text-purple-400">Shop.</span>
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed max-w-xs mb-6">
                  Turn your consistency into flair. Spend stars on profile ranks, animated avatar decorations, and personalized titles.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/10">
                    👑 8+ Prestige Ranks
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/10">
                    ✨ Avatar Borders
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/10">
                    🏷️ Custom Tags
                  </span>
                </div>
              </div>
            )}

            {/* SLIDE 6: Personalize & Launch */}
            {currentSlide === 5 && (
              <div className="w-full flex flex-col items-center">
                {/* Interactive Personalization Card */}
                <div className="w-full max-w-[320px] p-5 rounded-3xl bg-gray-800/80 border border-white/10 shadow-2xl backdrop-blur-md mb-6 text-left">
                  {/* Name field */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Your Adventurer Name
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g. Cosmic Wanderer"
                        maxLength={24}
                        className="flex-1 bg-gray-900/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light', userData.vibrationEnabled);
                          setCustomName(getRandomInterestingName());
                        }}
                        title="Generate random name"
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-gray-300 hover:text-white cursor-pointer ring-1 ring-white/10"
                      >
                        <Dices size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Starter Accent Color Picker */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Choose Your Theme Accent
                    </label>
                    <div className="grid grid-cols-4 gap-2.5">
                      {BASIC_COLORS.map((c) => {
                        const isSelected = selectedColor.toLowerCase() === c.id.toLowerCase();
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              triggerHaptic('selection', userData.vibrationEnabled);
                              setSelectedColor(c.id);
                            }}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-white/15 border-white/40 ring-2 ring-white/30 scale-105' 
                                : 'bg-gray-900/50 border-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div 
                              className="w-5 h-5 rounded-full shadow-sm flex items-center justify-center relative"
                              style={{ backgroundColor: c.color }}
                            >
                              {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className="text-[10px] font-medium text-gray-300">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                  You're Ready to Roll! 🚀
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed max-w-xs mb-4">
                  Welcome to the Dailyz community. Consistency beats intensity every single time. Let's tackle day one!
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation & Controls */}
      <footer className="px-6 pt-3 pb-2 flex flex-col gap-4 shrink-0 max-w-md mx-auto w-full relative z-10">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="h-2 rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  width: isActive ? '28px' : '8px',
                  backgroundColor: isActive ? (selectedColor || '#3b82f6') : 'rgba(255, 255, 255, 0.2)',
                }}
              />
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {currentSlide > 0 && (
            <button
              onClick={handleBack}
              className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-gray-300 font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ring-1 ring-white/10 shrink-0"
            >
              <ChevronLeft size={18} />
              <span>Back</span>
            </button>
          )}

          {currentSlide < TOTAL_SLIDES - 1 ? (
            <button
              onClick={handleNext}
              className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer group"
              style={{
                backgroundColor: selectedColor || '#3b82f6',
                boxShadow: `0 4px 20px -2px ${selectedColor}66`,
              }}
            >
              <span>Continue</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex-1 py-3.5 px-6 rounded-2xl font-black text-sm text-white shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer animate-pop"
              style={{
                backgroundColor: selectedColor || '#3b82f6',
                boxShadow: `0 4px 25px -1px ${selectedColor}88`,
              }}
            >
              <span>Start My Adventure</span>
              <Sparkles size={18} className="fill-white" />
            </button>
          )}
        </div>
      </footer>
    </motion.div>
  );
}
