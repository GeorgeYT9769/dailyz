import React, { useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Moon, Sun, Palette, Download, Upload, Vibrate } from 'lucide-react';

export default function Settings() {
  const { userData, updateSettings, importData } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "daily_quests_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
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
          alert('Data imported successfully!');
        } else {
          alert('Invalid data format.');
        }
      } catch (err) {
        alert('Failed to parse file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#8b5cf6', // violet
    '#f43f5e', // rose
    '#f59e0b', // amber
    '#06b6d4', // cyan
  ];

  return (
    <div className="animate-pop">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
      </header>

      <div className="space-y-6">
        <section className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Appearance</h2>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                {userData.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <span className="font-medium">Dark Mode</span>
            </div>
            <button 
              onClick={() => updateSettings({ theme: userData.theme === 'dark' ? 'light' : 'dark' })}
              className={`w-12 h-6 rounded-full relative transition-colors ${userData.theme === 'dark' ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'}`}
              style={userData.theme === 'dark' ? { backgroundColor: 'var(--accent-color)' } : {}}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${userData.theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                <Vibrate size={20} />
              </div>
              <span className="font-medium">Vibration</span>
            </div>
            <button 
              onClick={() => updateSettings({ vibrationEnabled: !userData.vibrationEnabled })}
              className={`w-12 h-6 rounded-full relative transition-colors ${userData.vibrationEnabled ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'}`}
              style={userData.vibrationEnabled ? { backgroundColor: 'var(--accent-color)' } : {}}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${userData.vibrationEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                <Palette size={20} />
              </div>
              <span className="font-medium">Accent Color</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => updateSettings({ accentColor: color })}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${userData.accentColor === color ? 'scale-110 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color, ringColor: color }}
                >
                  {userData.accentColor === color && <div className="w-3 h-3 bg-white rounded-full opacity-80" />}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Data Management</h2>
          
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download size={20} className="text-gray-500" />
                <span className="font-medium">Export Backup</span>
              </div>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Upload size={20} className="text-gray-500" />
                <span className="font-medium">Import Backup</span>
              </div>
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
    </div>
  );
}
