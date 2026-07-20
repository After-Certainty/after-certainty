import { describe, expect, it } from "vitest";

import {
  sourceCreatorThinkerLinks,
  sourceDisplayBody,
  sourceDisplayLabel,
  sourceDisplayTitle,
} from "@/lib/graph/sourceDisplay";
import type { SemanticGraph, Source } from "@/types/semanticGraph";

const legacySource: Source = {
  id: "source-legacy",
  slug: "legacy-source",
  name: "Hannah Arendt — Between Past and Future",
  type: "book",
  summary: "Legacy citation line.",
  concepts: [],
  patterns: [],
  relatedBooks: [],
};

const enrichedSource: Source = {
  id: "source-arendt-between-past-and-future",
  slug: "arendt-hannah-between-past-and-future",
  name: "Hannah Arendt — Between Past and Future",
  type: "book",
  sourceKind: "book",
  creatorSlugs: ["hannah-arendt"],
  title: "Between Past and Future",
  citation: "Arendt, Hannah. *Between Past and Future*. New York: Penguin Books, 2006.",
  summary: "Arendt, Hannah. *Between Past and Future*. New York: Penguin Books, 2006.",
  whyThisMatters: "Arendt on authority and judgment.",
  concepts: [],
  patterns: [],
  relatedBooks: [],
};

const enrichedGraph: SemanticGraph = {
  manifestVersion: 1,
  books: [],
  glossary: [],
  patterns: [],
  situations: [],
  sources: [enrichedSource],
  relationships: [],
};

describe("source display helpers", () => {
  it("keeps legacy field resolution unchanged", () => {
    expect(sourceDisplayTitle(legacySource)).toBe("Hannah Arendt — Between Past and Future");
    expect(sourceDisplayLabel(legacySource)).toBe("book");
    expect(sourceDisplayBody(legacySource)).toBe("Legacy citation line.");
  });

  it("prefers enriched title, label, and citation fields when present", () => {
    expect(sourceDisplayTitle(enrichedSource)).toBe("Between Past and Future");
    expect(sourceDisplayLabel(enrichedSource)).toBe("book");
    expect(sourceDisplayBody(enrichedSource)).toContain("Between Past and Future");
  });

  it("formats snake_case source kinds for display", () => {
    expect(
      sourceDisplayLabel({
        ...enrichedSource,
        sourceKind: "institutional_document",
      }),
    ).toBe("institutional document");
  });

  it("returns thinker links only for resolvable creator slugs", () => {
    const graph: SemanticGraph = {
      ...enrichedGraph,
      thinkers: [
        {
          id: "thinker-hannah-arendt",
          slug: "hannah-arendt",
          name: "Hannah Arendt",
          type: "person",
          works: [enrichedSource.id],
          concepts: [],
          patterns: [],
          relatedBooks: [],
        },
      ],
    };

    expect(sourceCreatorThinkerLinks(graph, enrichedSource).map((thinker) => thinker.slug)).toEqual(
      ["hannah-arendt"],
    );
    expect(
      sourceCreatorThinkerLinks(graph, {
        ...enrichedSource,
        creatorSlugs: ["missing-thinker"],
      }),
    ).toEqual([]);
  });

  it("links to derived thinkers when manifest thinkers are absent", () => {
    const graph: SemanticGraph = {
      ...enrichedGraph,
      thinkers: undefined,
    };

    expect(sourceCreatorThinkerLinks(graph, enrichedSource).map((thinker) => thinker.slug)).toEqual(
      ["hannah-arendt"],
    );
  });
});
