import React, { useRef } from 'react';
import { Home, User, Gift, Settings } from 'lucide-react';
import { motion } from 'motion/react';
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
        {/* Guaranteed bottom clearance spacer so user can scroll completely down */}
        <div className="h-6 shrink-0" aria-hidden="true" />
      </main>
      
      <nav className="shrink-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-4 py-2 pb-safe z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (activeTab !== tab.id) {
                    triggerHaptic('selection', userData.vibrationEnabled);
                  }
                  setActiveTab(tab.id);
                }}
                className={`relative flex flex-col items-center py-1.5 px-3 rounded-2xl transition-colors cursor-pointer ${
                  isActive ? 'text-accent' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
                style={isActive ? { color: 'var(--accent-color)' } : {}}
              >
                <Icon size={24} className={isActive ? 'animate-bounce-slight' : ''} />
                <span className="text-[11px] mt-1 font-medium">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--accent-color, #3b82f6)' }}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
