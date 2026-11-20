import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Info,
  Flame,
  Shield,
  Sparkles,
  Database,
  Terminal,
  ChevronRight,
  Star,
  Snowflake,
  Award,
  BookOpen,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import questsData from '../data/quests.json';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audioEffects';
import Toast from './Toast';

interface AboutAppScreenProps {
  onBack: () => void;
  onOpenDevTools: () => void;
}

const APP_VERSION = '1.0.0';
const DEV_UNLOCK_STORAGE_KEY = 'dailyz_dev_unlocked';
const REQUIRED_TAPS = 7;

export default function AboutAppScreen({ onBack, onOpenDevTools }: AboutAppScreenProps) {
  const { userData } = useAppContext();

  const [devUnlocked, setDevUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DEV_UNLOCK_STORAGE_KEY) === 'true';
  });
  const [tapCount, setTapCount] = useState(0);
  const [aboutToast, setAboutToast] = useState<string | null>(null);
  const tapResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (tapResetTimerRef.current) clearTimeout(tapResetTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToastMessage = (msg: string) => {
    setAboutToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setAboutToast(null), 2200);
  };

  const handleVersionTap = () => {
    if (tapResetTimerRef.current) clearTimeout(tapResetTimerRef.current);

    if (devUnlocked) {
      triggerHaptic('selection', userData.vibrationEnabled);
      playSound('pop', userData.soundEnabled ?? true);
      onOpenDevTools();
      return;
    }

    const nextTaps = tapCount + 1;
    setTapCount(nextTaps);

    if (nextTaps >= REQUIRED_TAPS) {
      setTapCount(0);
      setDevUnlocked(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(DEV_UNLOCK_STORAGE_KEY, 'true');
      }
      triggerHaptic('success', userData.vibrationEnabled);
      playSound('achievement', userData.soundEnabled ?? true);
      onOpenDevTools();
      return;
    }

    triggerHaptic('light', userData.vibrationEnabled);
    playSound('click', userData.soundEnabled ?? true);

    const remaining = REQUIRED_TAPS - nextTaps;
    if (nextTaps >= 3) {
      showToastMessage(
        remaining === 1
          ? '1 more tap to unlock Developer Settings'
          : `${remaining} more taps to unlock Developer Settings`
      );
    }

    tapResetTimerRef.current = setTimeout(() => {
      setTapCount(0);
    }, 2500);
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
          aria-label="Back to Settings"
        >
          <ArrowLeft size={15} />
          <span>Settings</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-xs font-black text-gray-700 dark:text-gray-200">
          <Info size={14} className="text-[#067bc2]" />
          <span>About App</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start">
        <div className="space-y-5">
          {/* App Identity Card */}
          <section className="bg-white dark:bg-gray-800 rounded-[1.75rem] p-5 playful-card border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#ff3b5c] text-white flex items-center justify-center shrink-0 shadow-[0_4px_0_#c81438]">
                <Flame size={28} className="fill-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-gray-950 dark:text-white leading-tight">
                  Dailyz
                </h1>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                  One mindful micro-quest every day
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Interactive Secret Version Row */}
              <button
                type="button"
                onClick={handleVersionTap}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/70 border-2 border-gray-200 dark:border-gray-700 text-left transition-colors hover:bg-gray-100/80 dark:hover:bg-gray-900 cursor-pointer select-none"
              >
                <div>
                  <div className="text-xs font-black text-gray-900 dark:text-white">
                    App Version
                  </div>
                  <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    {devUnlocked ? 'Developer Settings unlocked' : 'Dailyz Web & Mobile Edition'}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-xs font-black font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                  v{APP_VERSION}
                </span>
              </button>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/70 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2.5">
                  <BookOpen size={17} className="text-[#067bc2] shrink-0" />
                  <div>
                    <div className="text-xs font-black text-gray-900 dark:text-white">
                      Quest Library
                    </div>
                    <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                      Curated daily challenges
                    </div>
                  </div>
                </div>
                <span className="text-xs font-black text-gray-900 dark:text-white tabular-nums">
                  {questsData.length} Quests
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/70 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2.5">
                  <Shield size={17} className="text-emerald-500 shrink-0" />
                  <div>
                    <div className="text-xs font-black text-gray-900 dark:text-white">
                      Privacy & Storage
                    </div>
                    <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                      Saved locally on your device
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                  <Database size={13} />
                  <span>On-Device</span>
                </span>
              </div>
            </div>
          </section>

          {/* Revealed Only After Secret Unlock */}
          {devUnlocked && (
            <section className="bg-white dark:bg-gray-800 rounded-[1.75rem] p-5 playful-card border-gray-200 dark:border-gray-700">
              <h2 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Unlocked Secret
              </h2>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light', userData.vibrationEnabled);
                  playSound('pop', userData.soundEnabled ?? true);
                  onOpenDevTools();
                }}
                className="btn-tactile btn-tactile-neutral w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-[#067bc2] dark:text-[#84bcda]">
                    <Terminal size={19} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm text-gray-900 dark:text-white">
                      Developer Settings
                    </div>
                    <div className="text-xs text-gray-400">
                      Reset quest state &amp; testing tools
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            </section>
          )}
        </div>

        {/* How Dailyz Works Card */}
        <section className="bg-white dark:bg-gray-800 rounded-[1.75rem] p-5 playful-card border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-[#067bc2]" />
            <h2 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              How Dailyz Works
            </h2>
          </div>

          <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
            <div className="p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-1">
              <div className="font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                <Flame size={14} className="text-[#ff3b5c]" />
                <span>1. Daily Quests &amp; Streaks</span>
              </div>
              <p className="leading-relaxed">
                Complete one small, meaningful quest each day to build consistency, grow your streak, and earn XP toward higher levels.
              </p>
            </div>

            <div className="p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-1">
              <div className="font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                <Star size={14} className="text-[#ecc30b] fill-[#ecc30b]" />
                <span>2. Tomorrow Mystery &amp; Early Reveal</span>
              </div>
              <p className="leading-relaxed">
                Once today&apos;s quest is done, unlock a sneak peek of tomorrow&apos;s quest early with Stars or wait for midnight.
              </p>
            </div>

            <div className="p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-1">
              <div className="font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                <Snowflake size={14} className="text-[#067bc2]" />
                <span>3. Streak Freezes &amp; Rerolls</span>
              </div>
              <p className="leading-relaxed">
                Protect busy days with a Streak Freeze or swap today&apos;s challenge with your daily free Reroll.
              </p>
            </div>

            <div className="p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 space-y-1">
              <div className="font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                <Award size={14} className="text-[#067bc2]" />
                <span>4. Rewards &amp; Customization</span>
              </div>
              <p className="leading-relaxed">
                Spend earned Stars in the Rewards shop for custom profile frames, ranks, and streak protection.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Toast show={!!aboutToast} title={aboutToast ?? ''} icon={<Terminal size={20} />} />
    </div>
  );
}
