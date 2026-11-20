import React, { useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  RefreshCw,
  Lock,
  Star,
  Snowflake,
  Compass,
  CheckCircle2,
  Circle,
  Terminal,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getDayOfYear, getTodayISO, getTomorrowISO } from '../utils/dateUtils';
import questsData from '../data/quests.json';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audioEffects';
import Toast from './Toast';

interface DevScreenProps {
  onBack: () => void;
}

export default function DevScreen({ onBack }: DevScreenProps) {
  const {
    userData,
    updateSettings,
    resetTodayQuest,
    rerollQuest,
    openOnboarding,
  } = useAppContext();

  const [devToast, setDevToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setDevToast(msg);
    setTimeout(() => setDevToast(null), 2600);
  };

  const todayISO = getTodayISO();
  const tomorrowISO = getTomorrowISO();
  const dayOfYear = getDayOfYear();
  const scheduledToday = questsData[(dayOfYear - 1) % questsData.length];
  const savedToday =
    userData.nextDayQuest && userData.nextDayQuest.dateIso === todayISO
      ? userData.nextDayQuest
      : null;
  const rolledToday =
    userData.currentRolledQuest && userData.currentRolledQuest.dateIso === todayISO
      ? userData.currentRolledQuest
      : null;

  const activeQuest = rolledToday || savedToday || scheduledToday;
  const isTodayCompleted = userData.completedDays.includes(todayISO);
  const isTomorrowUnlocked = Boolean(
    userData.nextDayQuest && userData.nextDayQuest.dateIso === tomorrowISO
  );

  const handleResetToday = () => {
    triggerHaptic('medium', userData.vibrationEnabled);
    playSound('reroll', userData.soundEnabled ?? true);
    resetTodayQuest();
    showToast("Today's quest reset to uncompleted!");
  };

  const handleLockTomorrow = () => {
    triggerHaptic('light', userData.vibrationEnabled);
    playSound('click', userData.soundEnabled ?? true);
    updateSettings({ nextDayQuest: null });
    showToast("Tomorrow's quest preview locked again.");
  };

  const handleResetFreeReroll = () => {
    triggerHaptic('light', userData.vibrationEnabled);
    playSound('pop', userData.soundEnabled ?? true);
    updateSettings({ lastFreeRerollDate: undefined, currentRolledQuest: null });
    showToast('Free daily reroll restored & quest reset to scheduled!');
  };

  const handleRerollNow = () => {
    triggerHaptic('medium', userData.vibrationEnabled);
    playSound('reroll', userData.soundEnabled ?? true);
    // Ensure it works even if low points
    if (userData.lastFreeRerollDate === todayISO && userData.points < 5) {
      updateSettings({ lastFreeRerollDate: undefined });
    }
    const res = rerollQuest();
    showToast(res.message);
  };

  const handleAddStars = () => {
    triggerHaptic('success', userData.vibrationEnabled);
    playSound('complete', userData.soundEnabled ?? true);
    updateSettings({ points: userData.points + 100 });
    showToast('Added +100 Stars!');
  };

  const handleAddFreeze = () => {
    triggerHaptic('success', userData.vibrationEnabled);
    playSound('freeze', userData.soundEnabled ?? true);
    updateSettings({ streakFreezes: userData.streakFreezes + 1 });
    showToast('Added +1 Streak Freeze!');
  };

  return (
    <div className="pb-16 text-gray-900 dark:text-gray-100">
      {/* Header Bar */}
      <header className="pt-1 pb-4 flex items-center justify-between gap-3 border-b-2 border-gray-200/80 dark:border-gray-800 mb-6">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light', userData.vibrationEnabled);
            playSound('pop', userData.soundEnabled ?? true);
            onBack();
          }}
          className="btn-tactile btn-tactile-neutral inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer"
          aria-label="Back to About App"
        >
          <ArrowLeft size={15} />
          <span>About App</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-xs font-black text-gray-700 dark:text-gray-200">
          <Terminal size={14} className="text-[#067bc2]" />
          <span>Developer Settings</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start">
        {/* Quest State Inspector & Reset */}
        <section className="bg-white dark:bg-gray-800 rounded-[1.75rem] p-5 playful-card border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Today&apos;s Quest State
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{todayISO}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border-2 ${
                isTodayCompleted
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-[#ff4b5c]/12 border-[#ff4b5c]/30 text-[#ff3b5c]'
              }`}
            >
              {isTodayCompleted ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              <span>{isTodayCompleted ? 'Completed' : 'Uncompleted'}</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/70 border-2 border-gray-200 dark:border-gray-700">
            <div className="text-[11px] font-black uppercase tracking-wider text-[#067bc2] dark:text-[#84bcda] mb-1">
              {(activeQuest as any)?.category || 'Daily Quest'}
            </div>
            <p className="text-sm font-black text-gray-950 dark:text-white leading-snug">
              {activeQuest?.quest}
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetToday}
            disabled={!isTodayCompleted}
            className={`btn-tactile w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 ${
              isTodayCompleted
                ? 'btn-tactile-coral cursor-pointer'
                : 'btn-tactile-neutral bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <RotateCcw size={17} />
            <span>
              {isTodayCompleted
                ? "Reset Today's Quest to Uncompleted"
                : "Today's Quest is Already Uncompleted"}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleRerollNow}
              className="btn-tactile btn-tactile-neutral py-3 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-xs font-extrabold text-gray-800 dark:text-gray-100 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={14} className="text-[#067bc2]" />
              <span>Reroll Quest</span>
            </button>

            <button
              type="button"
              onClick={handleResetFreeReroll}
              className="btn-tactile btn-tactile-neutral py-3 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-xs font-extrabold text-gray-800 dark:text-gray-100 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} className="text-[#ff5d38]" />
              <span>Restore Free Reroll</span>
            </button>
          </div>
        </section>

        {/* Tomorrow Preview & Quick Test Boosts */}
        <section className="bg-white dark:bg-gray-800 rounded-[1.75rem] p-5 playful-card border-gray-200 dark:border-gray-700 space-y-4">
          <h2 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Preview & Quick Testing
          </h2>

          <button
            type="button"
            onClick={handleLockTomorrow}
            disabled={!isTomorrowUnlocked}
            className={`btn-tactile btn-tactile-neutral w-full flex items-center justify-between p-4 rounded-2xl border-gray-200 dark:border-gray-700 ${
              isTomorrowUnlocked
                ? 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white cursor-pointer'
                : 'bg-gray-100 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-[#ecc30b]" />
              <div className="text-left">
                <div className="font-bold text-sm">Lock Tomorrow&apos;s Preview</div>
                <div className="text-xs text-gray-400">
                  {isTomorrowUnlocked ? 'Currently unlocked — tap to re-lock' : 'Already locked'}
                </div>
              </div>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleAddStars}
              className="btn-tactile btn-tactile-amber py-3 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Star size={14} className="fill-gray-900 text-gray-900" />
              <span>+100 Stars</span>
            </button>

            <button
              type="button"
              onClick={handleAddFreeze}
              className="btn-tactile btn-tactile-teal py-3 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Snowflake size={14} />
              <span>+1 Freeze</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light', userData.vibrationEnabled);
              playSound('pop', userData.soundEnabled ?? true);
              openOnboarding();
            }}
            className="btn-tactile btn-tactile-neutral w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Compass size={18} className="text-[#067bc2]" />
              <span className="font-bold text-sm text-gray-900 dark:text-white">
                Open Onboarding Tour
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light', userData.vibrationEnabled);
              playSound('click', userData.soundEnabled ?? true);
              if (typeof window !== 'undefined') {
                localStorage.removeItem('dailyz_dev_unlocked');
              }
              onBack();
            }}
            className="btn-tactile btn-tactile-neutral w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-gray-500" />
              <div className="text-left">
                <div className="font-bold text-sm text-gray-900 dark:text-white">
                  Hide Secret Menu
                </div>
                <div className="text-xs text-gray-400">
                  Re-lock Developer Settings behind 7 version taps
                </div>
              </div>
            </div>
          </button>
        </section>
      </div>

      <Toast show={!!devToast} title={devToast ?? ''} icon={<Terminal size={20} />} />
    </div>
  );
}
