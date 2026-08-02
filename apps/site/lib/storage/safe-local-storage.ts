/**
 * Client-only localStorage helpers for device-scoped preferences.
 *
 * Used by Native Reader stores (progress, bookmarks, prefs, favorites).
 * Legacy bare JSON payloads are migrated into versioned envelopes on read.
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
 * Versioned envelope for local-only reader state.
 * Prefer wrapping stores in this shape so migrations can branch on `version`.
 */
export type VersionedLocalState<T> = {
  version: number;
  data: T;
};

function isVersionedEnvelope(raw: unknown): raw is VersionedLocalState<unknown> {
  if (!raw || typeof raw !== "object") return false;
  const record = raw as Record<string, unknown>;
  return typeof record.version === "number" && "data" in record;
}

export function readVersionedLocalState<T>(
  key: string,
  expectedVersion: number,
): VersionedLocalState<T> | null {
  const parsed = readLocalStorageJson<unknown>(key);
  if (!isVersionedEnvelope(parsed)) return null;
  if (parsed.version !== expectedVersion) return null;
  return { version: parsed.version, data: parsed.data as T };
}

export function writeVersionedLocalState<T>(key: string, version: number, data: T): boolean {
  return writeLocalStorageJson(key, { version, data } satisfies VersionedLocalState<T>);
}

/**
 * Read versioned data, or migrate a legacy (or wrong-version) payload once and rewrite.
 * `migrate` receives either envelope `.data` or a bare legacy payload; return null to skip.
 */
export function readVersionedLocalStateWithMigration<T>(
  key: string,
  expectedVersion: number,
  migrate: (raw: unknown) => T | null,
): T | null {
  const current = readVersionedLocalState<T>(key, expectedVersion);
  if (current) return current.data;

  const raw = readLocalStorageJson<unknown>(key);
  if (raw == null) return null;

  const source = isVersionedEnvelope(raw) ? raw.data : raw;
  const migrated = migrate(source);
  if (migrated == null) return null;

  writeVersionedLocalState(key, expectedVersion, migrated);
  return migrated;
}
