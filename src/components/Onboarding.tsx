import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Star,
  Sparkles,
  CheckCircle,
  Lock,
  ArrowRight,
  ChevronLeft,
  Award,
  Clock,
  Dices,
  Compass,
  Check,
  Bell,
  Volume2,
  Snowflake,
  RefreshCw,
  Calendar,
  Zap,
  Footprints,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { triggerHaptic } from '../utils/haptics';
import { getRandomInterestingName } from '../utils/nameGenerator';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  formatTimeDisplay,
} from '../utils/notificationUtils';
import { playSound } from '../utils/audioEffects';
import TactileSwitch from './TactileSwitch';
import DifficultyBars from './DifficultyBars';

interface OnboardingProps {
  onClose?: () => void;
}

const BASIC_COLORS = [
  { id: '#067bc2', name: 'Teal Blue', color: '#067bc2', dark: '#04598c' },
  { id: '#ff5d38', name: 'Coral Glow', color: '#ff5d38', dark: '#cc3412' },
  { id: '#ff3b5c', name: 'Vibrant Pink', color: '#ff3b5c', dark: '#c81438' },
  { id: '#ecc30b', name: 'Amber', color: '#ecc30b', dark: '#b99603' },
  { id: '#84bcda', name: 'Sky Blue', color: '#84bcda', dark: '#4e91b5' },
  { id: '#10b981', name: 'Emerald', color: '#10b981', dark: '#047857' },
  { id: '#8b5cf6', name: 'Purple', color: '#8b5cf6', dark: '#6d28d9' },
  { id: '#3b82f6', name: 'Classic Blue', color: '#3b82f6', dark: '#1d4ed8' },
];

export default function Onboarding({ onClose }: OnboardingProps) {
  const { userData, updateSettings, closeOnboarding } = useAppContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [customName, setCustomName] = useState(userData.name || 'Cosmic Wanderer');
  const [selectedColor, setSelectedColor] = useState(userData.accentColor || '#067bc2');
  const [remindersEnabled, setRemindersEnabled] = useState(userData.notificationsEnabled ?? false);
  const [reminderTime, setReminderTime] = useState(userData.notificationTime || '09:00');

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const TOTAL_SLIDES = 6;

  const activeColorMeta =
    BASIC_COLORS.find((c) => c.id.toLowerCase() === selectedColor.toLowerCase()) || BASIC_COLORS[0];

  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

  const handleFinish = () => {
    triggerHaptic('success', userData.vibrationEnabled);
    playSound('complete', userData.soundEnabled ?? true);
    if (remindersEnabled) {
      scheduleDailyReminder(reminderTime, true);
    }
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
    playSound('click', userData.soundEnabled ?? true);
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
    playSound('pop', userData.soundEnabled ?? true);
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
    e.stopPropagation();
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0 && currentSlide < TOTAL_SLIDES - 1) {
        handleNext();
      } else if (diffX < 0 && currentSlide > 0) {
        handleBack();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

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
      x: dir > 0 ? 28 : -28,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -28 : 28,
      opacity: 0,
    }),
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="dark fixed inset-0 z-[120] flex flex-col justify-between bg-[#0f172a] text-white select-none overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        paddingTop: 'max(1.25rem, env(safe-area-inset-top, 1.25rem))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))',
      }}
    >
      {/* Top Header Bar */}
      <header className="px-6 py-2 flex items-center justify-between shrink-0 relative z-10 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gray-800 border-2 border-b-[3px] border-gray-700 flex items-center justify-center">
            <Compass size={18} className="text-[#84bcda]" />
          </div>
          <div className="text-xs font-black tracking-wider uppercase text-gray-200 flex items-center gap-1.5">
            <span>Dailyz Tour</span>
            <span className="text-gray-500" aria-hidden="true">·</span>
            <span className="text-[11px] font-mono text-gray-400">
              {currentSlide + 1}/{TOTAL_SLIDES}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="btn-tactile btn-tactile-neutral text-xs font-extrabold px-3.5 py-1.5 rounded-xl bg-gray-800 border-gray-700 text-gray-200 hover:text-white cursor-pointer"
        >
          Skip
        </button>
      </header>

      {/* Slide Carousel Main Content */}
      <main className="flex-1 w-full overflow-y-auto no-scrollbar relative z-10 flex flex-col">
        <div className="my-auto px-5 py-2 max-w-md md:max-w-lg mx-auto w-full flex flex-col items-center">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'transform, opacity' }}
            className="w-full flex flex-col items-center text-center"
          >
            {/* SLIDE 1: Minimal Homescreen Quest & Weekly Streak */}
            {currentSlide === 0 && (
              <div className="w-full flex flex-col items-center">
                {/* Preview Widget matching Home.tsx */}
                <div className="w-full max-w-[330px] rounded-2xl bg-[#0f172a] border-2 border-b-4 border-gray-700 p-4 mb-6 text-left space-y-3.5">
                  {/* Mini Dailyz Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-black tracking-tight text-white">Dailyz</span>
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-1 bg-gray-800 text-white px-2.5 py-1 rounded-xl border-2 border-gray-700 text-[11px] font-extrabold tabular-nums">
                        <Flame size={12} className="fill-[#ff3b5c] text-[#ff3b5c]" />
                        <span>7</span>
                      </span>
                      <span className="flex items-center gap-1 bg-gray-800 text-white px-2.5 py-1 rounded-xl border-2 border-gray-700 text-[11px] font-extrabold tabular-nums">
                        <Star size={12} className="fill-[#ecc30b] text-[#ecc30b]" />
                        <span>1,450</span>
                      </span>
                    </div>
                  </div>

                  {/* Quest Directly on Background */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#84bcda]">
                        <Footprints size={12} />
                        <span>Mind & Motion</span>
                      </span>
                      <DifficultyBars difficulty="medium" compact />
                    </div>

                    <div className="text-base font-black leading-snug text-white mb-2">
                      Take a 15-minute walk without checking your phone
                    </div>

                    <div className="flex items-center gap-2.5 text-[11px] font-extrabold mb-3 tabular-nums">
                      <span className="inline-flex items-center gap-1 text-white">
                        <Star size={12} className="fill-[#ecc30b] text-[#ecc30b]" />
                        +20 PTS
                      </span>
                      <span className="text-gray-600" aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-[#84bcda]">
                        <Award size={12} />
                        +35 XP
                      </span>
                    </div>

                    {/* Vibrant Complete Button + Side-by-Side Freeze & Reroll */}
                    <div className="btn-tactile-coral w-full py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 pointer-events-none">
                      <CheckCircle size={15} strokeWidth={2.5} />
                      <span>Complete Quest</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-gray-800 border-2 border-b-[3px] border-gray-700 py-2 px-2.5 rounded-xl text-[11px] font-extrabold text-gray-100 flex items-center justify-center gap-1.5">
                        <Snowflake size={12} className="text-[#84bcda]" />
                        <span>Freeze</span>
                        <span className="text-[#84bcda] font-black">2</span>
                      </div>
                      <div className="bg-gray-800 border-2 border-b-[3px] border-gray-700 py-2 px-2.5 rounded-xl text-[11px] font-extrabold text-gray-100 flex items-center justify-center gap-1.5">
                        <RefreshCw size={12} />
                        <span>Reroll</span>
                        <span className="text-[#84bcda] font-black">FREE</span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Weekly Streak Widget */}
                  <div className="bg-gray-800 rounded-xl p-3 playful-card border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Flame size={13} className="fill-[#ff3b5c] text-[#ff3b5c]" />
                        <span className="text-xs font-black text-white">7-Day Streak</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">Week 2</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
                        const isDone = i < 5;
                        const isToday = i === 5;
                        return (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <span
                              className={`text-[9px] font-extrabold ${
                                isToday ? 'text-[#ff4b5c]' : 'text-gray-400'
                              }`}
                            >
                              {d}
                            </span>
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                isDone
                                  ? 'bg-[#ff3b5c] text-white shadow-[0_2px_0_#c81438]'
                                  : isToday
                                  ? 'bg-[#ff4b5c] text-white ring-2 ring-[#ff4b5c]/30 shadow-[0_2px_0_#d12134]'
                                  : 'bg-gray-900/70 border border-gray-700'
                              }`}
                            >
                              {isDone ? (
                                <Check size={11} strokeWidth={3.5} />
                              ) : isToday ? (
                                <Zap size={11} className="fill-white" />
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                  One Quest. <span className="text-[#ff4b5c]">Pure Momentum.</span>
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
                  Zero clutter. Every day gives you one clear quest on the home canvas, freeze protection, a daily reroll, and your weekly streak.
                </p>
              </div>
            )}

            {/* SLIDE 2: Completion Blur & Instant Swap */}
            {currentSlide === 1 && (
              <div className="w-full flex flex-col items-center">
                {/* Preview Widget matching Home.tsx completion overlay + switcher */}
                <div className="w-full max-w-[330px] rounded-2xl bg-[#0f172a] border-2 border-b-4 border-gray-700 p-4 mb-6 text-left space-y-3">
                  {/* Blurred completion showcase */}
                  <div className="relative rounded-xl overflow-hidden py-4 px-3">
                    {/* Blurred content underneath */}
                    <div className="blur-[3px] opacity-25 scale-[0.98] select-none pointer-events-none space-y-2.5">
                      <div className="text-[10px] font-black uppercase text-[#84bcda]">Mind & Motion</div>
                      <div className="text-base font-black text-white leading-snug">
                        Take a 15-minute walk without checking your phone
                      </div>
                      <div className="h-9 rounded-xl bg-[#ff4b5c]" />
                    </div>

                    {/* Crisp Celebration Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <div className="relative flex items-center justify-center mb-1.5">
                        <div className="w-14 h-14 rounded-2xl border-4 border-[#067bc2]/70 flex items-center justify-center bg-emerald-500 shadow-[0_3px_0_#047857]">
                          <Check size={28} strokeWidth={3.2} className="text-white" />
                        </div>
                      </div>
                      <div className="font-black text-lg text-white leading-tight">
                        Quest Completed!
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2.5 py-1 rounded-xl bg-gray-800 border-2 border-gray-700 text-[#f6d84c] font-black text-xs">
                          +20 PTS
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-gray-800 border-2 border-gray-700 text-[#84bcda] font-black text-xs">
                          +35 XP
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-300 mt-2">
                        Loading tomorrow&apos;s quest...
                      </span>
                    </div>
                  </div>

                  {/* Tomorrow | Today (Done) Toggle Bar */}
                  <div className="flex items-center gap-1.5 bg-gray-800 p-1 rounded-xl border-2 border-gray-700">
                    <div className="flex-1 py-2 text-[11px] font-extrabold rounded-lg bg-[#067bc2] text-white flex items-center justify-center gap-1.5">
                      <Calendar size={12} />
                      <span>Tomorrow</span>
                    </div>
                    <div className="flex-1 py-2 text-[11px] font-extrabold rounded-lg text-gray-400 flex items-center justify-center gap-1.5">
                      <CheckCircle size={12} />
                      <span>Today (Done)</span>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                  Blur Effect. <span className="text-[#84bcda]">Instant Swap.</span>
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
                  Finish today&apos;s quest to trigger your celebratory animation over a smooth blur, then automatically switch to Tomorrow&apos;s tab.
                </p>
              </div>
            )}

            {/* SLIDE 3: Tomorrow's Mystery Quest */}
            {currentSlide === 2 && (
              <div className="w-full flex flex-col items-center">
                {/* Preview Widget matching Home.tsx Tomorrow Mystery view */}
                <div className="w-full max-w-[330px] rounded-2xl bg-[#0f172a] border-2 border-b-4 border-gray-700 p-4 mb-6 text-left">
                  {/* Tab Switcher */}
                  <div className="flex items-center gap-1.5 bg-gray-800 p-1 rounded-xl border-2 border-gray-700 mb-4">
                    <div className="flex-1 py-1.5 text-[11px] font-extrabold rounded-lg bg-[#067bc2] text-white flex items-center justify-center gap-1.5">
                      <Calendar size={12} />
                      <span>Tomorrow</span>
                    </div>
                    <div className="flex-1 py-1.5 text-[11px] font-extrabold rounded-lg text-gray-400 flex items-center justify-center gap-1.5">
                      <CheckCircle size={12} />
                      <span>Today (Done)</span>
                    </div>
                  </div>

                  {/* Tomorrow Mystery Header */}
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#f6d84c] mb-2">
                    <Lock size={12} />
                    <span>Tomorrow Mystery</span>
                  </div>

                  {/* Blurred Quest Text + Centered Yellow Badge */}
                  <div className="relative mb-4">
                    <div className="text-lg font-black leading-snug filter blur-[5px] select-none opacity-25 text-white">
                      Write down three things you learned today and sketch one quick idea.
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 border-2 border-[#ecc30b]">
                        <Lock size={13} className="text-[#ecc30b]" />
                        <span className="text-xs font-extrabold text-gray-100">
                          Unlock Early with Stars
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tactile Amber Unlock Button */}
                  <div className="btn-tactile-amber w-full py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 pointer-events-none">
                    <Star size={15} className="fill-gray-900 text-gray-900" />
                    <span>Unlock Tomorrow (20 PTS)</span>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                  Peek Into <span className="text-[#ecc30b]">Tomorrow.</span>
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
                  Curious what&apos;s next? Spend 20 earned Stars to reveal tomorrow&apos;s mystery quest early and prep ahead.
                </p>
              </div>
            )}

            {/* SLIDE 4: Daily Reminders & Local Notifications */}
            {currentSlide === 3 && (
              <div className="w-full flex flex-col items-center">
                {/* Preview Widget matching Settings.tsx Notification Card */}
                <div className="w-full max-w-[330px] rounded-2xl bg-gray-800 playful-card border-gray-700 p-4 mb-5 text-left">
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-gray-700 text-gray-100">
                        <Bell size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-white leading-tight">Daily Reminders</div>
                        <div className="text-[11px] text-gray-400">Stay consistent before midnight</div>
                      </div>
                    </div>
                    <TactileSwitch
                      checked={remindersEnabled}
                      activeColor={selectedColor}
                      onChange={async () => {
                        triggerHaptic('medium', userData.vibrationEnabled);
                        playSound('pop', userData.soundEnabled ?? true);
                        if (!remindersEnabled) {
                          const granted = await requestNotificationPermission();
                          setRemindersEnabled(granted);
                        } else {
                          setRemindersEnabled(false);
                        }
                      }}
                      ariaLabel="Toggle daily reminders"
                    />
                  </div>

                  {/* Notification Preview Banner */}
                  <div className="p-3 bg-gray-900 rounded-xl border-2 border-gray-700 mb-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-black text-white">Dailyz · Today&apos;s Quest 🎯</span>
                      <span className="text-[10px] font-black font-mono text-[#84bcda]">
                        {formatTimeDisplay(reminderTime)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-snug">
                      Your daily micro-quest is waiting. Keep your streak alive!
                    </p>
                  </div>

                  {/* Presets matching Settings.tsx */}
                  <div className="grid grid-cols-2 gap-2 mb-2.5">
                    {[
                      { time: '08:00', label: '08:00 AM', desc: 'Morning' },
                      { time: '09:00', label: '09:00 AM', desc: 'Start Day' },
                      { time: '13:00', label: '01:00 PM', desc: 'Midday' },
                      { time: '20:00', label: '08:00 PM', desc: 'Evening' },
                    ].map((t) => {
                      const isActive = reminderTime === t.time;
                      return (
                        <button
                          key={t.time}
                          type="button"
                          onClick={() => {
                            triggerHaptic('selection', userData.vibrationEnabled);
                            playSound('pop', userData.soundEnabled ?? true);
                            setReminderTime(t.time);
                          }}
                          className={`btn-tactile py-2 px-2.5 rounded-xl text-left cursor-pointer ${
                            isActive
                              ? 'btn-tactile-teal'
                              : 'btn-tactile-neutral bg-gray-900 border-gray-700 text-gray-200'
                          }`}
                        >
                          <div className="font-extrabold text-[11px]">{t.label}</div>
                          <div className={`text-[9px] ${isActive ? 'text-white/85' : 'text-gray-400'}`}>
                            {t.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Time Row */}
                  <div className="px-3 py-2 rounded-xl bg-gray-900 border-2 border-gray-700 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#84bcda]" />
                      <span className="text-xs font-bold text-gray-200">Custom Time</span>
                    </div>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => {
                        if (!e.target.value) return;
                        triggerHaptic('selection', userData.vibrationEnabled);
                        setReminderTime(e.target.value);
                      }}
                      className="px-2.5 py-1 rounded-xl text-xs font-black bg-gray-800 border-2 border-gray-700 text-white focus:outline-none focus:border-[#067bc2] cursor-pointer"
                      aria-label="Pick custom reminder time"
                    />
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                  Never Miss <span className="text-[#84bcda]">Your Streak.</span>
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
                  Pick a daily reminder time that fits your routine so you never lose your streak before midnight.
                </p>
              </div>
            )}

            {/* SLIDE 5: XP Levels, Milestones & Rewards Shop */}
            {currentSlide === 4 && (
              <div className="w-full flex flex-col items-center">
                {/* Preview Stack matching Profile.tsx & Rewards.tsx */}
                <div className="w-full max-w-[330px] space-y-3 mb-6 text-left">
                  {/* Profile XP Level Card */}
                  <div className="bg-gray-800 rounded-2xl p-4 playful-card border-gray-700">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#067bc2] text-white flex flex-col items-center justify-center shadow-[0_3px_0_#045b91] shrink-0">
                          <span className="text-[8px] font-black uppercase leading-none opacity-85">LV</span>
                          <span className="text-base font-black leading-none">5</span>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-wider text-[#84bcda]">
                            Experience Level
                          </div>
                          <div className="text-sm font-black text-white leading-tight">
                            Trailblazer
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-[#84bcda]/20 text-[#84bcda] text-[11px] font-black">
                        1,240 XP
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                        <span>Level Progress</span>
                        <span>240 / 350 XP (68%)</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-gray-900 border border-gray-700 overflow-hidden">
                        <div className="h-full rounded-full bg-[#067bc2] w-[68%]" />
                      </div>
                    </div>
                  </div>

                  {/* Rewards Shop Row Previews */}
                  <div className="space-y-2">
                    <div className="bg-gray-800 rounded-2xl p-3 playful-card border-gray-700 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs text-white truncate">Streak Freeze</div>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-gray-300 mt-0.5">
                          <Star size={11} className="fill-[#ecc30b] text-[#ecc30b]" />
                          <span>50 PTS</span>
                        </div>
                      </div>
                      <div className="btn-tactile-amber px-3.5 py-1.5 rounded-xl font-extrabold text-[11px] shrink-0">
                        Get
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-2xl p-3 playful-card border-gray-700 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs text-white truncate">Gold PFP Border</div>
                        <span className="inline-block text-[9px] font-black bg-gray-700 text-gray-200 px-2 py-0.5 rounded-lg uppercase tracking-wider mt-0.5">
                          Unlocked
                        </span>
                      </div>
                      <div className="btn-tactile-teal px-3.5 py-1.5 rounded-xl font-extrabold text-[11px] shrink-0">
                        Equip
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                  XP Levels & <span className="text-[#ecc30b]">Rewards Shop.</span>
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
                  Level up with every quest, unlock Milestones, and spend your Stars on Streak Freezes, custom ranks, avatars, and profile borders.
                </p>
              </div>
            )}

            {/* SLIDE 6: Personalize & Launch */}
            {currentSlide === 5 && (
              <div className="w-full flex flex-col items-center">
                {/* Interactive Personalization Card matching Settings.tsx */}
                <div className="w-full max-w-[330px] p-4 rounded-2xl bg-gray-800 playful-card border-gray-700 mb-5 text-left">
                  {/* Name field */}
                  <div className="mb-4">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                      Your Adventurer Name
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g. Cosmic Wanderer"
                        maxLength={24}
                        className="flex-1 bg-gray-900 border-2 border-gray-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-[#067bc2] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light', userData.vibrationEnabled);
                          playSound('reroll', userData.soundEnabled ?? true);
                          setCustomName(getRandomInterestingName());
                        }}
                        title="Generate random name"
                        className="btn-tactile btn-tactile-neutral p-2.5 rounded-xl bg-gray-700 border-gray-600 text-gray-200 hover:text-white cursor-pointer"
                      >
                        <Dices size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Starter Accent Color Picker */}
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">
                      Accent Color
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {BASIC_COLORS.map((c) => {
                        const isSelected = selectedColor.toLowerCase() === c.id.toLowerCase();
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              triggerHaptic('selection', userData.vibrationEnabled);
                              playSound('equip', userData.soundEnabled ?? true);
                              setSelectedColor(c.id);
                            }}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-gray-700 border-white/80'
                                : 'bg-gray-900 border-gray-700 hover:bg-gray-700/60'
                            }`}
                          >
                            <div
                              className="w-5 h-5 rounded-full border border-black/20 flex items-center justify-center"
                              style={{ backgroundColor: c.color }}
                            >
                              {isSelected && <Check size={11} className="text-white" strokeWidth={3.5} />}
                            </div>
                            <span className="text-[10px] font-bold text-gray-200 truncate w-full text-center">
                              {c.name.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-4 pt-3.5 border-t border-gray-700">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-gray-700 text-[#ecc30b]">
                          <Volume2 size={16} />
                        </div>
                        <span className="font-bold text-sm text-white">Sound Effects</span>
                      </div>
                      <TactileSwitch
                        checked={userData.soundEnabled ?? true}
                        activeColor={selectedColor}
                        onChange={() => {
                          const nextVal = !(userData.soundEnabled ?? true);
                          if (nextVal) playSound('complete', true);
                          updateSettings({ soundEnabled: nextVal });
                        }}
                        ariaLabel="Toggle sound effects"
                      />
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                  You&apos;re Ready to Roll! 🚀
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
                  No one checks your progress—only you know how you&apos;re doing. Stay honest, keep it playful, and enjoy building momentum!
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation & Controls */}
      <footer className="px-6 pt-3 pb-2 flex flex-col gap-3.5 shrink-0 max-w-md mx-auto w-full relative z-10">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="h-2 rounded-md transition-all duration-200 cursor-pointer"
                style={{
                  width: isActive ? '26px' : '8px',
                  backgroundColor: isActive ? activeColorMeta.color : 'rgba(255, 255, 255, 0.2)',
                }}
              />
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {currentSlide > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="btn-tactile btn-tactile-neutral px-4 py-3.5 rounded-xl bg-gray-800 border-gray-700 text-gray-100 font-extrabold text-sm flex items-center justify-center gap-1 cursor-pointer shrink-0"
            >
              <ChevronLeft size={18} />
              <span>Back</span>
            </button>
          )}

          {currentSlide < TOTAL_SLIDES - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className={`btn-tactile flex-1 py-3.5 px-6 rounded-xl font-black text-sm border-2 border-b-[5px] active:border-b-2 active:translate-y-[3px] flex items-center justify-center gap-2 cursor-pointer group ${
                activeColorMeta.id === '#ecc30b' ? 'text-gray-900' : 'text-white'
              }`}
              style={{
                backgroundColor: activeColorMeta.color,
                borderColor: activeColorMeta.dark,
              }}
            >
              <span>Continue</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className={`btn-tactile flex-1 py-3.5 px-6 rounded-xl font-black text-sm border-2 border-b-[5px] active:border-b-2 active:translate-y-[3px] flex items-center justify-center gap-2 cursor-pointer ${
                activeColorMeta.id === '#ecc30b' ? 'text-gray-900' : 'text-white'
              }`}
              style={{
                backgroundColor: activeColorMeta.color,
                borderColor: activeColorMeta.dark,
              }}
            >
              <span>Start My Adventure</span>
              <Sparkles size={18} className="fill-current" />
            </button>
          )}
        </div>
      </footer>
    </motion.div>,
    document.body
  );
}
