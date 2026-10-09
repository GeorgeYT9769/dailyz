import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateStreaks, getTodayISO, getYesterdayISO } from '../utils/dateUtils';
import { getRandomInterestingName } from '../utils/nameGenerator';
import { updateSystemBars } from '../utils/statusBar';
import { scheduleDailyReminder } from '../utils/notificationUtils';
import rewardsData from '../data/rewards.json';
import questsData from '../data/quests.json';

export type Reward = {
  id: string;
  title: string;
  cost: number;
};

export type UserData = {
  completedDays: string[];
  points: number;
  streak: number;
  longestStreak: number;
  redeemedRewards: Reward[];
  theme: "light" | "dark";
  accentColor: string;
  vibrationEnabled: boolean;
  profileImage: string | null;
  name: string;
  rank: string;
  hasCustomRankUnlock: boolean;
  unlockedRanks: string[];
  unlockedDecorations: string[];
  unlockedAvatars: string[];
  activeDecoration: string | null;
  activeAvatar: string | null;
  pfpTag: string | null;
  hasCustomPfpTagUnlock: boolean;
  hasSeenOnboarding?: boolean;
  streakFreezes: number;
  usedStreakFreezes: string[];
  lastBrokenStreak: { count: number; brokenDate: string } | null;
  lastFreeRerollDate?: string;
  currentRolledQuest?: {
    id: number;
    quest: string;
    difficulty: string;
    reward: number;
    category?: string;
    dateIso: string;
  } | null;
  notificationsEnabled: boolean;
  notificationTime: string;
  nextDayQuest?: {
    id?: number;
    quest: string;
    difficulty: string;
    reward: number;
    dateIso: string;
  } | null;
};

interface AppContextType {
  userData: UserData;
  isLoaded: boolean;
  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  completeQuest: (reward: number, dateIso: string, force?: boolean) => void;
  redeemReward: (id: string, customValue?: string) => void;
  updateSettings: (settings: Partial<UserData>) => void;
  importData: (data: UserData) => void;
  useStreakFreeze: (dateIso?: string) => boolean;
  recoverStreak: () => { success: boolean; message: string };
  buyStreakFreeze: (count?: number, cost?: number) => boolean;
  rerollQuest: () => { success: boolean; isFree: boolean; message: string; quest?: any };
}

const defaultUserData: UserData = {
  completedDays: [],
  points: 0,
  streak: 0,
  longestStreak: 0,
  redeemedRewards: [],
  theme: "dark",
  accentColor: "#3b82f6",
  vibrationEnabled: true,
  profileImage: null,
  name: "Cosmic Wanderer",
  rank: "Novice",
  hasCustomRankUnlock: false,
  unlockedRanks: ["Novice"],
  unlockedDecorations: [],
  unlockedAvatars: [],
  activeDecoration: null,
  activeAvatar: null,
  pfpTag: null,
  hasCustomPfpTagUnlock: false,
  hasSeenOnboarding: false,
  streakFreezes: 1, // 1 complimentary starter streak freeze
  usedStreakFreezes: [],
  lastBrokenStreak: null,
  lastFreeRerollDate: undefined,
  currentRolledQuest: null,
  notificationsEnabled: false,
  notificationTime: "09:00",
  nextDayQuest: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(() => {
    const saved = localStorage.getItem('dailyQuestsUserData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const usedFreezes = parsed.usedStreakFreezes || [];
        const streaks = calculateStreaks(parsed.completedDays || [], usedFreezes);
        const initialName = (!parsed.name || parsed.name === 'Adventurer')
          ? getRandomInterestingName()
          : parsed.name;
        
        const streakFreezesCount = typeof parsed.streakFreezes === 'number' ? parsed.streakFreezes : 1;

        return { 
          ...defaultUserData, 
          ...parsed, 
          name: initialName, 
          streak: streaks.current, 
          longestStreak: streaks.longest,
          streakFreezes: streakFreezesCount,
          usedStreakFreezes: usedFreezes,
          lastBrokenStreak: parsed.lastBrokenStreak || null,
          notificationsEnabled: parsed.notificationsEnabled ?? false,
          notificationTime: parsed.notificationTime || "09:00",
          hasSeenOnboarding: parsed.hasSeenOnboarding ?? false,
        };
      } catch (e) {
        return { ...defaultUserData, name: getRandomInterestingName() };
      }
    }
    return { ...defaultUserData, name: getRandomInterestingName() };
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    // Trigger onboarding automatically on initial launch if not completed yet
    if (isLoaded && !userData.hasSeenOnboarding) {
      setIsOnboardingOpen(true);
    }
  }, [isLoaded, userData.hasSeenOnboarding]);

  const openOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
    setUserData(prev => ({ ...prev, hasSeenOnboarding: true }));
  };

  useEffect(() => {
    localStorage.setItem('dailyQuestsUserData', JSON.stringify(userData));
    const isDark = userData.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#111827';
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#f9fafb';
      document.documentElement.style.colorScheme = 'light';
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', isDark ? '#111827' : '#f9fafb');
    }
    document.documentElement.style.setProperty('--accent-color', userData.accentColor);

    // Sync native status bar & navigation bar colors on Android / Capacitor
    updateSystemBars(isDark);

    // Mark initial loading and hydration as finished
    if (!isLoaded) {
      setIsLoaded(true);
    }
  }, [userData, isLoaded]);

  useEffect(() => {
    // Schedule or cancel native/web local notification reminder when settings update
    if (isLoaded) {
      scheduleDailyReminder(userData.notificationTime || "09:00", userData.notificationsEnabled || false);
    }
  }, [userData.notificationsEnabled, userData.notificationTime, isLoaded]);

  const completeQuest = (reward: number, dateIso: string, force: boolean = false) => {
    setUserData(prev => {
      const isAlreadyCompleted = prev.completedDays.includes(dateIso);
      if (isAlreadyCompleted && !force) return prev;
      
      const newCompleted = isAlreadyCompleted ? prev.completedDays : [...prev.completedDays, dateIso];
      const streaks = calculateStreaks(newCompleted, prev.usedStreakFreezes || []);
      return {
        ...prev,
        completedDays: newCompleted,
        points: prev.points + reward,
        streak: streaks.current,
        longestStreak: streaks.longest,
        lastBrokenStreak: null, // Clear broken streak once a new day is completed
      };
    });
  };

  const useStreakFreeze = (dateIso?: string): boolean => {
    const targetDate = dateIso || getYesterdayISO();
    if (userData.streakFreezes <= 0) return false;
    if (userData.usedStreakFreezes.includes(targetDate) || userData.completedDays.includes(targetDate)) return false;

    setUserData(prev => {
      const newUsedFreezes = [...prev.usedStreakFreezes, targetDate];
      const streaks = calculateStreaks(prev.completedDays, newUsedFreezes);
      return {
        ...prev,
        streakFreezes: Math.max(0, prev.streakFreezes - 1),
        usedStreakFreezes: newUsedFreezes,
        streak: streaks.current,
        longestStreak: Math.max(prev.longestStreak, streaks.longest),
        lastBrokenStreak: null,
      };
    });
    return true;
  };

  const recoverStreak = (): { success: boolean; message: string } => {
    const broken = userData.lastBrokenStreak;
    if (!broken || broken.count <= 0) {
      return { success: false, message: 'No broken streak available to recover.' };
    }

    const RECOVERY_COST = 15;
    const canPayWithStars = userData.points >= RECOVERY_COST;
    const hasFreeze = userData.streakFreezes > 0;

    if (!canPayWithStars && !hasFreeze) {
      return { success: false, message: `Need ${RECOVERY_COST} Stars or 1 Streak Freeze to recover streak.` };
    }

    setUserData(prev => {
      const targetDate = broken.brokenDate || getYesterdayISO();
      const newUsedFreezes = prev.usedStreakFreezes.includes(targetDate) 
        ? prev.usedStreakFreezes 
        : [...prev.usedStreakFreezes, targetDate];

      let newPoints = prev.points;
      let newFreezes = prev.streakFreezes;

      if (hasFreeze) {
        newFreezes -= 1;
      } else {
        newPoints -= RECOVERY_COST;
      }

      const streaks = calculateStreaks(prev.completedDays, newUsedFreezes);
      const restoredCurrent = Math.max(streaks.current, broken.count);

      return {
        ...prev,
        points: newPoints,
        streakFreezes: newFreezes,
        usedStreakFreezes: newUsedFreezes,
        streak: restoredCurrent,
        longestStreak: Math.max(prev.longestStreak, restoredCurrent),
        lastBrokenStreak: null,
      };
    });

    return { success: true, message: `Streak of ${broken.count} days successfully restored! 🔥` };
  };

  const buyStreakFreeze = (count: number = 1, cost: number = 25): boolean => {
    if (userData.points < cost) return false;
    setUserData(prev => ({
      ...prev,
      points: prev.points - cost,
      streakFreezes: prev.streakFreezes + count,
    }));
    return true;
  };

  const rerollQuest = (): { success: boolean; isFree: boolean; message: string; quest?: any } => {
    const today = getTodayISO();
    const isFree = userData.lastFreeRerollDate !== today;

    if (!isFree && userData.points < 5) {
      return { success: false, isFree: false, message: 'You need 5 stars to reroll again today.' };
    }

    // Pick a new quest different from the current rolled/base quest
    const currentId = userData.currentRolledQuest?.id;
    const candidatePool = questsData.filter(q => q.id !== currentId);
    const chosen = candidatePool[Math.floor(Math.random() * candidatePool.length)] || questsData[0];

    const rolled = {
      id: chosen.id,
      quest: chosen.quest.replace(/\(Day \d+\)/, '').trim(),
      difficulty: chosen.difficulty,
      reward: chosen.reward,
      category: (chosen as any).category || 'Mind & Focus',
      dateIso: today,
    };

    setUserData(prev => ({
      ...prev,
      points: isFree ? prev.points : prev.points - 5,
      lastFreeRerollDate: isFree ? today : prev.lastFreeRerollDate,
      currentRolledQuest: rolled,
    }));

    return { 
      success: true, 
      isFree, 
      quest: rolled,
      message: isFree ? 'Free daily reroll used! New quest rolled 🎲' : 'Rerolled quest for 5 Stars 🎲'
    };
  };

  const redeemReward = (id: string, customValue?: string) => {
    setUserData(prev => {
      const reward = (rewardsData as any[]).find(r => r.id === id);
      if (!reward || prev.points < reward.cost) return prev;

      let newState = {
        ...prev,
        points: prev.points - reward.cost,
        redeemedRewards: [...prev.redeemedRewards, reward]
      };

      if (reward.type === 'freeze') {
        newState.streakFreezes = (prev.streakFreezes || 0) + 1;
      } else if (reward.type === 'freeze_pack') {
        newState.streakFreezes = (prev.streakFreezes || 0) + 3;
      } else if (reward.type === 'recovery_token') {
        // If broken streak exists, automatically repair it
        if (prev.lastBrokenStreak) {
          const targetDate = prev.lastBrokenStreak.brokenDate || getYesterdayISO();
          newState.usedStreakFreezes = [...prev.usedStreakFreezes, targetDate];
          const streaks = calculateStreaks(prev.completedDays, newState.usedStreakFreezes);
          newState.streak = Math.max(streaks.current, prev.lastBrokenStreak.count);
          newState.longestStreak = Math.max(prev.longestStreak, newState.streak);
          newState.lastBrokenStreak = null;
        } else {
          // Store an extra freeze as token
          newState.streakFreezes = (prev.streakFreezes || 0) + 1;
        }
      } else if (reward.type === 'rank') {
        newState.rank = reward.value;
        if (!newState.unlockedRanks.includes(reward.value)) {
          newState.unlockedRanks = [...newState.unlockedRanks, reward.value];
        }
      } else if (reward.type === 'rank_custom') {
        newState.hasCustomRankUnlock = true;
        if (customValue) {
          newState.rank = customValue;
          if (!newState.unlockedRanks.includes(customValue)) {
            newState.unlockedRanks = [...newState.unlockedRanks, customValue];
          }
        }
      } else if (reward.type === 'decoration') {
        newState.activeDecoration = reward.value;
        if (!newState.unlockedDecorations.includes(reward.value)) {
          newState.unlockedDecorations = [...newState.unlockedDecorations, reward.value];
        }
      } else if (reward.type === 'avatar') {
        newState.activeAvatar = reward.value;
        if (!newState.unlockedAvatars.includes(reward.value)) {
          newState.unlockedAvatars = [...newState.unlockedAvatars, reward.value];
        }
      } else if (reward.type === 'pfp_tag') {
        newState.pfpTag = reward.value;
      } else if (reward.type === 'pfp_tag_custom') {
        newState.hasCustomPfpTagUnlock = true;
        if (customValue) {
          newState.pfpTag = customValue;
        }
      }

      return newState;
    });
  };

  const updateSettings = (settings: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...settings }));
  };

  const importData = (data: UserData) => {
    const streaks = calculateStreaks(data.completedDays || [], data.usedStreakFreezes || []);
    setUserData({ ...defaultUserData, ...data, streak: streaks.current, longestStreak: streaks.longest });
  };

  return (
    <AppContext.Provider value={{ 
      userData, 
      isLoaded, 
      isOnboardingOpen, 
      openOnboarding, 
      closeOnboarding, 
      completeQuest, 
      redeemReward, 
      updateSettings, 
      importData,
      useStreakFreeze,
      recoverStreak,
      buyStreakFreeze,
      rerollQuest,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
