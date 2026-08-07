import { beforeEach, describe, expect, it } from "vitest";

import {
  PATTERN_RECOGNITION_STORAGE_KEY,
  completeDailySession,
  getPatternMemoryEntry,
  getTotalInsightXp,
  hasCompletedDaily,
  recordChallengeAttempt,
  resetPatternRecognitionProgress,
} from "./storage";

describe("pattern recognition storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("records attempts, accumulates Insight XP, and updates Pattern Memory", () => {
    const first = recordChallengeAttempt({
      challengeId: "challenge-a",
      selectedPatternId: "exceptions-are-forever",
      outcome: "dominant",
      context: "software",
      xpAwarded: 25,
      dominantPatternId: "exceptions-are-forever",
      secondaryPatternIds: ["structures-outlive-reasons"],
    });
    expect(first.totalInsightXp).toBe(25);
    expect(first.attemptEvents).toHaveLength(1);
    expect(getTotalInsightXp()).toBe(25);
    expect(getPatternMemoryEntry("exceptions-are-forever")?.recognizedDominant).toBe(1);
    expect(getPatternMemoryEntry("exceptions-are-forever")?.contexts).toContain("software");

    recordChallengeAttempt({
      challengeId: "challenge-b",
      selectedPatternId: "blame-compresses-complexity",
      outcome: "secondary",
      context: "leadership",
      xpAwarded: 15,
      dominantPatternId: "meaning-forms-early",
      secondaryPatternIds: ["blame-compresses-complexity"],
    });
    expect(getTotalInsightXp()).toBe(40);
  });

  it("completes a daily session once with streak and bonus XP", () => {
    recordChallengeAttempt({
      challengeId: "challenge-a",
      selectedPatternId: "exceptions-are-forever",
      outcome: "dominant",
      context: "software",
      xpAwarded: 25,
      mode: "daily",
      sessionId: "daily-session",
      dailyDate: "2026-08-07",
      dominantPatternId: "exceptions-are-forever",
      secondaryPatternIds: [],
    });
    const completed = completeDailySession({
      dateKey: "2026-08-07",
      sessionId: "daily-session",
      challengeIds: ["challenge-a"],
    });
    expect(hasCompletedDaily("2026-08-07")).toBe(true);
    expect(completed.currentStreak).toBe(1);
    expect(completed.totalInsightXp).toBe(40); // 25 + 15 bonus
    const again = completeDailySession({
      dateKey: "2026-08-07",
      sessionId: "daily-session",
      challengeIds: ["challenge-a"],
    });
    expect(again.totalInsightXp).toBe(40);
    expect(again.currentStreak).toBe(1);
  });

  it("resets progress to a fresh anonymous player", () => {
    recordChallengeAttempt({
      challengeId: "challenge-a",
      selectedPatternId: "exceptions-are-forever",
      outcome: "dominant",
      context: "software",
      xpAwarded: 25,
      dominantPatternId: "exceptions-are-forever",
      secondaryPatternIds: [],
    });
    const reset = resetPatternRecognitionProgress();
    expect(reset.totalInsightXp).toBe(0);
    expect(reset.attemptEvents).toEqual([]);
    expect(reset.patternMemory).toEqual({});
    expect(window.localStorage.getItem(PATTERN_RECOGNITION_STORAGE_KEY)).toContain(
      '"version":2',
    );
  });
});
