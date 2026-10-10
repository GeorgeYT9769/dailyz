import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Star, ShoppingBag, Clock, Trophy, Palette, User, CheckCircle, Flame, Snowflake } from 'lucide-react';
import rewardsData from '../data/rewards.json';
import { motion, AnimatePresence } from 'motion/react';
import Lottie from 'lottie-react';
import StreakModal from './StreakModal';
import { triggerHaptic } from '../utils/haptics';

// 💡 CUSTOM LOTTIE ANIMATION:
// Replace this with your own Lottie JSON for the reward unlock effect
const unlockLottie = {"v":"4.10.1","fr":30,"ip":0,"op":40,"w":80,"h":80,"nm":"Success Checkmark","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"Check Mark","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[40,40,0],"ix":2},"a":{"a":0,"k":[-1.312,6,0],"ix":1},"s":{"a":0,"k":[100,100,100],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":0,"k":{"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0]],"v":[[-15.75,8],[-8,16],[13.125,-4]],"c":false},"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"tm","s":{"a":1,"k":[{"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"n":["0p667_1_0p333_0"],"t":25,"s":[0],"e":[100]},{"t":33}],"ix":1},"e":{"a":0,"k":0,"ix":2},"o":{"a":0,"k":0,"ix":3},"m":1,"ix":2,"nm":"Trim Paths 1","mn":"ADBE Vector Filter - Trim","hd":false},{"ty":"st","c":{"a":0,"k":[1,1,1,1],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":3,"ix":5},"lc":2,"lj":2,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Shape 1","np":3,"cix":2,"ix":1,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":40,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"Circle Flash","sr":1,"ks":{"o":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":25,"s":[0],"e":[98]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":30,"s":[98],"e":[0]},{"t":38}],"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[40,40,0],"ix":2},"a":{"a":0,"k":[0,0,0],"ix":1},"s":{"a":1,"k":[{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"n":["0p667_1_0p333_0","0p667_1_0p333_0","0p667_1_0p333_0"],"t":25,"s":[0,0,100],"e":[100,100,100]},{"t":30}],"ix":6}},"ao":0,"shapes":[{"d":1,"ty":"el","s":{"a":0,"k":[64,64],"ix":2},"p":{"a":0,"k":[0,0],"ix":3},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse","hd":false},{"ty":"fl","c":{"a":0,"k":[0.529866635799,0.961458325386,0.448091417551,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false}],"ip":0,"op":40,"st":0,"bm":0},{"ddd":0,"ind":3,"ty":4,"nm":"Circle Stroke","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[39.022,39.022,0],"ix":2},"a":{"a":0,"k":[0,0,0],"ix":1},"s":{"a":1,"k":[{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"n":["0p667_1_0p333_0","0p667_1_0p333_0","0p667_1_0p333_0"],"t":16,"s":[100,100,100],"e":[80,80,100]},{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"n":["0p667_1_0p333_0","0p667_1_0p333_0","0p667_1_0p333_0"],"t":22,"s":[80,80,100],"e":[120,120,100]},{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"n":["0p667_1_0p333_0","0p667_1_0p333_0","0p667_1_0p333_0"],"t":25,"s":[120,120,100],"e":[100,100,100]},{"t":29}],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[60,60],"ix":2},"p":{"a":0,"k":[0,0],"ix":3},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse","hd":false},{"ty":"tm","s":{"a":1,"k":[{"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"n":["0p667_1_0p333_0"],"t":0,"s":[0],"e":[100]},{"t":16}],"ix":1},"e":{"a":0,"k":0,"ix":2},"o":{"a":0,"k":0,"ix":3},"m":1,"ix":2,"nm":"Trim Paths 1","mn":"ADBE Vector Filter - Trim","hd":false},{"ty":"st","c":{"a":0,"k":[0.427450984716,0.800000011921,0.35686275363,1],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":3,"ix":5},"lc":2,"lj":2,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tr","p":{"a":0,"k":[0.978,0.978],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Ellipse 1","np":3,"cix":2,"ix":1,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":40,"st":0,"bm":0},{"ddd":0,"ind":4,"ty":4,"nm":"Circle Green Fill","sr":1,"ks":{"o":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"n":["0p833_0p833_0p167_0p167"],"t":21,"s":[0],"e":[98]},{"t":28}],"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[40,40,0],"ix":2},"a":{"a":0,"k":[0,0,0],"ix":1},"s":{"a":1,"k":[{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"n":["0p667_1_0p333_0","0p667_1_0p333_0","0p667_1_0p333_0"],"t":21,"s":[0,0,100],"e":[100,100,100]},{"t":28}],"ix":6}},"ao":0,"shapes":[{"d":1,"ty":"el","s":{"a":0,"k":[64,64],"ix":2},"p":{"a":0,"k":[0,0],"ix":3},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse","hd":false},{"ty":"fl","c":{"a":0,"k":[0.427450984716,0.800000011921,0.35686275363,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false}],"ip":0,"op":40,"st":0,"bm":0}]};

export default function Rewards() {
  const { userData, redeemReward, updateSettings } = useAppContext();
  const [showUnlock, setShowUnlock] = useState<{title: string, type?: 'unlock' | 'equip'} | null>(null);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleRedeem = (reward: any) => {
    const isUnlocked = 
      (reward.type === 'rank' && userData.unlockedRanks.includes(reward.value)) ||
      (reward.type === 'decoration' && userData.unlockedDecorations.includes(reward.value)) ||
      (reward.type === 'avatar' && userData.unlockedAvatars.includes(reward.value)) ||
      (reward.type === 'rank_custom' && userData.hasCustomRankUnlock) ||
      (reward.type === 'avatar_custom' && userData.unlockedAvatars.some(a => a.startsWith('img:')));

    if (reward.type === 'freeze' || reward.type === 'freeze_pack' || reward.type === 'recovery_token') {
      if (userData.points < reward.cost) return;
      triggerHaptic('success', userData.vibrationEnabled);
      redeemReward(reward.id);
      triggerFeedback(reward.title, 'unlock');
      return;
    }

    if (isUnlocked) {
      // Just equip
      triggerHaptic('light', userData.vibrationEnabled);
      if (reward.type === 'rank') updateSettings({ rank: reward.value });
      if (reward.type === 'decoration') updateSettings({ activeDecoration: reward.value });
      if (reward.type === 'avatar') updateSettings({ activeAvatar: reward.value });
      triggerFeedback(reward.title, 'equip');
    } else {
      // Buy
      if (userData.points < reward.cost) return;

      triggerHaptic('success', userData.vibrationEnabled);

      if (reward.type === 'rank_custom') {
        redeemReward(reward.id);
        triggerFeedback(reward.title, 'unlock');
      } else if (reward.type === 'avatar_custom') {
        avatarInputRef.current?.click();
      } else {
        redeemReward(reward.id);
        triggerFeedback(reward.title, 'unlock');
      }
    }
  };

  const handleCustomAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const customAvatarValue = `img:${base64}`;
      redeemReward('av_custom', customAvatarValue);
      triggerFeedback("Custom Avatar", 'unlock');
    };
    reader.readAsDataURL(file);
  };

  const triggerFeedback = (title: string, type: 'unlock' | 'equip') => {
    setShowUnlock({ title, type });
    setTimeout(() => setShowUnlock(null), 2000);
  };

  const categories = [
    { id: 'freeze', label: 'Streak Protection', icon: Snowflake },
    { id: 'standard', label: 'Standard Rewards', icon: ShoppingBag },
    { id: 'rank', label: 'Ranks', icon: Trophy },
    { id: 'decoration', label: 'Decorations', icon: Palette },
    { id: 'avatar', label: 'Avatars', icon: User },
  ];

  return (
    <div>
      <header className="flex justify-between items-center mb-6 pt-2 sm:pt-3">
        <h1 className="text-2xl font-bold tracking-tight">Rewards Shop</h1>
        <div className="flex items-center gap-2">
          {/* Streak pill: flame and number */}
          <button
            onClick={() => setShowStreakModal(true)}
            className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title="View Streak Map"
            aria-label="View Streak Map"
          >
            <Flame className="text-orange-500 fill-orange-500 group-hover:scale-110 transition-transform" size={16} />
            <span className="font-bold text-sm text-gray-800 dark:text-gray-100">{userData.streak}</span>
          </button>

          {/* Stars pill */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
            <Star className="text-yellow-400 fill-yellow-400" size={16} />
            <span className="font-bold text-sm text-gray-800 dark:text-gray-100">{userData.points}</span>
          </div>
        </div>
      </header>

      <input 
        type="file" 
        ref={avatarInputRef} 
        onChange={handleCustomAvatar} 
        accept="image/*" 
        className="hidden" 
      />

      <div className="space-y-8 pb-8">
        {categories.map(category => {
          const categoryRewards = (rewardsData as any[]).filter(r => 
            category.id === 'freeze' ? (r.type === 'freeze' || r.type === 'freeze_pack' || r.type === 'recovery_token') :
            category.id === 'standard' ? r.type === 'standard' : 
            category.id === 'rank' ? (r.type === 'rank' || r.type === 'rank_custom') :
            category.id === 'avatar' ? (r.type === 'avatar' || r.type === 'avatar_custom') :
            r.type === category.id
          );

          if (categoryRewards.length === 0) return null;

          const CategoryIcon = category.icon;

          return (
            <div key={category.id} className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 px-2">
                <CategoryIcon size={20} className="text-gray-400" />
                {category.label}
              </h2>
              <div className="space-y-3">
                {categoryRewards.map(reward => {
                  const canAfford = userData.points >= reward.cost;
                  const isUnlocked = 
                    (reward.type === 'rank' && userData.unlockedRanks.includes(reward.value)) ||
                    (reward.type === 'decoration' && userData.unlockedDecorations.includes(reward.value)) ||
                    (reward.type === 'avatar' && userData.unlockedAvatars.includes(reward.value)) ||
                    (reward.type === 'rank_custom' && userData.hasCustomRankUnlock) ||
                    (reward.type === 'avatar_custom' && userData.unlockedAvatars.some(a => a.startsWith('img:')));

                  const isEquipped = 
                    (reward.type === 'rank' && userData.rank === reward.value) ||
                    (reward.type === 'decoration' && userData.activeDecoration === reward.value) ||
                    (reward.type === 'avatar' && userData.activeAvatar === reward.value);

                  return (
                    <div key={reward.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="font-bold flex items-center gap-2">
                          {reward.title}
                          {isUnlocked && <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Unlocked</span>}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <Star size={14} className="text-yellow-400" />
                          <span>{reward.cost} Points</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canAfford && !isUnlocked}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                          isEquipped
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm flex items-center gap-1.5'
                            : isUnlocked
                              ? 'bg-accent text-white shadow-md shadow-accent/25 hover:opacity-95 flex items-center gap-1.5' 
                              : canAfford
                                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 flex items-center gap-1.5'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed flex items-center gap-1.5'
                        }`}
                        style={
                          isUnlocked && !isEquipped
                            ? userData.accentColor === '#f59e0b'
                              ? { backgroundColor: '#4f46e5' }
                              : { backgroundColor: 'var(--accent-color)' }
                            : {}
                        }
                      >
                        {isEquipped ? (
                          <>
                            <CheckCircle size={14} />
                            Equipped
                          </>
                        ) : isUnlocked ? (
                          reward.type === 'standard' ? 'Redeem' : 'Equip'
                        ) : (
                          (reward.type === 'freeze' || reward.type === 'freeze_pack' || reward.type === 'recovery_token')
                            ? 'Get'
                            : reward.type === 'standard' ? 'Redeem' : 'Buy'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showUnlock && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className={`fixed bottom-24 left-4 right-4 p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[60] ${
              showUnlock.type === 'equip' ? 'bg-accent text-white' : 'bg-amber-500 text-white'
            }`}
            style={showUnlock.type === 'equip' ? { backgroundColor: 'var(--accent-color)' } : {}}
          >
            <div className="bg-white/20 p-1 rounded-full w-12 h-12 flex items-center justify-center">
              {showUnlock.type === 'equip' ? (
                <CheckCircle size={24} />
              ) : (
                <Lottie animationData={unlockLottie} loop={false} />
              )}
            </div>
            <div>
              <p className="font-bold">{showUnlock.type === 'equip' ? 'Item Equipped!' : 'Reward Unlocked!'}</p>
              <p className="text-sm opacity-90">{showUnlock.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {userData.redeemedRewards.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Clock size={20} className="text-gray-400" />
            Recently Redeemed
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            {userData.redeemedRewards.slice().reverse().map((reward, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0 first:pt-0">
                <span className="font-medium text-gray-600 dark:text-gray-300">{reward.title}</span>
                <span className="text-sm text-gray-400">-{reward.cost} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showStreakModal && (
          <StreakModal
            isOpen={showStreakModal}
            onClose={() => setShowStreakModal(false)}
            streak={userData.streak}
            longestStreak={userData.longestStreak}
            completedDays={userData.completedDays}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
