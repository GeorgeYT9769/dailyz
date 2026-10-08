import { Capacitor, registerPlugin } from '@capacitor/core';

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
