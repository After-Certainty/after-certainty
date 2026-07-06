import { describe, expect, it } from "vitest";

import { buildGraphIndex } from "@/lib/graph/graph";
import { resolveThinkersForBook } from "@/lib/graph/bookThinkers";
import type { Book, SemanticGraph, Source } from "@/types/semanticGraph";

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

const arendtWork: Source = {
  id: "source-arendt-between-past-and-future",
  slug: "arendt-hannah-between-past-and-future",
  name: "Hannah Arendt — Between Past and Future",
  type: "book",
  sourceKind: "book",
  creatorSlugs: ["hannah-arendt"],
  concepts: ["concept-authority"],
  patterns: [],
  relatedBooks: [],
};

const foucaultWork: Source = {
  id: "source-foucault-discipline",
  slug: "foucault-michel-discipline-and-punish",
  name: "Michel Foucault — Discipline and Punish",
  type: "book",
  sourceKind: "book",
  creatorSlugs: ["michel-foucault"],
  concepts: ["concept-power"],
  patterns: [],
  relatedBooks: [],
};

const legacyBook: Book = {
  id: "book-legacy",
  slug: "legacy-book",
  title: "Legacy Book",
  sources: ["source-legacy"],
};

const enrichedBook: Book = {
  id: "book-after-certainty",
  slug: "after-certainty",
  title: "After Certainty",
  sources: ["source-arendt-between-past-and-future", "source-foucault-discipline"],
};

const legacyGraph: SemanticGraph = {
  books: [legacyBook],
  glossary: [],
  patterns: [],
  sources: [legacySource],
  relationships: [],
};

const enrichedGraph: SemanticGraph = {
  manifestVersion: 1,
  books: [enrichedBook],
  glossary: [],
  patterns: [],
  sources: [arendtWork, foucaultWork],
  relationships: [],
};

describe("resolveThinkersForBook", () => {
  it("uses legacy layout when linked sources lack creatorSlugs and manifest has no thinkers", () => {
    const index = buildGraphIndex(legacyGraph);
    const result = resolveThinkersForBook(index, legacyBook, legacyGraph);

    expect(result.useLegacyThinkersSection).toBe(true);
    expect(result.thinkers).toEqual([]);
    expect(result.researchSources).toHaveLength(1);
    expect(result.researchSources[0]?.slug).toBe("legacy-source");
  });

  it("splits thinkers and research sources for enriched manifests", () => {
    const index = buildGraphIndex(enrichedGraph);
    const result = resolveThinkersForBook(index, enrichedBook, enrichedGraph);

    expect(result.useLegacyThinkersSection).toBe(false);
    expect(result.researchSources).toHaveLength(2);
    expect(result.thinkers.map((thinker) => thinker.slug)).toEqual(
      expect.arrayContaining(["hannah-arendt", "michel-foucault"]),
    );
  });

  it("prefers explicit manifest thinkers linked to book sources", () => {
    const graph: SemanticGraph = {
      ...enrichedGraph,
      manifestVersion: 2,
      thinkers: [
        {
          id: "thinker-hannah-arendt",
          slug: "hannah-arendt",
          name: "Hannah Arendt",
          type: "person",
          summary: "Canonical thinker.",
          works: ["source-arendt-between-past-and-future"],
          concepts: ["concept-authority"],
          patterns: [],
          relatedBooks: ["book-after-certainty"],
        },
      ],
    };

    const index = buildGraphIndex(graph);
    const result = resolveThinkersForBook(index, enrichedBook, graph);

    expect(result.useLegacyThinkersSection).toBe(false);
    expect(result.thinkers).toHaveLength(1);
    expect(result.thinkers[0]?.slug).toBe("hannah-arendt");
    expect(result.researchSources).toHaveLength(2);
  });
});
