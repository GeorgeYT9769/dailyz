import { Capacitor, registerPlugin } from '@capacitor/core';
import { getDayOfYear, getTodayISO } from './dateUtils';
import questsData from '../data/quests.json';

export interface WidgetSyncData {
  questTitle: string;
  difficulty: string;
  reward: number;
  streak: number;
  stars: number;
  isCompleted: boolean;
}

interface DailyzWidgetPlugin {
  updateWidgetData(options: WidgetSyncData): Promise<{ success: boolean }>;
}

const DailyzWidget = registerPlugin<DailyzWidgetPlugin>('DailyzWidget');

/**
 * Calculates current active quest information for widget display
 */
export function getActiveWidgetData(userData: {
  completedDays: string[];
  streak: number;
  points: number;
  currentRolledQuest?: any;
  nextDayQuest?: any;
}): WidgetSyncData {
  const todayISO = getTodayISO();
  const dayOfYear = getDayOfYear();
  const defaultQuest = questsData[(dayOfYear - 1) % questsData.length];

  let activeQuest = defaultQuest;
  if (userData.currentRolledQuest && userData.currentRolledQuest.dateIso === todayISO) {
    activeQuest = userData.currentRolledQuest;
  } else if (userData.nextDayQuest && userData.nextDayQuest.dateIso === todayISO) {
    activeQuest = userData.nextDayQuest;
  }

  const isCompleted = (userData.completedDays || []).includes(todayISO);

  return {
    questTitle: activeQuest.quest || defaultQuest.quest,
    difficulty: activeQuest.difficulty || defaultQuest.difficulty,
    reward: activeQuest.reward ?? defaultQuest.reward,
    streak: userData.streak || 0,
    stars: userData.points || 0,
    isCompleted,
  };
}

/**
 * Synchronizes the user's quest, streak, and stars with the native Android Homescreen Widget.
 */
export async function syncWidgetWithNative(data: WidgetSyncData): Promise<void> {
  try {
    // Cache in localStorage for reference
    localStorage.setItem('dailyz_widget_cached', JSON.stringify(data));

    if (Capacitor.isNativePlatform()) {
      await DailyzWidget.updateWidgetData(data);
    }
  } catch (err) {
    // Silent fail in browser / non-supported environments
    console.debug('[DailyzWidget] Native sync skipped or unavailable:', err);
  }
}

/**
 * Automatically calculates and syncs the homescreen widget from the active user state.
 */
export async function autoSyncWidget(userData: {
  completedDays: string[];
  streak: number;
  points: number;
  currentRolledQuest?: any;
  nextDayQuest?: any;
}): Promise<void> {
  const data = getActiveWidgetData(userData);
  await syncWidgetWithNative(data);
}
