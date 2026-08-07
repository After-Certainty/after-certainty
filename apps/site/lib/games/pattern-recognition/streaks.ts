/**
 * Humane streak rules:
 * - Completing the Daily set for a dateKey increments streak when contiguous.
 * - Missing a day resets currentStreak to 0 on the next completion (no XP clawback).
 * - Practice never affects streaks.
 */

export function previousDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map((part) => Number(part));
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() - 1);
  return utc.toISOString().slice(0, 10);
}

export function nextStreakAfterDailyCompletion(input: {
  currentStreak: number;
  longestStreak: number;
  lastDailyCompletionDate: string | null;
  completedDateKey: string;
}): { currentStreak: number; longestStreak: number; lastDailyCompletionDate: string } {
  const alreadyCompleted = input.lastDailyCompletionDate === input.completedDateKey;
  if (alreadyCompleted) {
    return {
      currentStreak: input.currentStreak,
      longestStreak: input.longestStreak,
      lastDailyCompletionDate: input.completedDateKey,
    };
  }

  const contiguous =
    input.lastDailyCompletionDate != null &&
    input.lastDailyCompletionDate === previousDateKey(input.completedDateKey);
  const currentStreak = contiguous ? input.currentStreak + 1 : 1;
  const longestStreak = Math.max(input.longestStreak, currentStreak);
  return {
    currentStreak,
    longestStreak,
    lastDailyCompletionDate: input.completedDateKey,
  };
}

/** Display helper: if last completion wasn't today or yesterday, streak shows as 0. */
export function visibleCurrentStreak(input: {
  currentStreak: number;
  lastDailyCompletionDate: string | null;
  todayDateKey: string;
}): number {
  if (!input.lastDailyCompletionDate || input.currentStreak <= 0) return 0;
  if (input.lastDailyCompletionDate === input.todayDateKey) return input.currentStreak;
  if (input.lastDailyCompletionDate === previousDateKey(input.todayDateKey)) {
    return input.currentStreak;
  }
  return 0;
}
