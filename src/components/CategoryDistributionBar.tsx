import React, { useState } from 'react';
import { Sparkles, Brain, Dumbbell, Users, CheckSquare, Globe } from 'lucide-react';

export interface CategoryInfo {
  name: string;
  color: string;
  count: number;
  percentage: number;
  icon: any;
}

export const CATEGORY_DEFINITIONS: Record<string, { color: string; bg: string; border: string; text: string; icon: any }> = {
  'Creativity & Discovery': {
    color: '#f59e0b',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    icon: Sparkles,
  },
  'Mind & Focus': {
    color: '#8b5cf6',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
    icon: Brain,
  },
  'Health & Fitness': {
    color: '#10b981',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: Dumbbell,
  },
  'Kindness & Social': {
    color: '#ec4899',
    bg: 'bg-pink-50 dark:bg-pink-950/40',
    border: 'border-pink-200 dark:border-pink-800',
    text: 'text-pink-700 dark:text-pink-300',
    icon: Users,
  },
  'Productivity': {
    color: '#3b82f6',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    icon: CheckSquare,
  },
  'Eco & Community': {
    color: '#06b6d4',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    border: 'border-cyan-200 dark:border-cyan-800',
    text: 'text-cyan-700 dark:text-cyan-300',
    icon: Globe,
  },
};

export const getCategoryMeta = (name?: string) => {
  if (!name || !CATEGORY_DEFINITIONS[name]) {
    return CATEGORY_DEFINITIONS['Mind & Focus'];
  }
  return CATEGORY_DEFINITIONS[name];
};

interface CategoryDistributionBarProps {
  quests: Array<{ category?: string; [key: string]: any }>;
  title?: string;
  subtitle?: string;
}

export default function CategoryDistributionBar({
  quests,
  title = "Quest Categories Breakdown",
  subtitle,
}: CategoryDistributionBarProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Group and count categories
  const total = quests.length;
  if (total === 0) return null;

  const counts: Record<string, number> = {};
  quests.forEach(q => {
    const cat = q.category || 'Mind & Focus';
    counts[cat] = (counts[cat] || 0) + 1;
  });

  // Convert to sorted array
  const categoriesList: CategoryInfo[] = Object.entries(counts)
    .map(([name, count]) => {
      const def = getCategoryMeta(name);
      const percentage = Math.round((count / total) * 1000) / 10; // 1 decimal place
      return {
        name,
        color: def.color,
        count,
        percentage,
        icon: def.icon,
      };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div className="w-full">
      {/* Title & Stats */}
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <span>{title}</span>
            <span className="text-[11px] font-mono text-gray-400 font-normal">({total} quests)</span>
          </h4>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        {hoveredCategory && (
          <div className="text-xs font-bold transition-all px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            {hoveredCategory}
          </div>
        )}
      </div>

      {/* GitHub-style Multi-Colored Continuous Segment Bar */}
      <div 
        className="flex h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 shadow-inner relative"
        role="progressbar"
        aria-label="Quest Category Distribution"
      >
        {categoriesList.map((cat, idx) => {
          const isHovered = hoveredCategory === cat.name;
          return (
            <div
              key={cat.name}
              onMouseEnter={() => setHoveredCategory(`${cat.name} • ${cat.percentage}% (${cat.count})`)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => setHoveredCategory(isHovered ? null : `${cat.name} • ${cat.percentage}% (${cat.count})`)}
              className="h-full transition-all duration-300 relative cursor-pointer group"
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: cat.color,
                opacity: hoveredCategory && !isHovered ? 0.6 : 1,
              }}
              title={`${cat.name}: ${cat.percentage}% (${cat.count} quests)`}
            />
          );
        })}
      </div>

      {/* GitHub-style Legend Below Bar */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        {categoriesList.map(cat => {
          const isHovered = hoveredCategory?.startsWith(cat.name);
          return (
            <button
              key={cat.name}
              type="button"
              onMouseEnter={() => setHoveredCategory(`${cat.name} • ${cat.percentage}% (${cat.count})`)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => setHoveredCategory(isHovered ? null : `${cat.name} • ${cat.percentage}% (${cat.count})`)}
              className={`flex items-center gap-1.5 transition-all cursor-pointer py-0.5 rounded ${
                isHovered ? 'scale-105 font-black text-gray-950 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm transition-transform"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-semibold">{cat.name}</span>
              <span className="text-gray-400 dark:text-gray-500 font-mono text-[11px]">
                {cat.percentage}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
