import { describe, expect, it } from "vitest";

import {
  nextStreakAfterDailyCompletion,
  previousDateKey,
  visibleCurrentStreak,
} from "./streaks";

describe("streaks", () => {
  it("starts a new streak on first completion", () => {
    expect(
      nextStreakAfterDailyCompletion({
        currentStreak: 0,
        longestStreak: 0,
        lastDailyCompletionDate: null,
        completedDateKey: "2026-08-07",
      }),
    ).toEqual({
      currentStreak: 1,
      longestStreak: 1,
      lastDailyCompletionDate: "2026-08-07",
    });
  });

  it("increments on contiguous days and ignores duplicate same-day completion", () => {
    const afterSecond = nextStreakAfterDailyCompletion({
      currentStreak: 1,
      longestStreak: 1,
      lastDailyCompletionDate: "2026-08-07",
      completedDateKey: "2026-08-08",
    });
    expect(afterSecond.currentStreak).toBe(2);
    expect(
      nextStreakAfterDailyCompletion({
        ...afterSecond,
        completedDateKey: "2026-08-08",
      }).currentStreak,
    ).toBe(2);
  });

  it("resets after a missed day without shrinking longest", () => {
    const result = nextStreakAfterDailyCompletion({
      currentStreak: 4,
      longestStreak: 6,
      lastDailyCompletionDate: "2026-08-05",
      completedDateKey: "2026-08-08",
    });
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(6);
  });

  it("hides stale streaks for display", () => {
    expect(
      visibleCurrentStreak({
        currentStreak: 3,
        lastDailyCompletionDate: "2026-08-01",
        todayDateKey: "2026-08-08",
      }),
    ).toBe(0);
    expect(
      visibleCurrentStreak({
        currentStreak: 3,
        lastDailyCompletionDate: previousDateKey("2026-08-08"),
        todayDateKey: "2026-08-08",
      }),
    ).toBe(3);
  });
});
