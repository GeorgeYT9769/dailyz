import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getDayOfYear, getTodayISO, getTomorrowISO } from '../utils/dateUtils';
import questsData from '../data/quests.json';
import { Flame, Star, CheckCircle, Gift, RefreshCw, Calendar, Lock, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Lottie from 'lottie-react';
import StreakModal from './StreakModal';
import { triggerHaptic } from '../utils/haptics';
import { syncWidgetWithNative } from '../utils/widgetSync';

// Lottie success checkmark
const successLottie = {"v":"4.10.1","fr":30,"ip":0,"op":40,"w":80,"h":80,"nm":"Success Checkmark","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"Check Mark","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[40,40,0],"ix":2},"a":{"a":0,"k":[-1.312,6,0],"ix":1},"s":{"a":0,"k":[100,100,100],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0]],"v":[[-15.75,8],[-8,16],[13.125,-4]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"tm","s":{"a":1,"k":[{"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"n":["0p667_1_0p333_0"],"t":25,"s":[0],"e":[100]},{"t":33}],"ix":1},"e":{"a":0,"k":0,"ix":2},"o":{"a":0,"k":0,"ix":3},"m":1,"ix":2,"nm":"Trim Paths 1","mn":"ADBE Vector Filter - Trim","hd":false},{"ty":"st","c":{"a":0,"k":[1,1,1,1],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":3,"ix":5},"lc":2,"lj":2,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Shape 1","np":3,"cix":2,"ix":1,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":40,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"Circle Flash","sr":1,"ks":{"o":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":25,"s":[0],"e":[98]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":30,"s":[98],"e":[0]},{"t":38}],"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[40,40,0],"ix":2},"a":{"a":0,"k":[0,0,0],"ix":1},"s":{"a":1,"k":[{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"n":["0p667_1_0p333_0","0p667_1_0p333_0","0p667_1_0p333_0"],"t":25,"s":[0,0,100],"e":[100,100,100]},{"t":30}],"ix":6}},"ao":0,"shapes":[{"d":1,"ty":"el","s":{"a":0,"k":[64,64],"ix":2},"p":{"a":0,"k":[0,0],"ix":3},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse","hd":false},{"ty":"fl","c":{"a":0,"k":[0.529866635799,0.961458325386,0.448091417551,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false}],"ip":0,"op":40,"st":0,"bm":0},{"ddd":0,"ind":3,"ty":4,"nm":"Circle Stroke","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[39.022,39.022,0],"ix":2},"a":{"a":0,"k":[0,0,0],"ix":1},"s":{"a":1,"k":[{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"n":["0p667_1_0p333_0","0p667_1_0p333_0","0p667_1_0p333_0"],"t":16,"s":[100,100,100],"e":[80,80,100]},{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"n":["0p667_1_0p333_0","0p667_1_0p333_0","0p667_1_0p333_0"],"t":22,"s":[80,80,100],"e":[120,120,100]},{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"n":["0p667_1_0p333_0","0p667_1_0p333_0","0p667_1_0p333_0"],"t":25,"s":[120,120,100],"e":[100,100,100]},{"t":29}],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[60,60],"ix":2},"p":{"a":0,"k":[0,0],"ix":3},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse","hd":false},{"ty":"tm","s":{"a":1,"k":[{"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"n":["0p667_1_0p333_0"],"t":0,"s":[0],"e":[100]},{"t":16}],"ix":1},"e":{"a":0,"k":0,"ix":2},"o":{"a":0,"k":0,"ix":3},"m":1,"ix":2,"nm":"Trim Paths 1","mn":"ADBE Vector Filter - Trim","hd":false},{"ty":"st","c":{"a":0,"k":[0.427450984716,0.800000011921,0.35686275363,1],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":3,"ix":5},"lc":2,"lj":2,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tr","p":{"a":0,"k":[0.978,0.978],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Ellipse 1","np":3,"cix":2,"ix":1,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":40,"st":0,"bm":0},{"ddd":0,"ind":4,"ty":4,"nm":"Circle Green Fill","sr":1,"ks":{"o":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":21,"s":[0],"e":[98]},{"t":28}],"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[40,40,0],"ix":2},"a":{"a":0,"k":[0,0,0],"ix":1},"s":{"a":1,"k":[{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"n":["0p667_1_0p333_0","0p667_1_0p333_0","0p667_1_0p333_0"],"t":21,"s":[0,0,100],"e":[100,100,100]},{"t":28}],"ix":6}},"ao":0,"shapes":[{"d":1,"ty":"el","s":{"a":0,"k":[64,64],"ix":2},"p":{"a":0,"k":[0,0],"ix":3},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse","hd":false},{"ty":"fl","c":{"a":0,"k":[0.427450984716,0.800000011921,0.35686275363,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false}],"ip":0,"op":40,"st":0,"bm":0}]};

interface HomeProps {
  onNavigateTab?: (tab: string) => void;
}

export default function Home({ onNavigateTab }: HomeProps) {
  const { userData, completeQuest, updateSettings } = useAppContext();
  const [showAnimation, setShowAnimation] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [debugQuestIndex, setDebugQuestIndex] = useState<number | null>(null);
  const [debugCompleted, setDebugCompleted] = useState(false);
  const [showDebugTools, setShowDebugTools] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isDebug = params.get('debug') === 'true' || params.get('dev') === 'true' || localStorage.getItem('dailyz_debug') === 'true';
      setShowDebugTools(isDebug);
    }
  }, []);

  const dayOfYear = getDayOfYear();
  const todayISO = getTodayISO();
  const tomorrowISO = getTomorrowISO();

  // Calculate live countdown to tomorrow midnight
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown('0h 00m');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${hours}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Base and active quests
  const calculatedIndex = (dayOfYear - 1) % questsData.length;
  const scheduledTodayQuest = questsData[calculatedIndex];
  const savedTodayQuest = (userData.nextDayQuest && userData.nextDayQuest.dateIso === todayISO)
    ? userData.nextDayQuest
    : null;
  const baseTodayQuest = savedTodayQuest || scheduledTodayQuest;
  const todayQuest = debugQuestIndex !== null ? questsData[debugQuestIndex] : baseTodayQuest;

  // Tomorrow's quest state
  const isTomorrowUnlocked = Boolean(
    userData.nextDayQuest && userData.nextDayQuest.dateIso === tomorrowISO
  );
  const tomorrowQuest = isTomorrowUnlocked ? userData.nextDayQuest : null;

  // Completion check
  const isCompleted = debugQuestIndex !== null ? debugCompleted : userData.completedDays.includes(todayISO);

  // View state: strictly 'today' when today's quest is not completed.
  // When completed, it swaps to 'tomorrow'!
  const [activeQuestView, setActiveQuestView] = useState<'today' | 'tomorrow'>(() => isCompleted ? 'tomorrow' : 'today');

  // Keep synced when completed changes
  useEffect(() => {
    if (isCompleted) {
      setActiveQuestView('tomorrow');
    } else {
      setActiveQuestView('today');
    }
  }, [isCompleted]);

  // Keep native Android Homescreen Widget in sync
  useEffect(() => {
    if (todayQuest) {
      syncWidgetWithNative({
        questTitle: todayQuest.quest,
        difficulty: todayQuest.difficulty,
        reward: todayQuest.reward,
        streak: userData.streak,
        stars: userData.points,
        isCompleted: isCompleted,
      });
    }
  }, [todayQuest, userData.streak, userData.points, isCompleted]);

  const handleUnlockTomorrow = () => {
    if (userData.points < 20 || isTomorrowUnlocked) return;

    // Pick a fresh exciting quest from the pool that isn't today's quest
    const candidatePool = questsData.filter(q => q.id !== todayQuest.id);
    const chosen = candidatePool[Math.floor(Math.random() * candidatePool.length)] || questsData[(calculatedIndex + 1) % questsData.length];

    const generatedQuest = {
      id: chosen.id,
      quest: chosen.quest.replace(/\(Day \d+\)/, '').trim(),
      difficulty: chosen.difficulty,
      reward: chosen.reward,
      dateIso: tomorrowISO,
    };

    triggerHaptic('medium', userData.vibrationEnabled);

    updateSettings({
      points: userData.points - 20,
      nextDayQuest: generatedQuest,
    });
  };

  const handleComplete = () => {
    const isDebug = debugQuestIndex !== null;
    completeQuest(todayQuest.reward, todayISO, isDebug);
    
    if (isDebug) {
      setDebugCompleted(true);
    }

    triggerHaptic('success', userData.vibrationEnabled);
    
    setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
      // Seamlessly swap to tomorrow's quest once celebration ends
      setActiveQuestView('tomorrow');
    }, 1800);
  };

  const handleReroll = () => {
    const randomIndex = Math.floor(Math.random() * questsData.length);
    setDebugQuestIndex(randomIndex);
    setDebugCompleted(false);
    setActiveQuestView('today');
  };

  const difficultyColors = {
    easy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    hard: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  };

  const isShowingTomorrow = isCompleted && activeQuestView === 'tomorrow';

  return (
    <div className="flex-1 flex flex-col justify-between min-h-full animate-pop">
      {/* Top Header App Bar - positioned lower with generous breathing room */}
      <header className="flex justify-between items-center mb-5 pt-2 sm:pt-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hey, {userData.name}!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            {isCompleted ? 'Daily goal crushed! Ready for tomorrow?' : 'Your daily quest awaits'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Streak pill */}
          <button
            onClick={() => setShowStreakModal(true)}
            className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title="View Streak Map"
            aria-label="View Streak Map"
          >
            <Flame className="text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" size={16} />
            <span className="font-bold text-sm text-gray-800 dark:text-gray-100">{userData.streak}</span>
          </button>

          {/* Stars pill - clickable, leads to rewards tab */}
          <button
            onClick={() => {
              triggerHaptic('light', userData.vibrationEnabled);
              onNavigateTab?.('rewards');
            }}
            className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title="Rewards Shop"
            aria-label="Rewards Shop"
          >
            <Star className="text-yellow-400 fill-yellow-400 group-hover:scale-110 transition-transform" size={16} />
            <span className="font-bold text-sm text-gray-800 dark:text-gray-100">{userData.points}</span>
          </button>
        </div>
      </header>

      {/* Merged Full-Page Quest Card - dynamic height so bottom is always scrollable & reachable */}
      <div className="flex-1 flex flex-col justify-between bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100 dark:border-gray-700 relative transition-all">
        {/* Celebration Overlay */}
        <AnimatePresence>
          {showAnimation && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-3xl overflow-hidden bg-gray-950/30 flex items-center justify-center z-30 backdrop-blur-md"
            >
              <motion.div 
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center mx-4 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-24 h-24 mb-2">
                  <Lottie animationData={successLottie} loop={false} />
                </div>
                <span className="font-extrabold text-2xl text-gray-900 dark:text-white">Quest Completed!</span>
                <span className="text-accent font-bold text-lg mt-1" style={{ color: 'var(--accent-color)' }}>
                  +{todayQuest.reward} Points Earned
                </span>
                <span className="text-xs text-gray-400 mt-2">Swapping to tomorrow's quest...</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quest Card Header Bar */}
        <div className="shrink-0 mb-4">
          <div className="flex justify-between items-center">
            {isShowingTomorrow ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                  <Calendar size={13} />
                  Tomorrow's Quest
                </span>
                {isTomorrowUnlocked ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <Sparkles size={11} />
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Lock size={11} />
                    Locked
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                  <Flame size={13} className="text-orange-500 fill-orange-500" />
                  Today's Quest
                </span>
                {isCompleted && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle size={11} />
                    Completed
                  </span>
                )}
              </div>
            )}

            {/* Difficulty Badge */}
            {isShowingTomorrow ? (
              isTomorrowUnlocked && tomorrowQuest ? (
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${difficultyColors[tomorrowQuest.difficulty as keyof typeof difficultyColors]}`}>
                  {tomorrowQuest.difficulty.toUpperCase()}
                </span>
              ) : null
            ) : (
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${difficultyColors[todayQuest.difficulty as keyof typeof difficultyColors]}`}>
                {todayQuest.difficulty.toUpperCase()}
              </span>
            )}
          </div>

          {/* Quick toggle tab shown only if Today is completed */}
          {isCompleted && (
            <div className="mt-3 flex items-center gap-2 bg-gray-100 dark:bg-gray-900/80 p-1 rounded-2xl w-full">
              <button
                onClick={() => {
                  triggerHaptic('selection', userData.vibrationEnabled);
                  setActiveQuestView('tomorrow');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeQuestView === 'tomorrow'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Calendar size={13} className={activeQuestView === 'tomorrow' ? 'text-accent' : ''} style={activeQuestView === 'tomorrow' ? { color: 'var(--accent-color)' } : {}} />
                <span>Tomorrow's Quest</span>
                {isTomorrowUnlocked && <Sparkles size={11} className="text-amber-500" />}
              </button>

              <button
                onClick={() => {
                  triggerHaptic('selection', userData.vibrationEnabled);
                  setActiveQuestView('today');
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeQuestView === 'today'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <CheckCircle size={13} className="text-emerald-500" />
                <span>Today (Done ✓)</span>
              </button>
            </div>
          )}
        </div>

        {/* Central Content Section */}
        <div className="flex-1 flex flex-col justify-center my-2">
          <AnimatePresence mode="wait">
            {isShowingTomorrow ? (
              // TOMORROW'S QUEST VIEW - Identical widget layout to today's quest
              <motion.div
                key="tomorrow-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col justify-center"
              >
                {/* On top of the quest text: text Unlock tomorrow's quest ahead with countdown */}
                <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-amber-500 dark:text-amber-400">
                    <Sparkles size={13} />
                    {isTomorrowUnlocked ? "Tomorrow's Action • Unlocked Early" : "Unlock tomorrow's quest ahead"}
                  </span>
                  <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 bg-gray-100 dark:bg-gray-700/60 px-2.5 py-0.5 rounded-full">
                    <Clock size={12} />
                    <span>Unlocks in {countdown}</span>
                  </span>
                </div>

                {/* Quest text styled identical to today's widget */}
                <div className="relative">
                  <h2 className={`text-2xl sm:text-3xl font-extrabold leading-snug mb-5 ${
                    !isTomorrowUnlocked 
                      ? 'filter blur-[5px] select-none opacity-30 dark:opacity-20 transition-all duration-300' 
                      : 'text-gray-900 dark:text-gray-50'
                  }`}>
                    {tomorrowQuest ? tomorrowQuest.quest : "Undertake an intentional mindfulness exercise outdoors and capture a rare moment of clarity."}
                  </h2>

                  {!isTomorrowUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-gray-800/95 shadow-md border border-gray-200/80 dark:border-gray-700 backdrop-blur-sm">
                        <Lock size={14} className="text-amber-500" />
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Quest Preview Hidden</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              // TODAY'S QUEST VIEW
              <motion.div
                key="today-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col justify-center"
              >
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {isCompleted ? 'Completed Goal' : 'Action of the day'}
                  </span>
                </div>

                <h2 className={`text-2xl sm:text-3xl font-extrabold leading-snug mb-5 ${isCompleted ? 'text-gray-500 dark:text-gray-400 line-through decoration-emerald-500/50' : 'text-gray-900 dark:text-gray-50'}`}>
                  {todayQuest.quest}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-gray-600 dark:text-gray-300 font-medium">
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-3.5 py-2 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <Gift size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} />
                    <span className="text-sm">Reward: {todayQuest.reward} {todayQuest.reward === 1 ? 'Point' : 'Points'}</span>
                  </div>

                  {!isCompleted && (
                    <div className="flex items-center gap-1.5 text-xs text-orange-500 bg-orange-50 dark:bg-orange-950/40 px-3 py-2 rounded-2xl border border-orange-200/50 dark:border-orange-800/50 font-medium">
                      <Flame size={14} className="fill-orange-500" />
                      <span>Keeps streak active</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Actions Section */}
        <div className="shrink-0 pt-4 border-t border-gray-100 dark:border-gray-700/60">
          {isShowingTomorrow ? (
            isTomorrowUnlocked && tomorrowQuest ? (
              <div className="w-full py-4 sm:py-4.5 rounded-2xl font-bold text-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2 shadow-sm">
                <CheckCircle size={20} />
                <span>Ready for Tomorrow • Unlocked</span>
              </div>
            ) : (
              <button
                onClick={handleUnlockTomorrow}
                disabled={userData.points < 20}
                className={`w-full py-4 sm:py-4.5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg ${
                  userData.points >= 20
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'
                }`}
              >
                <Star size={20} className={userData.points >= 20 ? 'text-yellow-200 fill-yellow-200' : ''} />
                <span>{userData.points >= 20 ? 'Unlock Tomorrow (20 Stars)' : `Need 20 Stars to Unlock (${userData.points}/20)`}</span>
              </button>
            )
          ) : (
            <div>
              <button
                onClick={handleComplete}
                disabled={isCompleted}
                className={`w-full py-4 sm:py-4.5 rounded-2xl font-bold text-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                  isCompleted 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                    : 'bg-accent text-white shadow-lg shadow-accent/30 hover:opacity-95'
                }`}
                style={!isCompleted ? { backgroundColor: 'var(--accent-color)' } : {}}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle size={20} className="text-emerald-500" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Complete Quest</span>
                  </>
                )}
              </button>

              {isCompleted && (
                <button
                  onClick={() => setActiveQuestView('tomorrow')}
                  className="mt-2.5 w-full py-2.5 text-xs font-semibold text-accent dark:text-blue-400 flex items-center justify-center gap-1.5 hover:underline cursor-pointer"
                  style={{ color: 'var(--accent-color)' }}
                >
                  <span>Go to Tomorrow's Quest</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}

          {/* Dev Debug Tools */}
          {showDebugTools && (
            <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 flex gap-2">
              <button
                onClick={handleReroll}
                className="flex-1 py-2.5 rounded-xl font-medium text-xs text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5"
                title="Debug: Reroll Daily Quest"
              >
                <RefreshCw size={13} />
                Reroll (Dev)
              </button>
              {debugQuestIndex !== null && (
                <button
                  onClick={() => {
                    setDebugQuestIndex(null);
                    setDebugCompleted(false);
                    setActiveQuestView('today');
                  }}
                  className="px-3 py-2.5 rounded-xl font-medium text-xs text-red-500 border border-dashed border-red-200 hover:bg-red-50 transition-colors"
                  title="Debug: Reset to active quest"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
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
    </div>
  );
}
