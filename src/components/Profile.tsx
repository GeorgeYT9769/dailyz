import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  Trophy, Flame, Star, CalendarCheck, Camera, User, Share2, X,
  Edit2, CheckCircle, ChevronRight, Dices, Sparkles, AtSign
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import StreakModal from './StreakModal';
import Toast from './Toast';
import ProfileCardModal from './ProfileCardModal';
import SocialsModal, { TwitterIcon, DiscordIcon, InstagramIcon, GithubIcon, TwitchIcon, YoutubeIcon } from './SocialsModal';
import ProfileImageModal from './ProfileImageModal';
import MilestonesScreen from './MilestonesScreen';
import CategoryDistributionBar from './CategoryDistributionBar';
import { getRandomInterestingName } from '../utils/nameGenerator';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audioEffects';
import questsData from '../data/quests.json';
import { getDayOfYear } from '../utils/dateUtils';
import { ACHIEVEMENTS_TREE } from '../data/achievements';
import { getLevelProgress } from '../utils/xpUtils';

export default function Profile() {
  const { userData, updateSettings } = useAppContext();
  const [activeSubView, setActiveSubView] = useState<'profile' | 'milestones'>('profile');
  const [showCardModal, setShowCardModal] = useState(false);
  const [showSocialsModal, setShowSocialsModal] = useState(false);
  const [showPfpMenu, setShowPfpMenu] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [isEditingRank, setIsEditingRank] = useState(false);
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [categoryView, setCategoryView] = useState<'completed' | 'catalog'>('completed');

  const completedQuestsList = (userData.completedDays || []).map((dateIso) => {
    try {
      const parts = dateIso.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const doy = getDayOfYear(d);
      return questsData[(doy - 1) % questsData.length];
    } catch {
      return questsData[0];
    }
  }).filter(Boolean);

  const displayQuests =
    categoryView === 'completed' && completedQuestsList.length > 0
      ? completedQuestsList
      : questsData;

  const triggerFeedback = (msg: string) => {
    triggerHaptic('light', userData.vibrationEnabled);
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2000);
  };

  const levelInfo = getLevelProgress(userData.xp || 0);

  const stats = [
    {
      label: 'Total Points',
      value: userData.points.toLocaleString(),
      icon: Star,
      iconColor: '#ecc30b',
      iconBg: 'bg-gray-100 dark:bg-gray-700',
    },
    {
      label: 'Current Streak',
      value: `${userData.streak} Days`,
      icon: Flame,
      iconColor: '#ff3b5c',
      iconBg: 'bg-gray-100 dark:bg-gray-700',
    },
    {
      label: 'Longest Streak',
      value: `${userData.longestStreak} Days`,
      icon: Trophy,
      iconColor: '#f37748',
      iconBg: 'bg-gray-100 dark:bg-gray-700',
    },
    {
      label: 'Completed Quests',
      value: userData.completedDays.length,
      icon: CalendarCheck,
      iconColor: '#067bc2',
      iconBg: 'bg-gray-100 dark:bg-gray-700',
    },
  ];

  const getDecorationClass = () => {
    if (!userData.activeDecoration) return '';
    return `decoration-${userData.activeDecoration}`;
  };

  const unlockedAchievementsCount = ACHIEVEMENTS_TREE.filter((n) => n.isUnlocked(userData)).length;

  const openMilestones = () => {
    triggerHaptic('medium', userData.vibrationEnabled);
    playSound('achievement', userData.soundEnabled ?? true);
    setActiveSubView('milestones');
    const mainElem = document.querySelector('main');
    if (mainElem) mainElem.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (activeSubView === 'milestones') {
    return (
      <MilestonesScreen
        onBack={() => {
          setActiveSubView('profile');
          const mainElem = document.querySelector('main');
          if (mainElem) mainElem.scrollTop = 0;
        }}
        userData={userData}
      />
    );
  }

  return (
    <div className="pb-8 lg:grid lg:grid-cols-12 lg:gap-7 lg:items-start">
      <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
      <header className="pt-1 flex flex-col items-center">
        <div className="relative mb-4 group">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light', userData.vibrationEnabled);
              playSound('pop', userData.soundEnabled ?? true);
              setShowPfpMenu(true);
            }}
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center transition-all duration-300 cursor-pointer relative active:scale-95 ${getDecorationClass()}`}
            title="Change profile photo"
            aria-label="Change profile photo"
          >
            {userData.profileImage ? (
              <img
                src={userData.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (userData.profileImage?.endsWith('.svg')) {
                    (e.target as HTMLImageElement).src = userData.profileImage.replace('.svg', '.png');
                  }
                }}
              />
            ) : (
              <User size={60} className="text-gray-400" />
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera size={24} className="drop-shadow-md" />
            </div>
          </button>

          {userData.pfpTag && (
            <div
              className="absolute -top-1 -right-1 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md border-2 border-white dark:border-gray-800 z-30 animate-pop pointer-events-none"
              style={{ backgroundColor: 'var(--accent-color, #067bc2)' }}
            >
              {userData.pfpTag}
            </div>
          )}

          {userData.activeAvatar && (
            <div className="absolute -bottom-1 -left-1 w-11 h-11 bg-white dark:bg-gray-800 rounded-2xl shadow-md flex items-center justify-center text-2xl border-2 border-gray-200 dark:border-gray-700 z-20 animate-pop overflow-hidden pointer-events-none">
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
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light', userData.vibrationEnabled);
              setShowPfpMenu(true);
            }}
            className="btn-tactile absolute bottom-0 right-0 p-2.5 rounded-full text-white border-2 border-white dark:border-gray-800 shadow-md z-20 cursor-pointer"
            style={{ backgroundColor: 'var(--accent-color, #067bc2)' }}
            aria-label="Change profile photo"
            title="Change profile photo"
          >
            <Camera size={18} />
          </button>
        </div>

        <div className="text-center w-full px-4">
          <div className="relative flex items-center justify-center max-w-sm mx-auto">
            <input
              type="text"
              value={userData.name}
              onChange={(e) => updateSettings({ name: e.target.value })}
              className="text-2xl font-black bg-transparent border-none text-center focus:outline-none focus:ring-2 focus:ring-accent/20 rounded-lg px-9 w-full text-gray-950 dark:text-white"
              placeholder="Enter your name"
            />
            <button
              type="button"
              onClick={() => {
                const newName = getRandomInterestingName();
                updateSettings({ name: newName });
                triggerHaptic('medium', userData.vibrationEnabled);
                playSound('reroll', userData.soundEnabled ?? true);
              }}
              className="absolute right-0 p-1.5 text-gray-400 hover:text-[#067bc2] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all shrink-0 active:rotate-45 cursor-pointer"
              title="Roll a random interesting name"
              aria-label="Roll a random interesting name"
            >
              <Dices size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-1 mt-1">
            <div className="flex items-center justify-center gap-2">
              {isEditingRank ? (
                <input
                  autoFocus
                  type="text"
                  value={userData.rank}
                  onChange={(e) => updateSettings({ rank: e.target.value })}
                  onBlur={() => setIsEditingRank(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingRank(false)}
                  className="text-accent font-extrabold text-sm uppercase tracking-widest bg-gray-100 dark:bg-gray-700 rounded px-2 py-0.5 focus:outline-none"
                  style={{ color: 'var(--accent-color)' }}
                />
              ) : (
                <div className="flex items-center gap-1 group">
                  <span
                    className="font-black text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-[#067bc2]/12 text-[#067bc2] dark:bg-[#067bc2]/25 dark:text-[#84bcda]"
                  >
                    {userData.rank}
                  </span>
                  {userData.hasCustomRankUnlock && (
                    <button
                      type="button"
                      onClick={() => setIsEditingRank(true)}
                      className="opacity-60 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#067bc2]"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {userData.hasCustomPfpTagUnlock && (
              <div className="flex items-center justify-center gap-2 mt-0.5">
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
                    type="button"
                    onClick={() => setIsEditingTag(true)}
                    className="text-[10px] font-black text-gray-400 hover:text-[#067bc2] uppercase tracking-widest transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {userData.pfpTag || 'ADD TAG'}
                    <Edit2 size={8} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Pills Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <button
            type="button"
            onClick={openMilestones}
            className="btn-tactile btn-tactile-amber flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black cursor-pointer"
            title="Quest Milestones Screen"
          >
            <span className="text-sm">🏆</span>
            <span>Milestones ({unlockedAchievementsCount}/{ACHIEVEMENTS_TREE.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light', userData.vibrationEnabled);
              playSound('click', userData.soundEnabled ?? true);
              setShowCardModal(true);
            }}
            className="btn-tactile btn-tactile-neutral flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border-gray-200 dark:border-gray-700 text-xs font-extrabold text-gray-800 dark:text-gray-100 cursor-pointer"
          >
            <Share2 size={14} className="text-[#067bc2]" />
            <span>Player Card</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light', userData.vibrationEnabled);
              playSound('click', userData.soundEnabled ?? true);
              setShowSocialsModal(true);
            }}
            className="btn-tactile btn-tactile-neutral flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-800 rounded-xl border-gray-200 dark:border-gray-700 text-xs font-extrabold text-gray-800 dark:text-gray-100 cursor-pointer"
          >
            <AtSign size={14} className="text-[#f37748]" />
            <span>Socials</span>
            {userData.socials && Object.values(userData.socials).some(Boolean) && (
              <span className="w-2 h-2 rounded-full bg-[#067bc2]" />
            )}
          </button>
        </div>

        {userData.socials && Object.values(userData.socials).some(Boolean) && (
          <div
            onClick={() => {
              triggerHaptic('light', userData.vibrationEnabled);
              setShowSocialsModal(true);
            }}
            className="mt-3 flex flex-wrap items-center justify-center gap-1.5 cursor-pointer max-w-sm px-2 group"
            title="Click to edit social handles"
          >
            {userData.socials.discord && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5865F2]/10 dark:bg-[#5865F2]/20 text-[#5865F2] dark:text-[#8B93FF] border border-[#5865F2]/30">
                <DiscordIcon className="w-3 h-3 shrink-0" />
                <span>{userData.socials.discord}</span>
              </span>
            )}
            {userData.socials.twitter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/5 dark:bg-white/10 text-gray-800 dark:text-white border border-gray-200 dark:border-white/20">
                <TwitterIcon className="w-2.5 h-2.5 shrink-0" />
                <span>@{userData.socials.twitter}</span>
              </span>
            )}
            {userData.socials.instagram && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E1306C]/10 dark:bg-[#E1306C]/20 text-[#E1306C] dark:text-[#FF639B] border border-[#E1306C]/30">
                <InstagramIcon className="w-2.5 h-2.5 shrink-0" />
                <span>@{userData.socials.instagram}</span>
              </span>
            )}
            {userData.socials.github && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/5 dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/20">
                <GithubIcon className="w-2.5 h-2.5 shrink-0" />
                <span>{userData.socials.github}</span>
              </span>
            )}
            {userData.socials.twitch && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#9146FF]/10 dark:bg-[#9146FF]/20 text-[#9146FF] dark:text-[#B788FF] border border-[#9146FF]/30">
                <TwitchIcon className="w-2.5 h-2.5 shrink-0" />
                <span>{userData.socials.twitch}</span>
              </span>
            )}
            {userData.socials.youtube && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF0000]/10 dark:bg-[#FF0000]/20 text-[#FF0000] dark:text-[#FF6B6B] border border-[#FF0000]/30">
                <YoutubeIcon className="w-2.5 h-2.5 shrink-0" />
                <span>{userData.socials.youtube}</span>
              </span>
            )}
          </div>
        )}
      </header>

        {/* XP Level Card */}
        <section className="bg-white dark:bg-gray-800 rounded-[1.75rem] p-5 playful-card border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#067bc2] text-white flex flex-col items-center justify-center shadow-[0_3px_0_#045b91] shrink-0">
                <span className="text-[9px] font-black uppercase leading-none opacity-85">LV</span>
                <span className="text-lg font-black leading-none">{levelInfo.level}</span>
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#067bc2] dark:text-[#84bcda]">
                  Experience Level
                </div>
                <div className="text-base font-black text-gray-950 dark:text-white leading-tight">
                  {levelInfo.title}
                </div>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#84bcda]/25 text-[#067bc2] dark:text-[#84bcda] text-xs font-black">
              {levelInfo.totalXp.toLocaleString()} XP
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
              <span>Level Progress</span>
              <span>
                {levelInfo.currentLevelXp} / {levelInfo.xpNeededForNext} XP ({levelInfo.percent}%)
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-[#067bc2]"
                style={{
                  width: `${Math.max(5, levelInfo.percent)}%`,
                }}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 lg:mt-0 lg:col-span-7 space-y-6">
        {/* Statistics */}
        <section>
          <h2 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-3">
            Statistics
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              const isStreak = stat.label === 'Current Streak';
              return (
                <div
                  key={i}
                  onClick={isStreak ? () => setShowStreakModal(true) : undefined}
                  className={`bg-white dark:bg-gray-800 rounded-2xl p-4 playful-card border-gray-200 dark:border-gray-700/80 flex flex-col gap-2 transition-all ${
                    isStreak ? 'cursor-pointer hover:border-[#ff3b5c]/60 active:translate-y-[1px]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`${stat.iconBg} p-2.5 rounded-xl`}>
                      <Icon style={{ color: stat.iconColor }} size={20} />
                    </div>
                    {isStreak && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-black text-[#ff3b5c]">
                        Map <ChevronRight size={13} />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-black text-gray-950 dark:text-white leading-tight">
                      {stat.value}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quest Milestones Banner Card */}
          <button
            type="button"
            onClick={openMilestones}
            className="w-full text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-2xl p-4 playful-card border-gray-200 dark:border-gray-700 flex items-center gap-3.5 transition-all cursor-pointer active:translate-y-[1px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#ecc30b] text-gray-950 flex items-center justify-center text-2xl shadow-[0_3px_0_#b99603] shrink-0">
              🏆
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Milestones
                </p>
                <span className="text-[10px] font-black bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded-full">
                  {unlockedAchievementsCount}/{ACHIEVEMENTS_TREE.length} Unlocked
                </span>
              </div>
              <p className="text-base font-black text-gray-950 dark:text-white leading-tight">
                Quest Milestones
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                Habit achievements, streaks & Star rewards
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-[#067bc2] dark:text-[#84bcda] shrink-0">
              <span>View</span>
              <ChevronRight size={14} />
            </div>
          </button>
        </section>

        {/* Quest Categories Breakdown */}
        <section className="bg-white dark:bg-gray-800 rounded-[1.75rem] p-5 playful-card border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 text-[#067bc2] dark:text-[#84bcda] flex items-center justify-center">
                <Sparkles size={17} />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-950 dark:text-white">Quest Categories</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Your habit mix breakdown</p>
              </div>
            </div>
            <div className="flex items-center bg-gray-100 dark:bg-gray-900/80 p-1 rounded-xl text-xs font-extrabold border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection', userData.vibrationEnabled);
                  playSound('click', userData.soundEnabled ?? true);
                  setCategoryView('completed');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  categoryView === 'completed'
                    ? 'bg-white dark:bg-gray-800 text-gray-950 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Done ({completedQuestsList.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection', userData.vibrationEnabled);
                  playSound('click', userData.soundEnabled ?? true);
                  setCategoryView('catalog');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  categoryView === 'catalog'
                    ? 'bg-white dark:bg-gray-800 text-gray-950 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                All ({questsData.length})
              </button>
            </div>
          </div>

          <CategoryDistributionBar
            quests={displayQuests}
            title={categoryView === 'completed' ? 'Completed Quest Divisions' : 'Master Quest Divisions'}
            subtitle={
              categoryView === 'completed'
                ? completedQuestsList.length > 0
                  ? 'Based on all quests you have completed so far'
                  : 'Complete your first daily quest to start your personal breakdown!'
                : 'Full 366-day offline quests collection'
            }
          />
        </section>

        {(userData.unlockedAvatars.length > 0 ||
          userData.unlockedDecorations.length > 0 ||
          userData.unlockedRanks.length > 1) && (
          <section className="bg-white dark:bg-gray-800 rounded-[1.75rem] p-5 playful-card border-gray-200 dark:border-gray-700">
            <h2 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Customization
            </h2>

            {userData.unlockedRanks.length > 1 && (
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Equipped Rank</p>
                <div className="flex flex-wrap gap-2">
                  {userData.unlockedRanks.map((rank) => (
                    <button
                      type="button"
                      key={rank}
                      onClick={() => {
                        playSound('equip', userData.soundEnabled ?? true);
                        updateSettings({ rank });
                        triggerFeedback('Rank Equipped!');
                      }}
                      className={`btn-tactile px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer ${
                        userData.rank === rank
                          ? 'btn-tactile-teal'
                          : 'btn-tactile-neutral bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200'
                      }`}
                    >
                      <span>{rank}</span>
                      {userData.rank === rank && <CheckCircle size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {userData.unlockedAvatars.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Unlocked Avatars</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      updateSettings({ activeAvatar: null });
                      triggerFeedback('Avatar Removed');
                    }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all cursor-pointer ${
                      !userData.activeAvatar
                        ? 'border-[#067bc2] bg-[#067bc2]/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                    }`}
                  >
                    {!userData.activeAvatar ? (
                      <CheckCircle size={20} className="text-[#067bc2]" />
                    ) : (
                      <X size={20} className="text-gray-400" />
                    )}
                  </button>
                  {userData.unlockedAvatars.map((avatar) => (
                    <button
                      type="button"
                      key={avatar}
                      onClick={() => {
                        playSound('equip', userData.soundEnabled ?? true);
                        updateSettings({ activeAvatar: avatar });
                        triggerFeedback('Avatar Equipped!');
                      }}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all overflow-hidden relative cursor-pointer ${
                        userData.activeAvatar === avatar
                          ? 'border-[#067bc2] bg-[#067bc2]/10'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                      }`}
                    >
                      {avatar.startsWith('img:') ? (
                        <img
                          src={avatar.replace('img:', '')}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        avatar
                      )}
                      {userData.activeAvatar === avatar && (
                        <div className="absolute inset-0 bg-[#067bc2]/25 flex items-center justify-center">
                          <CheckCircle size={18} className="text-white drop-shadow-md" />
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
                    type="button"
                    onClick={() => {
                      playSound('pop', userData.soundEnabled ?? true);
                      updateSettings({ activeDecoration: null });
                      triggerFeedback('Decoration Removed');
                    }}
                    className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                      !userData.activeDecoration
                        ? 'border-[#067bc2] bg-[#067bc2]/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                    }`}
                  >
                    {!userData.activeDecoration ? (
                      <CheckCircle size={20} className="text-[#067bc2]" />
                    ) : (
                      <X size={20} className="text-gray-400" />
                    )}
                  </button>
                  {userData.unlockedDecorations.map((dec) => (
                    <button
                      type="button"
                      key={dec}
                      onClick={() => {
                        playSound('equip', userData.soundEnabled ?? true);
                        updateSettings({ activeDecoration: dec });
                        triggerFeedback('Decoration Equipped!');
                      }}
                      className={`w-12 h-12 rounded-full border-4 transition-all decoration-${dec} flex items-center justify-center cursor-pointer ${
                        userData.activeDecoration === dec ? 'ring-2 ring-offset-2 ring-[#067bc2]' : ''
                      }`}
                    >
                      {userData.activeDecoration === dec && (
                        <div className="bg-white/90 dark:bg-black/90 rounded-full p-0.5 shadow-sm">
                          <CheckCircle size={14} className="text-[#067bc2]" />
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

      <AnimatePresence>
        {showCardModal && (
          <ProfileCardModal
            isOpen={showCardModal}
            onClose={() => setShowCardModal(false)}
            userData={userData}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSocialsModal && (
          <SocialsModal
            isOpen={showSocialsModal}
            onClose={() => setShowSocialsModal(false)}
            initialSocials={userData.socials}
            onSave={(newSocials) => {
              updateSettings({ socials: newSocials });
              triggerFeedback('Socials Saved!');
            }}
            vibrationEnabled={userData.vibrationEnabled}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPfpMenu && (
          <ProfileImageModal
            isOpen={showPfpMenu}
            onClose={() => setShowPfpMenu(false)}
            currentImage={userData.profileImage}
            onSelectImage={(img) => {
              updateSettings({ profileImage: img });
              triggerFeedback(img ? 'Photo Updated!' : 'Photo Removed');
            }}
            vibrationEnabled={userData.vibrationEnabled}
          />
        )}
      </AnimatePresence>

      <Toast show={!!feedback} title={feedback ?? ''} />

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
