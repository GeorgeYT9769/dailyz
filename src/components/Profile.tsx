import React, { useRef, useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Trophy, Flame, Star, CalendarCheck, Camera, User, Share2, X, Edit2, Scan, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function Profile() {
  const { userData, updateSettings } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showPfpMenu, setShowPfpMenu] = useState(false);
  const [isEditingRank, setIsEditingRank] = useState(false);
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const defaultPfps = [
    '/pfp1.png',
    '/pfp2.png',
    '/pfp3.png',
    '/pfp4.png',
  ];

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render((decodedText) => {
        try {
          const url = new URL(decodedText);
          const name = url.searchParams.get('user');
          const rank = url.searchParams.get('rank');
          if (name && rank) {
            // Use window.location.search to trigger the preview in App.tsx
            window.location.search = url.search;
          } else {
            alert(`Scanned: ${decodedText}`);
          }
        } catch (e) {
          alert(`Scanned: ${decodedText}`);
        }
        scanner.clear();
        setShowScanner(false);
      }, (error) => {
        // console.warn(error);
      });

      return () => {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      };
    }
  }, [showScanner]);

  const triggerFeedback = (msg: string) => {
    if (userData.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(20);
    }
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateSettings({ profileImage: base64 });
      triggerFeedback("Photo Updated!");
      setShowPfpMenu(false);
    };
    reader.readAsDataURL(file);
  };

  const stats = [
    {
      label: 'Total Points',
      value: userData.points,
      icon: Star,
      color: 'text-yellow-500',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: 'Current Streak',
      value: `${userData.streak} Days`,
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      label: 'Longest Streak',
      value: `${userData.longestStreak} Days`,
      icon: Trophy,
      color: 'text-purple-500',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: 'Completed Quests',
      value: userData.completedDays.length,
      icon: CalendarCheck,
      color: 'text-green-500',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
  ];

  const getDecorationClass = () => {
    if (!userData.activeDecoration) return '';
    return `decoration-${userData.activeDecoration}`;
  };

  const shareUrl = `${window.location.origin}?user=${encodeURIComponent(userData.name)}&rank=${encodeURIComponent(userData.rank)}&points=${userData.points}&streak=${userData.streak}&avatar=${encodeURIComponent(userData.activeAvatar || '')}&dec=${encodeURIComponent(userData.activeDecoration || '')}&tag=${encodeURIComponent(userData.pfpTag || '')}${userData.profileImage && !userData.profileImage.startsWith('data:') ? `&pfp=${encodeURIComponent(userData.profileImage)}` : ''}`;

  return (
    <div className="animate-pop pb-8">
      <header className="mb-8 flex flex-col items-center">
        <div className="relative mb-4">
          <div className={`w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center transition-all duration-500 ${getDecorationClass()}`}>
            {userData.profileImage ? (
              <img 
                src={userData.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User size={64} className="text-gray-400" />
            )}
          </div>
          
          {/* PFP Tag */}
          {userData.pfpTag && (
            <div className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800 z-30 animate-pop" style={{ backgroundColor: 'var(--accent-color)' }}>
              {userData.pfpTag}
            </div>
          )}

          {/* Avatar Overlay - Bottom Left */}
          {userData.activeAvatar && (
            <div className="absolute -bottom-1 -left-1 w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center text-2xl border-2 border-gray-100 dark:border-gray-700 z-20 animate-pop overflow-hidden">
              {userData.activeAvatar.startsWith('img:') ? (
                <img 
                  src={userData.activeAvatar.replace('img:', '')} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                userData.activeAvatar
              )}
            </div>
          )}

          <button 
            onClick={() => setShowPfpMenu(true)}
            className="absolute bottom-0 right-0 bg-accent p-2 rounded-full text-white shadow-md hover:scale-110 transition-transform z-10"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            <Camera size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        
        <div className="text-center w-full px-4">
          <input
            type="text"
            value={userData.name}
            onChange={(e) => updateSettings({ name: e.target.value })}
            className="text-2xl font-bold bg-transparent border-none text-center focus:outline-none focus:ring-2 focus:ring-accent/20 rounded-lg px-2 w-full"
            placeholder="Enter your name"
          />
          <div className="flex flex-col items-center gap-1 mt-1">
            <div className="flex items-center justify-center gap-2">
              {isEditingRank ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={userData.rank}
                    onChange={(e) => updateSettings({ rank: e.target.value })}
                    onBlur={() => setIsEditingRank(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingRank(false)}
                    className="text-accent font-bold text-sm uppercase tracking-widest bg-gray-100 dark:bg-gray-700 rounded px-2 py-0.5 focus:outline-none"
                    style={{ color: 'var(--accent-color)' }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-1 group">
                  <span className="text-accent font-bold text-sm uppercase tracking-widest" style={{ color: 'var(--accent-color)' }}>
                    {userData.rank}
                  </span>
                  {userData.hasCustomRankUnlock && (
                    <button 
                      onClick={() => setIsEditingRank(true)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-accent"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* PFP Tag Editor */}
            {userData.hasCustomPfpTagUnlock && (
              <div className="flex items-center justify-center gap-2">
                {isEditingTag ? (
                  <input
                    autoFocus
                    type="text"
                    value={userData.pfpTag || ''}
                    onChange={(e) => updateSettings({ pfpTag: e.target.value.toUpperCase() })}
                    onBlur={() => setIsEditingTag(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingTag(false)}
                    className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-700 rounded px-2 py-0.5 focus:outline-none"
                    placeholder="CUSTOM TAG"
                  />
                ) : (
                  <button 
                    onClick={() => setIsEditingTag(true)}
                    className="text-[10px] font-black text-gray-400 hover:text-accent uppercase tracking-widest transition-colors flex items-center gap-1"
                  >
                    {userData.pfpTag || 'ADD TAG'}
                    <Edit2 size={8} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button 
            onClick={() => setShowQR(true)}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-accent transition-colors uppercase tracking-widest"
          >
            <Share2 size={14} />
            Share
          </button>
          <button 
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-accent transition-colors uppercase tracking-widest"
          >
            <Scan size={14} />
            Scan
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showPfpMenu && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowPfpMenu(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">Change PFP</h3>
                <button onClick={() => setShowPfpMenu(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {defaultPfps.map((pfp, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      updateSettings({ profileImage: pfp });
                      triggerFeedback("PFP Updated!");
                      setShowPfpMenu(false);
                    }}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${userData.profileImage === pfp ? 'border-accent' : 'border-transparent'}`}
                    style={userData.profileImage === pfp ? { borderColor: 'var(--accent-color)' } : {}}
                  >
                    <img src={pfp} alt={`Default ${i+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-accent text-white rounded-2xl font-black shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                <Camera size={20} />
                Upload Custom
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-3">Statistics</h2>
          <div className="space-y-3">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                  <div className={`${stat.bg} p-3 rounded-xl`}>
                    <Icon className={stat.color} size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {(userData.unlockedAvatars.length > 0 || userData.unlockedDecorations.length > 0 || userData.unlockedRanks.length > 1) && (
          <section className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Customization</h2>
            
            {userData.unlockedRanks.length > 1 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Equipped Rank</p>
                <div className="flex flex-wrap gap-2">
                  {userData.unlockedRanks.map(rank => (
                    <button
                      key={rank}
                      onClick={() => {
                        updateSettings({ rank });
                        triggerFeedback("Rank Equipped!");
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${userData.rank === rank ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
                      style={userData.rank === rank ? { backgroundColor: 'var(--accent-color)' } : {}}
                    >
                      {rank}
                      {userData.rank === rank && <CheckCircle size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {userData.unlockedAvatars.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Unlocked Avatars</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      updateSettings({ activeAvatar: null });
                      triggerFeedback("Avatar Removed");
                    }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${!userData.activeAvatar ? 'border-accent bg-accent/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'}`}
                    style={!userData.activeAvatar ? { borderColor: 'var(--accent-color)' } : {}}
                  >
                    {!userData.activeAvatar ? (
                      <CheckCircle size={20} className="text-accent" style={{ color: 'var(--accent-color)' }} />
                    ) : (
                      <X size={20} className="text-gray-400" />
                    )}
                  </button>
                  {userData.unlockedAvatars.map(avatar => (
                    <button
                      key={avatar}
                      onClick={() => {
                        updateSettings({ activeAvatar: avatar });
                        triggerFeedback("Avatar Equipped!");
                      }}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 transition-all overflow-hidden relative ${userData.activeAvatar === avatar ? 'border-accent bg-accent/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'}`}
                      style={userData.activeAvatar === avatar ? { borderColor: 'var(--accent-color)' } : {}}
                    >
                      {avatar.startsWith('img:') ? (
                        <img src={avatar.replace('img:', '')} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        avatar
                      )}
                      {userData.activeAvatar === avatar && (
                        <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                          <CheckCircle size={20} className="text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {userData.unlockedDecorations.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">PFP Decorations</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      updateSettings({ activeDecoration: null });
                      triggerFeedback("Decoration Removed");
                    }}
                    className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center ${!userData.activeDecoration ? 'border-accent bg-accent/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'}`}
                    style={!userData.activeDecoration ? { borderColor: 'var(--accent-color)' } : {}}
                  >
                    {!userData.activeDecoration ? (
                      <CheckCircle size={20} className="text-accent" style={{ color: 'var(--accent-color)' }} />
                    ) : (
                      <X size={20} className="text-gray-400" />
                    )}
                  </button>
                  {userData.unlockedDecorations.map(dec => (
                    <button
                      key={dec}
                      onClick={() => {
                        updateSettings({ activeDecoration: dec });
                        triggerFeedback("Decoration Equipped!");
                      }}
                      className={`w-12 h-12 rounded-full border-4 transition-all decoration-${dec} flex items-center justify-center ${userData.activeDecoration === dec ? 'ring-2 ring-offset-2 ring-accent' : ''}`}
                      style={userData.activeDecoration === dec ? { ringColor: 'var(--accent-color)' } : {}}
                    >
                      {userData.activeDecoration === dec && (
                        <div className="bg-white/90 dark:bg-black/90 rounded-full p-0.5 shadow-sm">
                          <CheckCircle size={14} className="text-accent" style={{ color: 'var(--accent-color)' }} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={() => setShowQR(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-xs w-full flex flex-col items-center text-center shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-white p-4 rounded-3xl mb-6 shadow-inner border-4 border-accent" style={{ borderColor: 'var(--accent-color)' }}>
                <QRCodeSVG value={shareUrl} size={200} level="H" includeMargin />
              </div>
              <h3 className="text-xl font-bold mb-2">{userData.name}</h3>
              <p className="text-accent font-bold text-sm uppercase tracking-widest mb-6" style={{ color: 'var(--accent-color)' }}>
                {userData.rank}
              </p>
              <button 
                onClick={() => setShowQR(false)}
                className="w-full py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-bold">Scan Profile</h3>
                <button 
                  onClick={() => setShowScanner(false)}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
              <div id="reader" className="w-full aspect-square bg-black"></div>
              <div className="p-6 text-center text-sm text-gray-500">
                Point your camera at a Daily Quests QR code
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 bg-accent text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[60]"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            <div className="bg-white/20 p-2 rounded-full">
              <Star size={20} />
            </div>
            <p className="font-bold">{feedback}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
