import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Updates the native Android / mobile status bar and navigation bar colors.
 * Keeps status bar in sync with dark/light theme and app background.
 */
export async function updateSystemBars(isDark: boolean = true) {
  try {
    const color = isDark ? '#111827' : '#f9fafb';
    await StatusBar.setBackgroundColor({ color });
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light,
    });
  } catch (e) {
    // Non-fatal fallback in web browser or environments without native plugin
  }
}
