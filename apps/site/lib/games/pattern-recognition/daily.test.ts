import { describe, expect, it } from "vitest";

import {
  formatDateKeyInTimeZone,
  hashString,
  selectDailyChallengeSlugs,
  selectPracticeChallengeSlugs,
} from "./daily";

describe("daily challenge selection", () => {
  const pool = [
    "alpha",
    "bravo",
    "charlie",
    "delta",
    "echo",
    "foxtrot",
    "golf",
    "hotel",
  ];

  it("is deterministic for a fixed date key", () => {
    const a = selectDailyChallengeSlugs(pool, "2026-08-07");
    const b = selectDailyChallengeSlugs(pool, "2026-08-07");
    expect(a).toEqual(b);
    expect(a).toHaveLength(5);
  });

  it("usually varies across dates while staying within the pool", () => {
    const a = selectDailyChallengeSlugs(pool, "2026-08-07");
    const b = selectDailyChallengeSlugs(pool, "2026-08-08");
    expect(a.every((slug) => pool.includes(slug))).toBe(true);
    expect(b.every((slug) => pool.includes(slug))).toBe(true);
    expect(a.join("|")).not.toEqual(b.join("|"));
  });

  it("formats date keys in the game timezone around Pacific midnight", () => {
    // 2026-08-08T06:30:00Z is still 2026-08-07 in America/Los_Angeles (PDT).
    const lateUtc = new Date("2026-08-08T06:30:00.000Z");
    expect(formatDateKeyInTimeZone(lateUtc, "America/Los_Angeles")).toBe("2026-08-07");
    // 2026-08-08T07:30:00Z is 2026-08-08 00:30 PDT.
    const afterMidnight = new Date("2026-08-08T07:30:00.000Z");
    expect(formatDateKeyInTimeZone(afterMidnight, "America/Los_Angeles")).toBe("2026-08-08");
  });

  it("hashes stably", () => {
    expect(hashString("pattern-recognition-daily:2026-08-07")).toBe(
      hashString("pattern-recognition-daily:2026-08-07"),
    );
  });

  it("selects practice packs from a session seed", () => {
    const a = selectPracticeChallengeSlugs(pool, "session-1");
    const b = selectPracticeChallengeSlugs(pool, "session-1");
    const c = selectPracticeChallengeSlugs(pool, "session-2");
    expect(a).toEqual(b);
    expect(a).toHaveLength(5);
    expect(a.join("|")).not.toEqual(c.join("|"));
  });
});
