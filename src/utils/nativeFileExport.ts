import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export interface ExportResult {
  success: boolean;
  message: string;
  uri?: string;
}

/**
 * Saves an image (dataURL) to the device storage or downloads it.
 * Fully compatible with native Android Capacitor and web browsers.
 */
export async function saveImageFile(dataUrl: string, filename: string): Promise<ExportResult> {
  // Web browser fallback
  if (!Capacitor.isNativePlatform()) {
    try {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, message: 'Card downloaded successfully! 📥' };
    } catch (err) {
      console.error('[saveImageFile Web error]:', err);
      return { success: false, message: 'Failed to download card on browser' };
    }
  }

  // Native Capacitor platform (Android / iOS)
  try {
    const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

    // Check and request storage permission if required on specific Android versions
    try {
      const perm = await Filesystem.checkPermissions();
      if (perm.publicStorage !== 'granted') {
        await Filesystem.requestPermissions();
      }
    } catch {
      // Scoped storage on newer Android versions does not need publicStorage
    }

    // Attempt 1: Write directly to Documents directory so it persists in the device file manager
    try {
      const docResult = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });

      return {
        success: true,
        message: 'Saved to Documents folder! 📥',
        uri: docResult.uri,
      };
    } catch (docErr) {
      console.warn('[saveImageFile Documents attempt failed, falling back to Cache + Share]:', docErr);
      
      // Attempt 2: Write to Cache and present the native Save/Share dialog
      const cacheResult = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      await Share.share({
        title: 'Dailyz Player Card',
        text: 'Save your Dailyz Player Card to your photos or files',
        files: [cacheResult.uri],
        dialogTitle: 'Save Player Card',
      });

      return {
        success: true,
        message: 'Card ready! Choose Save or Share',
        uri: cacheResult.uri,
      };
    }
  } catch (err: any) {
    console.error('[saveImageFile Native error]:', err);
    return {
      success: false,
      message: err?.message || 'Could not save card to device storage',
    };
  }
}

/**
 * Shares an image card using Android native share sheet or Web Share API.
 */
export async function shareImageCard(options: {
  dataUrl: string;
  filename: string;
  title: string;
  text: string;
  url?: string;
}): Promise<ExportResult> {
  const { dataUrl, filename, title, text, url } = options;

  // Native Capacitor platform (Android / iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

      // Save to Cache so Android FileProvider can securely share with target apps
      const cacheResult = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      await Share.share({
        title,
        text,
        files: [cacheResult.uri],
        dialogTitle: 'Share Dailyz Player Card',
      });

      return { success: true, message: 'Share sheet opened!', uri: cacheResult.uri };
    } catch (err: any) {
      console.error('[shareImageCard Native error]:', err);
      // User cancelling the share sheet throws an error in some Android implementations
      if (err?.message?.includes('canceled') || err?.message?.includes('cancelled')) {
        return { success: true, message: 'Share dismissed' };
      }
      return { success: false, message: 'Unable to open share sheet' };
    }
  }

  // Web Browser fallback
  try {
    if (navigator.share) {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], filename, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title,
            text,
            files: [file],
          });
          return { success: true, message: 'Card shared!' };
        }
      } catch (fileShareErr) {
        console.debug('[shareImageCard Web file share fallback]:', fileShareErr);
      }

      // Fallback to text & link share
      await navigator.share({
        title,
        text,
        url: url || window.location.href,
      });
      return { success: true, message: 'Shared successfully!' };
    }

    // No navigator.share available: download file & copy link
    await saveImageFile(dataUrl, filename);
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url || window.location.href);
      return { success: true, message: 'Card downloaded & link copied!' };
    }

    return { success: true, message: 'Card downloaded! 📥' };
  } catch (err: any) {
    console.error('[shareImageCard Web error]:', err);
    if (err?.name === 'AbortError') {
      return { success: true, message: 'Share dismissed' };
    }
    return { success: false, message: 'Could not share card' };
  }
}

/**
 * Exports JSON backup data on both Capacitor native and Web
 */
export async function exportBackupFile(data: object, filename: string): Promise<ExportResult> {
  const jsonString = JSON.stringify(data, null, 2);

  if (Capacitor.isNativePlatform()) {
    try {
      const cacheResult = await Filesystem.writeFile({
        path: filename,
        data: jsonString,
        directory: Directory.Cache,
      });

      await Share.share({
        title: 'Dailyz Data Backup',
        text: 'Backup file for Dailyz quests and progress',
        files: [cacheResult.uri],
        dialogTitle: 'Export / Save Backup File',
      });

      return { success: true, message: 'Backup file ready!' };
    } catch (err: any) {
      console.error('[exportBackupFile Native error]:', err);
      return { success: false, message: 'Could not export backup on device' };
    }
  }

  // Web fallback
  try {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString);
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    return { success: true, message: 'Backup downloaded! 📥' };
  } catch (err) {
    return { success: false, message: 'Failed to download backup' };
  }
}
