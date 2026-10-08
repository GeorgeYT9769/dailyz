import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, Download, Share2, Star, Flame, CalendarCheck, User, Sparkles } from 'lucide-react';
import { UserData } from '../context/AppContext';
import { triggerHaptic } from '../utils/haptics';

interface ProfileCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
}

export default function ProfileCardModal({ isOpen, onClose, userData }: ProfileCardModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

    // Badge Title: DAILYZ ADVENTURER PASS
    ctx.fillStyle = accentColor;
    ctx.font = '900 16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    drawFittedText(ctx, 'DAILYZ ADVENTURER PASS', leftCenterX, 85, 340, 16, '900', 'center');

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
    try {
      setIsGenerating(true);
      triggerHaptic('medium', userData.vibrationEnabled);
      const canvas = await generateCardCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `dailyz-card-${userData.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      triggerHaptic('success', userData.vibrationEnabled);
    } catch (e) {
      console.error('Failed to save profile card:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    triggerHaptic('light', userData.vibrationEnabled);
    try {
      if (navigator.share) {
        try {
          const canvas = await generateCardCanvas();
          canvas.toBlob(async (blob) => {
            if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'dailyz-card.png', { type: 'image/png' })] })) {
              const file = new File([blob], `dailyz-${userData.name.toLowerCase()}.png`, { type: 'image/png' });
              await navigator.share({
                title: `${userData.name}'s Dailyz Player Card`,
                text: `Check out ${userData.name}'s Dailyz Card! Streak: ${userData.streak} days, ${userData.points} stars, ${userData.completedDays.length} quests done.`,
                files: [file],
              });
              return;
            }
            // Standard text share
            await navigator.share({
              title: `${userData.name}'s Dailyz Player Card`,
              text: `Check out ${userData.name}'s Dailyz Card! Streak: ${userData.streak} days, ${userData.points} stars, ${userData.completedDays.length} quests completed.`,
            });
          }, 'image/png');
          return;
        } catch {
          await navigator.share({
            title: `${userData.name}'s Dailyz Player Card`,
            text: `Check out ${userData.name}'s Dailyz Card! Streak: ${userData.streak} days, ${userData.points} stars, ${userData.completedDays.length} quests completed.`,
          });
        }
      } else {
        handleSaveImage();
      }
    } catch {
      handleSaveImage();
    }
  };

  const getDecorationClass = () => {
    if (!userData.activeDecoration) return '';
    return `decoration-${userData.activeDecoration}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="max-w-2xl w-full bg-gray-900 border border-gray-800 text-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col my-auto relative"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
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
              Dailyz Adventurer Pass
            </span>
            <span className="text-xs font-mono font-medium text-gray-400 pr-10">
              MOMENTUM ID
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

              <span className="text-[11px] text-gray-400 mt-1">Official Adventurer</span>
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

        {/* Action Buttons: Download Card & Share (Copy Link button removed!) */}
        <div className="p-4 bg-gray-950/80 border-t border-white/10 flex items-center gap-3">
          {/* Download / Save Image */}
          <button
            onClick={handleSaveImage}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white font-bold cursor-pointer group"
          >
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
            <span className="text-sm">Download Card</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-accent hover:opacity-90 active:scale-95 transition-all text-white font-bold cursor-pointer shadow-lg"
            style={{ backgroundColor: userData.accentColor || '#3b82f6' }}
          >
            <Share2 size={18} />
            <span className="text-sm">Share Card</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
