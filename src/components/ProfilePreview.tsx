import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Flame, Trophy, User } from 'lucide-react';

interface ProfilePreviewProps {
  data: {
    user: string;
    rank: string;
    points: string;
    streak: string;
    avatar?: string;
    dec?: string;
    tag?: string;
    pfp?: string;
  };
  onClose: () => void;
}

export default function ProfilePreview({ data, onClose }: ProfilePreviewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-gray-950 z-[200] flex flex-col items-center overflow-y-auto"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]" style={{ backgroundColor: 'var(--accent-color)' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" style={{ backgroundColor: 'var(--accent-color)' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
      </div>

      <div className="max-w-md w-full px-6 py-12 flex flex-col items-center min-h-screen">
        <div className="w-full flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-black text-xs" style={{ backgroundColor: 'var(--accent-color)' }}>D</div>
            <span className="font-black text-sm uppercase tracking-widest">Dailyz Profile</span>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-500 hover:scale-110 transition-transform shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        <div className="relative mb-8">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className={`w-48 h-48 rounded-[3rem] overflow-hidden bg-gray-200 dark:bg-gray-800 border-8 border-white dark:border-gray-900 shadow-2xl flex items-center justify-center transition-all duration-500 ${data.dec ? `decoration-${data.dec}` : ''}`}
          >
            {data.pfp ? (
              <img 
                src={data.pfp} 
                alt="Profile" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (data.pfp?.endsWith('.svg')) {
                    (e.target as HTMLImageElement).src = data.pfp.replace('.svg', '.png');
                  }
                }}
              />
            ) : (
              <User size={96} className="text-gray-400" />
            )}
          </motion.div>
          
          {data.tag && (
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-2 -right-2 bg-accent text-white text-xs font-black px-4 py-1.5 rounded-full shadow-xl border-4 border-white dark:border-gray-900 z-30" 
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              {data.tag}
            </motion.div>
          )}
          
          {data.avatar && (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-2 -left-2 w-20 h-20 bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl flex items-center justify-center text-5xl border-4 border-gray-50 dark:border-gray-900 z-20"
            >
              {data.avatar.startsWith('img:') ? (
                <img 
                  src={data.avatar.replace('img:', '')} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                data.avatar
              )}
            </motion.div>
          )}
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-black mb-2 tracking-tighter">{data.user}</h2>
          <p className="text-accent font-black text-sm uppercase tracking-[0.4em]" style={{ color: 'var(--accent-color)' }}>
            {data.rank}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 w-full mb-12">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <Star size={20} className="text-yellow-500" />
              </div>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Points</span>
            </div>
            <p className="text-3xl font-black">{data.points}</p>
          </motion.div>
          
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Flame size={20} className="text-orange-500" />
              </div>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Streak</span>
            </div>
            <p className="text-3xl font-black">{data.streak}</p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full mt-auto"
        >
          <button 
            onClick={onClose}
            className="w-full py-6 bg-accent text-white rounded-[2rem] font-black shadow-2xl shadow-accent/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.3em] text-sm"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            Return to App
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
