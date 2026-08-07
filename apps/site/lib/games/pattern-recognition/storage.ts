import {
  canUseLocalStorage,
  readVersionedLocalStateWithMigration,
  writeVersionedLocalState,
} from "@/lib/storage/safe-local-storage";

import type { ChallengeOutcome } from "@/types/challenges";

import { DAILY_COMPLETION_BONUS_XP } from "@/lib/games/pattern-recognition/daily";
import {
  applyAttemptToPatternMemory,
  type PatternMemoryEntry,
  type PatternMemoryStore,
} from "@/lib/games/pattern-recognition/memory";
import { nextStreakAfterDailyCompletion } from "@/lib/games/pattern-recognition/streaks";

export const PATTERN_RECOGNITION_STORAGE_KEY = "ac_pattern_recognition";
export const PATTERN_RECOGNITION_STORAGE_VERSION = 2;
const CHANGE_EVENT = "ac-pattern-recognition-changed";

function notifyChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribePatternRecognition(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onLocalChange = () => onStoreChange();
  const onStorage = (event: StorageEvent) => {
    if (event.key != null && event.key !== PATTERN_RECOGNITION_STORAGE_KEY) return;
    hasLoadedFromStorage = false;
    loadStateFromStorage();
    onStoreChange();
  };
  window.addEventListener(CHANGE_EVENT, onLocalChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onLocalChange);
    window.removeEventListener("storage", onStorage);
  };
}

export type PatternRecognitionAttemptEvent = {
  id: string;
  challengeId: string;
  sessionId: string;
  mode: "daily" | "practice" | "single";
  selectedPatternId: string;
  outcome: ChallengeOutcome;
  context: string;
  answeredAt: string;
  xpAwarded: number;
  dailyDate?: string;
  dominantPatternId?: string;
  secondaryPatternIds?: string[];
};

export type DailyCompletionRecord = {
  dateKey: string;
  sessionId: string;
  completedAt: string;
  challengeIds: string[];
  bonusXpAwarded: number;
};

export type PatternRecognitionStateV2 = {
  anonymousPlayerId: string;
  createdAt: string;
  updatedAt: string;
  totalInsightXp: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  lastDailyCompletionDate: string | null;
  dailyCompletions: Record<string, DailyCompletionRecord>;
  attemptEvents: PatternRecognitionAttemptEvent[];
  patternMemory: PatternMemoryStore;
};

export type PatternMemoryEntryPublic = PatternMemoryEntry;

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `pr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function emptyState(now = new Date().toISOString()): PatternRecognitionStateV2 {
  return {
    anonymousPlayerId: createId(),
    createdAt: now,
    updatedAt: now,
    totalInsightXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPlayedDate: null,
    lastDailyCompletionDate: null,
    dailyCompletions: {},
    attemptEvents: [],
    patternMemory: {},
  };
}

/** Stable SSR / pre-hydration snapshot for useSyncExternalStore. */
const SERVER_SNAPSHOT: PatternRecognitionStateV2 = {
  anonymousPlayerId: "",
  createdAt: "",
  updatedAt: "",
  totalInsightXp: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: null,
  lastDailyCompletionDate: null,
  dailyCompletions: {},
  attemptEvents: [],
  patternMemory: {},
};

let cachedSnapshot: PatternRecognitionStateV2 = SERVER_SNAPSHOT;
let hasLoadedFromStorage = false;

function isAttemptEvent(value: unknown): value is PatternRecognitionAttemptEvent {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.challengeId === "string" &&
    typeof record.selectedPatternId === "string" &&
    typeof record.outcome === "string" &&
    typeof record.xpAwarded === "number" &&
    typeof record.answeredAt === "string"
  );
}

function migrateState(raw: unknown): PatternRecognitionStateV2 | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const attempts = Array.isArray(record.attemptEvents)
    ? record.attemptEvents.filter(isAttemptEvent)
    : [];
  const totalFromEvents = attempts.reduce((sum, event) => sum + Math.max(0, event.xpAwarded), 0);
  const totalInsightXp =
    typeof record.totalInsightXp === "number" && Number.isFinite(record.totalInsightXp)
      ? Math.max(0, Math.round(record.totalInsightXp))
      : totalFromEvents;
  const now = new Date().toISOString();

  let patternMemory: PatternMemoryStore = {};
  if (record.patternMemory && typeof record.patternMemory === "object") {
    patternMemory = record.patternMemory as PatternMemoryStore;
  } else {
    for (const attempt of attempts) {
      if (!attempt.dominantPatternId) continue;
      patternMemory = applyAttemptToPatternMemory(patternMemory, {
        dominantPatternId: attempt.dominantPatternId,
        secondaryPatternIds: attempt.secondaryPatternIds ?? [],
        selectedPatternId: attempt.selectedPatternId,
        outcome: attempt.outcome,
        context: attempt.context,
      });
    }
  }

  const dailyCompletions =
    record.dailyCompletions && typeof record.dailyCompletions === "object"
      ? (record.dailyCompletions as Record<string, DailyCompletionRecord>)
      : {};

  return {
    anonymousPlayerId:
      typeof record.anonymousPlayerId === "string" && record.anonymousPlayerId.trim()
        ? record.anonymousPlayerId
        : createId(),
    createdAt: typeof record.createdAt === "string" ? record.createdAt : now,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : now,
    totalInsightXp,
    currentStreak:
      typeof record.currentStreak === "number" ? Math.max(0, Math.round(record.currentStreak)) : 0,
    longestStreak:
      typeof record.longestStreak === "number" ? Math.max(0, Math.round(record.longestStreak)) : 0,
    lastPlayedDate: typeof record.lastPlayedDate === "string" ? record.lastPlayedDate : null,
    lastDailyCompletionDate:
      typeof record.lastDailyCompletionDate === "string"
        ? record.lastDailyCompletionDate
        : null,
    dailyCompletions,
    attemptEvents: attempts,
    patternMemory,
  };
}

function loadStateFromStorage(): PatternRecognitionStateV2 {
  if (!canUseLocalStorage()) {
    if (cachedSnapshot === SERVER_SNAPSHOT) {
      cachedSnapshot = emptyState();
    }
    return cachedSnapshot;
  }
  const loaded =
    readVersionedLocalStateWithMigration<PatternRecognitionStateV2>(
      PATTERN_RECOGNITION_STORAGE_KEY,
      PATTERN_RECOGNITION_STORAGE_VERSION,
      migrateState,
    ) ?? emptyState();
  cachedSnapshot = loaded;
  hasLoadedFromStorage = true;
  return cachedSnapshot;
}

function readState(): PatternRecognitionStateV2 {
  if (!hasLoadedFromStorage) {
    return loadStateFromStorage();
  }
  return cachedSnapshot;
}

function writeState(state: PatternRecognitionStateV2): boolean {
  cachedSnapshot = state;
  hasLoadedFromStorage = true;
  const ok = writeVersionedLocalState(
    PATTERN_RECOGNITION_STORAGE_KEY,
    PATTERN_RECOGNITION_STORAGE_VERSION,
    state,
  );
  notifyChanged();
  return ok;
}

export function getPatternRecognitionState(): PatternRecognitionStateV2 {
  return readState();
}

/** Stable getServerSnapshot for useSyncExternalStore subscribers. */
export function getPatternRecognitionServerSnapshot(): PatternRecognitionStateV2 {
  return SERVER_SNAPSHOT;
}

export function getTotalInsightXp(): number {
  return readState().totalInsightXp;
}

export function getTotalInsightXpServerSnapshot(): number {
  return 0;
}

export function getPatternMemoryEntry(patternId: string): PatternMemoryEntry | null {
  return readState().patternMemory[patternId] ?? null;
}

export function hasCompletedDaily(dateKey: string): boolean {
  return Boolean(readState().dailyCompletions[dateKey]);
}

export function recordChallengeAttempt(input: {
  challengeId: string;
  selectedPatternId: string;
  outcome: ChallengeOutcome;
  context: string;
  xpAwarded: number;
  mode?: "daily" | "practice" | "single";
  sessionId?: string;
  dailyDate?: string;
  dominantPatternId: string;
  secondaryPatternIds: readonly string[];
}): PatternRecognitionStateV2 {
  const state = readState();
  const now = new Date().toISOString();
  const event: PatternRecognitionAttemptEvent = {
    id: createId(),
    challengeId: input.challengeId,
    sessionId: input.sessionId ?? createId(),
    mode: input.mode ?? "single",
    selectedPatternId: input.selectedPatternId,
    outcome: input.outcome,
    context: input.context,
    answeredAt: now,
    xpAwarded: Math.max(0, Math.round(input.xpAwarded)),
    dailyDate: input.dailyDate,
    dominantPatternId: input.dominantPatternId,
    secondaryPatternIds: [...input.secondaryPatternIds],
  };

  const patternMemory = applyAttemptToPatternMemory(state.patternMemory, {
    dominantPatternId: input.dominantPatternId,
    secondaryPatternIds: input.secondaryPatternIds,
    selectedPatternId: input.selectedPatternId,
    outcome: input.outcome,
    context: input.context,
  });

  const next: PatternRecognitionStateV2 = {
    ...state,
    updatedAt: now,
    lastPlayedDate: input.dailyDate ?? state.lastPlayedDate,
    totalInsightXp: state.totalInsightXp + event.xpAwarded,
    attemptEvents: [...state.attemptEvents, event].slice(-200),
    patternMemory,
  };
  writeState(next);
  return next;
}

export function completeDailySession(input: {
  dateKey: string;
  sessionId: string;
  challengeIds: readonly string[];
}): PatternRecognitionStateV2 {
  const state = readState();
  if (state.dailyCompletions[input.dateKey]) {
    return state;
  }

  const streak = nextStreakAfterDailyCompletion({
    currentStreak: state.currentStreak,
    longestStreak: state.longestStreak,
    lastDailyCompletionDate: state.lastDailyCompletionDate,
    completedDateKey: input.dateKey,
  });

  const now = new Date().toISOString();
  const next: PatternRecognitionStateV2 = {
    ...state,
    updatedAt: now,
    totalInsightXp: state.totalInsightXp + DAILY_COMPLETION_BONUS_XP,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastDailyCompletionDate: streak.lastDailyCompletionDate,
    lastPlayedDate: input.dateKey,
    dailyCompletions: {
      ...state.dailyCompletions,
      [input.dateKey]: {
        dateKey: input.dateKey,
        sessionId: input.sessionId,
        completedAt: now,
        challengeIds: [...input.challengeIds],
        bonusXpAwarded: DAILY_COMPLETION_BONUS_XP,
      },
    },
  };
  writeState(next);
  return next;
}

export function resetPatternRecognitionProgress(): PatternRecognitionStateV2 {
  const next = emptyState();
  writeState(next);
  return next;
}
