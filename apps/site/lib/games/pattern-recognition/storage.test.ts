import { beforeEach, describe, expect, it } from "vitest";

import {
  PATTERN_RECOGNITION_STORAGE_KEY,
  getTotalInsightXp,
  recordChallengeAttempt,
  resetPatternRecognitionProgress,
} from "./storage";

describe("pattern recognition storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("records attempts and accumulates Insight XP", () => {
    const first = recordChallengeAttempt({
      challengeId: "challenge-a",
      selectedPatternId: "exceptions-are-forever",
      outcome: "dominant",
      context: "software",
      xpAwarded: 25,
    });
    expect(first.totalInsightXp).toBe(25);
    expect(first.attemptEvents).toHaveLength(1);
    expect(getTotalInsightXp()).toBe(25);

    recordChallengeAttempt({
      challengeId: "challenge-b",
      selectedPatternId: "blame-compresses-complexity",
      outcome: "secondary",
      context: "leadership",
      xpAwarded: 15,
    });
    expect(getTotalInsightXp()).toBe(40);
  });

  it("resets progress to a fresh anonymous player", () => {
    recordChallengeAttempt({
      challengeId: "challenge-a",
      selectedPatternId: "exceptions-are-forever",
      outcome: "dominant",
      context: "software",
      xpAwarded: 25,
    });
    const reset = resetPatternRecognitionProgress();
    expect(reset.totalInsightXp).toBe(0);
    expect(reset.attemptEvents).toEqual([]);
    expect(window.localStorage.getItem(PATTERN_RECOGNITION_STORAGE_KEY)).toContain(
      '"version":1',
    );
  });
});
