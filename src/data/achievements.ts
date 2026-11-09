import { UserData } from '../context/AppContext';

export type AchievementTier = 'task' | 'goal' | 'challenge';
export type MilestoneCategory = 'all' | 'streaks' | 'quests' | 'rewards';

export interface AchievementNode {
  id: string;
  parentId: string | null;
  category: 'streaks' | 'quests' | 'rewards';
  title: string;
  description: string;
  icon: string; // Emoji or glyph
  tier: AchievementTier;
  x: number; // Grid coordinate X (e.g. 0, 1, 2, 3...)
  y: number; // Grid coordinate Y (e.g. 0, 1, 2...)
  starsReward: number;
  conditionDescription: string;
  isUnlocked: (userData: UserData) => boolean;
  getProgress: (userData: UserData) => { current: number; total: number; percent: number };
}

export const ACHIEVEMENTS_TREE: AchievementNode[] = [
  // ROOT
  {
    id: 'first_steps',
    parentId: null,
    category: 'quests',
    title: 'First Spark',
    description: 'Begin your journey by completing your very first daily micro-quest.',
    icon: '🌱',
    tier: 'task',
    x: 0,
    y: 2,
    starsReward: 5,
    conditionDescription: 'Complete at least 1 daily quest',
    isUnlocked: (u) => (u.completedDays || []).length >= 1,
    getProgress: (u) => {
      const current = Math.min(1, (u.completedDays || []).length);
      return { current, total: 1, percent: Math.round((current / 1) * 100) };
    },
  },

  // BRANCH A: STREAKS & MOMENTUM (Upwards)
  {
    id: 'streak_3',
    parentId: 'first_steps',
    category: 'streaks',
    title: 'Streak Starter',
    description: 'Build momentum: maintain an active streak of 3 consecutive days.',
    icon: '🔥',
    tier: 'task',
    x: 1,
    y: 1,
    starsReward: 10,
    conditionDescription: 'Reach a streak of 3 days',
    isUnlocked: (u) => u.streak >= 3 || u.longestStreak >= 3,
    getProgress: (u) => {
      const best = Math.max(u.streak, u.longestStreak);
      return { current: Math.min(3, best), total: 3, percent: Math.min(100, Math.round((best / 3) * 100)) };
    },
  },
  {
    id: 'streak_7',
    parentId: 'streak_3',
    category: 'streaks',
    title: 'Week of Wins',
    description: 'Achieve a 7-day unbroken quest streak. A full week of true consistency.',
    icon: '⚡',
    tier: 'goal',
    x: 2,
    y: 0,
    starsReward: 20,
    conditionDescription: 'Reach a 7-day streak',
    isUnlocked: (u) => u.streak >= 7 || u.longestStreak >= 7,
    getProgress: (u) => {
      const best = Math.max(u.streak, u.longestStreak);
      return { current: Math.min(7, best), total: 7, percent: Math.min(100, Math.round((best / 7) * 100)) };
    },
  },
  {
    id: 'streak_14',
    parentId: 'streak_7',
    category: 'streaks',
    title: 'Fortnight Titan',
    description: 'Forge an unstoppable 14-day streak. Habit formation complete.',
    icon: '💎',
    tier: 'challenge',
    x: 3,
    y: 0,
    starsReward: 35,
    conditionDescription: 'Reach a 14-day streak',
    isUnlocked: (u) => u.streak >= 14 || u.longestStreak >= 14,
    getProgress: (u) => {
      const best = Math.max(u.streak, u.longestStreak);
      return { current: Math.min(14, best), total: 14, percent: Math.min(100, Math.round((best / 14) * 100)) };
    },
  },
  {
    id: 'streak_30',
    parentId: 'streak_14',
    category: 'streaks',
    title: 'Monthly Legend',
    description: 'Maintain a 30-day streak. You operate on an entirely higher level of discipline.',
    icon: '👑',
    tier: 'challenge',
    x: 4,
    y: 0,
    starsReward: 50,
    conditionDescription: 'Reach a 30-day streak',
    isUnlocked: (u) => u.streak >= 30 || u.longestStreak >= 30,
    getProgress: (u) => {
      const best = Math.max(u.streak, u.longestStreak);
      return { current: Math.min(30, best), total: 30, percent: Math.min(100, Math.round((best / 30) * 100)) };
    },
  },

  // BRANCH B: VOLUME & VETERAN (Central Line)
  {
    id: 'quests_5',
    parentId: 'first_steps',
    category: 'quests',
    title: 'High Five',
    description: 'Complete 5 total quests across your adventure.',
    icon: '✋',
    tier: 'task',
    x: 1,
    y: 2,
    starsReward: 10,
    conditionDescription: 'Complete 5 total quests',
    isUnlocked: (u) => (u.completedDays || []).length >= 5,
    getProgress: (u) => {
      const c = (u.completedDays || []).length;
      return { current: Math.min(5, c), total: 5, percent: Math.min(100, Math.round((c / 5) * 100)) };
    },
  },
  {
    id: 'quests_15',
    parentId: 'quests_5',
    category: 'quests',
    title: 'Quest Conqueror',
    description: 'Overcome inertia with 15 completed quests in your lifetime.',
    icon: '🎯',
    tier: 'goal',
    x: 2,
    y: 2,
    starsReward: 25,
    conditionDescription: 'Complete 15 total quests',
    isUnlocked: (u) => (u.completedDays || []).length >= 15,
    getProgress: (u) => {
      const c = (u.completedDays || []).length;
      return { current: Math.min(15, c), total: 15, percent: Math.min(100, Math.round((c / 15) * 100)) };
    },
  },
  {
    id: 'quests_30',
    parentId: 'quests_15',
    category: 'quests',
    title: 'Habit Virtuoso',
    description: 'Reach 30 completed quests. Building a lasting lifestyle day by day.',
    icon: '🌟',
    tier: 'goal',
    x: 3,
    y: 2,
    starsReward: 40,
    conditionDescription: 'Complete 30 total quests',
    isUnlocked: (u) => (u.completedDays || []).length >= 30,
    getProgress: (u) => {
      const c = (u.completedDays || []).length;
      return { current: Math.min(30, c), total: 30, percent: Math.min(100, Math.round((c / 30) * 100)) };
    },
  },
  {
    id: 'quests_60',
    parentId: 'quests_30',
    category: 'quests',
    title: 'Dailyz Champion',
    description: 'Surpass 60 total completed quests. You are an unstoppable force of nature.',
    icon: '🏆',
    tier: 'challenge',
    x: 4,
    y: 2,
    starsReward: 75,
    conditionDescription: 'Complete 60 total quests',
    isUnlocked: (u) => (u.completedDays || []).length >= 60,
    getProgress: (u) => {
      const c = (u.completedDays || []).length;
      return { current: Math.min(60, c), total: 60, percent: Math.min(100, Math.round((c / 60) * 100)) };
    },
  },

  // BRANCH C: SHOP, WEALTH & FLAIR (Downwards)
  {
    id: 'wealth_25',
    parentId: 'first_steps',
    category: 'rewards',
    title: 'Pocket of Stars',
    description: 'Accumulate 25 total Stars in your wallet.',
    icon: '⭐',
    tier: 'task',
    x: 1,
    y: 3,
    starsReward: 10,
    conditionDescription: 'Hold at least 25 Stars',
    isUnlocked: (u) => u.points >= 25,
    getProgress: (u) => ({ current: Math.min(25, u.points), total: 25, percent: Math.min(100, Math.round((u.points / 25) * 100)) }),
  },
  {
    id: 'unlock_shop',
    parentId: 'wealth_25',
    category: 'rewards',
    title: 'Treat Yourself',
    description: 'Redeem your first item or style from the Rewards Shop.',
    icon: '🎁',
    tier: 'goal',
    x: 2,
    y: 3,
    starsReward: 15,
    conditionDescription: 'Redeem at least 1 reward from the shop',
    isUnlocked: (u) => (u.redeemedRewards || []).length > 0 || (u.unlockedRanks || []).length > 1 || (u.unlockedAvatars || []).length > 0 || (u.unlockedDecorations || []).length > 0,
    getProgress: (u) => {
      const count = (u.redeemedRewards || []).length;
      return { current: Math.min(1, count), total: 1, percent: count > 0 ? 100 : 0 };
    },
  },
  {
    id: 'prestige_rank',
    parentId: 'unlock_shop',
    category: 'rewards',
    title: 'Rising Rank',
    description: 'Equip an upgraded Prestige Rank above Novice on your profile.',
    icon: '🎖️',
    tier: 'goal',
    x: 3,
    y: 3,
    starsReward: 25,
    conditionDescription: 'Equip a custom or prestige rank',
    isUnlocked: (u) => u.rank !== 'Novice' || (u.unlockedRanks || []).length > 1,
    getProgress: (u) => {
      const done = u.rank !== 'Novice';
      return { current: done ? 1 : 0, total: 1, percent: done ? 100 : 0 };
    },
  },
  {
    id: 'grandmaster',
    parentId: 'prestige_rank',
    category: 'rewards',
    title: 'Star Tycoon',
    description: 'Accumulate 100 or more Stars in your vault.',
    icon: '💫',
    tier: 'challenge',
    x: 4,
    y: 3,
    starsReward: 50,
    conditionDescription: 'Accumulate 100+ total Stars',
    isUnlocked: (u) => u.points >= 100,
    getProgress: (u) => ({ current: Math.min(100, u.points), total: 100, percent: Math.min(100, Math.round((u.points / 100) * 100)) }),
  },

  // BRANCH D: CUSTOMIZATION & SPECIALS (Bottom / Top accents)
  {
    id: 'streak_freeze',
    parentId: 'first_steps',
    category: 'streaks',
    title: 'Safety Shield',
    description: 'Own or use a Streak Freeze to safeguard your hard-earned progress.',
    icon: '❄️',
    tier: 'task',
    x: 1,
    y: 4,
    starsReward: 10,
    conditionDescription: 'Own or use at least 1 Streak Freeze',
    isUnlocked: (u) => (u.streakFreezes || 0) > 0 || (u.usedStreakFreezes || []).length > 0,
    getProgress: (u) => {
      const active = (u.streakFreezes || 0) + (u.usedStreakFreezes || []).length;
      return { current: Math.min(1, active), total: 1, percent: active > 0 ? 100 : 0 };
    },
  },
  {
    id: 'avatar_custom',
    parentId: 'unlock_shop',
    category: 'rewards',
    title: 'Dressed to Impress',
    description: 'Equip a special avatar border, decoration, or custom profile picture.',
    icon: '✨',
    tier: 'goal',
    x: 3,
    y: 4,
    starsReward: 20,
    conditionDescription: 'Equip a custom profile picture, avatar or decoration',
    isUnlocked: (u) => Boolean(u.profileImage || u.activeAvatar || u.activeDecoration || u.pfpTag),
    getProgress: (u) => {
      const done = Boolean(u.profileImage || u.activeAvatar || u.activeDecoration || u.pfpTag);
      return { current: done ? 1 : 0, total: 1, percent: done ? 100 : 0 };
    },
  },
];
