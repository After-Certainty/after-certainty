import type { ChallengeOutcome } from "@/types/challenges";

export type PatternMemoryEntry = {
  patternId: string;
  encountered: number;
  recognizedDominant: number;
  recognizedSecondary: number;
  contexts: string[];
};

export type PatternMemoryStore = Record<string, PatternMemoryEntry>;

function uniquePush(list: string[], value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return list;
  if (list.includes(trimmed)) return list;
  return [...list, trimmed].sort((a, b) => a.localeCompare(b));
}

function ensureEntry(store: PatternMemoryStore, patternId: string): PatternMemoryEntry {
  const existing = store[patternId];
  if (existing) return existing;
  return {
    patternId,
    encountered: 0,
    recognizedDominant: 0,
    recognizedSecondary: 0,
    contexts: [],
  };
}

/**
 * Update Pattern Memory after an attempt.
 * Encountered: dominant + secondaries shown (and selected if distractor).
 * Recognized counts follow outcome for the selected pattern; dominant also
 * increments recognizedDominant when correctly identified.
 */
export function applyAttemptToPatternMemory(
  store: PatternMemoryStore,
  input: {
    dominantPatternId: string;
    secondaryPatternIds: readonly string[];
    selectedPatternId: string;
    outcome: ChallengeOutcome;
    context: string;
  },
): PatternMemoryStore {
  const next: PatternMemoryStore = { ...store };
  const touch = (patternId: string) => {
    const entry = { ...ensureEntry(next, patternId) };
    entry.encountered += 1;
    entry.contexts = uniquePush(entry.contexts, input.context);
    next[patternId] = entry;
  };

  touch(input.dominantPatternId);
  for (const secondary of input.secondaryPatternIds) {
    touch(secondary);
  }
  if (
    input.selectedPatternId !== input.dominantPatternId &&
    !input.secondaryPatternIds.includes(input.selectedPatternId)
  ) {
    touch(input.selectedPatternId);
  }

  if (input.outcome === "dominant") {
    const dominant = { ...ensureEntry(next, input.dominantPatternId) };
    dominant.recognizedDominant += 1;
    next[input.dominantPatternId] = dominant;
  } else if (input.outcome === "secondary") {
    const secondary = { ...ensureEntry(next, input.selectedPatternId) };
    secondary.recognizedSecondary += 1;
    next[input.selectedPatternId] = secondary;
  }

  return next;
}

export function formatContextLabel(context: string): string {
  return context
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
