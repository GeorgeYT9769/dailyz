import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationScheduleOptions {
  hour: number;
  minute: number;
  enabled: boolean;
}

export const STANDARD_CHANNEL_ID = 'daily_quests_standard';

/**
 * Format 24-hour time "14:30" into friendly 12-hour or readable string "2:30 PM"
 */
export const formatTimeDisplay = (timeString: string = "09:00"): string => {
  try {
    const [hStr, mStr] = timeString.split(':');
    const hour = parseInt(hStr, 10);
    const minute = parseInt(mStr, 10) || 0;
    if (isNaN(hour)) return timeString;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
  } catch {
    return timeString;
  }
};

/**
 * Ensures a standard notification channel exists on Android (no alarm, no snooze)
 */
export const ensureStandardNotificationChannel = async (): Promise<void> => {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      await LocalNotifications.createChannel({
        id: STANDARD_CHANNEL_ID,
        name: 'Daily Quest Notifications',
        description: 'Standard daily reminder to complete your quest',
        importance: 3, // NotificationManager.IMPORTANCE_DEFAULT: Standard notification, not alarm
        visibility: 1, // VISIBILITY_PUBLIC
        vibration: true,
        sound: undefined, // Default system notification sound (not alarm/snooze sound)
      });
    } catch (e) {
      console.warn('Channel creation notice:', e);
    }
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      await ensureStandardNotificationChannel();
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  } catch (e) {
    console.warn('Could not request notification permission:', e);
  }
  return false;
};

export const checkNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.checkPermissions();
      return status.display === 'granted';
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
  } catch (e) {
    console.warn('Could not check notification permission:', e);
  }
  return false;
};

/**
 * Schedules a standard daily notification at user's custom chosen time.
 * Standard notification behavior: auto-dismiss on tap, standard system sound,
 * no alarm behavior, no snooze actions, auto-dismisses normally.
 */
export const scheduleDailyReminder = async (timeString: string, enabled: boolean): Promise<void> => {
  try {
    const [hStr, mStr] = timeString.split(':');
    const hour = parseInt(hStr, 10) || 9;
    const minute = parseInt(mStr, 10) || 0;

    if (Capacitor.isNativePlatform()) {
      await ensureStandardNotificationChannel();

      // Cancel previous scheduled reminders
      await LocalNotifications.cancel({ notifications: [{ id: 101 }] }).catch(() => {});

      if (enabled) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 101,
              title: "Dailyz • Today's Quest",
              body: "Your daily micro-quest is waiting. Take a moment to complete it!",
              channelId: STANDARD_CHANNEL_ID,
              schedule: {
                on: {
                  hour,
                  minute,
                },
                allowWhileIdle: false, // Standard notification, not an alarm
              },
              autoCancel: true, // Dismisses when tapped (standard behavior)
              ongoing: false, // Not sticky/alarm
              smallIcon: 'ic_launcher_round',
              extra: { type: 'standard_reminder' },
            },
          ],
        });
      }
    } else {
      // Web environment: Save to localStorage for web reminder
      localStorage.setItem('dailyz_notification_reminder', JSON.stringify({ hour, minute, enabled, timeString }));
    }
  } catch (err) {
    console.warn('Error scheduling standard notification reminder:', err);
  }
};

/**
 * Dispatches a standard instant notification alert (for testing and immediate feedback)
 */
export const sendInstantNotification = async (
  title: string = "Dailyz • Quest Alert 🎯",
  body: string = "Your daily micro-quest is ready. Check in when you have a moment!"
): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      await ensureStandardNotificationChannel();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 10000) + 200,
            title,
            body,
            channelId: STANDARD_CHANNEL_ID,
            schedule: { at: new Date(Date.now() + 500) },
            autoCancel: true,
            ongoing: false,
          },
        ],
      });
      return true;
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/icon.png',
          badge: '/icon.png',
          requireInteraction: false, // Standard notification: auto-dismisses, NOT lingering like an alarm
          silent: false,
        });
        return true;
      } else {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification(title, {
            body,
            icon: '/icon.png',
            badge: '/icon.png',
            requireInteraction: false,
            silent: false,
          });
          return true;
        }
      }
    }
  } catch (e) {
    console.warn('Instant notification failed:', e);
  }
  return false;
};
