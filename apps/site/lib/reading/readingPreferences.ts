import {
  canUseLocalStorage,
  readVersionedLocalStateWithMigration,
  removeLocalStorageKey,
  writeVersionedLocalState,
} from "@/lib/storage/safe-local-storage";

/**
 * Local (device-only) reading chrome preferences (READ-014 + Phase F).
 * Text size, line height, and reading width for the native reader.
 * Site light/dark remains the global theme (no reader-scoped theme).
 * No server sync; clearing site data resets.
 *
 * Storage: versioned envelope via safe-local-storage. Legacy flat prefs migrate on read.
 */

export const READING_TEXT_SIZES = ["sm", "md", "lg", "xl"] as const;
export type ReadingTextSize = (typeof READING_TEXT_SIZES)[number];

export const READING_LINE_HEIGHTS = ["compact", "comfortable", "relaxed"] as const;
export type ReadingLineHeight = (typeof READING_LINE_HEIGHTS)[number];

export const READING_WIDTHS = ["narrow", "medium", "wide"] as const;
export type ReadingWidth = (typeof READING_WIDTHS)[number];

export type ReadingPreferences = {
  textSize: ReadingTextSize;
  lineHeight: ReadingLineHeight;
  readingWidth: ReadingWidth;
  updatedAt: string;
};

const STORAGE_KEY = "ac_reading_prefs";
const STORAGE_VERSION = 1;
const CHANGE_EVENT = "ac-reading-prefs-changed";

export const DEFAULT_READING_PREFERENCES: Omit<ReadingPreferences, "updatedAt"> = {
  textSize: "md",
  lineHeight: "comfortable",
  readingWidth: "medium",
};

const EMPTY_SNAPSHOT: ReadingPreferences = {
  ...DEFAULT_READING_PREFERENCES,
  updatedAt: new Date(0).toISOString(),
};

let cachedSnapshot: ReadingPreferences = EMPTY_SNAPSHOT;

function notifyChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function isTextSize(value: unknown): value is ReadingTextSize {
  return typeof value === "string" && (READING_TEXT_SIZES as readonly string[]).includes(value);
}

function isLineHeight(value: unknown): value is ReadingLineHeight {
  return typeof value === "string" && (READING_LINE_HEIGHTS as readonly string[]).includes(value);
}

function isReadingWidth(value: unknown): value is ReadingWidth {
  return typeof value === "string" && (READING_WIDTHS as readonly string[]).includes(value);
}

function normalizePreferences(raw: unknown): ReadingPreferences {
  if (!raw || typeof raw !== "object") return EMPTY_SNAPSHOT;
  const record = raw as Record<string, unknown>;
  return {
    textSize: isTextSize(record.textSize) ? record.textSize : DEFAULT_READING_PREFERENCES.textSize,
    lineHeight: isLineHeight(record.lineHeight)
      ? record.lineHeight
      : DEFAULT_READING_PREFERENCES.lineHeight,
    readingWidth: isReadingWidth(record.readingWidth)
      ? record.readingWidth
      : DEFAULT_READING_PREFERENCES.readingWidth,
    updatedAt:
      typeof record.updatedAt === "string" && record.updatedAt.trim()
        ? record.updatedAt
        : EMPTY_SNAPSHOT.updatedAt,
  };
}

function migratePreferences(raw: unknown): ReadingPreferences | null {
  if (!raw || typeof raw !== "object") return null;
  // Accept legacy flat prefs (textSize) and versioned data payloads.
  const record = raw as Record<string, unknown>;
  if (!("textSize" in record) && !("lineHeight" in record) && !("readingWidth" in record)) {
    return null;
  }
  return normalizePreferences(raw);
}

function samePreferences(a: ReadingPreferences, b: ReadingPreferences): boolean {
  return (
    a.textSize === b.textSize &&
    a.lineHeight === b.lineHeight &&
    a.readingWidth === b.readingWidth &&
    a.updatedAt === b.updatedAt
  );
}

function rememberSnapshot(next: ReadingPreferences): ReadingPreferences {
  if (samePreferences(cachedSnapshot, next)) return cachedSnapshot;
  cachedSnapshot = next;
  return cachedSnapshot;
}

/**
 * Stable snapshot for `useSyncExternalStore` — same object reference when unchanged.
 */
export function getReadingPreferences(): ReadingPreferences {
  if (!canUseLocalStorage()) {
    return rememberSnapshot(EMPTY_SNAPSHOT);
  }
  const migrated = readVersionedLocalStateWithMigration<ReadingPreferences>(
    STORAGE_KEY,
    STORAGE_VERSION,
    migratePreferences,
  );
  if (!migrated) {
    return rememberSnapshot(EMPTY_SNAPSHOT);
  }
  return rememberSnapshot(normalizePreferences(migrated));
}

export function setReadingPreferences(
  patch: Partial<Pick<ReadingPreferences, "textSize" | "lineHeight" | "readingWidth">>,
): ReadingPreferences {
  const current = getReadingPreferences();
  const next: ReadingPreferences = {
    textSize: patch.textSize ?? current.textSize,
    lineHeight: patch.lineHeight ?? current.lineHeight,
    readingWidth: patch.readingWidth ?? current.readingWidth,
    updatedAt: new Date().toISOString(),
  };
  rememberSnapshot(next);
  if (!canUseLocalStorage()) return next;
  writeVersionedLocalState(STORAGE_KEY, STORAGE_VERSION, next);
  notifyChanged();
  return next;
}

export function setReadingTextSize(textSize: ReadingTextSize): ReadingPreferences {
  return setReadingPreferences({ textSize });
}

export function setReadingLineHeight(lineHeight: ReadingLineHeight): ReadingPreferences {
  return setReadingPreferences({ lineHeight });
}

export function setReadingWidth(readingWidth: ReadingWidth): ReadingPreferences {
  return setReadingPreferences({ readingWidth });
}

export function clearReadingPreferences(): void {
  rememberSnapshot(EMPTY_SNAPSHOT);
  removeLocalStorageKey(STORAGE_KEY);
  notifyChanged();
}

export function subscribeReadingPreferences(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export const READING_PREFERENCES_STORAGE_KEY = STORAGE_KEY;
export const READING_PREFERENCES_STORAGE_VERSION = STORAGE_VERSION;
export const READING_PREFERENCES_CHANGE_EVENT = CHANGE_EVENT;

export const READING_TEXT_SIZE_LABELS: Record<ReadingTextSize, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "Extra large",
};

export const READING_LINE_HEIGHT_LABELS: Record<ReadingLineHeight, string> = {
  compact: "Compact",
  comfortable: "Comfortable",
  relaxed: "Relaxed",
};

export const READING_WIDTH_LABELS: Record<ReadingWidth, string> = {
  narrow: "Narrow",
  medium: "Medium",
  wide: "Wide",
};

/** Rem values applied as `--reader-font-size` on the chapter frame. */
export const READING_TEXT_SIZE_REMS: Record<ReadingTextSize, string> = {
  sm: "0.9375rem",
  md: "1.0625rem",
  lg: "1.25rem",
  xl: "1.5rem",
};

export const READING_LINE_HEIGHT_VALUES: Record<ReadingLineHeight, string> = {
  compact: "1.5",
  comfortable: "1.75",
  relaxed: "2",
};

/** Max-width utility classes for the chapter frame. */
export const READING_WIDTH_CLASSNAMES: Record<ReadingWidth, string> = {
  narrow: "max-w-xl",
  medium: "max-w-3xl",
  wide: "max-w-5xl",
};
