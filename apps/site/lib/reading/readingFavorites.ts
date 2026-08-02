import {
  canUseLocalStorage,
  readVersionedLocalStateWithMigration,
  removeLocalStorageKey,
  writeVersionedLocalState,
} from "@/lib/storage/safe-local-storage";

/**
 * Local (device-only) book favorites (Phase F).
 * Stores book IDs — never implies account sync.
 */

export type ReadingFavoritesData = {
  bookIds: string[];
  updatedAt: string;
};

const STORAGE_KEY = "ac_reading_favorites";
const STORAGE_VERSION = 1;
const CHANGE_EVENT = "ac-reading-favorites-changed";

const EMPTY: ReadingFavoritesData = {
  bookIds: [],
  updatedAt: new Date(0).toISOString(),
};

let cached: ReadingFavoritesData = EMPTY;

function notifyChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function normalizeIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (typeof id !== "string") continue;
    const trimmed = id.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

function normalizeFavorites(raw: unknown): ReadingFavoritesData {
  if (!raw || typeof raw !== "object") return EMPTY;
  const record = raw as Record<string, unknown>;
  return {
    bookIds: normalizeIds(record.bookIds),
    updatedAt:
      typeof record.updatedAt === "string" && record.updatedAt.trim()
        ? record.updatedAt
        : EMPTY.updatedAt,
  };
}

function migrateFavorites(raw: unknown): ReadingFavoritesData | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (!("bookIds" in record)) return null;
  return normalizeFavorites(raw);
}

function sameFavorites(a: ReadingFavoritesData, b: ReadingFavoritesData): boolean {
  return (
    a.updatedAt === b.updatedAt &&
    a.bookIds.length === b.bookIds.length &&
    a.bookIds.every((id, i) => id === b.bookIds[i])
  );
}

function remember(next: ReadingFavoritesData): ReadingFavoritesData {
  if (sameFavorites(cached, next)) return cached;
  cached = next;
  return cached;
}

function readFavorites(): ReadingFavoritesData {
  if (!canUseLocalStorage()) return remember(EMPTY);
  const migrated = readVersionedLocalStateWithMigration<ReadingFavoritesData>(
    STORAGE_KEY,
    STORAGE_VERSION,
    migrateFavorites,
  );
  if (!migrated) return remember(EMPTY);
  return remember(normalizeFavorites(migrated));
}

function writeFavorites(data: ReadingFavoritesData): ReadingFavoritesData {
  const next = remember(data);
  if (canUseLocalStorage()) {
    writeVersionedLocalState(STORAGE_KEY, STORAGE_VERSION, next);
  }
  notifyChanged();
  return next;
}

export function getReadingFavorites(): ReadingFavoritesData {
  return readFavorites();
}

export function listFavoriteBookIds(): string[] {
  return [...readFavorites().bookIds];
}

export function isFavoriteBook(bookId: string): boolean {
  const id = bookId.trim();
  if (!id) return false;
  return readFavorites().bookIds.includes(id);
}

export function addFavoriteBook(bookId: string): ReadingFavoritesData {
  const id = bookId.trim();
  if (!id) return readFavorites();
  const current = readFavorites();
  if (current.bookIds.includes(id)) return current;
  return writeFavorites({
    bookIds: [...current.bookIds, id],
    updatedAt: new Date().toISOString(),
  });
}

export function removeFavoriteBook(bookId: string): ReadingFavoritesData {
  const id = bookId.trim();
  if (!id) return readFavorites();
  const current = readFavorites();
  if (!current.bookIds.includes(id)) return current;
  return writeFavorites({
    bookIds: current.bookIds.filter((entry) => entry !== id),
    updatedAt: new Date().toISOString(),
  });
}

export function toggleFavoriteBook(bookId: string): {
  favorited: boolean;
  data: ReadingFavoritesData;
} {
  if (isFavoriteBook(bookId)) {
    return { favorited: false, data: removeFavoriteBook(bookId) };
  }
  return { favorited: true, data: addFavoriteBook(bookId) };
}

export function clearAllReadingFavorites(): void {
  remember(EMPTY);
  removeLocalStorageKey(STORAGE_KEY);
  notifyChanged();
}

export function subscribeReadingFavorites(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export const READING_FAVORITES_STORAGE_KEY = STORAGE_KEY;
export const READING_FAVORITES_STORAGE_VERSION = STORAGE_VERSION;
export const READING_FAVORITES_CHANGE_EVENT = CHANGE_EVENT;
