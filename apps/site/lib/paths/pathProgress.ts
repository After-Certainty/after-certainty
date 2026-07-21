export type PathOwnerType = "question" | "trail";

export type PathProgressEntry = {
  ownerType: PathOwnerType;
  ownerId: string;
  lastStopPosition: number;
  updatedAt: string;
  completed?: boolean;
};

export type PathProgressStore = Record<string, PathProgressEntry>;

const STORAGE_KEY = "ac_path_progress";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function pathProgressStorageKey(ownerType: PathOwnerType, ownerId: string): string {
  return `${ownerType}:${ownerId}`;
}

function readStore(): PathProgressStore {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as PathProgressStore;
  } catch {
    return {};
  }
}

function writeStore(store: PathProgressStore): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota / private mode — ignore.
  }
}

export function getPathProgress(
  ownerType: PathOwnerType,
  ownerId: string,
): PathProgressEntry | null {
  return readStore()[pathProgressStorageKey(ownerType, ownerId)] ?? null;
}

export function recordPathStopVisit(input: {
  ownerType: PathOwnerType;
  ownerId: string;
  stopPosition: number;
  totalStops: number;
}): PathProgressEntry {
  const key = pathProgressStorageKey(input.ownerType, input.ownerId);
  const completed = input.stopPosition >= input.totalStops;
  const entry: PathProgressEntry = {
    ownerType: input.ownerType,
    ownerId: input.ownerId,
    lastStopPosition: input.stopPosition,
    updatedAt: new Date().toISOString(),
    completed,
  };
  const store = readStore();
  store[key] = entry;
  writeStore(store);
  return entry;
}

export function clearPathProgress(ownerType: PathOwnerType, ownerId: string): void {
  const key = pathProgressStorageKey(ownerType, ownerId);
  const store = readStore();
  if (!(key in store)) return;
  delete store[key];
  writeStore(store);
}

export const PATH_PROGRESS_STORAGE_KEY = STORAGE_KEY;
