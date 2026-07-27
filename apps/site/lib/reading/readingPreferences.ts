/**
 * Local (device-only) reading chrome preferences (READ-014).
 * Text size for the native reader. Site light/dark remains the global theme.
 * No server sync; clearing site data resets.
 */

export const READING_TEXT_SIZES = ["sm", "md", "lg", "xl"] as const;
export type ReadingTextSize = (typeof READING_TEXT_SIZES)[number];

export type ReadingPreferences = {
  textSize: ReadingTextSize;
  updatedAt: string;
};

const STORAGE_KEY = "ac_reading_prefs";
const CHANGE_EVENT = "ac-reading-prefs-changed";

export const DEFAULT_READING_PREFERENCES: Omit<ReadingPreferences, "updatedAt"> = {
  textSize: "md",
};

const EMPTY_SNAPSHOT: ReadingPreferences = {
  ...DEFAULT_READING_PREFERENCES,
  updatedAt: new Date(0).toISOString(),
};

let cachedSnapshot: ReadingPreferences = EMPTY_SNAPSHOT;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifyChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function isTextSize(value: unknown): value is ReadingTextSize {
  return typeof value === "string" && (READING_TEXT_SIZES as readonly string[]).includes(value);
}

function normalizePreferences(raw: unknown): ReadingPreferences {
  if (!raw || typeof raw !== "object") return EMPTY_SNAPSHOT;
  const record = raw as Record<string, unknown>;
  return {
    textSize: isTextSize(record.textSize) ? record.textSize : DEFAULT_READING_PREFERENCES.textSize,
    updatedAt:
      typeof record.updatedAt === "string" && record.updatedAt.trim()
        ? record.updatedAt
        : EMPTY_SNAPSHOT.updatedAt,
  };
}

function samePreferences(a: ReadingPreferences, b: ReadingPreferences): boolean {
  return a.textSize === b.textSize && a.updatedAt === b.updatedAt;
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
  if (!canUseStorage()) {
    return rememberSnapshot(EMPTY_SNAPSHOT);
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return rememberSnapshot(EMPTY_SNAPSHOT);
    }
    return rememberSnapshot(normalizePreferences(JSON.parse(raw) as unknown));
  } catch {
    return rememberSnapshot(EMPTY_SNAPSHOT);
  }
}

export function setReadingPreferences(
  patch: Partial<Pick<ReadingPreferences, "textSize">>,
): ReadingPreferences {
  const current = getReadingPreferences();
  const next: ReadingPreferences = {
    textSize: patch.textSize ?? current.textSize,
    updatedAt: new Date().toISOString(),
  };
  rememberSnapshot(next);
  if (!canUseStorage()) return next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    notifyChanged();
  } catch {
    // Quota / private mode — ignore persistence.
  }
  return next;
}

export function setReadingTextSize(textSize: ReadingTextSize): ReadingPreferences {
  return setReadingPreferences({ textSize });
}

export function clearReadingPreferences(): void {
  rememberSnapshot(EMPTY_SNAPSHOT);
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    notifyChanged();
  } catch {
    // ignore
  }
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
export const READING_PREFERENCES_CHANGE_EVENT = CHANGE_EVENT;

export const READING_TEXT_SIZE_LABELS: Record<ReadingTextSize, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "Extra large",
};

/** Rem values applied as `--reader-font-size` on the chapter frame. */
export const READING_TEXT_SIZE_REMS: Record<ReadingTextSize, string> = {
  sm: "0.9375rem",
  md: "1.0625rem",
  lg: "1.25rem",
  xl: "1.5rem",
};
