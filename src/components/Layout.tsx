import React from 'react';
import { Home, User, Gift, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'rewards', icon: Gift, label: 'Rewards' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-20 transition-colors duration-300">
      <main className="max-w-md mx-auto p-4 pt-8">
        {children}
      </main>
      
      <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 pb-safe z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                  isActive ? 'text-accent' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                style={isActive ? { color: 'var(--accent-color)' } : {}}
              >
                <Icon size={24} className={isActive ? 'animate-bounce-slight' : ''} />
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
