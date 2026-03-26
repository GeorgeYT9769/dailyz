/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './components/Home';
import Profile from './components/Profile';
import Rewards from './components/Rewards';
import Settings from './components/Settings';
import ProfilePreview from './components/ProfilePreview';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [profilePreview, setProfilePreview] = useState<any>(null);

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

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'profile': return <Profile />;
      case 'rewards': return <Rewards />;
      case 'settings': return <Settings />;
      default: return <Home />;
    }
  };

  return (
    <AppProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderTab()}
      </Layout>
      <AnimatePresence>
        {profilePreview && (
          <ProfilePreview 
            data={profilePreview} 
            onClose={() => setProfilePreview(null)} 
          />
        )}
      </AnimatePresence>
    </AppProvider>
  );
}
