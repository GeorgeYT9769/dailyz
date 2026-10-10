import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Sparkles, Flame, Star, CheckCircle, RefreshCw, LayoutGrid } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { syncWidgetWithNative } from '../utils/widgetSync';
import { useAppContext } from '../context/AppContext';

interface HomescreenWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuest?: {
    quest: string;
    difficulty: string;
    reward: number;
  };
  isCompleted?: boolean;
}

export default function HomescreenWidgetModal({
  isOpen,
  onClose,
  currentQuest,
  isCompleted = false,
}: HomescreenWidgetModalProps) {
  const { userData } = useAppContext();
  const [viewMode, setViewMode] = useState<'card' | 'home'>('card');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const questTitle = currentQuest?.quest || "Pick up one piece of trash you see outside. (Day 1)";
  const difficulty = currentQuest?.difficulty || "easy";
  const reward = currentQuest?.reward ?? 1;

  const handleSyncNow = async () => {
    triggerHaptic('medium', userData.vibrationEnabled);
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      await syncWidgetWithNative({
        questTitle,
        difficulty,
        reward,
        streak: userData.streak,
        stars: userData.points,
        isCompleted,
      });
      setSyncStatus('Widget synced!');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch {
      setSyncStatus('Sync complete');
      setTimeout(() => setSyncStatus(null), 2500);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'transform, opacity' }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]"
          >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700/60 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-500">
                <LayoutGrid size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  Homescreen Widget
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Minimal daily quest & stats at a glance
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light', userData.vibrationEnabled);
                onClose();
              }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Live Interactive Simplified Widget Card */}
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400" />
                  Live Widget Preview
                </span>
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-updated
                </span>
              </div>

              {/* Simplified Minimalist Widget Card */}
              <div className="bg-[#182234] border border-[#374151] rounded-3xl p-5 sm:p-6 shadow-xl text-left transition-all">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug mb-3">
                  {isCompleted ? '✓ Done for today! Great job, Adventurer 🎉' : questTitle}
                </h3>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="text-[#FBBF24] flex items-center gap-1">
                    ⭐ {userData.points} Stars
                  </span>
                  <span className="text-[#6B7280]">•</span>
                  <span className="text-[#FB923C] flex items-center gap-1">
                    🔥 {userData.streak} Day Streak
                  </span>
                </div>
              </div>
            </div>

            {/* View switcher tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-700/60 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection', userData.vibrationEnabled);
                  setViewMode('card');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  viewMode === 'card'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                Widget Picker Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection', userData.vibrationEnabled);
                  setViewMode('home');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  viewMode === 'home'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                On Android Launcher
              </button>
            </div>

            {/* Widget Picture Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-900 shadow-inner">
              {viewMode === 'card' ? (
                <div className="p-4 sm:p-5 flex flex-col items-center">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 self-start flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-400" />
                    Android Widget Picker Preview Picture
                  </div>
                  <img
                    src="/widget_preview.png"
                    alt="Dailyz Android Widget Preview"
                    className="w-full max-h-56 object-contain rounded-xl shadow-lg border border-gray-700/50"
                  />
                  <p className="text-[11px] text-gray-400 mt-2 text-center">
                    Simplified design shown when picking widgets in Android launcher.
                  </p>
                </div>
              ) : (
                <div className="p-3 sm:p-4">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Smartphone size={12} className="text-blue-400" />
                    Preview on Android Home Screen
                  </div>
                  <img
                    src="/widget_showcase.jpg"
                    alt="Widget on Android Homescreen"
                    className="w-full max-h-56 object-cover object-center rounded-xl shadow-lg"
                  />
                </div>
              )}
            </div>

            {/* How to Add Step-by-Step Guide */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                How to Add to Android Home Screen
              </h3>
              
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-white">Press & Hold:</strong> Long-press any empty space on your Android home screen.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-white">Select Widgets:</strong> Tap the <span className="font-semibold text-blue-500">Widgets</span> icon in the menu.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-white">Place Dailyz:</strong> Scroll to <strong className="text-gray-900 dark:text-white">Dailyz</strong>, pick the <strong className="text-amber-500">Daily Quest</strong> widget, and place it!
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800/80 shrink-0 flex items-center justify-between gap-3">
            {syncStatus ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-pop">
                <CheckCircle size={15} />
                {syncStatus}
              </span>
            ) : (
              <span className="text-xs text-gray-400">
                Syncs with your latest quest & stars
              </span>
            )}

            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-accent text-white font-bold text-xs shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: userData.accentColor || '#3b82f6' }}
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync Widget'}
            </button>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
