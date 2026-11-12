import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Trophy,
  Star,
  CheckCircle2,
  Lock,
  Sparkles,
  Flame,
  Target,
  Gift,
  LayoutGrid,
  GitCommit,
  Check
} from 'lucide-react';
import { UserData } from '../context/AppContext';
import { ACHIEVEMENTS_TREE, AchievementNode, MilestoneCategory } from '../data/achievements';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audioEffects';

interface MilestonesScreenProps {
  onBack: () => void;
  userData: UserData;
}

export default function MilestonesScreen({ onBack, userData }: MilestonesScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<MilestoneCategory>('all');
  const [selectedNode, setSelectedNode] = useState<AchievementNode | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'journey'>('cards');

  const stats = useMemo(() => {
    const unlocked = ACHIEVEMENTS_TREE.filter((node) => node.isUnlocked(userData));
    const total = ACHIEVEMENTS_TREE.length;
    const earnedStars = unlocked.reduce((acc, curr) => acc + curr.starsReward, 0);
    const totalStars = ACHIEVEMENTS_TREE.reduce((acc, curr) => acc + curr.starsReward, 0);
    const percent = Math.round((unlocked.length / total) * 100);
    return {
      unlockedCount: unlocked.length,
      totalCount: total,
      earnedStars,
      totalStars,
      percent,
    };
  }, [userData]);

  const filteredMilestones = useMemo(() => {
    if (selectedCategory === 'all') return ACHIEVEMENTS_TREE;
    return ACHIEVEMENTS_TREE.filter((node) => node.category === selectedCategory);
  }, [selectedCategory]);

  const categoryCounts = useMemo(() => {
    return {
      all: ACHIEVEMENTS_TREE.length,
      streaks: ACHIEVEMENTS_TREE.filter((n) => n.category === 'streaks').length,
      quests: ACHIEVEMENTS_TREE.filter((n) => n.category === 'quests').length,
      rewards: ACHIEVEMENTS_TREE.filter((n) => n.category === 'rewards').length,
    };
  }, []);

  const handleSelectCard = (node: AchievementNode) => {
    const isUnlocked = node.isUnlocked(userData);
    triggerHaptic(isUnlocked ? 'medium' : 'light', userData.vibrationEnabled);
    playSound(isUnlocked ? 'complete' : 'pop', userData.soundEnabled ?? true);
    setSelectedNode(selectedNode?.id === node.id ? null : node);
  };

  return (
    <div className="pb-12 text-gray-900 dark:text-gray-100 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <header className="pt-1 pb-4 flex items-center justify-between gap-3 border-b border-gray-200/80 dark:border-gray-800/80 mb-5">
        <button
          onClick={() => {
            triggerHaptic('light', userData.vibrationEnabled);
            playSound('pop', userData.soundEnabled ?? true);
            onBack();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 -ml-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer active:scale-95"
          aria-label="Back to Profile"
        >
          <ArrowLeft size={16} />
          <span>Profile</span>
        </button>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-gray-200/70 dark:bg-gray-800/80 rounded-xl border border-gray-300/40 dark:border-gray-700/60 text-xs">
            <button
              onClick={() => {
                triggerHaptic('light', userData.vibrationEnabled);
                playSound('pop', userData.soundEnabled ?? true);
                setViewMode('cards');
              }}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              title="Cards List View"
              aria-label="Cards List View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => {
                triggerHaptic('light', userData.vibrationEnabled);
                playSound('pop', userData.soundEnabled ?? true);
                setViewMode('journey');
              }}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'journey'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              title="Journey Roadmap View"
              aria-label="Journey Roadmap View"
            >
              <GitCommit size={15} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/60 dark:border-amber-700/60 rounded-xl text-amber-700 dark:text-amber-300 text-xs font-bold">
            <Trophy size={13} className="text-amber-500" />
            <span>{stats.unlockedCount}/{stats.totalCount}</span>
          </div>
        </div>
      </header>

      {/* Hero Overview Card */}
      <section className="bg-gray-100/90 dark:bg-gray-800 rounded-2xl p-5 border border-gray-200/90 dark:border-gray-700 shadow-sm mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-black tracking-wider uppercase text-gray-500 dark:text-gray-400">
              Quest Progression
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight mt-0.5">
              Milestones
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-1">
              Unlock lifelong habit badges and earn bonus Stars along the way.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-2xl shadow-md shadow-orange-500/20 shrink-0">
            🏆
          </div>
        </div>

        {/* Progress Bar & Summary Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-gray-800 dark:text-gray-200">
              {stats.unlockedCount} of {stats.totalCount} completed ({stats.percent}%)
            </span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Star size={12} className="fill-amber-400 text-amber-500" />
              <span>+{stats.earnedStars} / {stats.totalStars} Stars</span>
            </span>
          </div>

          <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-300/60 dark:border-gray-600/60">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${stats.percent}%`,
                backgroundColor: 'var(--accent-color, #6366f1)',
              }}
            />
          </div>
        </div>
      </section>

      {/* Category Segmented Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-gray-200/60 dark:bg-gray-800/60 rounded-xl mb-6 overflow-x-auto no-scrollbar">
        {[
          { key: 'all' as MilestoneCategory, label: 'All', count: categoryCounts.all, icon: Sparkles },
          { key: 'streaks' as MilestoneCategory, label: 'Streaks', count: categoryCounts.streaks, icon: Flame },
          { key: 'quests' as MilestoneCategory, label: 'Quests', count: categoryCounts.quests, icon: Target },
          { key: 'rewards' as MilestoneCategory, label: 'Vault', count: categoryCounts.rewards, icon: Gift },
        ].map((tab) => {
          const isActive = selectedCategory === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                triggerHaptic('light', userData.vibrationEnabled);
                playSound('pop', userData.soundEnabled ?? true);
                setSelectedCategory(tab.key);
              }}
              className={`flex-1 min-w-[70px] py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={13} className={isActive ? 'text-accent' : 'opacity-70'} style={isActive ? { color: 'var(--accent-color)' } : {}} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                isActive
                  ? 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content: Cards View or Journey View */}
      {viewMode === 'cards' ? (
        <div className="space-y-3">
          {filteredMilestones.map((node) => {
            const isUnlocked = node.isUnlocked(userData);
            const progress = node.getProgress(userData);
            const isSelected = selectedNode?.id === node.id;

            return (
              <div
                key={node.id}
                onClick={() => handleSelectCard(node)}
                className={`bg-gray-100/90 dark:bg-gray-800 rounded-2xl p-4 border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-accent shadow-md ring-2 ring-accent/20'
                    : isUnlocked
                    ? 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    : 'border-gray-200/70 dark:border-gray-700/70 opacity-90 hover:opacity-100'
                }`}
                style={isSelected ? { borderColor: 'var(--accent-color)' } : {}}
              >
                <div className="flex items-start gap-3.5">
                  {/* Milestone Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border transition-all ${
                      isUnlocked
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 shadow-xs'
                        : 'bg-gray-200 dark:bg-gray-700/80 border-gray-300 dark:border-gray-600 text-gray-400 grayscale'
                    }`}
                  >
                    {node.icon}
                  </div>

                  {/* Body Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-black text-sm text-gray-900 dark:text-white truncate">
                          {node.title}
                        </h3>
                        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {node.tier}
                        </span>
                      </div>

                      {/* Reward Chip */}
                      <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        <Star size={11} className="fill-amber-400 text-amber-500" />
                        <span>+{node.starsReward}</span>
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 font-normal mt-0.5 leading-snug">
                      {node.description}
                    </p>

                    {/* Progress Bar & Status */}
                    <div className="mt-3 pt-2.5 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                          <span className="truncate pr-2 font-medium">{node.conditionDescription}</span>
                          <span className="font-bold shrink-0">{progress.current}/{progress.total}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${progress.percent}%`,
                              backgroundColor: isUnlocked ? '#10b981' : 'var(--accent-color, #6366f1)',
                            }}
                          />
                        </div>
                      </div>

                      <div className="shrink-0 pl-1">
                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={13} />
                            <span>Done</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                            <Lock size={12} />
                            <span>{progress.percent > 0 ? `${progress.percent}%` : 'Locked'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Card Details (Only when tapped) */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3.5 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs space-y-2 bg-white/70 dark:bg-gray-900/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 font-medium">
                          <span>Milestone Reward:</span>
                          <span className="font-black text-amber-600 dark:text-amber-400">
                            +{node.starsReward} Stars added to wallet
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 font-medium">
                          <span>Status:</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">
                            {isUnlocked ? 'Unlocked & Claimed' : `${progress.total - progress.current} steps remaining`}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        /* Journey Roadmap View: Clean, vertical connected timeline */
        <div className="relative pl-6 py-2 space-y-6">
          {/* Vertical connecting line */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-800 -translate-x-1/2" />

          {filteredMilestones.map((node, index) => {
            const isUnlocked = node.isUnlocked(userData);
            const progress = node.getProgress(userData);

            return (
              <div
                key={node.id}
                onClick={() => handleSelectCard(node)}
                className="relative flex items-start gap-4 cursor-pointer group"
              >
                {/* Node Dot / Glyph on the line */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black z-10 shrink-0 transition-transform group-hover:scale-110 shadow-xs ${
                    isUnlocked
                      ? 'bg-emerald-500 text-white ring-4 ring-white dark:ring-gray-900'
                      : progress.percent > 0
                      ? 'bg-accent text-white ring-4 ring-white dark:ring-gray-900'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-4 ring-white dark:ring-gray-900'
                  }`}
                  style={progress.percent > 0 && !isUnlocked ? { backgroundColor: 'var(--accent-color)' } : {}}
                >
                  {isUnlocked ? (
                    <Check size={14} className="stroke-[3]" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Milestone Node Card */}
                <div className={`flex-1 bg-gray-100/90 dark:bg-gray-800 rounded-2xl p-4 border transition-all ${
                  isUnlocked
                    ? 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-xs'
                    : 'border-gray-200/70 dark:border-gray-700/70 opacity-80'
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{node.icon}</span>
                      <h4 className="font-black text-sm text-gray-900 dark:text-white">
                        {node.title}
                      </h4>
                    </div>

                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Star size={11} className="fill-amber-400 text-amber-500" />
                      <span>+{node.starsReward}</span>
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {node.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    <span>{node.conditionDescription}</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">{progress.current}/{progress.total}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
