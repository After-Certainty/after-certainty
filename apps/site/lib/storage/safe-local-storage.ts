/**
 * Client-only localStorage helpers for device-scoped preferences.
 *
 * Phase A foundation for reader redesign Phase F migration.
 * Existing reading modules (`ac_reading_progress`, `ac_reading_bookmarks`,
 * `ac_reading_prefs`) are not migrated yet — adopt this helper when adding
 * versioned schemas or new local-only features (favorites, highlights).
 *
 * Guarantees:
 * - No access during SSR (`canUseLocalStorage` is false on the server)
 * - Malformed JSON returns null / no-op rather than throwing
 * - Quota / private-mode write failures are swallowed
 * - No personal data, analytics, or sync semantics
 *
 * @see apps/site/docs/roadmaps/books-reader-redesign.md
 */

export function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Read a raw string from localStorage, or null when unavailable / missing.
 */
export function readLocalStorageRaw(key: string): string | null {
  if (!canUseLocalStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Parse JSON from localStorage. Returns `null` when missing, unavailable, or malformed.
 */
export function readLocalStorageJson<T>(key: string): T | null {
  const raw = readLocalStorageRaw(key);
  if (raw == null || raw === "") return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Write a JSON value. No-ops when storage is unavailable or the write fails.
 */
export function writeLocalStorageJson(key: string, value: unknown): boolean {
  if (!canUseLocalStorage()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove a key. No-ops when storage is unavailable.
 */
export function removeLocalStorageKey(key: string): boolean {
  if (!canUseLocalStorage()) return false;
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Versioned envelope for future local-only reader state.
 * Prefer wrapping new stores in this shape so migrations can branch on `version`.
 */
export type VersionedLocalState<T> = {
  version: number;
  data: T;
};

export function readVersionedLocalState<T>(
  key: string,
  expectedVersion: number,
): VersionedLocalState<T> | null {
  const parsed = readLocalStorageJson<unknown>(key);
  if (!parsed || typeof parsed !== "object") return null;
  const record = parsed as Record<string, unknown>;
  if (typeof record.version !== "number" || record.version !== expectedVersion) return null;
  if (!("data" in record)) return null;
  return { version: record.version, data: record.data as T };
}

export function writeVersionedLocalState<T>(key: string, version: number, data: T): boolean {
  return writeLocalStorageJson(key, { version, data } satisfies VersionedLocalState<T>);
}
