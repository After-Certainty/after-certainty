import { describe, expect, it } from "vitest";

import { isPatternChallengePlayPath } from "@/lib/games/is-pattern-challenge-play-path";

describe("isPatternChallengePlayPath", () => {
  it("matches daily, practice, and challenge routes", () => {
    expect(isPatternChallengePlayPath("/games/pattern-recognition/daily")).toBe(true);
    expect(isPatternChallengePlayPath("/games/pattern-recognition/practice")).toBe(true);
    expect(
      isPatternChallengePlayPath("/games/pattern-recognition/challenge/hallway-workaround-exception"),
    ).toBe(true);
  });

  it("does not match lobby or unrelated routes", () => {
    expect(isPatternChallengePlayPath("/games/pattern-recognition")).toBe(false);
    expect(isPatternChallengePlayPath("/games")).toBe(false);
    expect(isPatternChallengePlayPath("/explore/patterns")).toBe(false);
    expect(isPatternChallengePlayPath(null)).toBe(false);
  });
});
