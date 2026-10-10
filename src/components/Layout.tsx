import React, { useRef } from 'react';
import { Home, User, Gift, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerHaptic } from '../utils/haptics';
import { useAppContext } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export default function Layout({ 
  children, 
  activeTab, 
  setActiveTab,
  onSwipeLeft,
  onSwipeRight
}: LayoutProps) {
  const { userData } = useAppContext();
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'rewards', icon: Gift, label: 'Rewards' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const target = e.target as HTMLElement | null;
    // Don't intercept swipe when interacting with form controls or sliders
    if (target?.closest('input, textarea, select, [contenteditable="true"], [role="slider"]')) {
      touchStartRef.current = null;
      return;
    }
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const start = touchStartRef.current;
    touchStartRef.current = null;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - start.x;
    const deltaY = endY - start.y;
    const elapsed = Date.now() - start.time;

    // A valid horizontal swipe: fast (< 500ms), > 45px distance, and predominantly horizontal
    if (elapsed < 500 && Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      }
    }
  };

  return (
    <div 
      className="h-[100dvh] max-h-[100dvh] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <main className="max-w-md mx-auto px-4 pt-safe pt-8 sm:pt-10 pb-6 flex-1 w-full flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
        {children}
        {/* Generous bottom clearance spacer so all content scrolls completely above the floating nav */}
        <div className="h-20 sm:h-24 shrink-0" aria-hidden="true" />
      </main>
      
      {/* Floating Bottom Nav Island */}
      <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none pb-safe">
        <nav 
          className="relative pointer-events-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-2xl shadow-gray-950/15 dark:shadow-black/50 p-1.5 rounded-full flex items-center ring-1 ring-black/5 dark:ring-white/5 select-none text-gray-400 dark:text-gray-500 max-w-[calc(100vw-2rem)] isolate"
          aria-label="Main Navigation"
        >
          {/* Active Sliding Pill: precisely matches the active tab's width and position */}
          {(() => {
            const activeIdx = tabs.findIndex(t => t.id === activeTab);
            // Inactive tab = 40px, Active tab = 100px, gap = 4px, nav padding = 6px (p-1.5)
            // The nav has p-1.5 (left: 1.5). The active button starts at activeIdx * (40 + 4)
            const inactiveWidth = 40;
            const activeWidth = 100;
            const gap = 4;
            const leftOffset = activeIdx * (inactiveWidth + gap);

            return (
              <motion.div
                className="absolute left-1.5 top-1.5 bottom-1.5 rounded-full pointer-events-none -z-0"
                style={{
                  backgroundColor: 'var(--accent-color)',
                  opacity: 0.16,
                }}
                initial={false}
                animate={{
                  x: leftOffset,
                  width: activeWidth,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 34,
                  mass: 0.7,
                }}
              />
            );
          })()}

          <div className="flex items-center gap-1 relative z-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (activeTab !== tab.id) {
                      triggerHaptic('selection', userData.vibrationEnabled);
                    }
                    setActiveTab(tab.id);
                  }}
                  className={`relative flex items-center h-10 rounded-full cursor-pointer select-none [-webkit-tap-highlight-color:transparent] outline-none transition-[width,color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    isActive 
                      ? 'w-[100px] font-bold text-xs sm:text-sm' 
                      : 'w-10 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  style={isActive ? { color: 'var(--accent-color)' } : undefined}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Fixed left-anchored icon: centered when w-10 (10px padding on left for 20px icon in 40px button), perfectly still during button expansion */}
                  <div className="absolute left-2.5 top-2.5 w-5 h-5 flex items-center justify-center shrink-0 pointer-events-none">
                    <Icon 
                      size={20}
                      className={`shrink-0 transition-colors duration-200 ${
                        isActive ? '' : 'text-gray-400 dark:text-gray-500'
                      }`}
                      style={isActive ? { color: 'var(--accent-color)' } : undefined}
                    />
                  </div>
                  
                  {/* Label: positioned immediately to the right of the icon with zero twitching */}
                  <AnimatePresence initial={false} mode="wait">
                    {isActive && (
                      <motion.span
                        key={tab.id}
                        initial={{ opacity: 0, x: 2 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, transition: { duration: 0.05 } }}
                        transition={{ 
                          opacity: { duration: 0.16, delay: 0.05 },
                          x: { duration: 0.16, ease: 'easeOut' },
                        }}
                        className="pl-8 pr-3 font-bold text-xs sm:text-sm whitespace-nowrap select-none overflow-hidden truncate pointer-events-none"
                        style={{ color: 'var(--accent-color)' }}
                      >
                        {tab.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
