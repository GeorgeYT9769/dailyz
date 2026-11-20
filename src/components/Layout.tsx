import React, { useState, useEffect, useRef } from 'react';
import { Zap, User, Gift, Settings as SettingsIcon } from 'lucide-react';
import { motion, LayoutGroup } from 'motion/react';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audioEffects';
import { useAppContext } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export default function Layout({ children, activeTab, setActiveTab, onSwipeLeft, onSwipeRight }: LayoutProps) {
  const { userData } = useAppContext();
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);

  // Scroll detection for hiding/showing floating bottom nav
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY.current;

      if (Math.abs(diff) > 6) {
        if (diff > 0 && currentScrollY > 48) {
          setNavVisible(false);
        } else if (diff < 0) {
          setNavVisible(true);
        }
      }

      if (currentScrollY <= 20) {
        setNavVisible(true);
      }

      lastScrollY.current = currentScrollY;

      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        setNavVisible(true);
      }, 650);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!navVisible) {
      document.body.setAttribute('data-nav-hidden', 'true');
    } else {
      document.body.removeAttribute('data-nav-hidden');
    }
    return () => {
      document.body.removeAttribute('data-nav-hidden');
    };
  }, [navVisible]);

  // Swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('[data-prevent-swipe="true"], [data-modal="true"], [role="dialog"]')) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('[data-prevent-swipe="true"], [data-modal="true"], [role="dialog"]')) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
      if (diffX > 0 && onSwipeLeft) {
        triggerHaptic('selection', userData.vibrationEnabled);
        onSwipeLeft();
      } else if (diffX < 0 && onSwipeRight) {
        triggerHaptic('selection', userData.vibrationEnabled);
        onSwipeRight();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const navItems = [
    { id: 'home', label: 'Quests', icon: Zap },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleNavClick = (id: string) => {
    triggerHaptic('selection', userData.vibrationEnabled);
    playSound('pop', userData.soundEnabled ?? true);
    setActiveTab(id);
  };

  return (
    <div
      className="min-h-screen bg-[#f6f8fc] dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 flex flex-col md:flex-row pt-safe overflow-x-clip transition-colors duration-300"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tablet & Wide-Screen Sticky Side Navigation Rail (md+) */}
      <aside className="hidden md:flex md:flex-col w-60 lg:w-64 shrink-0 sticky top-0 h-screen py-7 px-4 bg-white dark:bg-gray-900 border-r-2 border-gray-200 dark:border-gray-800 z-40">
        <div className="px-3 mb-7">
          <div className="text-2xl font-black tracking-tight text-gray-950 dark:text-white leading-none">
            Dailyz
          </div>
          <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-1.5">
            One quest a day
          </p>
        </div>

        <LayoutGroup id="sideNav">
          <nav aria-label="Primary Sidebar Navigation" className="flex flex-col gap-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  whileTap={{ y: 2, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 550, damping: 32 }}
                  className={`relative w-full py-3 px-4 rounded-xl flex items-center gap-3 cursor-pointer select-none transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:text-gray-950 dark:hover:text-white'
                  }`}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSideNavTab"
                      transition={{
                        type: 'spring',
                        stiffness: 480,
                        damping: 34,
                        mass: 0.75,
                      }}
                      className="absolute inset-0 rounded-xl tab-pill-active"
                    />
                  )}
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.6 : 2.1}
                    className="relative z-10 shrink-0"
                  />
                  <span
                    className={`relative z-10 text-sm tracking-tight ${
                      isActive ? 'font-black text-white' : 'font-bold'
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </nav>
        </LayoutGroup>
      </aside>

      {/* Main Scrollable Content */}
      <main className="flex-1 w-full max-w-md sm:max-w-xl md:max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pt-4 md:pt-8 pb-24 md:pb-12 min-w-0">
        {children}
      </main>

      {/* Compact Tactile Floating Bottom Navigation Bar (Phones & Foldables portrait) */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe pointer-events-none transition-all duration-300 ease-out ${
          navVisible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-[120%] opacity-0'
        }`}
        style={{
          marginBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))',
        }}
      >
        <LayoutGroup id="bottomNav">
          <nav
            aria-label="Primary Navigation"
            className="pointer-events-auto max-w-[356px] sm:max-w-[390px] mx-auto bg-white dark:bg-gray-900 border-2 border-b-[5px] border-gray-200 dark:border-gray-700 rounded-2xl p-1.5 shadow-lg flex items-center justify-between gap-1"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  whileTap={{ y: 2, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 550, damping: 32 }}
                  className={`relative flex-1 min-h-[48px] py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      transition={{
                        type: 'spring',
                        stiffness: 480,
                        damping: 34,
                        mass: 0.75,
                      }}
                      className="absolute inset-0 rounded-xl tab-pill-active"
                    />
                  )}
                  <motion.div
                    className="relative z-10 flex items-center justify-center"
                    animate={{
                      scale: isActive ? 1.08 : 1,
                      y: isActive ? -1 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  >
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.6 : 2}
                      className="shrink-0"
                    />
                  </motion.div>
                  <span
                    className={`relative z-10 text-[10px] leading-none tracking-tight transition-colors ${
                      isActive ? 'font-extrabold text-white' : 'font-semibold'
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </nav>
        </LayoutGroup>
      </div>
    </div>
  );
}
