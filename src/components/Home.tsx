import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getDayOfYear, getTodayISO, getTomorrowISO } from '../utils/dateUtils';
import questsData from '../data/quests.json';
import { Flame, Star, CheckCircle, Gift, RefreshCw, Calendar, Lock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Lottie from 'lottie-react';
import StreakModal from './StreakModal';

// 💡 CUSTOM LOTTIE ANIMATION:
// To use your own Lottie animation, replace the 'successLottie' object below 
// with the contents of your Lottie JSON file.
const successLottie = {"v":"4.10.1","fr":30,"ip":0,"op":40,"w":80,"h":80,"nm":"Success Checkmark","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"Check Mark","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[40,40,0],"ix":2},"a":{"a":0,"k":[-1.312,6,0],"ix":1},"s":{"a":0,"k":[100,100,100],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0]],"v":[[-15.75,8],[-8,16],[13.125,-4]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"tm","s":{"a":1,"k":[{"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"n":["0p667_1_0p333_0"],"t":25,"s":[0],"e":[100]},{"t":33}],"ix":1},"e":{"a":0,"k":0,"ix":2},"o":{"a":0,"k":0,"ix":3},"m":1,"ix":2,"nm":"Trim Paths 1","mn":"ADBE Vector Filter - Trim","hd":false},{"ty":"st","c":{"a":0,"k":[1,1,1,1],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":3,"ix":5},"lc":2,"lj":2,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Shape 1","np":3,"cix":2,"ix":1,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":40,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"Circle Flash","sr":1,"ks":{"o":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":25,"s":[0],"e":[98]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":30,"s":[98],"e":[0]},{"t":38}],"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[40,40,0],"ix":2},"a":{"a":0,"k":[0,0,0],"ix":1},"s":{"a":1,"k":[{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"n":["0p667_1_0p333_0","0p667_1_0p333_0","0p667_1_0p333_0"],"t":25,"s":[0,0,100],"e":[100,100,100]},{"t":30}],"ix":6}},"ao":0,"shapes":[{"d":1,"ty":"el","s":{"a":0,"k":[64,64],"ix":2},"p":{"a":0,"k":[0,0],"ix":3},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse","hd":false},{"ty":"fl","c":{"a":0,"k":[0.529866635799,0.961458325386,0.448091417551,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false}],"ip":0,"op":40,"st":0,"bm":0},{"ddd":0,"ind":3,"ty":4,"nm":"Circle Stroke","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[39.022,39.022,0],"ix":2},"a":{"a":0,"k":[0,0,0],"ix":1},"s":{"a":1,"k":[{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"n":["0p667_1_0p333_0","0p667_1_0p333_0","0p667_1_0p333_0"],"t":16,"s":[100,100,100],"e":[80,80,100]},{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"n":["0p667_1_0p333_0","0p667_1_0p333_0","0p667_1_0p333_0"],"t":22,"s":[80,80,100],"e":[120,120,100]},{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"n":["0p667_1_0p333_0","0p667_1_0p333_0","0p667_1_0p333_0"],"t":25,"s":[120,120,100],"e":[100,100,100]},{"t":29}],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[60,60],"ix":2},"p":{"a":0,"k":[0,0],"ix":3},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse","hd":false},{"ty":"tm","s":{"a":1,"k":[{"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"n":["0p667_1_0p333_0"],"t":0,"s":[0],"e":[100]},{"t":16}],"ix":1},"e":{"a":0,"k":0,"ix":2},"o":{"a":0,"k":0,"ix":3},"m":1,"ix":2,"nm":"Trim Paths 1","mn":"ADBE Vector Filter - Trim","hd":false},{"ty":"st","c":{"a":0,"k":[0.427450984716,0.800000011921,0.35686275363,1],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":3,"ix":5},"lc":2,"lj":2,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tr","p":{"a":0,"k":[0.978,0.978],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Ellipse 1","np":3,"cix":2,"ix":1,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":40,"st":0,"bm":0},{"ddd":0,"ind":4,"ty":4,"nm":"Circle Green Fill","sr":1,"ks":{"o":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":21,"s":[0],"e":[98]},{"t":28}],"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[40,40,0],"ix":2},"a":{"a":0,"k":[0,0,0],"ix":1},"s":{"a":1,"k":[{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"n":["0p667_1_0p333_0","0p667_1_0p333_0","0p667_1_0p333_0"],"t":21,"s":[0,0,100],"e":[100,100,100]},{"t":28}],"ix":6}},"ao":0,"shapes":[{"d":1,"ty":"el","s":{"a":0,"k":[64,64],"ix":2},"p":{"a":0,"k":[0,0],"ix":3},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse","hd":false},{"ty":"fl","c":{"a":0,"k":[0.427450984716,0.800000011921,0.35686275363,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false}],"ip":0,"op":40,"st":0,"bm":0}]};

export default function Home() {
  const { userData, completeQuest, updateSettings } = useAppContext();
  const [isCompleted, setIsCompleted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [debugQuestIndex, setDebugQuestIndex] = useState<number | null>(null);
  const [debugCompleted, setDebugCompleted] = useState(false);
  // Debug tools are hidden from normal release; active only via ?debug=true in URL or localStorage 'dailyz_debug'
  const [showDebugTools, setShowDebugTools] = useState(false);

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

  // If a quest was unlocked/generated for today, use it; otherwise fall back to standard daily scheduled quest
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

    if (userData.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([40, 30, 60]);
    }

    updateSettings({
      points: userData.points - 20,
      nextDayQuest: generatedQuest,
    });
  };

  useEffect(() => {
    if (debugQuestIndex === null) {
      setIsCompleted(userData.completedDays.includes(todayISO));
    } else {
      setIsCompleted(debugCompleted);
    }
  }, [userData.completedDays, todayISO, debugQuestIndex, debugCompleted]);

  const handleComplete = () => {
    const isDebug = debugQuestIndex !== null;
    completeQuest(todayQuest.reward, todayISO, isDebug);
    
    if (isDebug) {
      setDebugCompleted(true);
    }

    if (userData.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 2000);
  };

  const handleReroll = () => {
    const randomIndex = Math.floor(Math.random() * questsData.length);
    setDebugQuestIndex(randomIndex);
    setDebugCompleted(false);
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800',
  };

  return (
    <div className="animate-pop">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Hey, {userData.name}!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Your daily adventure awaits</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Streak pill: flame and number */}
          <button
            onClick={() => setShowStreakModal(true)}
            className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title="View Streak Map"
            aria-label="View Streak Map"
          >
            <Flame className="text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" size={16} />
            <span className="font-bold text-sm text-gray-800 dark:text-gray-100">{userData.streak}</span>
          </button>

          {/* Stars pill */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
            <Star className="text-yellow-400 fill-yellow-400" size={16} />
            <span className="font-bold text-sm text-gray-800 dark:text-gray-100">{userData.points}</span>
          </div>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        <AnimatePresence>
          {showAnimation && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-accent/10 flex items-center justify-center z-10 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl flex flex-col items-center"
              >
                <div className="w-24 h-24 mb-2">
                  <Lottie animationData={successLottie} loop={false} />
                </div>
                <span className="font-bold text-xl">Quest Completed!</span>
                <span className="text-accent font-medium mt-1" style={{ color: 'var(--accent-color)' }}>+{todayQuest.reward} Points</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-start mb-4">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Today's Quest
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${difficultyColors[todayQuest.difficulty as keyof typeof difficultyColors]}`}>
            {todayQuest.difficulty.toUpperCase()}
          </span>
        </div>

        <h2 className="text-2xl font-bold mb-6 leading-tight">
          {todayQuest.quest}
        </h2>

        <div className="flex items-center gap-2 mb-8 text-gray-600 dark:text-gray-300 font-medium">
          <Gift size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} />
          <span>Reward: {todayQuest.reward} {todayQuest.reward === 1 ? 'Point' : 'Points'}</span>
        </div>

        <button
          onClick={handleComplete}
          disabled={isCompleted}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 ${
            isCompleted 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
              : 'bg-accent text-white shadow-lg shadow-accent/30 hover:opacity-90'
          }`}
          style={!isCompleted ? { backgroundColor: 'var(--accent-color)' } : {}}
        >
          {isCompleted ? 'Completed' : 'Complete Quest'}
        </button>

        {showDebugTools && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleReroll}
              className="flex-1 py-3 rounded-xl font-medium text-sm text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              title="Debug: Reroll Daily Quest"
            >
              <RefreshCw size={16} />
              Reroll (Dev)
            </button>
            {debugQuestIndex !== null && (
              <button
                onClick={() => {
                  setDebugQuestIndex(null);
                  setDebugCompleted(false);
                }}
                className="px-4 py-3 rounded-xl font-medium text-sm text-red-500 border border-dashed border-red-200 hover:bg-red-50 transition-colors"
                title="Debug: Reset to today's active quest"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Next Day Quest Card */}
      <div className="mt-4 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden transition-all">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} className="text-accent" style={{ color: 'var(--accent-color)' }} />
              Tomorrow's Quest
            </span>
            {isTomorrowUnlocked && (
              <span className="text-[10px] bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} />
                Unlocked
              </span>
            )}
          </div>
          
          {isTomorrowUnlocked && tomorrowQuest ? (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${difficultyColors[tomorrowQuest.difficulty as keyof typeof difficultyColors]}`}>
              {tomorrowQuest.difficulty.toUpperCase()}
            </span>
          ) : (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <Lock size={11} />
              LOCKED
            </span>
          )}
        </div>

        {/* Quest Content: Unblurred or Blurred */}
        {isTomorrowUnlocked && tomorrowQuest ? (
          <motion.div
            initial={{ filter: 'blur(10px)', opacity: 0.3 }}
            animate={{ filter: 'blur(0px)', opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <h3 className="text-xl font-bold mb-4 leading-tight text-gray-800 dark:text-gray-100">
              {tomorrowQuest.quest}
            </h3>

            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 font-medium">
              <div className="flex items-center gap-2">
                <Gift size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} />
                <span>Reward: {tomorrowQuest.reward} {tomorrowQuest.reward === 1 ? 'Point' : 'Points'}</span>
              </div>
              <span className="text-xs text-gray-400 font-normal italic">Activates tomorrow</span>
            </div>
          </motion.div>
        ) : (
          <div>
            {/* Blurred Mystery Text */}
            <div className="relative py-1 select-none filter blur-md opacity-35 dark:opacity-25 pointer-events-none transition-all duration-500">
              <h3 className="text-xl font-bold mb-3 leading-tight">
                Undertake an intentional mindfulness exercise outdoors and capture a rare moment of clarity today.
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Gift size={16} />
                <span>Reward: 2 Points</span>
              </div>
            </div>

            {/* Unlock Action Row */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Sparkles size={14} className="text-amber-500 shrink-0" />
                <span>Preview and generate tomorrow's quest early</span>
              </div>

              <button
                onClick={handleUnlockTomorrow}
                disabled={userData.points < 20}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                  userData.points >= 20
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 cursor-pointer'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                <Star size={14} className="text-yellow-200 fill-yellow-200" />
                <span>{userData.points >= 20 ? 'Unlock (20 Stars)' : 'Need 20 Stars'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

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
