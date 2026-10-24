import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { X, Upload, Camera, Trash2, Check, Image as ImageIcon, Link2, Sparkles, RefreshCw } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface ProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string | null;
  onSelectImage: (imageData: string | null) => void;
  vibrationEnabled?: boolean;
}

const PRESET_AVATARS = [
  { id: '/pfp1.svg', name: 'Adventurer', url: '/pfp1.svg' },
  { id: '/pfp2.svg', name: 'Explorer', url: '/pfp2.svg' },
  { id: '/pfp3.svg', name: 'Champion', url: '/pfp3.svg' },
  { id: '/pfp4.svg', name: 'Voyager', url: '/pfp4.svg' },
  // Fun SVG data uri presets
  { 
    id: 'avatar_astronaut', 
    name: 'Cosmonaut', 
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%233b82f6"/><circle cx="50" cy="45" r="28" fill="%23ffffff"/><circle cx="50" cy="45" r="22" fill="%231e293b"/><ellipse cx="44" cy="40" rx="6" ry="3" fill="%2360a5fa" opacity="0.8"/><circle cx="50" cy="85" r="25" fill="%23ffffff"/></svg>' 
  },
  { 
    id: 'avatar_ninja', 
    name: 'Shadow', 
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%2318181b"/><circle cx="50" cy="48" r="32" fill="%2327272a"/><rect x="25" y="42" width="50" height="12" rx="6" fill="%23ef4444"/><circle cx="40" cy="48" r="4" fill="%23ffffff"/><circle cx="60" cy="48" r="4" fill="%23ffffff"/></svg>' 
  },
  { 
    id: 'avatar_phoenix', 
    name: 'Phoenix', 
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23f97316"/><path d="M50 18 C35 35 30 60 50 82 C70 60 65 35 50 18 Z" fill="%23fef08a"/><path d="M50 32 C42 45 40 60 50 74 C60 60 58 45 50 32 Z" fill="%23ef4444"/></svg>' 
  },
  { 
    id: 'avatar_zen', 
    name: 'Zen Spirit', 
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%2310b981"/><circle cx="50" cy="50" r="30" fill="%23064e3b"/><circle cx="50" cy="40" r="14" fill="%23a7f3d0"/><path d="M30 75 C30 60 70 60 70 75 Z" fill="%23a7f3d0"/></svg>' 
  },
];

export default function ProfileImageModal({
  isOpen,
  onClose,
  currentImage,
  onSelectImage,
  vibrationEnabled = true,
}: ProfileImageModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setPreviewImage(currentImage);
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOpen, currentImage]);

  if (!isOpen) return null;

  // Process selected file with automatic canvas downsampling to maintain performance and stay well within localStorage quotas
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 400;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          triggerHaptic('success', vibrationEnabled);
          onSelectImage(compressed);
          onClose();
        } else {
          triggerHaptic('success', vibrationEnabled);
          onSelectImage(result);
          onClose();
        }
      };
      img.onerror = () => {
        triggerHaptic('success', vibrationEnabled);
        onSelectImage(result);
        onClose();
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Reset file input value so re-selecting the same file fires onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectPreset = (url: string) => {
    triggerHaptic('selection', vibrationEnabled);
    onSelectImage(url);
    onClose();
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:')) {
      setUrlError(true);
      return;
    }
    setUrlError(false);
    triggerHaptic('success', vibrationEnabled);
    onSelectImage(trimmed);
    onClose();
  };

  const handleRemoveImage = () => {
    triggerHaptic('light', vibrationEnabled);
    onSelectImage(null);
    onClose();
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 overflow-hidden select-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm max-h-[85vh] shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              <Camera size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Profile Photo
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Choose an avatar or upload your own
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-900/40">
          <div className="flex rounded-xl bg-gray-200/70 dark:bg-gray-800 p-1 text-xs font-bold">
            <button
              onClick={() => {
                triggerHaptic('selection', vibrationEnabled);
                setActiveTab('presets');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Sparkles size={13} />
              <span>Avatars</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic('selection', vibrationEnabled);
                setActiveTab('upload');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Upload size={13} />
              <span>Upload</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic('selection', vibrationEnabled);
                setActiveTab('url');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Link2 size={13} />
              <span>Link URL</span>
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-4">
          {/* TAB 1: PRESET AVATARS */}
          {activeTab === 'presets' && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">
                Select an illustrated avatar:
              </p>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = currentImage === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`relative aspect-square rounded-2xl p-1.5 border-2 transition-all flex flex-col items-center justify-center cursor-pointer group active:scale-95 ${
                        isSelected 
                          ? 'border-accent bg-accent/10 ring-2 ring-accent/30' 
                          : 'border-gray-100 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900/60 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      style={isSelected ? { borderColor: 'var(--accent-color)' } : {}}
                      title={preset.name}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.name}
                        className="w-full h-full object-cover rounded-xl transition-transform group-hover:scale-105"
                        onError={(e) => {
                          if (preset.url.endsWith('.svg')) {
                            (e.target as HTMLImageElement).src = preset.url.replace('.svg', '.png');
                          }
                        }}
                      />
                      {isSelected && (
                        <div 
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white flex items-center justify-center shadow-md text-xs font-bold"
                          style={{ backgroundColor: 'var(--accent-color)' }}
                        >
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD CUSTOM PHOTO */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="profile-file-picker-input"
              />

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium', vibrationEnabled);
                  fileInputRef.current?.click();
                }}
                className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 dark:hover:bg-accent/10 transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                >
                  <Upload size={22} />
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    Choose from Gallery or Camera
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Supports JPG, PNG, WEBP, GIF, SVG
                  </div>
                </div>
              </button>

              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                Photos are automatically cropped to a clean circular profile and safely saved locally on your device.
              </p>
            </div>
          )}

          {/* TAB 3: IMAGE LINK URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Direct Image URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (urlError) setUrlError(false);
                  }}
                  placeholder="https://example.com/avatar.jpg"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent ${
                    urlError 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
                {urlError && (
                  <p className="text-[11px] text-red-500 mt-1">
                    Please provide a valid image URL starting with http:// or https://
                  </p>
                )}
              </div>

              {urlInput && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 shrink-0 border border-gray-200 dark:border-gray-700">
                    <img 
                      src={urlInput} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      onError={() => setUrlError(true)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block truncate">
                      Preview Image
                    </span>
                    <span className="text-[10px] text-gray-400 block truncate">
                      {urlInput}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!urlInput.trim()}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                Apply Image Link
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-3.5 sm:p-4 border-t border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between gap-2 shrink-0">
          {currentImage ? (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="py-2 px-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Remove Photo</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
