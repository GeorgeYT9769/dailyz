import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { getDayOfYear, getTodayISO, getTomorrowISO } from '../utils/dateUtils';
import questsData from '../data/quests.json';
import {
  Flame,
  Star,
  CheckCircle,
  RefreshCw,
  Lock,
  Sparkles,
  ArrowRight,
  Snowflake,
  Zap,
  Check,
  Award,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import StreakModal from './StreakModal';
import Toast from './Toast';
import DifficultyBars from './DifficultyBars';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audioEffects';
import { syncWidgetWithNative } from '../utils/widgetSync';
import { getCategoryMeta } from './CategoryDistributionBar';
import { getLevelProgress, getQuestXp } from '../utils/xpUtils';

interface HomeProps {
  onNavigateTab?: (tab: string) => void;
}

function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMidnightCountdown(): string {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diff = Math.max(0, midnight.getTime() - now.getTime());
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  return `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
}

const MYSTERY_WORDS: Record<number, string[]> = {
  1: ['a', 'I'],
  2: ['to', 'in', 'on', 'by'],
  3: ['new', 'day', 'own', 'way'],
  4: ['calm', 'mind', 'slow', 'step'],
  5: ['quiet', 'focus', 'fresh', 'pause'],
  6: ['moment', 'breath', 'gentle', 'inside'],
  7: ['mindful', 'morning', 'outside', 'clarity'],
  8: ['peaceful', 'everyday', 'discover', 'stillness'],
  9: ['attention', 'awareness', 'something', 'gratitude'],
  10: ['reflection', 'thoughtful', 'refreshing', 'confidence'],
  11: ['mindfulness', 'perspective', 'exploration', 'appreciates'],
  12: ['appreciative', 'surroundings', 'conversation'],
};

function buildMysteryPlaceholder(source: string): string {
  return source
    .split(/\s+/)
    .map((token, idx) => {
      const match = token.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9-]+)([^a-zA-Z0-9]*)$/);
      if (!match) return token;
      const [, lead, core, trail] = match;
      const len = core.length;
      const pool = MYSTERY_WORDS[Math.min(12, Math.max(1, len))] || MYSTERY_WORDS[12];
      let word = pool[(idx + len) % pool.length];
      if (len > 12) {
        word = (word + 'mindfulfocus').slice(0, len);
      } else if (word.length !== len) {
        word = word.padEnd(len, 'e').slice(0, len);
      }
      if (core[0] && core[0] === core[0].toUpperCase() && /[A-Z]/.test(core[0])) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      return `${lead}${word}${trail}`;
    })
    .join(' ');
}

export default function Home({ onNavigateTab }: HomeProps) {
  const { userData, completeQuest, updateSettings, rerollQuest, recoverStreak, useStreakFreeze } = useAppContext();

  const dayOfYear = getDayOfYear();
  const todayISO = getTodayISO();
  const tomorrowISO = getTomorrowISO();

  const [showStreakModal, setShowStreakModal] = useState(false);
  const [debugQuestIndex, setDebugQuestIndex] = useState<number | null>(null);
  const [debugCompleted, setDebugCompleted] = useState(false);
  const [showDebugTools, setShowDebugTools] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ title: string; subtitle?: string } | null>(null);
  const [activeQuestView, setActiveQuestView] = useState<'today' | 'tomorrow'>(() =>
    userData.completedDays.includes(todayISO) ? 'tomorrow' : 'today'
  );
  const [isBlurringToTomorrow, setIsBlurringToTomorrow] = useState(false);
  const [countdown, setCountdown] = useState<string>(() => getMidnightCountdown());

  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getMidnightCountdown());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isDebug =
        params.get('debug') === 'true' ||
        params.get('dev') === 'true' ||
        localStorage.getItem('dailyz_debug') === 'true';
      setShowDebugTools(isDebug);
    }
  }, []);

  const calculatedIndex = (dayOfYear - 1) % questsData.length;
  const scheduledTodayQuest = questsData[calculatedIndex];
  const savedTodayQuest =
    userData.nextDayQuest && userData.nextDayQuest.dateIso === todayISO ? userData.nextDayQuest : null;
  const activeRolledQuest =
    userData.currentRolledQuest && userData.currentRolledQuest.dateIso === todayISO
      ? userData.currentRolledQuest
      : null;

  const baseTodayQuest = activeRolledQuest || savedTodayQuest || scheduledTodayQuest;
  const todayQuest = debugQuestIndex !== null ? questsData[debugQuestIndex] : baseTodayQuest;

  const isTomorrowUnlocked = Boolean(
    userData.nextDayQuest && userData.nextDayQuest.dateIso === tomorrowISO
  );
  const tomorrowQuest = isTomorrowUnlocked ? userData.nextDayQuest : null;
  const isCompleted = debugQuestIndex !== null ? debugCompleted : userData.completedDays.includes(todayISO);
  const isFrozenToday = (userData.usedStreakFreezes || []).includes(todayISO);

  // If today's quest is reset to uncompleted (e.g. from Dev Screen), reset back to Today view
  useEffect(() => {
    if (!isCompleted) {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      setIsBlurringToTomorrow(false);
      setActiveQuestView('today');
    }
  }, [isCompleted]);

  useEffect(() => {
    if (todayQuest) {
      syncWidgetWithNative({
        questTitle: todayQuest.quest,
        difficulty: todayQuest.difficulty,
        reward: todayQuest.reward,
        streak: userData.streak,
        stars: userData.points,
        isCompleted,
      });
    }
  }, [todayQuest, userData.streak, userData.points, isCompleted]);

  const weekDays = useMemo(() => {
    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const now = new Date();
    const jsDay = now.getDay();
    const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);

    return labels.map((label, idx) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + idx);
      const iso = toLocalISO(d);
      return {
        label,
        iso,
        isToday: iso === todayISO,
        isDone: userData.completedDays.includes(iso),
        isFrozen: (userData.usedStreakFreezes || []).includes(iso),
      };
    });
  }, [todayISO, userData.completedDays, userData.usedStreakFreezes]);

  const todayXpReward = getQuestXp(todayQuest.difficulty);
  const streakWeekNumber = Math.max(1, Math.ceil(Math.max(1, userData.streak || 1) / 7));
  const isShowingTomorrow = isCompleted && activeQuestView === 'tomorrow';
  const mysteryPreviewText = useMemo(
    () => buildMysteryPlaceholder(todayQuest.quest),
    [todayQuest.quest]
  );

  const showToastMessage = (title: string, subtitle?: string) => {
    setActionFeedback({ title, subtitle });
    setTimeout(() => setActionFeedback(null), 2600);
  };

  const handleComplete = () => {
    if (isCompleted) return;
    const isDebug = debugQuestIndex !== null;
    const prevLevel = getLevelProgress(userData.xp || 0).level;
    const nextLevel = getLevelProgress((userData.xp || 0) + todayXpReward).level;
    const didLevelUp = nextLevel > prevLevel;

    completeQuest(todayQuest.reward, todayISO, isDebug, todayXpReward);

    if (isDebug) {
      setDebugCompleted(true);
    }

    triggerHaptic('success', userData.vibrationEnabled);
    playSound(didLevelUp ? 'levelUp' : 'complete', userData.soundEnabled ?? true);

    showToastMessage(
      didLevelUp ? `Level Up! Level ${nextLevel}` : 'Quest Completed!',
      `+${todayQuest.reward} PTS · +${todayXpReward} XP`
    );
  };

  const handleContinueToTomorrow = () => {
    if (isBlurringToTomorrow) return;
    triggerHaptic('selection', userData.vibrationEnabled);
    playSound('pop', userData.soundEnabled ?? true);
    setIsBlurringToTomorrow(true);
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    blurTimerRef.current = setTimeout(() => {
      setActiveQuestView('tomorrow');
      setIsBlurringToTomorrow(false);
    }, 220);
  };

  const handleFreeze = () => {
    if (isCompleted) {
      triggerHaptic('light', userData.vibrationEnabled);
      playSound('pop', userData.soundEnabled ?? true);
      showToastMessage("Today's quest is already completed!");
      return;
    }

    if (isFrozenToday) {
      triggerHaptic('light', userData.vibrationEnabled);
      playSound('pop', userData.soundEnabled ?? true);
      showToastMessage('Today is already protected by a Freeze!');
      return;
    }

    if (userData.lastBrokenStreak && userData.streak === 0) {
      triggerHaptic('success', userData.vibrationEnabled);
      playSound('freeze', userData.soundEnabled ?? true);
      const res = recoverStreak();
      showToastMessage(res.message);
      return;
    }

    if (userData.streakFreezes > 0) {
      const success = useStreakFreeze(todayISO);
      if (success) {
        triggerHaptic('success', userData.vibrationEnabled);
        playSound('freeze', userData.soundEnabled ?? true);
        showToastMessage('Today frozen! Your streak stays safe.');
        return;
      }
    }

    triggerHaptic('light', userData.vibrationEnabled);
    playSound('click', userData.soundEnabled ?? true);
    setShowStreakModal(true);
  };

  const handleUnlockTomorrow = () => {
    if (userData.points < 20 || isTomorrowUnlocked) return;

    const candidatePool = questsData.filter((q) => q.id !== todayQuest.id);
    const chosen =
      candidatePool[Math.floor(Math.random() * candidatePool.length)] ||
      questsData[(calculatedIndex + 1) % questsData.length];

    const generatedQuest = {
      id: chosen.id,
      quest: chosen.quest.replace(/\(Day \d+\)/, '').trim(),
      difficulty: chosen.difficulty,
      reward: chosen.reward,
      category: (chosen as any).category || 'Mind & Focus',
      dateIso: tomorrowISO,
    };

    triggerHaptic('medium', userData.vibrationEnabled);
    playSound('achievement', userData.soundEnabled ?? true);

    updateSettings({
      points: userData.points - 20,
      nextDayQuest: generatedQuest,
    });
  };

  const handleDebugReroll = () => {
    triggerHaptic('medium', userData.vibrationEnabled);
    playSound('reroll', userData.soundEnabled ?? true);
    const randomIndex = Math.floor(Math.random() * questsData.length);
    setDebugQuestIndex(randomIndex);
    setDebugCompleted(false);
    setIsBlurringToTomorrow(false);
    setActiveQuestView('today');
  };

  const todayMeta = getCategoryMeta((todayQuest as any).category || 'Daily Focus');
  const TodayCatIcon = todayMeta.icon;

  return (
    <div className="pb-8">
      {/* Header: Dailyz + Streak & Stars */}
      <header className="flex justify-between items-center gap-3 mb-12 sm:mb-14 lg:mb-16 pt-1">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-gray-950 dark:text-white">
          Dailyz
        </h1>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light', userData.vibrationEnabled);
              playSound('click', userData.soundEnabled ?? true);
              setShowStreakModal(true);
            }}
            className="flex items-center gap-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:brightness-98 active:scale-95 transition-all cursor-pointer tabular-nums"
            title="View Streak Map"
            aria-label="View Streak Map"
          >
            <Flame className="fill-[#ff3b5c] text-[#ff3b5c]" size={15} />
            <span className="font-extrabold text-xs">{userData.streak}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light', userData.vibrationEnabled);
              playSound('pop', userData.soundEnabled ?? true);
              onNavigateTab?.('rewards');
            }}
            className="flex items-center gap-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:brightness-98 active:scale-95 transition-all cursor-pointer tabular-nums"
            title="Rewards Shop"
            aria-label="Rewards Shop"
          >
            <Star className="fill-[#ecc30b] text-[#ecc30b]" size={15} />
            <span className="font-extrabold text-xs">{userData.points.toLocaleString()}</span>
          </button>
        </div>
      </header>

      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
        {/* Quest Area Directly on Background */}
        <section className="relative lg:col-span-7 pb-1">
          <div>
            {/* Unified Metadata Line: Category + Icon transform into Tomorrow Mystery + Lock, Difficulty into Locked */}
            <div className="h-5 flex items-center justify-between gap-2 mb-3">
              <div className="min-w-0">
                <AnimatePresence mode="wait" initial={false}>
                  {isShowingTomorrow ? (
                    isTomorrowUnlocked && (tomorrowQuest as any)?.category ? (() => {
                      const meta = getCategoryMeta((tomorrowQuest as any).category);
                      const Icon = meta.icon;
                      return (
                        <motion.span
                          key="cat-tomorrow-unlocked"
                          initial={{ opacity: 0, filter: 'blur(4px)' }}
                          animate={{ opacity: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, filter: 'blur(4px)' }}
                          transition={{ duration: 0.2 }}
                          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#067bc2] dark:text-[#84bcda] truncate"
                        >
                          <Icon size={14} className="shrink-0" />
                          <span className="truncate">{(tomorrowQuest as any).category}</span>
                        </motion.span>
                      );
                    })() : (
                      <motion.span
                        key="cat-tomorrow-mystery"
                        initial={{ opacity: 0, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(4px)' }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#8a6d00] dark:text-[#f6d84c]"
                      >
                        <Lock size={13} className="shrink-0" />
                        <span>Tomorrow Mystery</span>
                      </motion.span>
                    )
                  ) : (
                    <motion.div
                      key="cat-today"
                      initial={{ opacity: 0, filter: 'blur(4px)' }}
                      animate={{
                        opacity: isBlurringToTomorrow ? 0.25 : 1,
                        filter: isBlurringToTomorrow ? 'blur(4px)' : 'blur(0px)',
                      }}
                      exit={{ opacity: 0, filter: 'blur(4px)' }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#067bc2] dark:text-[#84bcda] min-w-0"
                    >
                      <TodayCatIcon size={14} className="shrink-0" />
                      <span className="truncate">{(todayQuest as any).category || 'Daily Quest'}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="shrink-0">
                <AnimatePresence mode="wait" initial={false}>
                  {isShowingTomorrow ? (
                    isTomorrowUnlocked && tomorrowQuest ? (
                      <motion.div
                        key="diff-tomorrow-unlocked"
                        initial={{ opacity: 0, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(4px)' }}
                        transition={{ duration: 0.2 }}
                      >
                        <DifficultyBars difficulty={tomorrowQuest.difficulty} compact />
                      </motion.div>
                    ) : (
                      <motion.span
                        key="diff-tomorrow-locked"
                        initial={{ opacity: 0, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(4px)' }}
                        transition={{ duration: 0.2 }}
                        className="text-[11px] font-bold text-gray-400 dark:text-gray-500"
                      >
                        Locked
                      </motion.span>
                    )
                  ) : (
                    <motion.div
                      key="diff-today"
                      initial={{ opacity: 0, filter: 'blur(4px)' }}
                      animate={{
                        opacity: isBlurringToTomorrow ? 0.25 : 1,
                        filter: isBlurringToTomorrow ? 'blur(4px)' : 'blur(0px)',
                      }}
                      exit={{ opacity: 0, filter: 'blur(4px)' }}
                      transition={{ duration: 0.2 }}
                    >
                      <DifficultyBars difficulty={todayQuest.difficulty} compact />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Quest Text: Fixed Matched Slot + Smooth Blur Morph + Midnight Countdown */}
            <div className="relative min-h-[6.75rem] sm:min-h-[7.25rem] lg:min-h-[8rem] flex items-center mb-3">
              <motion.h2
                animate={{
                  filter: isBlurringToTomorrow
                    ? 'blur(8px)'
                    : isShowingTomorrow && !isTomorrowUnlocked
                    ? 'blur(6px)'
                    : 'blur(0px)',
                  opacity: isBlurringToTomorrow
                    ? 0.25
                    : isShowingTomorrow && !isTomorrowUnlocked
                    ? 0.28
                    : 1,
                }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full text-2xl sm:text-[1.65rem] lg:text-[1.85rem] font-black leading-snug tracking-tight text-balance ${
                  isShowingTomorrow ? 'select-none' : ''
                }`}
              >
                <motion.span
                  initial={false}
                  animate={{
                    backgroundSize: !isShowingTomorrow && isCompleted ? '100% 3.5px' : '0% 3.5px',
                  }}
                  transition={{
                    duration: !isShowingTomorrow ? 0.45 : 0,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    backgroundImage: 'linear-gradient(#ff3b5c, #ff3b5c)',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: '0 55%',
                    WebkitBoxDecorationBreak: 'clone',
                    boxDecorationBreak: 'clone',
                  }}
                  className={`inline transition-colors duration-300 ${
                    !isShowingTomorrow && isCompleted
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-gray-950 dark:text-white'
                  }`}
                >
                  {isShowingTomorrow
                    ? tomorrowQuest
                      ? tomorrowQuest.quest
                      : mysteryPreviewText
                    : todayQuest.quest}
                </motion.span>
              </motion.h2>

              <AnimatePresence>
                {isShowingTomorrow && !isTomorrowUnlocked && (
                  <motion.div
                    key="tomorrow-countdown-overlay"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Next Quest In
                      </span>
                      <div className="flex items-center gap-1.5 text-sm sm:text-base font-black font-mono tabular-nums text-gray-950 dark:text-white">
                        <Clock size={14} className="text-[#067bc2] dark:text-[#84bcda]" />
                        <span>{countdown}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reward Line: Star & XP Transform into Question Mark Strings */}
            <div className="h-5 flex items-center gap-3 text-xs font-extrabold mb-5 tabular-nums">
              <span className="inline-flex items-center gap-1 text-gray-900 dark:text-white">
                <Star size={14} className="fill-[#ecc30b] text-[#ecc30b] shrink-0" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={
                      isShowingTomorrow
                        ? isTomorrowUnlocked && tomorrowQuest
                          ? 'pts-unlocked'
                          : 'pts-mystery'
                        : 'pts-today'
                    }
                    initial={{ opacity: 0, filter: 'blur(3px)' }}
                    animate={{ opacity: isBlurringToTomorrow ? 0.25 : 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(3px)' }}
                    transition={{ duration: 0.18 }}
                  >
                    {isShowingTomorrow
                      ? isTomorrowUnlocked && tomorrowQuest
                        ? `+${tomorrowQuest.reward} PTS`
                        : '+? PTS'
                      : `+${todayQuest.reward} PTS`}
                  </motion.span>
                </AnimatePresence>
              </span>

              <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>

              <span className="inline-flex items-center gap-1 text-[#067bc2] dark:text-[#84bcda]">
                <Award size={14} className="shrink-0" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={
                      isShowingTomorrow
                        ? isTomorrowUnlocked && tomorrowQuest
                          ? 'xp-unlocked'
                          : 'xp-mystery'
                        : 'xp-today'
                    }
                    initial={{ opacity: 0, filter: 'blur(3px)' }}
                    animate={{ opacity: isBlurringToTomorrow ? 0.25 : 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(3px)' }}
                    transition={{ duration: 0.18 }}
                  >
                    {isShowingTomorrow
                      ? isTomorrowUnlocked && tomorrowQuest
                        ? `+${getQuestXp(tomorrowQuest.difficulty)} XP`
                        : '+?? XP'
                      : `+${todayXpReward} XP`}
                  </motion.span>
                </AnimatePresence>
              </span>

              <AnimatePresence mode="wait" initial={false}>
                {!isShowingTomorrow && isCompleted ? (
                  <motion.span
                    key="status-done"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isBlurringToTomorrow ? 0 : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="inline-flex items-center gap-3"
                  >
                    <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Check size={13} strokeWidth={3} />
                      Done
                    </span>
                  </motion.span>
                ) : isShowingTomorrow && isTomorrowUnlocked ? (
                  <motion.span
                    key="status-midnight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="inline-flex items-center gap-3"
                  >
                    <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>
                    <span className="text-gray-500 dark:text-gray-400 font-bold">Unlocks at midnight</span>
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Primary CTA: Complete -> Continue -> Unlock Tomorrow / Unlocked */}
            <AnimatePresence mode="wait" initial={false}>
              {!isCompleted ? (
                <motion.div
                  key="btn-complete-wrap"
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.16 }}
                >
                  <button
                    type="button"
                    onClick={handleComplete}
                    className="btn-tactile btn-tactile-coral w-full min-h-[56px] sm:min-h-[64px] py-3.5 sm:py-4 px-5 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle size={20} strokeWidth={2.5} />
                    <span>Complete Quest</span>
                  </button>
                </motion.div>
              ) : !isShowingTomorrow ? (
                <motion.div
                  key="btn-continue-wrap"
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.18 }}
                >
                  <button
                    type="button"
                    onClick={handleContinueToTomorrow}
                    disabled={isBlurringToTomorrow}
                    className="btn-tactile btn-tactile-teal w-full min-h-[56px] sm:min-h-[64px] py-3.5 sm:py-4 px-5 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight size={19} strokeWidth={2.5} />
                  </button>
                </motion.div>
              ) : !isTomorrowUnlocked ? (
                <motion.div
                  key="btn-unlock-wrap"
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.18 }}
                >
                  <button
                    type="button"
                    onClick={handleUnlockTomorrow}
                    disabled={userData.points < 20}
                    className={`btn-tactile w-full min-h-[56px] sm:min-h-[64px] py-3.5 sm:py-4 px-5 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 ${
                      userData.points >= 20
                        ? 'btn-tactile-amber cursor-pointer'
                        : 'btn-tactile-neutral bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Star size={18} className={userData.points >= 20 ? 'fill-gray-900 text-gray-900' : ''} />
                    <span>
                      {userData.points >= 20
                        ? 'Unlock Tomorrow (20 PTS)'
                        : `Need 20 PTS (${userData.points}/20)`}
                    </span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="btn-unlocked-wrap"
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.22 }}
                  className="w-full min-h-[56px] sm:min-h-[64px] py-3.5 sm:py-4 px-5 rounded-2xl font-black text-base sm:text-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500/30 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={19} />
                  <span>Unlocked · Starts at Midnight</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Row: Freeze & Reroll on Today, Empty Height-Matched Spacer on Tomorrow (No Info Under Button) */}
            {!isShowingTomorrow ? (
              <motion.div
                animate={{ opacity: isBlurringToTomorrow ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 gap-2.5 mt-3"
              >
                <button
                  type="button"
                  onClick={handleFreeze}
                  className="btn-tactile btn-tactile-neutral py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                  title={
                    isFrozenToday
                      ? 'Streak frozen for today'
                      : userData.streakFreezes > 0
                      ? `Use 1 Streak Freeze (${userData.streakFreezes} available)`
                      : 'Get Streak Freezes'
                  }
                >
                  <Snowflake size={15} className="text-[#067bc2] dark:text-[#84bcda] shrink-0" />
                  <span>Freeze</span>
                  <span className="text-[11px] font-black text-[#067bc2] dark:text-[#84bcda] tabular-nums">
                    {isFrozenToday ? 'ACTIVE' : `${userData.streakFreezes}`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium', userData.vibrationEnabled);
                    playSound('reroll', userData.soundEnabled ?? true);
                    const res = rerollQuest();
                    showToastMessage(res.message);
                  }}
                  disabled={isCompleted}
                  className={`btn-tactile btn-tactile-neutral py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                    isCompleted
                      ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500'
                      : 'cursor-pointer text-gray-800 dark:text-gray-100'
                  }`}
                  title={
                    userData.lastFreeRerollDate !== todayISO
                      ? 'Free daily reroll available'
                      : 'Reroll quest for 5 Stars'
                  }
                >
                  <RefreshCw size={14} className="shrink-0" />
                  <span>Reroll</span>
                  <span className="text-[11px] font-black text-[#067bc2] dark:text-[#84bcda]">
                    {userData.lastFreeRerollDate !== todayISO ? 'FREE' : '5 PTS'}
                  </span>
                </button>
              </motion.div>
            ) : (
              <div className="mt-3 h-11" aria-hidden="true" />
            )}
          </div>

          {showDebugTools && (
            <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 flex gap-2">
              <button
                type="button"
                onClick={handleDebugReroll}
                className="flex-1 py-2 rounded-xl font-bold text-xs text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} />
                Reroll (Dev)
              </button>
              {debugQuestIndex !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setDebugQuestIndex(null);
                    setDebugCompleted(false);
                    setIsBlurringToTomorrow(false);
                    setActiveQuestView('today');
                  }}
                  className="px-3 py-2 rounded-xl font-bold text-xs text-[#ff3b5c] border border-dashed border-[#ff3b5c]/40 hover:bg-[#ff3b5c]/10 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </section>

        {/* Weekly 7-Day Streak Widget */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light', userData.vibrationEnabled);
            playSound('click', userData.soundEnabled ?? true);
            setShowStreakModal(true);
          }}
          className="w-full lg:col-span-5 lg:sticky lg:top-8 text-left bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-5 playful-card border-gray-200 dark:border-gray-700 transition-all cursor-pointer active:translate-y-[1px]"
        >
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-lg">
                <Flame size={15} className="fill-[#ff3b5c] text-[#ff3b5c]" />
              </div>
              <span className="font-black text-sm text-gray-950 dark:text-white tabular-nums">
                {userData.streak}-Day Streak
              </span>
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-gray-400 dark:text-gray-500 tabular-nums">
              Week {streakWeekNumber}
              <ChevronRight size={14} />
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDays.map((day) => (
              <div key={day.iso} className="flex flex-col items-center gap-1.5">
                <span
                  className={`text-[11px] font-extrabold ${
                    day.isToday ? 'text-[#ff4b5c]' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {day.label}
                </span>
                <div
                  className={`w-9 h-9 lg:w-8 lg:h-8 xl:w-9 xl:h-9 rounded-full flex items-center justify-center transition-all ${
                    day.isDone
                      ? 'bg-[#ff3b5c] text-white shadow-[0_3px_0_#c81438]'
                      : day.isFrozen
                      ? 'bg-[#84bcda] text-white shadow-[0_3px_0_#067bc2]'
                      : day.isToday
                      ? 'bg-[#ff4b5c] text-white ring-4 ring-[#ff4b5c]/20 shadow-[0_3px_0_#d12134]'
                      : 'bg-gray-100 dark:bg-gray-900/60 border-2 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600'
                  }`}
                >
                  {day.isDone ? (
                    <Check size={16} strokeWidth={3.2} />
                  ) : day.isFrozen ? (
                    <Snowflake size={15} />
                  ) : day.isToday ? (
                    <Zap size={16} className="fill-white" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </button>
      </div>

      {/* Streak Modal */}
      <AnimatePresence>
        {showStreakModal && (
          <StreakModal
            isOpen={showStreakModal}
            onClose={() => setShowStreakModal(false)}
            streak={userData.streak}
            longestStreak={userData.longestStreak}
            completedDays={userData.completedDays}
          />
        )}
      </AnimatePresence>

      {/* Action Feedback Toast */}
      <Toast
        show={!!actionFeedback}
        title={actionFeedback?.title ?? ''}
        subtitle={actionFeedback?.subtitle}
        icon={<Sparkles size={20} />}
      />
    </div>
  );
}
