import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateStreaks } from '../utils/dateUtils';
import { getRandomInterestingName } from '../utils/nameGenerator';
import rewardsData from '../data/rewards.json';

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
  completeQuest: (reward: number, dateIso: string, force?: boolean) => void;
  redeemReward: (id: string, customValue?: string) => void;
  updateSettings: (settings: Partial<UserData>) => void;
  importData: (data: UserData) => void;
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
  nextDayQuest: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(() => {
    const saved = localStorage.getItem('dailyQuestsUserData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const streaks = calculateStreaks(parsed.completedDays || []);
        // If name is unset or the old generic default "Adventurer", generate a fresh interesting name
        const initialName = (!parsed.name || parsed.name === 'Adventurer')
          ? getRandomInterestingName()
          : parsed.name;
        return { 
          ...defaultUserData, 
          ...parsed, 
          name: initialName, 
          streak: streaks.current, 
          longestStreak: streaks.longest 
        };
      } catch (e) {
        return { ...defaultUserData, name: getRandomInterestingName() };
      }
    }
    return { ...defaultUserData, name: getRandomInterestingName() };
  });

  useEffect(() => {
    localStorage.setItem('dailyQuestsUserData', JSON.stringify(userData));
    if (userData.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.style.setProperty('--accent-color', userData.accentColor);
  }, [userData]);

  const completeQuest = (reward: number, dateIso: string, force: boolean = false) => {
    setUserData(prev => {
      const isAlreadyCompleted = prev.completedDays.includes(dateIso);
      if (isAlreadyCompleted && !force) return prev;
      
      const newCompleted = isAlreadyCompleted ? prev.completedDays : [...prev.completedDays, dateIso];
      const streaks = calculateStreaks(newCompleted);
      return {
        ...prev,
        completedDays: newCompleted,
        points: prev.points + reward,
        streak: streaks.current,
        longestStreak: streaks.longest
      };
    });
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

      if (reward.type === 'rank') {
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
    const streaks = calculateStreaks(data.completedDays || []);
    setUserData({ ...defaultUserData, ...data, streak: streaks.current, longestStreak: streaks.longest });
  };

  return (
    <AppContext.Provider value={{ userData, completeQuest, redeemReward, updateSettings, importData }}>
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
