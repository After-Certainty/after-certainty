import { describe, expect, it } from "vitest";

import { buildGraphIndex } from "@/lib/graph/graph";
import { DEFAULT_PROGRESSIVE_NEIGHBORS_PER_KIND } from "@/lib/observatory/focusEntry";
import {
  buildGraphVizModel,
  buildProgressiveGraphVizModel,
  defaultFocusCanonicalId,
  distinctConceptLayers,
  distinctRelationshipPredicates,
  passesNodeFilters,
  vizEdgeDedupKey,
} from "@/lib/graph/graphVizModel";
import type { SemanticGraph } from "@/types/semanticGraph";

const rich: SemanticGraph = {
  books: [{ id: "b1", slug: "book-one", title: "Book One", concepts: ["c1"], patterns: [], sources: [] }],
  glossary: [
    {
      id: "c1",
      slug: "alpha",
      title: "Alpha",
      shortDefinition: "a",
      layer: "Primitives",
      relatedConcepts: ["c2"],
    },
    {
      id: "c2",
      slug: "beta",
      title: "Beta",
      shortDefinition: "b",
      layer: "Dynamics",
    },
  ],
  patterns: [{ id: "p1", slug: "pat", title: "Pat", summary: "s", relatedConcepts: ["c1"] }],
  sources: [],
  relationships: [
    { source: "c1", target: "p1", relationship: "Illustrates" },
    { source: "c1", target: "c2", relationship: "Preserves" },
  ],
};

describe("graphVizModel", () => {
  it("expands ego neighborhood within caps", () => {
    const index = buildGraphIndex(rich);
    const { nodeIds, edges } = buildGraphVizModel(index, {
      focusCanonicalId: "c1",
      maxDepth: 2,
      maxNodes: 20,
      kinds: [],
      layers: [],
      predicates: [],
      includeRelatedEntityLinks: true,
      pinnedCanonicalIds: [],
    });
    expect(nodeIds).toContain("c1");
    expect(nodeIds.length).toBeGreaterThan(1);
    expect(edges.length).toBeGreaterThan(0);
  });

  it("filters by layer", () => {
    const index = buildGraphIndex(rich);
    const { nodeIds } = buildGraphVizModel(index, {
      focusCanonicalId: "c1",
      maxDepth: 2,
      maxNodes: 20,
      kinds: ["concept"],
      layers: ["Primitives"],
      predicates: [],
      includeRelatedEntityLinks: false,
      pinnedCanonicalIds: [],
    });
    expect(nodeIds.every((id) => passesNodeFilters(index, id, { kinds: ["concept"], layers: ["Primitives"] }))).toBe(
      true,
    );
  });

  it("filters predicates in BFS", () => {
    const index = buildGraphIndex(rich);
    const { nodeIds } = buildGraphVizModel(index, {
      focusCanonicalId: "c1",
      maxDepth: 2,
      maxNodes: 20,
      kinds: [],
      layers: [],
      predicates: ["illustrates"],
      includeRelatedEntityLinks: false,
      pinnedCanonicalIds: [],
    });
    expect(nodeIds).toContain("p1");
  });

  it("shelf padding adds books after BFS cap", () => {
    const manyBooks: SemanticGraph = {
      ...rich,
      books: [
        ...rich.books,
        { id: "b2", slug: "two", title: "B Two", concepts: [], patterns: [], sources: [] },
        { id: "b3", slug: "three", title: "B Three", concepts: [], patterns: [], sources: [] },
      ],
    };
    const index = buildGraphIndex(manyBooks);
    const withoutShelf = buildGraphVizModel(index, {
      focusCanonicalId: "c1",
      maxDepth: 1,
      maxNodes: 8,
      kinds: [],
      layers: [],
      predicates: [],
      includeRelatedEntityLinks: false,
      pinnedCanonicalIds: [],
      shelfPaddingBooks: 0,
    });
    const withShelf = buildGraphVizModel(index, {
      focusCanonicalId: "c1",
      maxDepth: 1,
      maxNodes: 8,
      kinds: [],
      layers: [],
      predicates: [],
      includeRelatedEntityLinks: false,
      pinnedCanonicalIds: [],
      shelfPaddingBooks: 4,
    });
    const bookCount = (ids: string[]) => ids.filter((id) => index.getNodeByCanonicalId(id)?.kind === "book").length;
    expect(bookCount(withShelf.nodeIds)).toBeGreaterThan(bookCount(withoutShelf.nodeIds));
  });

  it("fresh deep-link seed yields a tight single-root progressive neighborhood", () => {
    const glossary = Array.from({ length: 10 }, (_, i) => ({
      id: `c${i}`,
      slug: `concept-${i}`,
      title: `Concept ${i}`,
      shortDefinition: "def",
    }));
    const hubGraph: SemanticGraph = {
      books: [
        {
          id: "b1",
          slug: "hub-book",
          title: "Hub",
          concepts: glossary.map((c) => c.id),
          patterns: [],
          sources: [],
        },
      ],
      glossary,
      patterns: [],
      sources: [],
      relationships: [],
    };
    const index = buildGraphIndex(hubGraph);
    const focusId = "b1";
    const opt = {
      focusCanonicalId: focusId,
      maxDepth: 2,
      maxNodes: 36,
      kinds: [],
      layers: [],
      predicates: [],
      includeRelatedEntityLinks: true,
      pinnedCanonicalIds: [],
      progressiveNeighborsPerKind: DEFAULT_PROGRESSIVE_NEIGHBORS_PER_KIND,
    };
    const fresh = buildProgressiveGraphVizModel(index, opt, [focusId]);
    const expanded = buildProgressiveGraphVizModel(index, opt, [focusId, "c0", "c1", "c2", "c3"]);

    expect(fresh.nodeIds).toContain(focusId);
    expect(fresh.nodeIds.length).toBeGreaterThan(1);
    expect(fresh.nodeIds.length).toBeLessThanOrEqual(4);
    expect(expanded.nodeIds.length).toBeGreaterThan(fresh.nodeIds.length);
    expect(fresh.edges.length).toBeGreaterThan(0);
  });

  it("progressive expansion unions 1-hop neighborhoods per root", () => {
    const index = buildGraphIndex(rich);
    const opt = {
      focusCanonicalId: "c1",
      maxDepth: 1,
      maxNodes: 50,
      kinds: [],
      layers: [],
      predicates: [],
      includeRelatedEntityLinks: true,
      pinnedCanonicalIds: [],
    };
    const oneRoot = buildProgressiveGraphVizModel(index, opt, ["c1"]);
    expect(oneRoot.nodeIds).toContain("c1");
    expect(oneRoot.nodeIds).toContain("c2");
    expect(oneRoot.nodeIds).toContain("p1");
    const twoRoots = buildProgressiveGraphVizModel(index, opt, ["c1", "c2"]);
    expect(twoRoots.nodeIds.length).toBeGreaterThanOrEqual(oneRoot.nodeIds.length);
  });

  it("progressive mode caps neighbors per entity kind per expanded root", () => {
    const glossary = Array.from({ length: 10 }, (_, i) => ({
      id: `c${i}`,
      slug: `concept-${i}`,
      title: `Concept ${i}`,
      shortDefinition: "def",
    }));
    const graph: SemanticGraph = {
      books: [
        {
          id: "b1",
          slug: "hub-book",
          title: "Hub",
          concepts: glossary.map((c) => c.id),
          patterns: [],
          sources: [],
        },
      ],
      glossary,
      patterns: [],
      sources: [],
      relationships: [],
    };
    const index = buildGraphIndex(graph);
    const opt = {
      focusCanonicalId: "b1",
      maxDepth: 1,
      maxNodes: 99,
      kinds: [],
      layers: [],
      predicates: [],
      includeRelatedEntityLinks: true,
      pinnedCanonicalIds: [],
    };
    const capped = buildProgressiveGraphVizModel(index, opt, ["b1"]);
    const conceptCount = capped.nodeIds.filter((id) => index.getNodeByCanonicalId(id)?.kind === "concept").length;
    expect(conceptCount).toBeLessThanOrEqual(3);
    expect(conceptCount).toBeGreaterThan(0);
    expect(capped.nodeIds).toContain("b1");

    const uncapped = buildProgressiveGraphVizModel(index, { ...opt, progressiveNeighborsPerKind: 0 }, ["b1"]);
    expect(uncapped.nodeIds.filter((id) => index.getNodeByCanonicalId(id)?.kind === "concept").length).toBe(10);

    const onePerKind = buildProgressiveGraphVizModel(index, { ...opt, progressiveNeighborsPerKind: 1 }, ["b1"]);
    expect(onePerKind.nodeIds.filter((id) => index.getNodeByCanonicalId(id)?.kind === "concept").length).toBeLessThanOrEqual(
      1,
    );

    const twoPerKind = buildProgressiveGraphVizModel(index, { ...opt, progressiveNeighborsPerKind: 2 }, ["b1"]);
    expect(twoPerKind.nodeIds.filter((id) => index.getNodeByCanonicalId(id)?.kind === "concept").length).toBeLessThanOrEqual(
      2,
    );

    const fivePerKind = buildProgressiveGraphVizModel(index, { ...opt, progressiveNeighborsPerKind: 5 }, ["b1"]);
    expect(fivePerKind.nodeIds.filter((id) => index.getNodeByCanonicalId(id)?.kind === "concept").length).toBeLessThanOrEqual(
      5,
    );
    expect(fivePerKind.nodeIds.filter((id) => index.getNodeByCanonicalId(id)?.kind === "concept").length).toBeGreaterThan(
      2,
    );
  });

  it("distinct helpers", () => {
    const index = buildGraphIndex(rich);
    expect(distinctConceptLayers(index)).toEqual(["Dynamics", "Primitives"]);
    expect(distinctRelationshipPredicates(rich)).toContain("Illustrates");
    expect(defaultFocusCanonicalId(index)).toBe("c1");
  });

  it("vizEdgeDedupKey matches viz edge identity (order and predicate casing)", () => {
    expect(vizEdgeDedupKey("c1", "c2", "Preserves")).toBe(vizEdgeDedupKey("c2", "c1", "preserves"));
  });
});
