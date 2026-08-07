import {
  canUseLocalStorage,
  readVersionedLocalStateWithMigration,
  writeVersionedLocalState,
} from "@/lib/storage/safe-local-storage";

import type { ChallengeOutcome } from "@/types/challenges";

export const PATTERN_RECOGNITION_STORAGE_KEY = "ac_pattern_recognition";
export const PATTERN_RECOGNITION_STORAGE_VERSION = 1;

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
};

export type PatternRecognitionStateV1 = {
  anonymousPlayerId: string;
  createdAt: string;
  updatedAt: string;
  totalInsightXp: number;
  attemptEvents: PatternRecognitionAttemptEvent[];
};

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `pr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function emptyState(now = new Date().toISOString()): PatternRecognitionStateV1 {
  return {
    anonymousPlayerId: createId(),
    createdAt: now,
    updatedAt: now,
    totalInsightXp: 0,
    attemptEvents: [],
  };
}

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

function migrateState(raw: unknown): PatternRecognitionStateV1 | null {
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
  return {
    anonymousPlayerId:
      typeof record.anonymousPlayerId === "string" && record.anonymousPlayerId.trim()
        ? record.anonymousPlayerId
        : createId(),
    createdAt: typeof record.createdAt === "string" ? record.createdAt : now,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : now,
    totalInsightXp,
    attemptEvents: attempts,
  };
}

function readState(): PatternRecognitionStateV1 {
  if (!canUseLocalStorage()) return emptyState();
  return (
    readVersionedLocalStateWithMigration<PatternRecognitionStateV1>(
      PATTERN_RECOGNITION_STORAGE_KEY,
      PATTERN_RECOGNITION_STORAGE_VERSION,
      migrateState,
    ) ?? emptyState()
  );
}

function writeState(state: PatternRecognitionStateV1): boolean {
  return writeVersionedLocalState(
    PATTERN_RECOGNITION_STORAGE_KEY,
    PATTERN_RECOGNITION_STORAGE_VERSION,
    state,
  );
}

export function getPatternRecognitionState(): PatternRecognitionStateV1 {
  return readState();
}

export function getTotalInsightXp(): number {
  return readState().totalInsightXp;
}

export function recordChallengeAttempt(input: {
  challengeId: string;
  selectedPatternId: string;
  outcome: ChallengeOutcome;
  context: string;
  xpAwarded: number;
  mode?: "daily" | "practice" | "single";
  sessionId?: string;
}): PatternRecognitionStateV1 {
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
  };
  const next: PatternRecognitionStateV1 = {
    ...state,
    updatedAt: now,
    totalInsightXp: state.totalInsightXp + event.xpAwarded,
    attemptEvents: [...state.attemptEvents, event].slice(-200),
  };
  writeState(next);
  return next;
}

export function resetPatternRecognitionProgress(): PatternRecognitionStateV1 {
  const next = emptyState();
  writeState(next);
  return next;
}
