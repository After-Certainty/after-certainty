import { describe, expect, it } from "vitest";

import { explorePaths, exploreHrefForCanonicalId, exploreHrefForNode } from "@/lib/graph/explorePaths";
import { buildGraphIndex } from "@/lib/graph/graph";
import type { SemanticGraph } from "@/types/semanticGraph";

const tinyGraph: SemanticGraph = {
  books: [
    {
      id: "b1",
      slug: "book-slug",
      title: "Book",
      concepts: [],
      patterns: [],
      sources: [],
    },
  ],
  glossary: [{ id: "c1", slug: "concept-slug", title: "Concept", shortDefinition: "def" }],
  patterns: [{ id: "p1", slug: "pattern-slug", title: "Pattern", summary: "sum" }],
  sources: [{ id: "s1", slug: "source-slug", name: "Source Name", type: "philosopher" }],
  relationships: [],
};

describe("explorePaths", () => {
  it("exposes stable base paths for explore routes", () => {
    expect(explorePaths.home).toBe("/explore");
    expect(explorePaths.concepts).toBe("/explore/concepts");
    expect(explorePaths.patterns).toBe("/explore/patterns");
    expect(explorePaths.books).toBe("/explore/books");
    expect(explorePaths.sources).toBe("/explore/sources");
  });
});

describe("exploreHrefForNode", () => {
  const index = buildGraphIndex(tinyGraph);

  it("builds hrefs for each node kind", () => {
    expect(exploreHrefForNode(index.getNodeByCanonicalId("c1")!)).toBe("/explore/concepts/concept-slug");
    expect(exploreHrefForNode(index.getNodeByCanonicalId("p1")!)).toBe("/explore/patterns/pattern-slug");
    expect(exploreHrefForNode(index.getNodeByCanonicalId("b1")!)).toBe("/explore/books/book-slug");
    expect(exploreHrefForNode(index.getNodeByCanonicalId("s1")!)).toBe("/explore/sources/source-slug");
  });
});

describe("exploreHrefForCanonicalId", () => {
  const index = buildGraphIndex(tinyGraph);

  it("returns explore href for a known canonical id", () => {
    expect(exploreHrefForCanonicalId(index, "c1")).toBe("/explore/concepts/concept-slug");
  });

  it("returns null for unknown ids", () => {
    expect(exploreHrefForCanonicalId(index, "ghost")).toBeNull();
  });
});
