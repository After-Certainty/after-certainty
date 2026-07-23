import { describe, expect, it } from "vitest";

import {
  exploreThinkerAdjacentInIndexOrder,
  thinkersSortedForExploreIndex,
} from "@/lib/explore/explore-thinkers-order";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getThinkerBySlug } from "@/lib/graph/graphQueries";
import { relatedContentForThinker } from "@/lib/graph/relatedContent";
import type { SemanticGraph } from "@/types/semanticGraph";

const enrichedGraph: SemanticGraph = {
  manifestVersion: 2,
  books: [
    {
      id: "book-after-certainty",
      slug: "after-certainty",
      title: "After Certainty",
    },
  ],
  glossary: [
    {
      id: "concept-authority",
      slug: "authority",
      title: "Authority",
      shortDefinition: "Legitimate power.",
    },
  ],
  patterns: [
    {
      id: "pattern-mass-society",
      slug: "mass-society",
      title: "Mass Society",
      summary: "Pattern summary.",
      relatedConcepts: [],
      relatedBooks: [],
    },
  ],
  sources: [
    {
      id: "source-arendt-between-past-and-future",
      slug: "arendt-hannah-between-past-and-future",
      name: "Hannah Arendt — Between Past and Future",
      type: "book",
      creatorSlugs: ["hannah-arendt"],
      concepts: ["concept-authority"],
      patterns: [],
      relatedBooks: ["book-after-certainty"],
    },
    {
      id: "source-arendt-origins-of-totalitarianism",
      slug: "arendt-hannah-origins-of-totalitarianism",
      name: "Hannah Arendt — The Origins of Totalitarianism",
      type: "book",
      creatorSlugs: ["hannah-arendt"],
      concepts: [],
      patterns: ["pattern-mass-society"],
      relatedBooks: [],
    },
  ],
  relationships: [],
  thinkers: [
    {
      id: "thinker-hannah-arendt",
      slug: "hannah-arendt",
      name: "Hannah Arendt",
      type: "person",
      summary: "Political theorist.",
      works: ["source-arendt-between-past-and-future", "source-arendt-origins-of-totalitarianism"],
      concepts: ["concept-authority"],
      patterns: ["pattern-mass-society"],
      relatedBooks: ["book-after-certainty"],
      whyThisMatters: "Arendt on authority and judgment.",
    },
  ],
};

describe("thinker page data helpers", () => {
  it("resolves thinkers by slug from manifest thinkers", () => {
    const thinker = getThinkerBySlug(enrichedGraph, "hannah-arendt");
    expect(thinker?.name).toBe("Hannah Arendt");
    expect(thinker?.works).toHaveLength(2);
  });

  it("returns undefined for unknown thinker slugs", () => {
    expect(getThinkerBySlug(enrichedGraph, "unknown-thinker")).toBeUndefined();
  });

  it("resolves related works, concepts, patterns, and books for a thinker", () => {
    const thinker = getThinkerBySlug(enrichedGraph, "hannah-arendt");
    expect(thinker).toBeDefined();
    if (!thinker) return;

    const index = buildGraphIndex(enrichedGraph);
    const related = relatedContentForThinker(index, thinker);

    expect(related.works.map((work) => work.slug)).toEqual(
      expect.arrayContaining([
        "arendt-hannah-between-past-and-future",
        "arendt-hannah-origins-of-totalitarianism",
      ]),
    );
    expect(related.concepts.map((concept) => concept.slug)).toEqual(["authority"]);
    expect(related.patterns.map((pattern) => pattern.slug)).toEqual(["mass-society"]);
    expect(related.books.map((book) => book.slug)).toEqual(["after-certainty"]);
  });

  it("sorts thinkers for the explore index by name", () => {
    const graph: SemanticGraph = {
      ...enrichedGraph,
      thinkers: [
        { ...enrichedGraph.thinkers![0]!, slug: "zeta-thinker", name: "Zeta Thinker", works: [] },
        enrichedGraph.thinkers![0]!,
      ],
    };

    const sorted = thinkersSortedForExploreIndex(graph);
    expect(sorted.map((thinker) => thinker.slug)).toEqual(["hannah-arendt", "zeta-thinker"]);
  });

  it("returns adjacent thinkers in index order", () => {
    const graph: SemanticGraph = {
      ...enrichedGraph,
      thinkers: [
        enrichedGraph.thinkers![0]!,
        {
          id: "thinker-zeta",
          slug: "zeta-thinker",
          name: "Zeta Thinker",
          type: "person",
          works: [],
          concepts: [],
          patterns: [],
          relatedBooks: [],
        },
      ],
    };

    const sorted = thinkersSortedForExploreIndex(graph);
    const adjacent = exploreThinkerAdjacentInIndexOrder(sorted, "hannah-arendt");
    expect(adjacent.next?.slug).toBe("zeta-thinker");
    expect(adjacent.prev).toBeUndefined();
  });
});
