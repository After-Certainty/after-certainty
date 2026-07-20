import { describe, expect, it } from "vitest";

import { buildGraphIndex } from "@/lib/graph/graph";
import { computeNeighborhoodSignals } from "@/lib/observatory/neighborhoodSignals";
import type { SemanticGraph } from "@/types/semanticGraph";

const graph: SemanticGraph = {
  books: [],
  glossary: [
    { id: "c1", slug: "a", title: "A", shortDefinition: "a" },
    { id: "c2", slug: "b", title: "B", shortDefinition: "b" },
  ],
  patterns: [],
  situations: [],
  sources: [],
  relationships: [
    { source: "c1", target: "c2", relationship: "threatens", weight: 2 },
    { source: "c1", target: "c2", relationship: "preserves", weight: 1 },
  ],
};

describe("computeNeighborhoodSignals", () => {
  it("returns summary and dominant predicates", () => {
    const index = buildGraphIndex(graph);
    const visible = new Set(["c1", "c2"]);
    const signals = computeNeighborhoodSignals(index, visible, graph.relationships);
    expect(signals.dominantPredicates.length).toBeGreaterThan(0);
    expect(signals.summaryLine).toMatch(/neighborhood/);
    expect(["quiet", "strained", "contested"]).toContain(signals.tensionLevel);
  });
});
