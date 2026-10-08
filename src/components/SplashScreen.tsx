import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  isLoading?: boolean;
  onFinish?: () => void;
}

export default function SplashScreen({ isLoading = true, onFinish }: SplashScreenProps) {
  return (
    <AnimatePresence onExitComplete={onFinish}>
      {isLoading && (
        <motion.div
          key="dailyz-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-950 text-white select-none overflow-hidden"
          style={{ backgroundColor: '#111827' }}
        >
          <div className="flex flex-col items-center justify-center">
            {/* App Icon */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative flex items-center justify-center mb-5"
            >
              <img
                src="/icon.png"
                alt="Dailyz Icon"
                className="w-24 h-24 rounded-3xl shadow-2xl object-cover ring-1 ring-white/10"
                onError={(e) => {
                  // Fallback if image path fails
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.icon-fallback') as HTMLElement | null;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div 
                className="icon-fallback hidden w-24 h-24 rounded-3xl bg-gray-800 ring-1 ring-white/10 shadow-2xl items-center justify-center text-3xl font-black text-amber-400"
              >
                ⚡
              </div>
            </motion.div>

            {/* App Name & Version Only */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-center"
            >
              <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1">
                <span>Daily</span>
                <span 
                  className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, var(--accent-color, #3b82f6), #818cf8)'
                  }}
                >
                  z
                </span>
              </h1>
              <span className="mt-1.5 block text-xs font-mono font-medium text-gray-400 tracking-wider">
                v1.0.0
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
