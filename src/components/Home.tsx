import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { getDayOfYear, getTodayISO, getTomorrowISO } from '../utils/dateUtils';
import questsData from '../data/quests.json';
import {
  Flame,
  Star,
  CheckCircle,
  RefreshCw,
  Calendar,
  Lock,
  Sparkles,
  ArrowRight,
  Snowflake,
  Zap,
  Check,
  Award,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Lottie from 'lottie-react';
import StreakModal from './StreakModal';
import Toast from './Toast';
import DifficultyBars from './DifficultyBars';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audioEffects';
import { syncWidgetWithNative } from '../utils/widgetSync';
import { getCategoryMeta } from './CategoryDistributionBar';
import { getLevelProgress, getQuestXp } from '../utils/xpUtils';

const successLottie = {
  v: '4.10.1',
  fr: 30,
  ip: 0,
  op: 40,
  w: 80,
  h: 80,
  nm: 'Success Checkmark',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Check Mark',
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [40, 40, 0], ix: 2 },
        a: { a: 0, k: [-1.312, 6, 0], ix: 1 },
        s: { a: 0, k: [100, 100, 100], ix: 6 },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ind: 0,
              ty: 'sh',
              ix: 1,
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]],
                  v: [[-15.75, 8], [-8, 16], [13.125, -4]],
                  c: false,
                },
                ix: 2,
              },
              nm: 'Path 1',
              mn: 'ADBE Vector Shape - Group',
              hd: false,
            },
            {
              ty: 'tm',
              s: {
                a: 1,
                k: [
                  { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, n: ['0p667_1_0p333_0'], t: 25, s: [0], e: [100] },
                  { t: 33 },
                ],
                ix: 1,
              },
              e: { a: 0, k: 0, ix: 2 },
              o: { a: 0, k: 0, ix: 3 },
              m: 1,
              ix: 2,
              nm: 'Trim Paths 1',
              mn: 'ADBE Vector Filter - Trim',
              hd: false,
            },
            {
              ty: 'st',
              c: { a: 0, k: [1, 1, 1, 1], ix: 3 },
              o: { a: 0, k: 100, ix: 4 },
              w: { a: 0, k: 3, ix: 5 },
              lc: 2,
              lj: 2,
              nm: 'Stroke 1',
              mn: 'ADBE Vector Graphic - Stroke',
              hd: false,
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: 'Transform',
            },
          ],
          nm: 'Shape 1',
          np: 3,
          cix: 2,
          ix: 1,
          mn: 'ADBE Vector Group',
          hd: false,
        },
      ],
      ip: 0,
      op: 40,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Circle Flash',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, n: ['0p833_0p833_0p167_0p167'], t: 25, s: [0], e: [98] },
            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, n: ['0p833_0p833_0p167_0p167'], t: 30, s: [98], e: [0] },
            { t: 38 },
          ],
          ix: 11,
        },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [40, 40, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: {
          a: 1,
          k: [
            { i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] }, o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] }, n: ['0p667_1_0p333_0', '0p667_1_0p333_0', '0p667_1_0p333_0'], t: 25, s: [0, 0, 100], e: [100, 100, 100] },
            { t: 30 },
          ],
          ix: 6,
        },
      },
      ao: 0,
      shapes: [
        { d: 1, ty: 'el', s: { a: 0, k: [64, 64], ix: 2 }, p: { a: 0, k: [0, 0], ix: 3 }, nm: 'Ellipse Path 1', mn: 'ADBE Vector Shape - Ellipse', hd: false },
        { ty: 'fl', c: { a: 0, k: [0.529866635799, 0.961458325386, 0.448091417551, 1], ix: 4 }, o: { a: 0, k: 100, ix: 5 }, r: 1, nm: 'Fill 1', mn: 'ADBE Vector Graphic - Fill', hd: false },
      ],
      ip: 0,
      op: 40,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Circle Stroke',
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [39.022, 39.022, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: {
          a: 1,
          k: [
            { i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] }, o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] }, n: ['0p667_1_0p333_0', '0p667_1_0p333_0', '0p667_1_0p333_0'], t: 16, s: [100, 100, 100], e: [80, 80, 100] },
            { i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] }, o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] }, n: ['0p667_1_0p333_0', '0p667_1_0p333_0', '0p667_1_0p333_0'], t: 22, s: [80, 80, 100], e: [120, 120, 100] },
            { i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] }, o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] }, n: ['0p667_1_0p333_0', '0p667_1_0p333_0', '0p667_1_0p333_0'], t: 25, s: [120, 120, 100], e: [100, 100, 100] },
            { t: 29 },
          ],
          ix: 6,
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            { d: 1, ty: 'el', s: { a: 0, k: [60, 60], ix: 2 }, p: { a: 0, k: [0, 0], ix: 3 }, nm: 'Ellipse Path 1', mn: 'ADBE Vector Shape - Ellipse', hd: false },
            {
              ty: 'tm',
              s: {
                a: 1,
                k: [
                  { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, n: ['0p667_1_0p333_0'], t: 0, s: [0], e: [100] },
                  { t: 16 },
                ],
                ix: 1,
              },
              e: { a: 0, k: 0, ix: 2 },
              o: { a: 0, k: 0, ix: 3 },
              m: 1,
              ix: 2,
              nm: 'Trim Paths 1',
              mn: 'ADBE Vector Filter - Trim',
              hd: false,
            },
            { ty: 'st', c: { a: 0, k: [0.427450984716, 0.800000011921, 0.35686275363, 1], ix: 3 }, o: { a: 0, k: 100, ix: 4 }, w: { a: 0, k: 3, ix: 5 }, lc: 2, lj: 2, nm: 'Stroke 1', mn: 'ADBE Vector Graphic - Stroke', hd: false },
            { ty: 'tr', p: { a: 0, k: [0.978, 0.978], ix: 2 }, a: { a: 0, k: [0, 0], ix: 1 }, s: { a: 0, k: [100, 100], ix: 3 }, r: { a: 0, k: 0, ix: 6 }, o: { a: 0, k: 100, ix: 7 }, sk: { a: 0, k: 0, ix: 4 }, sa: { a: 0, k: 0, ix: 5 }, nm: 'Transform' },
          ],
          nm: 'Ellipse 1',
          np: 3,
          cix: 2,
          ix: 1,
          mn: 'ADBE Vector Group',
          hd: false,
        },
      ],
      ip: 0,
      op: 40,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: 'Circle Green Fill',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, n: ['0p833_0p833_0p167_0p167'], t: 21, s: [0], e: [98] },
            { t: 28 },
          ],
          ix: 11,
        },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [40, 40, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: {
          a: 1,
          k: [
            { i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] }, o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] }, n: ['0p667_1_0p333_0', '0p667_1_0p333_0', '0p667_1_0p333_0'], t: 21, s: [0, 0, 100], e: [100, 100, 100] },
            { t: 28 },
          ],
          ix: 6,
        },
      },
      ao: 0,
      shapes: [
        { d: 1, ty: 'el', s: { a: 0, k: [64, 64], ix: 2 }, p: { a: 0, k: [0, 0], ix: 3 }, nm: 'Ellipse Path 1', mn: 'ADBE Vector Shape - Ellipse', hd: false },
        { ty: 'fl', c: { a: 0, k: [0.427450984716, 0.800000011921, 0.35686275363, 1], ix: 4 }, o: { a: 0, k: 100, ix: 5 }, r: 1, nm: 'Fill 1', mn: 'ADBE Vector Graphic - Fill', hd: false },
      ],
      ip: 0,
      op: 40,
      st: 0,
      bm: 0,
    },
  ],
};

interface HomeProps {
  onNavigateTab?: (tab: string) => void;
}

function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function Home({ onNavigateTab }: HomeProps) {
  const { userData, completeQuest, updateSettings, rerollQuest, recoverStreak, useStreakFreeze } = useAppContext();

  const [showAnimation, setShowAnimation] = useState(false);
  const [celebrationMeta, setCelebrationMeta] = useState<{
    points: number;
    xp: number;
    leveledUpTo: number | null;
  } | null>(null);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [debugQuestIndex, setDebugQuestIndex] = useState<number | null>(null);
  const [debugCompleted, setDebugCompleted] = useState(false);
  const [showDebugTools, setShowDebugTools] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const swapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    };
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

  const dayOfYear = getDayOfYear();
  const todayISO = getTodayISO();
  const tomorrowISO = getTomorrowISO();

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

  const [activeQuestView, setActiveQuestView] = useState<'today' | 'tomorrow'>(() =>
    isCompleted ? 'tomorrow' : 'today'
  );

  useEffect(() => {
    if (!showAnimation) {
      setActiveQuestView(isCompleted ? 'tomorrow' : 'today');
    }
  }, [isCompleted, showAnimation]);

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
  const isShowingTomorrow = isCompleted && activeQuestView === 'tomorrow' && !showAnimation;

  const showToastMessage = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 2600);
  };

  const handleComplete = () => {
    const isDebug = debugQuestIndex !== null;
    const prevLevel = getLevelProgress(userData.xp || 0).level;
    const nextLevel = getLevelProgress((userData.xp || 0) + todayXpReward).level;
    const didLevelUp = nextLevel > prevLevel;

    completeQuest(todayQuest.reward, todayISO, isDebug, todayXpReward);

    if (isDebug) {
      setDebugCompleted(true);
    }

    setCelebrationMeta({
      points: todayQuest.reward,
      xp: todayXpReward,
      leveledUpTo: didLevelUp ? nextLevel : null,
    });

    triggerHaptic('success', userData.vibrationEnabled);
    playSound(didLevelUp ? 'levelUp' : 'complete', userData.soundEnabled ?? true);

    if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    if (doneTimerRef.current) clearTimeout(doneTimerRef.current);

    setShowAnimation(true);
    swapTimerRef.current = setTimeout(() => {
      setActiveQuestView('tomorrow');
    }, 1550);
    doneTimerRef.current = setTimeout(() => {
      setShowAnimation(false);
    }, 1750);
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
        <section className="relative overflow-hidden rounded-2xl lg:col-span-7">
          {/* Custom Completion Animation over Blurred Container */}
          <AnimatePresence>
            {showAnimation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 text-center"
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 420, damping: 22 }}
                  className="relative flex items-center justify-center mb-2"
                >
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0.7 }}
                    animate={{ scale: 1.55, opacity: 0 }}
                    transition={{ delay: 0.15, duration: 0.8, ease: 'easeOut' }}
                    className="absolute w-20 h-20 rounded-2xl border-4 border-[#067bc2]"
                  />
                  <div className="w-20 h-20">
                    <Lottie animationData={successLottie} loop={false} />
                  </div>
                </motion.div>

                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.22 }}
                  className="font-black text-2xl text-gray-950 dark:text-white"
                >
                  Quest Completed!
                </motion.span>

                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.28, duration: 0.22 }}
                  className="flex items-center gap-2 mt-2.5"
                >
                  <span className="px-3 py-1 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-[#8a6d00] dark:text-[#f6d84c] font-black text-sm shadow-xs">
                    +{celebrationMeta?.points ?? todayQuest.reward} PTS
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-[#067bc2] dark:text-[#84bcda] font-black text-sm shadow-xs">
                    +{celebrationMeta?.xp ?? todayXpReward} XP
                  </span>
                </motion.div>

                {celebrationMeta?.leveledUpTo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.36, type: 'spring', stiffness: 450, damping: 24 }}
                    className="mt-3 px-4 py-1.5 rounded-xl bg-[#ff4b5c] text-white font-black text-xs border-2 border-b-4 border-[#d12134] flex items-center gap-1.5"
                  >
                    <Award size={14} />
                    <span>LEVEL UP! Level {celebrationMeta.leveledUpTo}</span>
                  </motion.div>
                )}

                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.25 }}
                  className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-3"
                >
                  Loading tomorrow&apos;s quest...
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Blurred Container Content Wrapper during completion */}
          <div
            className={`transition-all duration-300 ease-out ${
              showAnimation ? 'blur-md opacity-30 scale-[0.98] pointer-events-none select-none' : ''
            }`}
          >
            {isCompleted && (
              <div className="mb-5 flex items-center gap-1.5 bg-white dark:bg-gray-800 p-1 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection', userData.vibrationEnabled);
                    playSound('pop', userData.soundEnabled ?? true);
                    setActiveQuestView('tomorrow');
                  }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeQuestView === 'tomorrow'
                      ? 'bg-[#067bc2] text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <Calendar size={13} />
                  <span>Tomorrow</span>
                  {isTomorrowUnlocked && <Sparkles size={11} className="text-[#ecc30b]" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection', userData.vibrationEnabled);
                    playSound('pop', userData.soundEnabled ?? true);
                    setActiveQuestView('today');
                  }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeQuestView === 'today'
                      ? 'bg-[#067bc2] text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <CheckCircle size={13} />
                  <span>Today (Done)</span>
                </button>
              </div>
            )}

            <AnimatePresence mode="wait" initial={false}>
              {isShowingTomorrow ? (
                <motion.div
                  key="tomorrow-view"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.16 }}
                >
                  {/* Metadata Line on Background */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {isTomorrowUnlocked && (tomorrowQuest as any)?.category ? (() => {
                        const meta = getCategoryMeta((tomorrowQuest as any).category);
                        const Icon = meta.icon;
                        return (
                          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#067bc2] dark:text-[#84bcda] truncate">
                            <Icon size={14} className="shrink-0" />
                            <span className="truncate">{(tomorrowQuest as any).category}</span>
                          </span>
                        );
                      })() : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#8a6d00] dark:text-[#f6d84c]">
                          <Lock size={13} />
                          <span>Tomorrow Mystery</span>
                        </span>
                      )}
                    </div>

                    {isTomorrowUnlocked && tomorrowQuest && (
                      <DifficultyBars difficulty={tomorrowQuest.difficulty} compact />
                    )}
                  </div>

                  {/* Quest Prompt directly on Background */}
                  <div className="relative mb-3">
                    <h2
                      className={`text-2xl sm:text-[1.65rem] lg:text-[1.85rem] font-black leading-snug tracking-tight text-balance ${
                        !isTomorrowUnlocked
                          ? 'filter blur-[6px] select-none opacity-30 dark:opacity-20'
                          : 'text-gray-950 dark:text-white'
                      }`}
                    >
                      {tomorrowQuest
                        ? tomorrowQuest.quest
                        : 'Undertake an intentional mindfulness challenge outdoors and capture a fresh moment of focus.'}
                    </h2>

                    {!isTomorrowUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border-2 border-[#ecc30b]">
                          <Lock size={14} className="text-[#ecc30b]" />
                          <span className="text-xs font-extrabold text-gray-800 dark:text-gray-100">
                            Unlock Early with Stars
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {isTomorrowUnlocked && tomorrowQuest && (
                    <div className="flex items-center gap-3 mb-5 text-xs font-extrabold tabular-nums">
                      <span className="inline-flex items-center gap-1 text-gray-900 dark:text-white">
                        <Star size={14} className="fill-[#ecc30b] text-[#ecc30b]" />
                        +{tomorrowQuest.reward} PTS
                      </span>
                      <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-[#067bc2] dark:text-[#84bcda]">
                        <Award size={14} />
                        +{getQuestXp(tomorrowQuest.difficulty)} XP
                      </span>
                    </div>
                  )}

                  {isTomorrowUnlocked && tomorrowQuest ? (
                    <div className="w-full py-3.5 rounded-2xl font-extrabold text-sm bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500/30 flex items-center justify-center gap-2 mt-4">
                      <CheckCircle size={18} />
                      <span>Ready for Tomorrow · Unlocks at Midnight</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUnlockTomorrow}
                      disabled={userData.points < 20}
                      className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer mt-4 ${
                        userData.points >= 20
                          ? 'btn-tactile btn-tactile-amber'
                          : 'btn-tactile btn-tactile-neutral bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Star size={17} className={userData.points >= 20 ? 'fill-gray-900 text-gray-900' : ''} />
                      <span>
                        {userData.points >= 20
                          ? 'Unlock Tomorrow (20 PTS)'
                          : `Need 20 PTS to Unlock (${userData.points}/20)`}
                      </span>
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="today-view"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.16 }}
                >
                  {/* Metadata Line on Background */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#067bc2] dark:text-[#84bcda] min-w-0">
                      <TodayCatIcon size={14} className="shrink-0" />
                      <span className="truncate">{(todayQuest as any).category || 'Daily Quest'}</span>
                    </div>

                    <DifficultyBars difficulty={todayQuest.difficulty} compact />
                  </div>

                  {/* Quest Title Directly on Background */}
                  <h2
                    className={`text-2xl sm:text-[1.65rem] lg:text-[1.85rem] font-black leading-snug tracking-tight text-balance mb-3 ${
                      isCompleted
                        ? 'text-gray-400 dark:text-gray-500 line-through decoration-[#ff3b5c]/60'
                        : 'text-gray-950 dark:text-white'
                    }`}
                  >
                    {todayQuest.quest}
                  </h2>

                  {/* Quiet Inline Reward Line */}
                  <div className="flex items-center gap-3 text-xs font-extrabold mb-5 tabular-nums">
                    <span className="inline-flex items-center gap-1 text-gray-900 dark:text-white">
                      <Star size={14} className="fill-[#ecc30b] text-[#ecc30b]" />
                      +{todayQuest.reward} PTS
                    </span>
                    <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-[#067bc2] dark:text-[#84bcda]">
                      <Award size={14} />
                      +{todayXpReward} XP
                    </span>
                  </div>

                  {/* Complete Button Under Today's Quest */}
                  {!isCompleted ? (
                    <button
                      type="button"
                      onClick={handleComplete}
                      disabled={isCompleted || showAnimation}
                      className="btn-tactile btn-tactile-coral w-full py-3.5 sm:py-4 px-5 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle size={20} strokeWidth={2.5} />
                      <span>Complete Quest</span>
                    </button>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="w-full py-3 rounded-2xl font-extrabold text-sm bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500/30 flex items-center justify-center gap-2">
                        <CheckCircle size={17} />
                        <span>Quest Completed Today!</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('selection', userData.vibrationEnabled);
                          playSound('pop', userData.soundEnabled ?? true);
                          setActiveQuestView('tomorrow');
                        }}
                        className="btn-tactile btn-tactile-teal w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Preview Tomorrow&apos;s Quest</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  )}

                  {/* Freeze & Reroll Buttons Side-by-Side Under Complete Button */}
                  <div className="grid grid-cols-2 gap-2.5 mt-2.5">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                      setActiveQuestView('today');
                    }}
                    className="px-3 py-2 rounded-xl font-bold text-xs text-[#ff3b5c] border border-dashed border-[#ff3b5c]/40 hover:bg-[#ff3b5c]/10 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}
          </div>
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
      <Toast show={!!actionFeedback} title={actionFeedback ?? ''} icon={<Sparkles size={20} />} />
    </div>
  );
}
