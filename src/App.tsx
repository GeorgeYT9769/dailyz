/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/Layout';
import Home from './components/Home';
import Profile from './components/Profile';
import Rewards from './components/Rewards';
import Settings from './components/Settings';
import ProfilePreview from './components/ProfilePreview';
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from './utils/audioEffects';

const TAB_ORDER = ['home', 'profile', 'rewards', 'settings'];

interface PageTransitionCustom {
  direction: number;
  isWide: boolean;
}

const pageVariants = {
  enter: ({ direction, isWide }: PageTransitionCustom) => ({
    x: isWide ? 0 : direction > 0 ? 24 : direction < 0 ? -24 : 0,
    y: isWide ? (direction > 0 ? 24 : direction < 0 ? -24 : 0) : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    y: 0,
    opacity: 1,
  },
  exit: ({ direction, isWide }: PageTransitionCustom) => ({
    x: isWide ? 0 : direction > 0 ? -20 : direction < 0 ? 20 : 0,
    y: isWide ? (direction > 0 ? -20 : direction < 0 ? 20 : 0) : 0,
    opacity: 0,
  }),
};

function MainContent() {
  const { isLoaded, isOnboardingOpen, closeOnboarding } = useAppContext();
  const [activeTab, setActiveTab] = useState('home');
  const [tabDirection, setTabDirection] = useState<number>(0);
  const [profilePreview, setProfilePreview] = useState<any>(null);
  const [isWideScreen, setIsWideScreen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    const handleChange = (e: MediaQueryListEvent) => setIsWideScreen(e.matches);
    setIsWideScreen(mq.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user');
    const rank = params.get('rank');
    const points = params.get('points');
    const streak = params.get('streak');
    const avatar = params.get('avatar');
    const dec = params.get('dec');
    const tag = params.get('tag');
    const pfp = params.get('pfp');

    if (user && rank) {
      setProfilePreview({ user, rank, points, streak, avatar, dec, tag, pfp });
      // Clear URL params without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleTabChange = (newTab: string) => {
    if (newTab === activeTab) return;
    const curIdx = TAB_ORDER.indexOf(activeTab);
    const newIdx = TAB_ORDER.indexOf(newTab);
    setTabDirection(newIdx > curIdx ? 1 : -1);
    setActiveTab(newTab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSwipeLeft = () => {
    if (typeof document !== 'undefined' && document.body.style.overflow === 'hidden') return;
    const curIdx = TAB_ORDER.indexOf(activeTab);
    if (curIdx < TAB_ORDER.length - 1) {
      playSound('pop', true);
      handleTabChange(TAB_ORDER[curIdx + 1]);
    }
  };

  const handleSwipeRight = () => {
    if (typeof document !== 'undefined' && document.body.style.overflow === 'hidden') return;
    const curIdx = TAB_ORDER.indexOf(activeTab);
    if (curIdx > 0) {
      playSound('pop', true);
      handleTabChange(TAB_ORDER[curIdx - 1]);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <Home onNavigateTab={handleTabChange} />;
      case 'profile': return <Profile />;
      case 'rewards': return <Rewards />;
      case 'settings': return <Settings />;
      default: return <Home onNavigateTab={handleTabChange} />;
    }
  };

  const transitionCustom: PageTransitionCustom = {
    direction: tabDirection,
    isWide: isWideScreen,
  };

  return (
    <>
      <SplashScreen isLoading={!isLoaded} />
      <Layout 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      >
        <div className="relative w-full overflow-x-clip">
          <AnimatePresence mode="wait" custom={transitionCustom} initial={false}>
            <motion.div
              key={activeTab}
              custom={transitionCustom}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { duration: 0.12, ease: [0.16, 1, 0.3, 1] },
                y: { duration: 0.14, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.1, ease: 'easeOut' },
              }}
              className="w-full"
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </Layout>
      <AnimatePresence>
        {profilePreview && (
          <ProfilePreview 
            data={profilePreview} 
            onClose={() => setProfilePreview(null)} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isLoaded && isOnboardingOpen && (
          <Onboarding onClose={closeOnboarding} />
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
