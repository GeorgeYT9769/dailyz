import React from 'react';

interface DifficultyBarsProps {
  difficulty?: string;
  compact?: boolean;
}

export default function DifficultyBars({ difficulty = 'medium', compact = false }: DifficultyBarsProps) {
  const normalized = difficulty.toLowerCase();
  const level = normalized === 'easy' ? 1 : normalized === 'hard' ? 3 : 2;
  const label = normalized === 'easy' ? 'Easy' : normalized === 'hard' ? 'Hard' : 'Medium';

  const activeBarColor =
    level === 1
      ? 'bg-[#067bc2]'
      : level === 2
      ? 'bg-[#ff5d38]'
      : 'bg-[#ff3b5c]';

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-bold text-gray-500 dark:text-gray-400 shrink-0 ${
        compact ? 'text-[11px]' : 'text-xs'
      }`}
    >
      <span>{label}</span>
      <span className="inline-flex items-end gap-[2.5px]" aria-hidden="true">
        {[1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={`w-[3.5px] rounded-sm transition-colors ${
              compact ? 'h-2.5' : 'h-3'
            } ${
              bar <= level
                ? activeBarColor
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </span>
    </div>
  );
}
