import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.georgeyt9769.dailyz',
  appName: 'Dailyz',
  webDir: 'dist',
  backgroundColor: '#111827',
  plugins: {
    StatusBar: {
      backgroundColor: '#111827',
      style: 'DARK',
      overlaysWebView: false
    }
  }
};

export default config;
