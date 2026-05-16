import { describe, expect, it } from "vitest";

import { buildGraphIndex } from "@/lib/graph/graph";
import { computeGraphInsights } from "@/lib/graph/graphInsights";
import type { SemanticGraph } from "@/types/semanticGraph";

const graph: SemanticGraph = {
  books: [],
  glossary: [
    { id: "c1", slug: "a", title: "A", shortDefinition: "x" },
    { id: "c2", slug: "b", title: "B", shortDefinition: "y" },
    { id: "c3", slug: "c", title: "C", shortDefinition: "z" },
  ],
  patterns: [],
  sources: [],
  relationships: [
    { source: "c1", target: "c2", relationship: "preserves", weight: 2 },
    { source: "c2", target: "c3", relationship: "threatens" },
  ],
};

describe("computeGraphInsights", () => {
  it("ranks strongest edges and finds tension", () => {
    const index = buildGraphIndex(graph);
    const visible = new Set(["c1", "c2", "c3"]);
    const snap = computeGraphInsights(index, visible, graph.relationships);
    expect(snap.strongestRelationships[0]?.weight).toBe(2);
    expect(snap.tensionEdges.length).toBeGreaterThan(0);
    expect(snap.edgeDensity).toBeGreaterThan(0);
  });

  it("flags isolated nodes", () => {
    const lonelyGraph: SemanticGraph = {
      ...graph,
      glossary: [
        ...graph.glossary,
        { id: "lonely", slug: "lonely", title: "L", shortDefinition: "o" },
      ],
    };
    const index2 = buildGraphIndex(lonelyGraph);
    const visible = new Set(["c1", "c2", "c3", "lonely"]);
    const snap = computeGraphInsights(index2, visible, lonelyGraph.relationships);
    expect(snap.isolatedNodeIds).toContain("lonely");
  });
});
