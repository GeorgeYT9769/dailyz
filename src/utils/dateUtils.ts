export const getDayOfYear = (date: Date = new Date()): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export const getTodayISO = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getTomorrowISO = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export const getYesterdayISO = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

export const getDaysAgoISO = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

export const calculateStreaks = (completedDays: string[], usedStreakFreezes: string[] = []) => {
  const combined = [...new Set([...(completedDays || []), ...(usedStreakFreezes || [])])].filter(Boolean);
  if (!combined || combined.length === 0) return { current: 0, longest: 0 };
  
  const sorted = [...combined].sort();
  let longest = 1;
  let tempStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffTime = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else {
      if (tempStreak > longest) longest = tempStreak;
      tempStreak = 1;
    }
  }
  if (tempStreak > longest) longest = tempStreak;

  const today = getTodayISO();
  const yesterday = getYesterdayISO();
  const lastCompleted = sorted[sorted.length - 1];

  let current = 0;
  if (lastCompleted === today || lastCompleted === yesterday) {
    current = 1;
    for (let i = sorted.length - 1; i > 0; i--) {
      const curr = new Date(sorted[i]);
      const prev = new Date(sorted[i - 1]);
      const diffTime = curr.getTime() - prev.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  return { current, longest };
};
