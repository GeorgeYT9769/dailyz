import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

/**
 * Robust cross-platform haptic feedback.
 * Works natively on Android & iOS via @capacitor/haptics,
 * and gracefully falls back to HTML5 navigator.vibrate on web.
 */
export async function triggerHaptic(type: HapticType = 'light', enabled: boolean = true) {
  if (!enabled) return;

  try {
    switch (type) {
      case 'light':
      case 'selection':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        break;
      default:
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
    }
  } catch {
    // Fallback to web navigator.vibrate if running outside native Capacitor or plugin fails
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator && navigator.vibrate) {
        switch (type) {
          case 'light':
          case 'selection':
            navigator.vibrate(20);
            break;
          case 'medium':
            navigator.vibrate(40);
            break;
          case 'heavy':
            navigator.vibrate(60);
            break;
          case 'success':
            navigator.vibrate([100, 50, 100]);
            break;
          case 'warning':
            navigator.vibrate([40, 30, 40]);
            break;
          case 'error':
            navigator.vibrate([60, 40, 60, 40, 100]);
            break;
          default:
            navigator.vibrate(25);
            break;
        }
      }
    } catch {
      // Ignore if vibrations not permitted by browser
    }
  }
}
