import { describe, expect, it } from "vitest";

import { getLibraryPatternBySlug, getLibraryPatterns } from "@/lib/patterns/registry";

describe("getLibraryPatterns", () => {
  it("uses unique slugs across merged sources", () => {
    const patterns = getLibraryPatterns();
    const slugs = patterns.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("includes at least one WoLTY-derived pattern", () => {
    const slugs = getLibraryPatterns().map((p) => p.slug);
    expect(slugs).toContain("attention-finds-a-focus");
  });
});

describe("getLibraryPatternBySlug", () => {
  it("returns a pattern for a known slug", () => {
    const p = getLibraryPatternBySlug("attention-finds-a-focus");
    expect(p?.title).toBeTruthy();
    expect(p?.slug).toBe("attention-finds-a-focus");
  });

  it("returns undefined for unknown slug", () => {
    expect(getLibraryPatternBySlug("not-a-real-pattern-slug-xyz")).toBeUndefined();
  });
});
