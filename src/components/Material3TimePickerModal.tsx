import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Keyboard, X } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface Material3TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTime?: string; // "HH:MM" in 24h format
  onConfirm: (time24: string) => void;
  vibrationEnabled?: boolean;
}

type SelectionMode = 'hour' | 'minute';
type InputMode = 'dial' | 'keypad';

export default function Material3TimePickerModal({
  isOpen,
  onClose,
  initialTime = '09:00',
  onConfirm,
  vibrationEnabled = true,
}: Material3TimePickerModalProps) {
  // Parse initial 24h time into 12h representation
  const parseInitial = useCallback((timeStr: string) => {
    const parts = (timeStr || '09:00').split(':');
    let h24 = parseInt(parts[0] || '9', 10);
    const m = parseInt(parts[1] || '0', 10);
    if (isNaN(h24)) h24 = 9;
    const isPM = h24 >= 12;
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return {
      hour: h12,
      minute: isNaN(m) ? 0 : Math.min(59, Math.max(0, m)),
      period: (isPM ? 'PM' : 'AM') as 'AM' | 'PM',
    };
  }, []);

  const [hour, setHour] = useState<number>(9);
  const [minute, setMinute] = useState<number>(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('hour');
  const [inputMode, setInputMode] = useState<InputMode>('dial');
  const dialRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Sync when opened
  useEffect(() => {
    if (isOpen) {
      const parsed = parseInitial(initialTime);
      setHour(parsed.hour);
      setMinute(parsed.minute);
      setPeriod(parsed.period);
      setSelectionMode('hour');
      setInputMode('dial');
    }
  }, [isOpen, initialTime, parseInitial]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    triggerHaptic('success', vibrationEnabled);
    // Convert 12h + AM/PM back to 24h "HH:MM"
    let h24 = hour % 12;
    if (period === 'PM') h24 += 12;
    const time24 = `${h24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onConfirm(time24);
    onClose();
  };

  // Convert angle on dial to value
  const handleDialInteraction = (clientX: number, clientY: number, isFinal = false) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;

    // Angle in degrees from top (12 o'clock), clockwise 0..360
    let theta = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (theta < 0) theta += 360;

    if (selectionMode === 'hour') {
      // 12 hours -> each 30 degrees
      let selectedHour = Math.round(theta / 30);
      if (selectedHour === 0) selectedHour = 12;
      if (selectedHour > 12) selectedHour = 1;
      if (selectedHour !== hour) {
        triggerHaptic('selection', vibrationEnabled);
        setHour(selectedHour);
      }
      if (isFinal) {
        // Auto-switch to minute selection after hour pick
        setTimeout(() => setSelectionMode('minute'), 200);
      }
    } else {
      // 60 minutes -> each 6 degrees
      let selectedMinute = Math.round(theta / 6) % 60;
      if (selectedMinute < 0) selectedMinute += 60;
      if (selectedMinute !== minute) {
        triggerHaptic('selection', vibrationEnabled);
        setMinute(selectedMinute);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    isDraggingRef.current = true;
    handleDialInteraction(e.touches[0].clientX, e.touches[0].clientY, false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    handleDialInteraction(e.touches[0].clientX, e.touches[0].clientY, false);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (e.changedTouches.length > 0) {
      handleDialInteraction(e.changedTouches[0].clientX, e.changedTouches[0].clientY, true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    handleDialInteraction(e.clientX, e.clientY, false);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (isDraggingRef.current) {
        handleDialInteraction(moveEvent.clientX, moveEvent.clientY, false);
      }
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        handleDialInteraction(upEvent.clientX, upEvent.clientY, true);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Dial angle calculations for indicator hand
  const currentAngle = selectionMode === 'hour' ? (hour % 12) * 30 : minute * 6;

  // Numbers to display on dial face
  const hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
        >
          <div 
            className="fixed inset-0"
            onClick={() => {
              triggerHaptic('light', vibrationEnabled);
              onClose();
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'transform, opacity' }}
            className="relative z-10 w-full max-w-[340px] sm:max-w-[360px] bg-white dark:bg-gray-800 rounded-[28px] p-6 shadow-2xl border border-gray-100 dark:border-gray-700/80 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
        {/* Header Title */}
        <div className="w-full flex items-center justify-between mb-5">
          <span className="text-xs font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">
            Select time
          </span>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light', vibrationEnabled);
              onClose();
            }}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close time picker"
          >
            <X size={18} />
          </button>
        </div>

        {/* Material 3 Time Display & AM/PM Selector */}
        <div className="flex items-center gap-3 mb-6">
          {/* Hour & Minute Big Display Blocks */}
          <div className="flex items-center gap-1.5">
            {/* Hour Block */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection', vibrationEnabled);
                setSelectionMode('hour');
              }}
              className={`w-20 h-18 sm:w-22 sm:h-20 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-black transition-all cursor-pointer ${
                selectionMode === 'hour'
                  ? 'bg-accent/15 text-accent ring-2 ring-accent'
                  : 'bg-gray-100 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 hover:bg-gray-200/70 dark:hover:bg-gray-700'
              }`}
              style={selectionMode === 'hour' ? { color: 'var(--accent-color)', borderColor: 'var(--accent-color)' } : {}}
            >
              {hour.toString().padStart(2, '0')}
            </button>

            {/* Separator Colon */}
            <span className="text-3xl font-extrabold text-gray-400 dark:text-gray-500 pb-1">
              :
            </span>

            {/* Minute Block */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection', vibrationEnabled);
                setSelectionMode('minute');
              }}
              className={`w-20 h-18 sm:w-22 sm:h-20 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-black transition-all cursor-pointer ${
                selectionMode === 'minute'
                  ? 'bg-accent/15 text-accent ring-2 ring-accent'
                  : 'bg-gray-100 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 hover:bg-gray-200/70 dark:hover:bg-gray-700'
              }`}
              style={selectionMode === 'minute' ? { color: 'var(--accent-color)', borderColor: 'var(--accent-color)' } : {}}
            >
              {minute.toString().padStart(2, '0')}
            </button>
          </div>

          {/* AM / PM Segmented Toggle */}
          <div className="flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 bg-gray-50 dark:bg-gray-800/80">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection', vibrationEnabled);
                setPeriod('AM');
              }}
              className={`px-3 py-2 text-xs font-black transition-all cursor-pointer ${
                period === 'AM'
                  ? 'bg-accent/20 text-accent font-black'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              style={period === 'AM' ? { color: 'var(--accent-color)' } : {}}
            >
              AM
            </button>
            <div className="h-px bg-gray-200 dark:bg-gray-700 w-full" />
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection', vibrationEnabled);
                setPeriod('PM');
              }}
              className={`px-3 py-2 text-xs font-black transition-all cursor-pointer ${
                period === 'PM'
                  ? 'bg-accent/20 text-accent font-black'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              style={period === 'PM' ? { color: 'var(--accent-color)' } : {}}
            >
              PM
            </button>
          </div>
        </div>

        {/* Input Mode Container: Dial or Keypad */}
        {inputMode === 'dial' ? (
          /* Material 3 Interactive Dial Face */
          <div
            ref={dialRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            className="w-60 h-60 sm:w-64 sm:h-64 rounded-full bg-gray-100 dark:bg-gray-700/50 relative flex items-center justify-center cursor-pointer touch-none shadow-inner mb-4"
          >
            {/* Center Pivot Point */}
            <div 
              className="w-2.5 h-2.5 rounded-full z-20 pointer-events-none"
              style={{ backgroundColor: 'var(--accent-color)' }}
            />

            {/* Rotating Selector Needle & Thumb Head */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-100 ease-out z-10"
              style={{ transform: `rotate(${currentAngle}deg)` }}
            >
              {/* Radial Line from center to thumb */}
              <div
                className="w-0.5 absolute bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom"
                style={{
                  height: 'calc(50% - 24px)',
                  backgroundColor: 'var(--accent-color)',
                }}
              />

              {/* Selector Thumb Circle */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-md absolute -translate-x-1/2"
                style={{
                  top: '12px',
                  left: '50%',
                  backgroundColor: 'var(--accent-color)',
                }}
              />
            </div>

            {/* Dial Numbers */}
            {selectionMode === 'hour'
              ? hoursList.map((h, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  // Distance from center: ~92px
                  const radius = 92;
                  const x = Math.sin(angle) * radius;
                  const y = -Math.cos(angle) * radius;
                  const isSelected = hour === h;

                  return (
                    <div
                      key={h}
                      className={`absolute w-8 h-8 flex items-center justify-center text-sm font-bold pointer-events-none z-20 transition-colors ${
                        isSelected
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-200'
                      }`}
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                      }}
                    >
                      {h}
                    </div>
                  );
                })
              : minutesList.map((m, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const radius = 92;
                  const x = Math.sin(angle) * radius;
                  const y = -Math.cos(angle) * radius;
                  const isSelected = minute === m;

                  return (
                    <div
                      key={m}
                      className={`absolute w-8 h-8 flex items-center justify-center text-xs font-bold pointer-events-none z-20 transition-colors ${
                        isSelected
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-200'
                      }`}
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                      }}
                    >
                      {m.toString().padStart(2, '0')}
                    </div>
                  );
                })}
          </div>
        ) : (
          /* Material 3 Keypad Stepper Quick-Select */
          <div className="w-full bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4 mb-4 border border-gray-100 dark:border-gray-700/60">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-3 text-center">
              Quick Adjustments
            </span>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col items-center gap-1.5 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                <span className="text-[11px] font-bold text-gray-500">Hour</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection', vibrationEnabled);
                      setHour(prev => (prev === 1 ? 12 : prev - 1));
                    }}
                    className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="text-base font-extrabold w-6 text-center">{hour}</span>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection', vibrationEnabled);
                      setHour(prev => (prev === 12 ? 1 : prev + 1));
                    }}
                    className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1.5 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
                <span className="text-[11px] font-bold text-gray-500">Minute</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection', vibrationEnabled);
                      setMinute(prev => (prev < 5 ? 55 : prev - 5));
                    }}
                    className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="text-base font-extrabold w-8 text-center">{minute.toString().padStart(2, '0')}</span>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection', vibrationEnabled);
                      setMinute(prev => (prev >= 55 ? 0 : prev + 5));
                    }}
                    className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Popular Minute Increments */}
            <div className="flex justify-center gap-2">
              {[0, 15, 30, 45].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection', vibrationEnabled);
                    setMinute(m);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    minute === m
                      ? 'bg-accent text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                  style={minute === m ? { backgroundColor: 'var(--accent-color)' } : {}}
                >
                  :{m.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="w-full flex items-center justify-between pt-2">
          {/* Mode Toggle Button (Dial vs Keypad) */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light', vibrationEnabled);
              setInputMode(prev => (prev === 'dial' ? 'keypad' : 'dial'));
            }}
            className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={inputMode === 'dial' ? 'Switch to keypad input' : 'Switch to dial picker'}
            aria-label="Toggle input mode"
          >
            {inputMode === 'dial' ? <Keyboard size={20} /> : <Clock size={20} />}
          </button>

          {/* Cancel & OK Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light', vibrationEnabled);
                onClose();
              }}
              className="px-4 py-2 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-full text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all cursor-pointer active:scale-95"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              OK
            </button>
          </div>
        </div>
      </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
