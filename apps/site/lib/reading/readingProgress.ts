import { chapterReadingStorageKey } from "@/lib/graph/chapters";

/**
 * Local (device-only) reading progress for Native Reader (READ-011).
 * One last-position entry per edition — continue-reading (READ-012) reads this.
 * No server sync; clearing site data resets.
 *
 * @see docs/semantic-chapter-identity.md — Client storage keys
 * @see lib/paths/pathProgress.ts — same storage pattern
 */

export type ReadingProgressEntry = {
  editionId: string;
  chapterId: string;
  /** Contract identity: `readingProgress:{editionId}:{chapterId}` */
  identityKey: string;
  /** Optional heading fragment (without `#`) from READ-003 anchors. */
  fragmentId?: string;
  /** Optional scroll offset within the chapter viewport. */
  scrollY?: number;
  updatedAt: string;
};

export type ReadingProgressStore = Record<string, ReadingProgressEntry>;

const STORAGE_KEY = "ac_reading_progress";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStore(): ReadingProgressStore {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as ReadingProgressStore;
  } catch {
    return {};
  }
}

function writeStore(store: ReadingProgressStore): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota / private mode — ignore.
  }
}

function normalizeOptionalString(value: string | null | undefined): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim().replace(/^#/, "");
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeScrollY(value: number | null | undefined): number | undefined {
  if (value == null || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.round(value));
}

/**
 * Last reading position for an edition, or null when none stored.
 */
export function getReadingProgress(editionId: string): ReadingProgressEntry | null {
  const id = editionId.trim();
  if (!id) return null;
  return readStore()[id] ?? null;
}

/**
 * All stored edition progress entries (newest `updatedAt` first).
 */
export function listReadingProgress(): ReadingProgressEntry[] {
  return Object.values(readStore()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/**
 * Persist last chapter (and optional fragment / scroll) for an edition.
 * Omitting `fragmentId` / `scrollY` keeps prior values when staying on the same chapter;
 * pass `null` to clear those fields. Switching chapters clears prior fragment/scroll
 * unless new values are provided.
 */
export function recordReadingProgress(input: {
  editionId: string;
  chapterId: string;
  fragmentId?: string | null;
  scrollY?: number | null;
}): ReadingProgressEntry {
  const editionId = input.editionId.trim();
  const chapterId = input.chapterId.trim();
  if (!editionId || !chapterId) {
    throw new Error("recordReadingProgress requires non-empty editionId and chapterId");
  }

  const existing = getReadingProgress(editionId);
  const sameChapter = existing?.chapterId === chapterId;

  let fragmentId: string | undefined;
  if (input.fragmentId === null) {
    fragmentId = undefined;
  } else if (input.fragmentId !== undefined) {
    fragmentId = normalizeOptionalString(input.fragmentId);
  } else if (sameChapter) {
    fragmentId = existing?.fragmentId;
  }

  let scrollY: number | undefined;
  if (input.scrollY === null) {
    scrollY = undefined;
  } else if (input.scrollY !== undefined) {
    scrollY = normalizeScrollY(input.scrollY);
  } else if (sameChapter) {
    scrollY = existing?.scrollY;
  }

  const entry: ReadingProgressEntry = {
    editionId,
    chapterId,
    identityKey: chapterReadingStorageKey(editionId, chapterId),
    ...(fragmentId ? { fragmentId } : {}),
    ...(scrollY !== undefined ? { scrollY } : {}),
    updatedAt: new Date().toISOString(),
  };

  const store = readStore();
  store[editionId] = entry;
  writeStore(store);
  return entry;
}

export function clearReadingProgress(editionId: string): void {
  const id = editionId.trim();
  if (!id) return;
  const store = readStore();
  if (!(id in store)) return;
  delete store[id];
  writeStore(store);
}

export function clearAllReadingProgress(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const READING_PROGRESS_STORAGE_KEY = STORAGE_KEY;
