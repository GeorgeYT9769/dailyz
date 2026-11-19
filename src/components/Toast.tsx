import { ReactNode, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Star } from 'lucide-react';

interface ToastProps {
  show: boolean;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  variant?: 'accent' | 'amber';
}

/**
 * App-wide toast. Rendered in a portal on document.body so it is never
 * affected by transformed ancestors (e.g. the animated tab page), which
 * would otherwise break `position: fixed`.
 */
export default function Toast(props: ToastProps) {
  const { show } = props;
  // Keep the last visible content so text doesn't vanish during the exit animation.
  const lastRef = useRef<ToastProps>(props);
  if (show) lastRef.current = props;
  const { title, subtitle, icon, variant = 'accent' } = lastRef.current;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 440, damping: 35 }}
          className={`app-toast fixed left-4 right-4 max-w-sm mx-auto p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[60] pointer-events-none text-white ${
            variant === 'amber' ? 'bg-amber-500' : 'bg-accent'
          }`}
          style={variant === 'accent' ? { backgroundColor: 'var(--accent-color)' } : undefined}
          role="status"
          aria-live="polite"
        >
          <div className="bg-white/20 p-2 rounded-full w-10 h-10 flex items-center justify-center shrink-0">
            {icon ?? <Star size={20} />}
          </div>
          <div className="min-w-0">
            <p className="font-bold">{title}</p>
            {subtitle && <p className="text-sm opacity-90">{subtitle}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
