import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2, Star, Flame, CalendarCheck, User, Sparkles, Loader2, Check } from 'lucide-react';
import { UserData } from '../context/AppContext';
import { triggerHaptic } from '../utils/haptics';
import { playSound } from '../utils/audioEffects';
import { TwitterIcon, DiscordIcon, InstagramIcon, GithubIcon, TwitchIcon, YoutubeIcon } from './SocialsModal';
import { saveImageFile, shareImageCard } from '../utils/nativeFileExport';

interface ProfileCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
}

export default function ProfileCardModal({ isOpen, onClose, userData }: ProfileCardModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3200);
  };

  useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Helper to measure and fit canvas text to guarantee it never goes out of bounds
  const drawFittedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    maxFontSize: number,
    fontWeight: string = 'bold',
    textAlign: CanvasTextAlign = 'center',
    minFontSize: number = 16
  ) => {
    ctx.textAlign = textAlign;
    let fontSize = maxFontSize;
    ctx.font = `${fontWeight} ${fontSize}px system-ui, -apple-system, sans-serif`;
    while (ctx.measureText(text).width > maxWidth && fontSize > minFontSize) {
      fontSize -= 2;
      ctx.font = `${fontWeight} ${fontSize}px system-ui, -apple-system, sans-serif`;
    }

    let renderedText = text;
    if (ctx.measureText(renderedText).width > maxWidth) {
      while (renderedText.length > 3 && ctx.measureText(renderedText + '...').width > maxWidth) {
        renderedText = renderedText.slice(0, -1);
      }
      renderedText += '...';
    }
    ctx.fillText(renderedText, x, y);
  };

  const generateCardCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    // Landscape wide ratio: 1200x640 (roughly 1.88:1 ratio)
    const width = 1200;
    const height = 640;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Rich Dark Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.5, '#111827');
    bgGrad.addColorStop(1, '#070a10');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, 44);
    ctx.fill();

    // Outer Glow / Border in user's accent color
    const accentColor = userData.accentColor || '#3b82f6';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(3, 3, width - 6, height - 6, 42);
    ctx.stroke();

    // Ambient radial glow behind left side
    const radialGrad = ctx.createRadialGradient(240, 240, 20, 240, 240, 320);
    radialGrad.addColorStop(0, `${accentColor}33`); // 20% opacity
    radialGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = radialGrad;
    ctx.fillRect(0, 0, width, height);

    // Inner subtle card container
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    ctx.roundRect(32, 32, width - 64, height - 64, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // --- LEFT COLUMN: Profile info (Avatar, Name, Rank) ---
    const leftCenterX = 260;
    const avatarY = 195;
    const avatarRadius = 88;

    // Badge Title: DAILYZ PROFILE CARD
    ctx.fillStyle = accentColor;
    ctx.font = '900 16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    drawFittedText(ctx, 'DAILYZ PROFILE CARD', leftCenterX, 85, 340, 16, '900', 'center');

    // Avatar background circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(leftCenterX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(leftCenterX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);

    // Render image if exists
    if (userData.profileImage) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = userData.profileImage;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 800);
        });
        ctx.drawImage(img, leftCenterX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
      } catch {
        // Fallback default silhouette
      }
    }
    ctx.restore();

    // Avatar Ring in accent color
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(leftCenterX, avatarY, avatarRadius + 3, 0, Math.PI * 2);
    ctx.stroke();

    // Adventurer Name (strictly fitted inside 380px boundary so text never clips!)
    ctx.fillStyle = '#ffffff';
    drawFittedText(ctx, userData.name, leftCenterX, 345, 380, 38, 'bold', 'center');

    // Rank Pill Box
    const rankText = userData.rank.toUpperCase();
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    const rankWidth = Math.min(280, Math.max(140, ctx.measureText(rankText).width + 36));
    ctx.fillStyle = `${accentColor}26`; // 15% opacity
    ctx.beginPath();
    ctx.roundRect(leftCenterX - rankWidth / 2, 375, rankWidth, 38, 19);
    ctx.fill();
    ctx.strokeStyle = `${accentColor}80`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = accentColor;
    drawFittedText(ctx, rankText, leftCenterX, 400, rankWidth - 16, 16, 'bold', 'center');

    // Tag if provided
    if (userData.pfpTag) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      drawFittedText(ctx, `TAG: ${userData.pfpTag}`, leftCenterX, 442, 340, 14, '600', 'center');
    }

    // Render Social Handles on Canvas if provided
    const activeSocialEntries = Object.entries(userData.socials || {}).filter(([_, val]) => !!val?.trim());
    if (activeSocialEntries.length > 0) {
      const socialStartY = userData.pfpTag ? 468 : 446;
      const displaySocials = activeSocialEntries.slice(0, 3);
      displaySocials.forEach(([platform, handle], idx) => {
        const y = socialStartY + idx * 22;
        const prefix = platform === 'twitter' ? '𝕏' : platform === 'discord' ? '💬' : platform === 'github' ? '🐙' : platform === 'instagram' ? '📸' : platform === 'twitch' ? '🟣' : '▶️';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        const formattedHandle = (platform === 'twitter' || platform === 'instagram')
          ? (handle.startsWith('@') ? handle : `@${handle}`)
          : handle;
        drawFittedText(ctx, `${prefix} ${formattedHandle}`, leftCenterX, y, 320, 13, 'bold', 'center');
      });
    }

    // Left sub-footer label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    drawFittedText(ctx, 'OFFICIAL PLAYER CARD', leftCenterX, 555, 300, 13, 'bold', 'center');

    // --- VERTICAL DIVIDER ---
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(490, 70);
    ctx.lineTo(490, 570);
    ctx.stroke();

    // --- RIGHT COLUMN: Stats (Stars, Streak, Done) ---
    const rightStartX = 530;
    const rightWidth = 590;

    // Header above stats
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.textAlign = 'left';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.fillText('PLAYER ACHIEVEMENTS & STATS', rightStartX, 95);

    const stats = [
      {
        iconSymbol: '★',
        label: 'TOTAL STARS',
        value: `${userData.points} Stars`,
        sub: 'Earned through consistency',
        color: '#facc15',
        bg: 'rgba(250, 204, 21, 0.08)',
        border: 'rgba(250, 204, 21, 0.25)',
      },
      {
        iconSymbol: '🔥',
        label: 'ACTIVE STREAK',
        value: `${userData.streak} Days Running`,
        sub: 'Daily momentum unbroken',
        color: '#f97316',
        bg: 'rgba(249, 115, 22, 0.08)',
        border: 'rgba(249, 115, 22, 0.25)',
      },
      {
        iconSymbol: '✓',
        label: 'QUESTS COMPLETED',
        value: `${userData.completedDays.length} Completed`,
        sub: 'Habits conquered',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.08)',
        border: 'rgba(16, 185, 129, 0.25)',
      },
    ];

    const cardHeight = 110;
    const cardGap = 20;
    const startY = 125;

    stats.forEach((stat, index) => {
      const cardY = startY + index * (cardHeight + cardGap);

      // Stat card background
      ctx.fillStyle = stat.bg;
      ctx.beginPath();
      ctx.roundRect(rightStartX, cardY, rightWidth, cardHeight, 22);
      ctx.fill();

      ctx.strokeStyle = stat.border;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Icon circle badge
      const iconX = rightStartX + 52;
      const iconY = cardY + cardHeight / 2;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.arc(iconX, iconY, 32, 0, Math.PI * 2);
      ctx.fill();

      // Icon symbol
      ctx.fillStyle = stat.color;
      ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stat.iconSymbol, iconX, iconY + 10);

      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.textAlign = 'left';
      drawFittedText(ctx, stat.label, rightStartX + 105, cardY + 36, 440, 13, 'bold', 'left');

      // Value (bold & big, bounded so it never clips)
      ctx.fillStyle = '#ffffff';
      drawFittedText(ctx, stat.value, rightStartX + 105, cardY + 74, 440, 28, 'bold', 'left');

      // Sub description
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      drawFittedText(ctx, stat.sub, rightStartX + 105, cardY + 96, 440, 12, '500', 'left');
    });

    // Right Bottom Tagline
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    drawFittedText(ctx, 'DAILYZ • Small habits. Epic momentum.', rightStartX + rightWidth / 2, 555, rightWidth, 13, '500', 'center');

    return canvas;
  };

  const handleSaveImage = async () => {
    if (isGenerating) return;
    try {
      setIsGenerating(true);
      triggerHaptic('medium', userData.vibrationEnabled);
      showToast('Generating card...');
      
      const canvas = await generateCardCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      const cleanName = userData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'player';
      const filename = `dailyz-card-${cleanName}.png`;

      const result = await saveImageFile(dataUrl, filename);
      showToast(result.message);
      if (result.success) {
        triggerHaptic('success', userData.vibrationEnabled);
        playSound('success', userData.soundEnabled ?? true);
      } else {
        triggerHaptic('error', userData.vibrationEnabled);
      }
    } catch (e) {
      console.error('Failed to save profile card:', e);
      showToast('Failed to generate player card');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (isGenerating) return;
    try {
      setIsGenerating(true);
      triggerHaptic('light', userData.vibrationEnabled);
      showToast('Preparing card to share...');

      const canvas = await generateCardCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      const cleanName = userData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'player';
      const filename = `dailyz-card-${cleanName}.png`;

      const shareUrl = `${window.location.origin}?user=${encodeURIComponent(userData.name)}&rank=${encodeURIComponent(userData.rank)}&points=${userData.points}&streak=${userData.streak}`;

      const result = await shareImageCard({
        dataUrl,
        filename,
        title: `${userData.name}'s Dailyz Player Card`,
        text: `Check out ${userData.name}'s Dailyz Player Card! Streak: ${userData.streak} days, ${userData.points} stars, ${userData.completedDays.length} quests done. 🔥`,
        url: shareUrl,
      });

      showToast(result.message);
      if (result.success) {
        triggerHaptic('success', userData.vibrationEnabled);
        playSound('success', userData.soundEnabled ?? true);
      }
    } catch (e) {
      console.error('Failed to share profile card:', e);
      showToast('Could not open share menu');
    } finally {
      setIsGenerating(false);
    }
  };

  const getDecorationClass = () => {
    if (!userData.activeDecoration) return '';
    return `decoration-${userData.activeDecoration}`;
  };

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      role="dialog"
      aria-modal="true"
      data-modal="true"
      data-prevent-swipe="true"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 overflow-hidden"
      onClick={() => {
        playSound('click', userData.soundEnabled ?? true);
        onClose();
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        style={{ willChange: 'transform, opacity' }}
        onClick={e => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="max-w-2xl w-full bg-gray-900 border border-gray-800 text-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col my-auto relative"
      >
        {/* Close Button */}
        <button 
          onClick={() => {
            playSound('click', userData.soundEnabled ?? true);
            onClose();
          }}
          className="absolute top-4 right-4 z-20 p-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 rounded-full transition-all cursor-pointer"
          aria-label="Close Profile Card"
        >
          <X size={18} />
        </button>

        {/* Wide Ratio Player Card Content (Profile left, Stats right, No QR) */}
        <div ref={cardRef} className="p-5 sm:p-7 relative overflow-hidden">
          {/* Subtle Ambient Accent Glow */}
          <div 
            className="absolute -top-20 -left-20 w-64 h-64 rounded-full blur-[100px] opacity-35 pointer-events-none"
            style={{ backgroundColor: userData.accentColor || '#3b82f6' }}
          />

          {/* Top Pass Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <span className="text-[11px] font-black uppercase tracking-[0.25em] px-3 py-1 rounded-full border border-white/20 bg-white/5 text-gray-200 flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-400" />
              Dailyz Profile Card
            </span>
          </div>

          {/* 2-Column Wide Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Left Column: Profile (Avatar, Name, Rank) */}
            <div className="sm:col-span-5 flex flex-col items-center text-center p-3 sm:border-r border-white/10">
              {/* Avatar with decoration */}
              <div className="relative mb-3">
                <div 
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-gray-800 border-4 shadow-xl flex items-center justify-center transition-all ${getDecorationClass()}`}
                  style={{ borderColor: userData.accentColor || '#3b82f6' }}
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
                    <User size={52} className="text-gray-400" />
                  )}
                </div>

                {/* Custom Tag */}
                {userData.pfpTag && (
                  <div 
                    className="absolute -top-1 -right-1 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border-2 border-gray-900"
                    style={{ backgroundColor: userData.accentColor || '#3b82f6' }}
                  >
                    {userData.pfpTag}
                  </div>
                )}
              </div>

              {/* Name (truncate strictly to prevent out-of-bounds) */}
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1 max-w-full truncate px-2" title={userData.name}>
                {userData.name}
              </h3>

              {/* Rank Badge */}
              <span 
                className="inline-block font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-1 border"
                style={{ 
                  color: userData.accentColor || '#3b82f6',
                  borderColor: `${userData.accentColor || '#3b82f6'}40`,
                  backgroundColor: `${userData.accentColor || '#3b82f6'}15`,
                }}
              >
                {userData.rank}
              </span>

              {/* User Socials Badges */}
              {userData.socials && Object.values(userData.socials).some(Boolean) && (
                <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 max-w-full px-1">
                  {userData.socials.discord && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5865F2]/20 text-[#8B93FF] border border-[#5865F2]/30 truncate max-w-[140px]" title={`Discord: ${userData.socials.discord}`}>
                      <DiscordIcon className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{userData.socials.discord}</span>
                    </span>
                  )}
                  {userData.socials.twitter && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20 truncate max-w-[140px]" title={`X: @${userData.socials.twitter}`}>
                      <TwitterIcon className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{userData.socials.twitter.startsWith('@') ? userData.socials.twitter : `@${userData.socials.twitter}`}</span>
                    </span>
                  )}
                  {userData.socials.instagram && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E1306C]/20 text-[#FF639B] border border-[#E1306C]/30 truncate max-w-[140px]" title={`Instagram: @${userData.socials.instagram}`}>
                      <InstagramIcon className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{userData.socials.instagram.startsWith('@') ? userData.socials.instagram : `@${userData.socials.instagram}`}</span>
                    </span>
                  )}
                  {userData.socials.github && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-gray-200 border border-white/20 truncate max-w-[140px]" title={`GitHub: ${userData.socials.github}`}>
                      <GithubIcon className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{userData.socials.github}</span>
                    </span>
                  )}
                  {userData.socials.twitch && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#9146FF]/20 text-[#B788FF] border border-[#9146FF]/30 truncate max-w-[140px]" title={`Twitch: ${userData.socials.twitch}`}>
                      <TwitchIcon className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{userData.socials.twitch}</span>
                    </span>
                  )}
                  {userData.socials.youtube && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF0000]/20 text-[#FF6B6B] border border-[#FF0000]/30 truncate max-w-[140px]" title={`YouTube: ${userData.socials.youtube}`}>
                      <YoutubeIcon className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{userData.socials.youtube}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Stats (Stars, Streak, Done) */}
            <div className="sm:col-span-7 flex flex-col gap-3">
              {/* Stars Card */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 transition-all">
                <div className="w-11 h-11 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                  <Star size={22} className="fill-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 block">Total Stars</span>
                  <div className="text-xl sm:text-2xl font-black text-white leading-tight truncate">
                    {userData.points} <span className="text-xs font-semibold text-gray-300">Points</span>
                  </div>
                </div>
              </div>

              {/* Streak Card */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 transition-all">
                <div className="w-11 h-11 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Flame size={22} className="fill-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block">Active Streak</span>
                  <div className="text-xl sm:text-2xl font-black text-white leading-tight truncate">
                    {userData.streak} <span className="text-xs font-semibold text-gray-300">Days Running</span>
                  </div>
                </div>
              </div>

              {/* Done / Completed Card */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 transition-all">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CalendarCheck size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Quests Done</span>
                  <div className="text-xl sm:text-2xl font-black text-white leading-tight truncate">
                    {userData.completedDays.length} <span className="text-xs font-semibold text-gray-300">Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Toast Notification */}
        <AnimatePresence>
          {statusToast && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.16 }}
              className="absolute bottom-20 left-4 right-4 z-30 mx-auto max-w-sm bg-gray-800/95 border border-white/20 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center justify-center gap-2 text-xs font-bold"
            >
              <Sparkles size={14} className="text-amber-400 shrink-0" />
              <span>{statusToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons: Download Card & Share (Identical sizing on all mobile screens) */}
        <div className="p-4 bg-gray-950/80 border-t border-white/10 grid grid-cols-2 gap-3 relative">
          {/* Download / Save Image */}
          <button
            type="button"
            onClick={handleSaveImage}
            disabled={isGenerating}
            className="w-full h-12 flex items-center justify-center gap-2 px-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white font-bold cursor-pointer group disabled:opacity-50 disabled:cursor-wait"
          >
            {isGenerating ? (
              <Loader2 size={18} className="animate-spin text-white shrink-0" />
            ) : (
              <Download size={18} className="shrink-0 group-hover:translate-y-0.5 transition-transform" />
            )}
            <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
              {isGenerating ? 'Saving...' : 'Download Card'}
            </span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            disabled={isGenerating}
            className="w-full h-12 flex items-center justify-center gap-2 px-3 rounded-2xl bg-accent hover:opacity-90 active:scale-95 transition-all text-white font-bold cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-wait"
            style={{ backgroundColor: userData.accentColor || '#3b82f6' }}
          >
            {isGenerating ? (
              <Loader2 size={18} className="animate-spin text-white shrink-0" />
            ) : (
              <Share2 size={18} className="shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
              {isGenerating ? 'Sharing...' : 'Share Card'}
            </span>
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
