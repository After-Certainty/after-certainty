import { describe, expect, it } from "vitest";

import {
  formatIdeaDefinitionSentence,
  getAllPatterns,
  getPatternBySlug,
  getPatternsByCategory,
  getPatternsGrouped,
  getRelatedPatterns,
  patternGroupOrder,
  patterns,
  resolveRelatedPatterns,
  type IdeaDefinitionBlock,
  type PatternGroupId,
} from "@/lib/books/when-others-look-to-you/content";

describe("getPatternBySlug", () => {
  it("returns the pattern for a known slug", () => {
    const p = getPatternBySlug("attention-finds-a-focus");
    expect(p).toBeDefined();
    expect(p?.slug).toBe("attention-finds-a-focus");
    expect(p?.title).toBe("Attention Finds a Focus");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getPatternBySlug("does-not-exist")).toBeUndefined();
  });
});

describe("getAllPatterns", () => {
  it("returns the same ordered list as patterns", () => {
    expect(getAllPatterns()).toBe(patterns);
    expect(getAllPatterns().length).toBe(patterns.length);
  });
});

describe("getPatternsByCategory", () => {
  it("returns only patterns in the given group", () => {
    const categories: PatternGroupId[] = ["forming", "adjusting", "eroding", "circulating"];
    for (const category of categories) {
      const list = getPatternsByCategory(category);
      expect(list.every((p) => p.detail.group === category)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
    }
  });

  it("matches filter count against full list", () => {
    const forming = getPatternsByCategory("forming");
    const expected = patterns.filter((p) => p.detail.group === "forming");
    expect(forming).toEqual(expected);
  });
});

describe("getRelatedPatterns", () => {
  it("preserves order and linkText from detail.relatedPatterns", () => {
    const p = getPatternBySlug("attention-finds-a-focus")!;
    const related = getRelatedPatterns(p);
    expect(related.length).toBe(p.detail.relatedPatterns.length);
    related.forEach((row, i) => {
      expect(row.linkText).toBe(p.detail.relatedPatterns[i]!.linkText);
      expect(row.pattern.slug).toBe(p.detail.relatedPatterns[i]!.slug);
    });
  });
});

describe("resolveRelatedPatterns", () => {
  it("throws for an unknown slug", () => {
    expect(() =>
      resolveRelatedPatterns([{ slug: "totally-unknown-slug", linkText: "nope" }]),
    ).toThrow(/Unknown related pattern slug: totally-unknown-slug/);
  });
});

describe("getPatternsGrouped", () => {
  it("orders groups by patternGroupOrder", () => {
    const grouped = getPatternsGrouped();
    expect(grouped.map((g) => g.group)).toEqual([...patternGroupOrder]);
  });

  it("places each pattern exactly once across groups", () => {
    const grouped = getPatternsGrouped();
    const flat = grouped.flatMap((g) => g.patterns);
    expect(flat.length).toBe(patterns.length);
    const slugs = flat.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("formatIdeaDefinitionSentence", () => {
  it("concatenates definition segments", () => {
    const block: IdeaDefinitionBlock = {
      label: "DEFINITION",
      beforeTerm: "A ",
      term: "leader",
      afterTerm: " is someone.",
    };
    expect(formatIdeaDefinitionSentence(block)).toBe("A leader is someone.");
  });
});
