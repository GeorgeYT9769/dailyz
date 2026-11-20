import React from 'react';
import { Check } from 'lucide-react';

interface TactileSwitchProps {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
  activeColor?: string;
}

export default function TactileSwitch({
  checked,
  onChange,
  ariaLabel,
  activeColor,
}: TactileSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={`relative inline-flex h-9 w-[60px] shrink-0 cursor-pointer items-center rounded-full border-2 border-b-4 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-[1px] active:border-b-2 ${
        checked
          ? 'border-[#04598c] bg-[#067bc2]'
          : 'border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700'
      }`}
      style={
        checked && activeColor
          ? {
              backgroundColor: activeColor,
              borderColor: 'rgba(0,0,0,0.28)',
            }
          : checked
          ? {
              backgroundColor: 'var(--accent-color, #067bc2)',
              borderColor: 'rgba(0,0,0,0.26)',
            }
          : undefined
      }
    >
      <span
        className={`pointer-events-none flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 ease-out border border-black/10 ${
          checked ? 'translate-x-[29px]' : 'translate-x-[3px]'
        }`}
      >
        {checked ? (
          <Check
            size={13}
            strokeWidth={3.5}
            style={{ color: activeColor || 'var(--accent-color, #067bc2)' }}
          />
        ) : (
          <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-500" />
        )}
      </span>
    </button>
  );
}
