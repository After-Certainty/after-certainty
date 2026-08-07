/**
 * Deterministic Daily Challenge selection (no backend cron).
 * Date keys are YYYY-MM-DD in GAME_TIMEZONE.
 */

export const GAME_TIMEZONE = "America/Los_Angeles";
export const DAILY_SESSION_SIZE = 5;
export const DAILY_COMPLETION_BONUS_XP = 15;

export type SessionMode = "daily" | "practice";

/** FNV-1a 32-bit hash for stable seeded shuffles. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function formatDateKeyInTimeZone(
  date: Date,
  timeZone: string = GAME_TIMEZONE,
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  if (!year || !month || !day) {
    return date.toISOString().slice(0, 10);
  }
  return `${year}-${month}-${day}`;
}

export function getGameDateKey(now: Date = new Date()): string {
  return formatDateKeyInTimeZone(now, GAME_TIMEZONE);
}

export function deterministicShuffle<T>(items: readonly T[], seed: number): T[] {
  const next = [...items];
  const rand = mulberry32(seed);
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
  }
  return next;
}

export function selectDailyChallengeSlugs(
  poolSlugs: readonly string[],
  dateKey: string,
  count: number = DAILY_SESSION_SIZE,
): string[] {
  const unique = [...new Set(poolSlugs.filter((slug) => slug.trim()))].sort();
  if (unique.length === 0 || count <= 0) return [];
  const seed = hashString(`pattern-recognition-daily:${dateKey}`);
  const ordered = deterministicShuffle(unique, seed);
  return ordered.slice(0, Math.min(count, ordered.length));
}

export function selectPracticeChallengeSlugs(
  poolSlugs: readonly string[],
  sessionSeed: string,
  count: number = DAILY_SESSION_SIZE,
): string[] {
  const unique = [...new Set(poolSlugs.filter((slug) => slug.trim()))].sort();
  if (unique.length === 0 || count <= 0) return [];
  const seed = hashString(`pattern-recognition-practice:${sessionSeed}`);
  const ordered = deterministicShuffle(unique, seed);
  return ordered.slice(0, Math.min(count, ordered.length));
}
