import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationScheduleOptions {
  hour: number;
  minute: number;
  enabled: boolean;
}

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
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

export const scheduleDailyReminder = async (timeString: string, enabled: boolean): Promise<void> => {
  try {
    const [hStr, mStr] = timeString.split(':');
    const hour = parseInt(hStr, 10) || 9;
    const minute = parseInt(mStr, 10) || 0;

    if (Capacitor.isNativePlatform()) {
      // Cancel previous scheduled reminders
      await LocalNotifications.cancel({ notifications: [{ id: 101 }] }).catch(() => {});

      if (enabled) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 101,
              title: "Dailyz - Today's Quest is Ready! ⚡",
              body: "Take 2 minutes to complete today's micro-quest and keep your streak burning!",
              schedule: {
                on: {
                  hour,
                  minute,
                },
                allowWhileIdle: true,
              },
              sound: 'beep.wav',
              smallIcon: 'ic_launcher_round',
            },
          ],
        });
      }
    } else {
      // Web environment: Save to localStorage for service worker / page reminder
      localStorage.setItem('dailyz_notification_reminder', JSON.stringify({ hour, minute, enabled }));
    }
  } catch (err) {
    console.warn('Error scheduling notification reminder:', err);
  }
};

export const sendInstantNotification = async (
  title: string = "Dailyz - Quest Alert! 🎯",
  body: string = "Your daily micro-quest is waiting. Complete it to earn stars and keep your streak alive!"
): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 10000) + 200,
            title,
            body,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'beep.wav',
          },
        ],
      });
      return true;
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/icon.png',
        });
        return true;
      } else {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification(title, {
            body,
            icon: '/icon.png',
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
