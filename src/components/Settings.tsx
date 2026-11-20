import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import {
  Moon, Sun, Palette, Download, Upload, Vibrate, Check,
  Heart, Coffee, ExternalLink, Shield,
  Sparkles, Flame, Star, X, ChevronRight, ChevronDown, Award,
  Compass, LayoutGrid, Bell, Clock, Volume2
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audioEffects';
import { motion, AnimatePresence } from 'motion/react';
import HomescreenWidgetModal from './HomescreenWidgetModal';
import Toast from './Toast';
import TactileSwitch from './TactileSwitch';
import Material3TimePickerModal from './Material3TimePickerModal';
import { requestNotificationPermission, scheduleDailyReminder, sendInstantNotification, formatTimeDisplay } from '../utils/notificationUtils';
import { exportBackupFile } from '../utils/nativeFileExport';

function BuyMeACoffeeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 884 1279" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M472.623 590.836C426.682 610.503 374.546 632.802 306.976 632.802C278.71 632.746 250.58 628.868 223.353 621.274L270.086 1101.08C271.74 1121.13 280.876 1139.83 295.679 1153.46C310.482 1167.09 329.87 1174.65 349.992 1174.65C349.992 1174.65 416.254 1178.09 438.365 1178.09C462.161 1178.09 533.516 1174.65 533.516 1174.65C553.636 1174.65 573.019 1167.08 587.819 1153.45C602.619 1139.82 611.752 1121.13 613.406 1101.08L663.459 570.876C641.091 563.237 618.516 558.161 593.068 558.161C549.054 558.144 513.591 573.303 472.623 590.836Z" fill="#FFDD00"/>
      <path d="M879.567 341.849L872.53 306.352C866.215 274.503 851.882 244.409 819.19 232.898C808.711 229.215 796.821 227.633 788.786 220.01C780.751 212.388 778.376 200.55 776.518 189.572C773.076 169.423 769.842 149.257 766.314 129.143C763.269 111.85 760.86 92.4243 752.928 76.56C742.604 55.2584 721.182 42.8009 699.88 34.559C688.965 30.4844 677.826 27.0375 666.517 24.2352C613.297 10.1947 557.342 5.03277 502.591 2.09047C436.875 -1.53577 370.983 -0.443234 305.422 5.35968C256.625 9.79894 205.229 15.1674 158.858 32.0469C141.91 38.224 124.445 45.6399 111.558 58.7341C95.7448 74.8221 90.5829 99.7026 102.128 119.765C110.336 134.012 124.239 144.078 138.985 150.737C158.192 159.317 178.251 165.846 198.829 170.215C256.126 182.879 315.471 187.851 374.007 189.968C438.887 192.586 503.87 190.464 568.44 183.618C584.408 181.863 600.347 179.758 616.257 177.304C634.995 174.43 647.022 149.928 641.499 132.859C634.891 112.453 617.134 104.538 597.055 107.618C594.095 108.082 591.153 108.512 588.193 108.942L586.06 109.252C579.257 110.113 572.455 110.915 565.653 111.661C551.601 113.175 537.515 114.414 523.394 115.378C491.768 117.58 460.057 118.595 428.363 118.647C397.219 118.647 366.058 117.769 334.983 115.722C320.805 114.793 306.661 113.611 292.552 112.177C286.134 111.506 279.733 110.801 273.333 110.009L267.241 109.235L265.917 109.046L259.602 108.134C246.697 106.189 233.792 103.953 221.025 101.251C219.737 100.965 218.584 100.249 217.758 99.2193C216.932 98.1901 216.482 96.9099 216.482 95.5903C216.482 94.2706 216.932 92.9904 217.758 91.9612C218.584 90.9319 219.737 90.2152 221.025 89.9293H221.266C232.33 87.5721 243.479 85.5589 254.663 83.8038C258.392 83.2188 262.131 82.6453 265.882 82.0832H265.985C272.988 81.6186 280.026 80.3625 286.994 79.5366C347.624 73.2302 408.614 71.0801 469.538 73.1014C499.115 73.9618 528.676 75.6996 558.116 78.6935C564.448 79.3474 570.746 80.0357 577.043 80.8099C579.452 81.1025 581.878 81.4465 584.305 81.7391L589.191 82.4445C603.438 84.5667 617.61 87.1419 631.708 90.1703C652.597 94.7128 679.422 96.1925 688.713 119.077C691.673 126.338 693.015 134.408 694.649 142.03L696.731 151.752C696.786 151.926 696.826 152.105 696.852 152.285C701.773 175.227 706.7 198.169 711.632 221.111C711.994 222.806 712.002 224.557 711.657 226.255C711.312 227.954 710.621 229.562 709.626 230.982C708.632 232.401 707.355 233.6 705.877 234.504C704.398 235.408 702.75 235.997 701.033 236.236H700.895L697.884 236.649L694.908 237.044C685.478 238.272 676.038 239.419 666.586 240.486C647.968 242.608 629.322 244.443 610.648 245.992C573.539 249.077 536.356 251.102 499.098 252.066C480.114 252.57 461.135 252.806 442.162 252.771C366.643 252.712 291.189 248.322 216.173 239.625C208.051 238.662 199.93 237.629 191.808 236.58C198.106 237.389 187.231 235.96 185.029 235.651C179.867 234.928 174.705 234.177 169.543 233.397C152.216 230.798 134.993 227.598 117.7 224.793C96.7944 221.352 76.8005 223.073 57.8906 233.397C42.3685 241.891 29.8055 254.916 21.8776 270.735C13.7217 287.597 11.2956 305.956 7.64786 324.075C4.00009 342.193 -1.67805 361.688 0.472751 380.288C5.10128 420.431 33.165 453.054 73.5313 460.35C111.506 467.232 149.687 472.807 187.971 477.556C338.361 495.975 490.294 498.178 641.155 484.129C653.44 482.982 665.708 481.732 677.959 480.378C681.786 479.958 685.658 480.398 689.292 481.668C692.926 482.938 696.23 485.005 698.962 487.717C701.694 490.429 703.784 493.718 705.08 497.342C706.377 500.967 706.846 504.836 706.453 508.665L702.633 545.797C694.936 620.828 687.239 695.854 679.542 770.874C671.513 849.657 663.431 928.434 655.298 1007.2C653.004 1029.39 650.71 1051.57 648.416 1073.74C646.213 1095.58 645.904 1118.1 641.757 1139.68C635.218 1173.61 612.248 1194.45 578.73 1202.07C548.022 1209.06 516.652 1212.73 485.161 1213.01C450.249 1213.2 415.355 1211.65 380.443 1211.84C343.173 1212.05 297.525 1208.61 268.756 1180.87C243.479 1156.51 239.986 1118.36 236.545 1085.37C231.957 1041.7 227.409 998.039 222.9 954.381L197.607 711.615L181.244 554.538C180.968 551.94 180.693 549.376 180.435 546.76C178.473 528.023 165.207 509.681 144.301 510.627C126.407 511.418 106.069 526.629 108.168 546.76L120.298 663.214L145.385 904.104C152.532 972.528 159.661 1040.96 166.773 1109.41C168.15 1122.52 169.44 1135.67 170.885 1148.78C178.749 1220.43 233.465 1259.04 301.224 1269.91C340.799 1276.28 381.337 1277.59 421.497 1278.24C472.979 1279.07 524.977 1281.05 575.615 1271.72C650.653 1257.95 706.952 1207.85 714.987 1130.13C717.282 1107.69 719.576 1085.25 721.87 1062.8C729.498 988.559 737.115 914.313 744.72 840.061L769.601 597.451L781.009 486.263C781.577 480.749 783.905 475.565 787.649 471.478C791.392 467.391 796.352 464.617 801.794 463.567C823.25 459.386 843.761 452.245 859.023 435.916C883.318 409.918 888.153 376.021 879.567 341.849ZM800.796 382.989C793.088 390.319 781.473 393.726 769.996 395.43C641.292 414.529 510.713 424.199 380.597 419.932C287.476 416.749 195.336 406.407 103.144 393.382C94.1102 392.109 84.3197 390.457 78.1082 383.798C66.4078 371.237 72.1548 345.944 75.2003 330.768C77.9878 316.865 83.3218 298.334 99.8572 296.355C125.667 293.327 155.64 304.218 181.175 308.09C211.917 312.781 242.774 316.538 273.745 319.36C405.925 331.405 540.325 329.529 671.92 311.91C695.905 308.686 719.805 304.941 743.619 300.674C764.835 296.871 788.356 289.731 801.175 311.703C809.967 326.673 811.137 346.701 809.778 363.615C809.359 370.984 806.139 377.915 800.779 382.989H800.796Z" fill="#0D0C22"/>
    </svg>
  );
}

function KofiIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 241 194" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M96.1344 193.911C61.1312 193.911 32.6597 178.256 15.9721 149.829C1.19788 124.912 -0.00585938 97.9229 -0.00585938 67.7662C-0.00585938 49.8876 5.37293 34.3215 15.5413 22.7466C24.8861 12.1157 38.1271 5.22907 52.8317 3.35378C70.2858 1.14271 91.9848 0.958984 114.545 0.958984C151.259 0.958984 161.63 1.4088 176.075 2.85328C195.29 4.76026 211.458 11.932 222.824 23.5955C234.368 35.4428 240.469 51.2624 240.469 69.3627V72.9994C240.469 103.885 219.821 129.733 191.046 136.759C188.898 141.827 186.237 146.871 183.089 151.837L183.006 151.964C172.869 167.632 149.042 193.918 103.401 193.918H96.1281L96.1344 193.911Z" fill="white"/>
      <path d="M15.1975 67.7674C15.1975 37.5285 33.3866 21.164 54.7559 18.4334C70.8987 16.387 90.906 16.1589 114.544 16.1589C151.372 16.1589 160.919 16.6151 174.559 17.9772C206.617 21.1576 225.255 40.937 225.255 69.3577V72.9941C225.255 99.3687 205.932 120.966 179.786 123.234C177.74 130.058 174.559 136.874 170.238 143.698C160.235 159.156 140.228 178.707 103.4 178.707H96.1264C66.1155 178.707 42.9277 165.751 29.0595 142.107C16.7814 121.422 15.1912 98.4563 15.1912 67.7674" fill="#202020"/>
      <path d="M32.2469 67.9899C32.2469 97.3168 34.0654 116.184 43.6127 133.689C54.5225 153.924 74.3018 161.653 96.8117 161.653H103.857C133.411 161.653 147.736 147.329 155.693 134.829C159.558 128.462 162.966 121.417 164.784 112.547L166.147 106.864H174.332C192.521 106.864 208.208 92.09 208.208 73.2166V69.8082C208.208 48.6669 195.024 37.5228 172.058 34.7987C159.102 33.6646 151.372 33.2084 114.538 33.2084C89.7602 33.2084 72.0272 33.4364 58.6152 35.4828C39.7483 38.2134 32.2407 48.8951 32.2407 67.9899" fill="white"/>
      <path d="M166.158 83.6801C166.158 86.4107 168.204 88.4572 171.841 88.4572C183.435 88.4572 189.802 81.8619 189.802 70.9523C189.802 60.0427 183.435 53.2195 171.841 53.2195C168.204 53.2195 166.158 55.2657 166.158 57.9963V83.6866V83.6801Z" fill="#202020"/>
      <path d="M54.5321 82.3198C54.5321 95.732 62.0332 107.326 71.5807 116.424C77.9478 122.562 87.9515 128.93 94.7685 133.022C96.8147 134.157 98.8611 134.841 101.136 134.841C103.866 134.841 106.134 134.157 107.959 133.022C114.782 128.93 124.779 122.562 130.919 116.424C140.694 107.332 148.195 95.7383 148.195 82.3198C148.195 67.7673 137.286 54.8115 121.599 54.8115C112.28 54.8115 105.912 59.5882 101.136 66.1772C96.8147 59.582 90.2259 54.8115 80.9001 54.8115C64.9855 54.8115 54.5256 67.7673 54.5256 82.3198" fill="#FF5A16"/>
    </svg>
  );
}

const ACCENT_PALETTE = [
  { id: '#067bc2', name: 'Teal Blue', light: '#3b9cd9', dark: '#04598c' },
  { id: '#ff5d38', name: 'Coral Glow', light: '#ff8568', dark: '#cc3412' },
  { id: '#ff3b5c', name: 'Vibrant Pink', light: '#ff7088', dark: '#c81438' },
  { id: '#ecc30b', name: 'Bright Amber', light: '#f5d74b', dark: '#b99603' },
  { id: '#84bcda', name: 'Sky Blue', light: '#a9d2e7', dark: '#4e91b5' },
  { id: '#10b981', name: 'Emerald', light: '#34d399', dark: '#047857' },
  { id: '#8b5cf6', name: 'Purple', light: '#a78bfa', dark: '#6d28d9' },
  { id: '#3b82f6', name: 'Classic Blue', light: '#60a5fa', dark: '#1d4ed8' },
];

export default function Settings() {
  const { userData, updateSettings, importData, openOnboarding } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BMAC_URL = 'https://buymeacoffee.com/georgeyt9769';
  const KOFI_URL = 'https://ko-fi.com/georgeyt9769';

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [showThankYouToast, setShowThankYouToast] = useState(false);
  const [settingsToast, setSettingsToast] = useState<string | null>(null);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);

  const showToast = (msg: string) => {
    setSettingsToast(msg);
    setTimeout(() => setSettingsToast(null), 3000);
  };

  const handleExport = async () => {
    triggerHaptic('medium', userData.vibrationEnabled);
    playSound('click', userData.soundEnabled ?? true);
    const result = await exportBackupFile(userData, 'daily_quests_backup.json');
    showToast(result.message);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed.points === 'number' && Array.isArray(parsed.completedDays)) {
          importData(parsed);
          playSound('success', userData.soundEnabled ?? true);
          showToast('Backup imported successfully!');
        } else {
          showToast('Invalid backup file format.');
        }
      } catch {
        showToast('Failed to read backup file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentColor =
    ACCENT_PALETTE.find((c) => c.id.toLowerCase() === userData.accentColor?.toLowerCase()) ||
    ACCENT_PALETTE[0];

  return (
    <div className="pb-16">
      <header className="mb-6 pt-1">
        <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white">Settings</h1>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Customize your look, reminders & backup
        </p>
      </header>

      {showThankYouToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2 text-sm font-extrabold animate-pop">
          <Heart size={17} className="fill-white" />
          <span>Thank you for supporting Dailyz! ⭐</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start">
        <div className="space-y-5">
        {/* Appearance & Audio */}
        <section className="bg-white dark:bg-gray-800 rounded-[1.75rem] p-5 playful-card border-gray-200 dark:border-gray-700">
          <h2 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Appearance & Feedback
          </h2>

          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2.5 rounded-xl">
                  {userData.theme === 'dark' ? <Moon size={19} /> : <Sun size={19} />}
                </div>
                <span className="font-bold text-sm text-gray-900 dark:text-white">Dark Mode</span>
              </div>
              <TactileSwitch
                checked={userData.theme === 'dark'}
                onChange={() => {
                  triggerHaptic('light', userData.vibrationEnabled);
                  playSound('click', userData.soundEnabled ?? true);
                  updateSettings({ theme: userData.theme === 'dark' ? 'light' : 'dark' });
                }}
                ariaLabel="Toggle dark mode"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2.5 rounded-xl">
                  <Vibrate size={19} />
                </div>
                <span className="font-bold text-sm text-gray-900 dark:text-white">Haptic Vibration</span>
              </div>
              <TactileSwitch
                checked={userData.vibrationEnabled}
                onChange={() => {
                  const nextVal = !userData.vibrationEnabled;
                  if (nextVal) triggerHaptic('medium', true);
                  playSound('pop', userData.soundEnabled ?? true);
                  updateSettings({ vibrationEnabled: nextVal });
                }}
                ariaLabel="Toggle vibration"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2.5 rounded-xl">
                  <Volume2 size={19} />
                </div>
                <div>
                  <span className="font-bold text-sm text-gray-900 dark:text-white block">
                    Sound Effects
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Playful chimes for quests & taps
                  </span>
                </div>
              </div>
              <TactileSwitch
                checked={userData.soundEnabled ?? true}
                onChange={() => {
                  const nextVal = !(userData.soundEnabled ?? true);
                  if (nextVal) playSound('complete', true);
                  updateSettings({ soundEnabled: nextVal });
                }}
                ariaLabel="Toggle sound effects"
              />
            </div>
          </div>

          <div className="relative pt-4 mt-5 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2.5 rounded-xl">
                  <Palette size={19} />
                </div>
                <div>
                  <span className="font-bold text-sm text-gray-900 dark:text-white block">
                    Accent Color
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Nav capsule & highlights
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light', userData.vibrationEnabled);
                  playSound('pop', userData.soundEnabled ?? true);
                  setIsColorDropdownOpen((prev) => !prev);
                }}
                className="btn-tactile btn-tactile-neutral flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 cursor-pointer"
                aria-expanded={isColorDropdownOpen}
                aria-haspopup="listbox"
                aria-label="Select accent color"
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0 border border-black/15"
                  style={{ backgroundColor: currentColor.id }}
                />
                <span className="text-xs font-extrabold text-gray-800 dark:text-gray-100">
                  {currentColor.name}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 ${
                    isColorDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            <AnimatePresence>
              {isColorDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsColorDropdownOpen(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-1.5 z-30 max-h-72 overflow-y-auto"
                    role="listbox"
                    aria-label="Accent colors list"
                  >
                    {ACCENT_PALETTE.map((color) => {
                      const isSelected = currentColor.id.toLowerCase() === color.id.toLowerCase();
                      return (
                        <button
                          key={color.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            triggerHaptic('selection', userData.vibrationEnabled);
                            playSound('equip', userData.soundEnabled ?? true);
                            updateSettings({ accentColor: color.id });
                            setIsColorDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gray-100 dark:bg-gray-700/80 font-extrabold text-gray-950 dark:text-white'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700/40 text-gray-700 dark:text-gray-300 font-semibold'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-5 h-5 rounded-full shrink-0 border border-black/15"
                              style={{ backgroundColor: color.id }}
                            />
                            <span className="text-xs">{color.name}</span>
                          </div>
                          {isSelected && (
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: color.id }}
                            >
                              <Check size={10} strokeWidth={3.5} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-white dark:bg-gray-800 rounded-[1.75rem] p-5 playful-card border-gray-200 dark:border-gray-700">
          <h2 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Data Management
          </h2>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleExport}
              className="btn-tactile btn-tactile-neutral w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Download size={19} className="text-[#067bc2]" />
                <span className="font-bold text-sm text-gray-900 dark:text-white">Export Backup</span>
              </div>
              <span className="text-xs text-gray-400 font-mono">.json</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-tactile btn-tactile-neutral w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Upload size={19} className="text-gray-600 dark:text-gray-300" />
                <span className="font-bold text-sm text-gray-900 dark:text-white">Import Backup</span>
              </div>
              <span className="text-xs text-gray-400 font-mono">.json</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
          </div>
        </section>
        </div>

        <div className="space-y-5">
        {/* Daily Notifications & Reminders */}
        <section className="bg-white dark:bg-gray-800 rounded-[1.75rem] p-5 playful-card border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-sm font-black text-gray-950 dark:text-white">Daily Reminders</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Stay consistent before midnight
                </p>
              </div>
            </div>
            <TactileSwitch
              checked={userData.notificationsEnabled}
              onChange={async () => {
                triggerHaptic('selection', userData.vibrationEnabled);
                playSound('pop', userData.soundEnabled ?? true);
                if (!userData.notificationsEnabled) {
                  const granted = await requestNotificationPermission();
                  if (granted) {
                    updateSettings({ notificationsEnabled: true });
                    scheduleDailyReminder(userData.notificationTime || '09:00', true);
                    showToast(
                      `Daily reminder scheduled for ${formatTimeDisplay(
                        userData.notificationTime || '09:00'
                      )}!`
                    );
                  } else {
                    showToast('Notification permission not granted.');
                  }
                } else {
                  updateSettings({ notificationsEnabled: false });
                  scheduleDailyReminder(userData.notificationTime || '09:00', false);
                  showToast('Daily notifications disabled.');
                }
              }}
              ariaLabel="Toggle daily quest notifications"
            />
          </div>

          {userData.notificationsEnabled && (
            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700/70 space-y-4 animate-pop">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2.5">
                  Scheduled Time:{' '}
                  <span className="font-black text-[#067bc2] dark:text-[#84bcda] font-mono">
                    {formatTimeDisplay(userData.notificationTime || '09:00')}
                  </span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {[
                    { time: '07:00', label: '07:00 AM', desc: 'Early Bird' },
                    { time: '08:00', label: '08:00 AM', desc: 'Morning' },
                    { time: '13:00', label: '01:00 PM', desc: 'Midday' },
                    { time: '19:00', label: '07:00 PM', desc: 'Evening' },
                  ].map((t) => {
                    const isActive = userData.notificationTime === t.time;
                    return (
                      <button
                        key={t.time}
                        type="button"
                        onClick={() => {
                          triggerHaptic('selection', userData.vibrationEnabled);
                          playSound('pop', userData.soundEnabled ?? true);
                          updateSettings({ notificationTime: t.time });
                          scheduleDailyReminder(t.time, true);
                          showToast(`Reminder scheduled for ${t.label}!`);
                        }}
                        className={`btn-tactile py-2 px-3 rounded-xl text-xs font-extrabold cursor-pointer text-left ${
                          isActive
                            ? 'btn-tactile-teal'
                            : 'btn-tactile-neutral bg-gray-50 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        <div>{t.label}</div>
                        <div className={`text-[10px] ${isActive ? 'text-white/85' : 'text-gray-400'}`}>
                          {t.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light', userData.vibrationEnabled);
                    setShowTimePickerModal(true);
                  }}
                  className="btn-tactile btn-tactile-neutral w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <Clock size={16} className="text-[#067bc2]" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-gray-900 dark:text-white">
                        Custom Reminder Time
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        Pick exact hour & minute
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono">
                      {formatTimeDisplay(userData.notificationTime || '09:00')}
                    </span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Verify alert banner:
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    triggerHaptic('medium', userData.vibrationEnabled);
                    playSound('pop', userData.soundEnabled ?? true);
                    const sent = await sendInstantNotification(
                      "Dailyz • Today's Quest 🎯",
                      'Your daily micro-quest is waiting. Take a moment to complete it!'
                    );
                    if (sent) {
                      showToast('Test notification dispatched!');
                    } else {
                      showToast('Please allow notifications in browser/system settings.');
                    }
                  }}
                  className="btn-tactile btn-tactile-neutral px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-xs font-extrabold text-gray-800 dark:text-gray-100 cursor-pointer flex items-center gap-1.5"
                >
                  <Bell size={13} />
                  <span>Send Test Alert</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Features & Guides */}
        <section className="bg-white dark:bg-gray-800 rounded-[1.75rem] p-5 playful-card border-gray-200 dark:border-gray-700">
          <h2 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Features & Guides
          </h2>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light', userData.vibrationEnabled);
                playSound('pop', userData.soundEnabled ?? true);
                openOnboarding();
              }}
              className="btn-tactile btn-tactile-neutral w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <Compass size={19} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-gray-900 dark:text-white">
                    App Onboarding Tour
                  </div>
                  <div className="text-xs text-gray-400">Replay the visual welcome tour</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light', userData.vibrationEnabled);
                playSound('pop', userData.soundEnabled ?? true);
                setShowWidgetModal(true);
              }}
              className="btn-tactile btn-tactile-neutral w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <LayoutGrid size={19} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-gray-900 dark:text-white">
                    Homescreen Widget
                  </div>
                  <div className="text-xs text-gray-400">Widget preview & setup</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </section>

        {/* Support Section */}
        <section className="bg-white dark:bg-gray-800 rounded-[1.75rem] p-5 playful-card border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl">
              <Coffee size={20} />
            </div>
            <div>
              <h2 className="text-xs font-black text-gray-950 dark:text-white uppercase tracking-wider">
                Support the Project
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Keep Dailyz free & ad-free
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <a
              href={BMAC_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setShowThankYouToast(true);
                setTimeout(() => setShowThankYouToast(false), 3000);
              }}
              className="btn-tactile btn-tactile-amber flex items-center justify-between px-4 py-3 rounded-2xl font-extrabold cursor-pointer no-underline"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-black/10 rounded-xl">
                  <BuyMeACoffeeIcon className="w-5 h-5 text-black" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black leading-tight">Buy Me a Coffee</div>
                  <div className="text-[11px] font-bold opacity-75 leading-none mt-0.5">
                    Tip a warm brew
                  </div>
                </div>
              </div>
              <ExternalLink size={16} className="text-black/70" />
            </a>

            <a
              href={KOFI_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setShowThankYouToast(true);
                setTimeout(() => setShowThankYouToast(false), 3000);
              }}
              className="btn-tactile btn-tactile-pink flex items-center justify-between px-4 py-3 rounded-2xl font-extrabold cursor-pointer no-underline"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-xl">
                  <KofiIcon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black leading-tight">Support on Ko-fi</div>
                  <div className="text-[11px] font-bold opacity-90 leading-none mt-0.5">
                    0% fee tip jar
                  </div>
                </div>
              </div>
              <ExternalLink size={16} className="text-white/85" />
            </a>
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-gray-500 dark:text-gray-400">
            <Heart size={16} className="text-[#ff3b5c] fill-[#ff3b5c] shrink-0" />
            <span>Every tip fuels new quests & rewards!</span>
          </div>
        </section>
        </div>
      </div>

      {/* Guide Modal */}
      <AnimatePresence>
        {showGuideModal &&
          createPortal(
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 overflow-hidden"
              onClick={() => setShowGuideModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={20} className="text-[#067bc2]" />
                    <h3 className="font-black text-lg text-gray-900 dark:text-white">
                      Dailyz Guide
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGuideModal(false)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl space-y-1">
                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Flame size={14} className="text-[#ff3b5c]" />
                      <span>1. Daily Quests & XP</span>
                    </div>
                    <p>
                      Complete one quest daily to claim Stars, earn XP toward your next level, and grow your streak.
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl space-y-1">
                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Star size={14} className="text-[#ecc30b]" />
                      <span>2. Tomorrow's Quest</span>
                    </div>
                    <p>
                      Spend 20 Stars to reveal tomorrow's quest early and save it for midnight!
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl space-y-1">
                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Award size={14} className="text-[#067bc2]" />
                      <span>3. Rewards Shop</span>
                    </div>
                    <p>
                      Redeem Stars for Streak Freezes, custom ranks, avatar badges, and frames.
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl space-y-1">
                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Shield size={14} className="text-emerald-500" />
                      <span>4. Private & Local</span>
                    </div>
                    <p>
                      Your progress stays safely on your device. Export a JSON backup anytime!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="btn-tactile btn-tactile-teal mt-5 w-full py-3 font-black rounded-2xl cursor-pointer"
                >
                  Got it!
                </button>
              </motion.div>
            </motion.div>,
            document.body
          )}
      </AnimatePresence>

      <HomescreenWidgetModal isOpen={showWidgetModal} onClose={() => setShowWidgetModal(false)} />

      <Material3TimePickerModal
        isOpen={showTimePickerModal}
        onClose={() => setShowTimePickerModal(false)}
        initialTime={userData.notificationTime || '09:00'}
        onConfirm={(newTime) => {
          updateSettings({ notificationTime: newTime });
          scheduleDailyReminder(newTime, true);
          showToast(`Reminder set to ${formatTimeDisplay(newTime)}!`);
        }}
        vibrationEnabled={userData.vibrationEnabled}
      />

      <Toast show={!!settingsToast} title={settingsToast ?? ''} icon={<Bell size={20} />} />
    </div>
  );
}
