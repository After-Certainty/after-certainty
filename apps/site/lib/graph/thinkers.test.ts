import { describe, expect, it } from "vitest";

import { deriveThinkersFromSources } from "@/lib/graph/thinkers";
import type { Source } from "@/types/semanticGraph";

const legacySource: Source = {
  id: "source-legacy",
  slug: "legacy-source",
  name: "Hannah Arendt — Between Past and Future",
  type: "book",
  summary: "Citation.",
  concepts: [],
  patterns: [],
  relatedBooks: [],
};

const arendtWorkA: Source = {
  id: "source-arendt-between-past-and-future",
  slug: "arendt-hannah-between-past-and-future",
  name: "Hannah Arendt — Between Past and Future",
  type: "book",
  sourceKind: "book",
  creatorNames: ["Hannah Arendt"],
  creatorSlugs: ["hannah-arendt"],
  title: "Between Past and Future",
  summary: "Summary A.",
  whyThisMatters: "Arendt on authority.",
  concepts: ["concept-authority"],
  patterns: [],
  relatedBooks: ["book-living-in-sediment"],
};

const arendtWorkB: Source = {
  id: "source-arendt-origins-of-totalitarianism",
  slug: "arendt-hannah-origins-of-totalitarianism",
  name: "Hannah Arendt — The Origins of Totalitarianism",
  type: "book",
  sourceKind: "book",
  creatorNames: ["Hannah Arendt"],
  creatorSlugs: ["hannah-arendt"],
  title: "The Origins of Totalitarianism",
  summary: "Summary B.",
  concepts: ["concept-totalitarianism"],
  patterns: ["pattern-mass-society"],
  relatedBooks: ["book-after-certainty"],
};

const worldBankReport: Source = {
  id: "source-world-bank-governance",
  slug: "world-bank-governance-indicators",
  name: "World Bank — Governance Indicators",
  type: "article",
  sourceKind: "report",
  creatorNames: ["World Bank"],
  creatorSlugs: ["world-bank"],
  institution: "World Bank",
  summary: "Report summary.",
  concepts: ["concept-governance"],
  patterns: [],
  relatedBooks: [],
};

describe("deriveThinkersFromSources", () => {
  it("returns an empty array for legacy sources without creatorSlugs", () => {
    expect(deriveThinkersFromSources([legacySource])).toEqual([]);
  });

  it("returns an empty array when no sources have creatorSlugs anywhere", () => {
    expect(
      deriveThinkersFromSources([
        legacySource,
        { ...legacySource, id: "source-legacy-2", slug: "legacy-2" },
      ]),
    ).toEqual([]);
  });

  it("aggregates multiple works by the same creator into one thinker", () => {
    const thinkers = deriveThinkersFromSources([arendtWorkA, arendtWorkB]);

    expect(thinkers).toHaveLength(1);
    const arendt = thinkers[0];
    expect(arendt?.slug).toBe("hannah-arendt");
    expect(arendt?.name).toBe("Hannah Arendt");
    expect(arendt?.type).toBe("person");
    expect(arendt?.works).toEqual([
      "source-arendt-between-past-and-future",
      "source-arendt-origins-of-totalitarianism",
    ]);
    expect(arendt?.concepts).toEqual(
      expect.arrayContaining(["concept-authority", "concept-totalitarianism"]),
    );
    expect(arendt?.patterns).toEqual(["pattern-mass-society"]);
    expect(arendt?.relatedBooks).toEqual(
      expect.arrayContaining(["book-living-in-sediment", "book-after-certainty"]),
    );
  });

  it("does not produce duplicate thinker slugs", () => {
    const thinkers = deriveThinkersFromSources([arendtWorkA, arendtWorkB, worldBankReport]);
    const slugs = thinkers.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("classifies institutional source kinds as organization thinkers", () => {
    const thinkers = deriveThinkersFromSources([worldBankReport]);
    expect(thinkers).toHaveLength(1);
    expect(thinkers[0]?.type).toBe("organization");
    expect(thinkers[0]?.slug).toBe("world-bank");
  });
});
