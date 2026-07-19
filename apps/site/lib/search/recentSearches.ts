const STORAGE_KEY = "ac_recent_searches";
const MAX_RECENT = 8;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Read recent search queries from localStorage (newest first). */
export function getRecentSearches(): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

/** Prepend a query and persist (deduped, capped). */
export function pushRecentSearch(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed || !canUseStorage()) return getRecentSearches();

  const next = [
    trimmed,
    ...getRecentSearches().filter((q) => q.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, MAX_RECENT);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota / private mode — ignore.
  }
  return next;
}

export function clearRecentSearches(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const RECENT_SEARCHES_STORAGE_KEY = STORAGE_KEY;
export const RECENT_SEARCHES_MAX = MAX_RECENT;
