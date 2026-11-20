export interface LevelProgress {
  level: number;
  title: string;
  totalXp: number;
  currentLevelXp: number;
  xpNeededForNext: number;
  xpRemaining: number;
  percent: number;
}

const LEVEL_TITLES: Array<{ minLevel: number; title: string }> = [
  { minLevel: 20, title: 'Mythic Voyager' },
  { minLevel: 15, title: 'Solar Paragon' },
  { minLevel: 12, title: 'Horizon Legend' },
  { minLevel: 10, title: 'Apex Challenger' },
  { minLevel: 8, title: 'Focus Ranger' },
  { minLevel: 6, title: 'Rhythm Keeper' },
  { minLevel: 4, title: 'Pathfinder' },
  { minLevel: 3, title: 'Momentum Maker' },
  { minLevel: 2, title: 'Habit Seeker' },
  { minLevel: 1, title: 'Spark Starter' },
];

export function getQuestXp(difficulty?: string): number {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 30;
    case 'hard':
      return 75;
    case 'medium':
    default:
      return 50;
  }
}

export function getXpForNextLevel(level: number): number {
  return 100 + Math.max(0, level - 1) * 50;
}

export function getLevelTitle(level: number): string {
  for (const entry of LEVEL_TITLES) {
    if (level >= entry.minLevel) {
      return entry.title;
    }
  }
  return 'Spark Starter';
}

export function getLevelProgress(totalXp: number = 0): LevelProgress {
  const safeXp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  let remaining = safeXp;
  let needed = getXpForNextLevel(level);

  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = getXpForNextLevel(level);
  }

  const percent = Math.min(100, Math.max(0, Math.round((remaining / needed) * 100)));

  return {
    level,
    title: getLevelTitle(level),
    totalXp: safeXp,
    currentLevelXp: remaining,
    xpNeededForNext: needed,
    xpRemaining: Math.max(0, needed - remaining),
    percent,
  };
}

export function getBackfillXp(completedDaysCount: number): number {
  return Math.max(0, completedDaysCount) * 50;
}
