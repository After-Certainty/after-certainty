import { describe, expect, it } from "vitest";

import {
  ENTITY_INTRO_DISCLOSURE_MIN_CHARS,
  entityIntroTeaser,
  entityIntroTeaserFromFullAndShort,
  shouldUseEntityIntroDisclosure,
} from "@/lib/explore/entity-intro-teaser";

describe("entityIntroTeaser", () => {
  it("returns null for empty text", () => {
    expect(entityIntroTeaser(null)).toBeNull();
    expect(entityIntroTeaser("  ")).toBeNull();
  });

  it("keeps short prose intact", () => {
    expect(entityIntroTeaser("A short gloss.")).toBe("A short gloss.");
  });
});

describe("entityIntroTeaserFromFullAndShort", () => {
  it("prefers a shorter authored gloss", () => {
    const full = `${"Word ".repeat(80)}. Extra detail that continues for a while.`;
    expect(entityIntroTeaserFromFullAndShort(full, "Portable gloss.")).toBe("Portable gloss.");
  });
});

describe("shouldUseEntityIntroDisclosure", () => {
  it("skips disclosure for short prose", () => {
    const full = "Short enough to stay open.";
    const teaser = entityIntroTeaser(full);
    expect(full.length).toBeLessThan(ENTITY_INTRO_DISCLOSURE_MIN_CHARS);
    expect(shouldUseEntityIntroDisclosure(full, teaser)).toBe(false);
  });

  it("uses disclosure when full prose is long and teaser differs", () => {
    const full = `${"Certainty is the habit of treating provisional maps as final terrain. ".repeat(6)}`;
    const teaser = entityIntroTeaser(full);
    expect(full.length).toBeGreaterThanOrEqual(ENTITY_INTRO_DISCLOSURE_MIN_CHARS);
    expect(teaser).toBeTruthy();
    expect(shouldUseEntityIntroDisclosure(full, teaser)).toBe(true);
  });
});
