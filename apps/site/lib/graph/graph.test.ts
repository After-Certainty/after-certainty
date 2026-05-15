import { describe, expect, it } from "vitest";

import { buildGraphIndex } from "@/lib/graph/graph";
import { getConnectedGraphNeighborhood, relationshipEndpointsResolved } from "@/lib/graph/graphTraversal";
import type { SemanticGraph } from "@/types/semanticGraph";

const sampleGraph: SemanticGraph = {
  books: [],
  glossary: [
    { id: "c1", slug: "alpha", title: "Alpha", shortDefinition: "a" },
    {
      id: "c2",
      slug: "beta",
      title: "Beta",
      shortDefinition: "b",
      relatedConcepts: ["c1"],
    },
  ],
  patterns: [{ id: "p1", slug: "pat", title: "Pat", summary: "s" }],
  sources: [],
  relationships: [
    { source: "c1", target: "p1", relationship: "illustrates" },
    { source: "ghost", target: "c1", relationship: "missing-endpoint" },
  ],
};

describe("buildGraphIndex", () => {
  it("resolves slug to canonical id", () => {
    const index = buildGraphIndex(sampleGraph);
    expect(index.resolveCanonicalId("alpha")).toBe("c1");
    expect(index.resolveCanonicalId("c2")).toBe("c2");
  });

  it("returns null for unknown refs", () => {
    const index = buildGraphIndex(sampleGraph);
    expect(index.resolveCanonicalId("nope")).toBeNull();
  });
});

describe("relationshipEndpointsResolved", () => {
  it("filters unknown endpoints", () => {
    const index = buildGraphIndex(sampleGraph);
    const valid = relationshipEndpointsResolved(index, sampleGraph.relationships[0]!);
    expect(valid).toEqual({ sourceId: "c1", targetId: "p1" });
    const invalid = relationshipEndpointsResolved(index, sampleGraph.relationships[1]!);
    expect(invalid).toBeNull();
  });
});

describe("getConnectedGraphNeighborhood", () => {
  it("respects maxNodes", () => {
    const glossary = Array.from({ length: 30 }, (_, i) => ({
      id: `c${i}`,
      slug: `c-${i}`,
      title: `C${i}`,
      shortDefinition: "x",
      relatedConcepts: i > 0 ? [`c${i - 1}`] : ([] as string[]),
    }));
    const big: SemanticGraph = {
      books: [],
      glossary,
      patterns: [],
      sources: [],
      relationships: [],
    };
    const index = buildGraphIndex(big);
    const focal = { kind: "concept" as const, id: "c15", slug: "c-15" };
    const nodes = getConnectedGraphNeighborhood(index, focal, { maxDepth: 1, maxNodes: 5 });
    expect(nodes.length).toBeLessThanOrEqual(5);
  });
});
