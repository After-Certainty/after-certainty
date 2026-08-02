import {
  canUseLocalStorage,
  readVersionedLocalStateWithMigration,
  removeLocalStorageKey,
  writeVersionedLocalState,
} from "@/lib/storage/safe-local-storage";

/**
 * Local (device-only) reading bookmarks (READ-013).
 * Keyed by `bookmark:{editionId}:{chapterId}[:{fragmentId}]`.
 * No server sync; clearing site data resets.
 *
 * Storage: versioned envelope via safe-local-storage (Phase F). Legacy bare maps migrate on read.
 */

export type ReadingBookmarkEntry = {
  editionId: string;
  chapterId: string;
  /** Optional heading fragment (without `#`) from READ-003 anchors. */
  fragmentId?: string;
  /** Contract identity: `bookmark:{editionId}:{chapterId}[:{fragmentId}]` */
  identityKey: string;
  /** Optional display label (chapter title or heading text) captured at bookmark time. */
  label?: string;
  createdAt: string;
};

export type ReadingBookmarkStore = Record<string, ReadingBookmarkEntry>;

const STORAGE_KEY = "ac_reading_bookmarks";
const STORAGE_VERSION = 1;

function normalizeFragmentId(value: string | null | undefined): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim().replace(/^#/, "");
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Stable identity string for a bookmark (chapter or section).
 */
export function chapterBookmarkStorageKey(
  editionId: string,
  chapterId: string,
  fragmentId?: string | null,
): string {
  const edition = editionId.trim();
  const chapter = chapterId.trim();
  const fragment = normalizeFragmentId(fragmentId);
  const base = `bookmark:${edition}:${chapter}`;
  return fragment ? `${base}:${fragment}` : base;
}

function isBookmarkEntry(value: unknown): value is ReadingBookmarkEntry {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.editionId === "string" &&
    typeof record.chapterId === "string" &&
    typeof record.identityKey === "string" &&
    typeof record.createdAt === "string"
  );
}

function migrateBookmarkStore(raw: unknown): ReadingBookmarkStore | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const store: ReadingBookmarkStore = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!key.trim() || !isBookmarkEntry(value)) continue;
    store[key] = value;
  }
  return store;
}

function readStore(): ReadingBookmarkStore {
  if (!canUseLocalStorage()) return {};
  return (
    readVersionedLocalStateWithMigration<ReadingBookmarkStore>(
      STORAGE_KEY,
      STORAGE_VERSION,
      migrateBookmarkStore,
    ) ?? {}
  );
}

function writeStore(store: ReadingBookmarkStore): void {
  writeVersionedLocalState(STORAGE_KEY, STORAGE_VERSION, store);
}

export function getReadingBookmark(
  editionId: string,
  chapterId: string,
  fragmentId?: string | null,
): ReadingBookmarkEntry | null {
  const key = chapterBookmarkStorageKey(editionId, chapterId, fragmentId);
  if (!editionId.trim() || !chapterId.trim()) return null;
  return readStore()[key] ?? null;
}

export function hasReadingBookmark(
  editionId: string,
  chapterId: string,
  fragmentId?: string | null,
): boolean {
  return getReadingBookmark(editionId, chapterId, fragmentId) != null;
}

/**
 * All bookmarks, newest first.
 */
export function listReadingBookmarks(): ReadingBookmarkEntry[] {
  return Object.values(readStore()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Bookmarks for one edition (newest first). Matches `editionId` exactly.
 */
export function listReadingBookmarksForEdition(editionId: string): ReadingBookmarkEntry[] {
  const id = editionId.trim();
  if (!id) return [];
  return listReadingBookmarks().filter((entry) => entry.editionId === id);
}

export function addReadingBookmark(input: {
  editionId: string;
  chapterId: string;
  fragmentId?: string | null;
  label?: string | null;
}): ReadingBookmarkEntry {
  const editionId = input.editionId.trim();
  const chapterId = input.chapterId.trim();
  if (!editionId || !chapterId) {
    throw new Error("addReadingBookmark requires non-empty editionId and chapterId");
  }

  const fragmentId = normalizeFragmentId(input.fragmentId);
  const identityKey = chapterBookmarkStorageKey(editionId, chapterId, fragmentId);
  const existing = readStore()[identityKey];
  const label = input.label?.trim() || existing?.label;
  const entry: ReadingBookmarkEntry = {
    editionId,
    chapterId,
    identityKey,
    ...(fragmentId ? { fragmentId } : {}),
    ...(label ? { label } : {}),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };

  const store = readStore();
  store[identityKey] = entry;
  writeStore(store);
  return entry;
}

export function removeReadingBookmark(
  editionId: string,
  chapterId: string,
  fragmentId?: string | null,
): void {
  removeReadingBookmarkByIdentityKey(chapterBookmarkStorageKey(editionId, chapterId, fragmentId));
}

export function removeReadingBookmarkByIdentityKey(identityKey: string): void {
  const key = identityKey.trim();
  if (!key) return;
  const store = readStore();
  if (!(key in store)) return;
  delete store[key];
  writeStore(store);
}

export function toggleReadingBookmark(input: {
  editionId: string;
  chapterId: string;
  fragmentId?: string | null;
  label?: string | null;
}): { bookmarked: boolean; entry: ReadingBookmarkEntry | null } {
  if (hasReadingBookmark(input.editionId, input.chapterId, input.fragmentId)) {
    removeReadingBookmark(input.editionId, input.chapterId, input.fragmentId);
    return { bookmarked: false, entry: null };
  }
  const entry = addReadingBookmark(input);
  return { bookmarked: true, entry };
}

export function clearReadingBookmarksForEdition(editionId: string): void {
  const id = editionId.trim();
  if (!id) return;
  const store = readStore();
  let changed = false;
  for (const [key, entry] of Object.entries(store)) {
    if (entry.editionId === id) {
      delete store[key];
      changed = true;
    }
  }
  if (changed) writeStore(store);
}

export function clearAllReadingBookmarks(): void {
  removeLocalStorageKey(STORAGE_KEY);
}

export const READING_BOOKMARKS_STORAGE_KEY = STORAGE_KEY;
export const READING_BOOKMARKS_STORAGE_VERSION = STORAGE_VERSION;
