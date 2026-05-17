import { describe, expect, it } from "vitest";

import { buildGraphIndex } from "@/lib/graph/graph";
import { vizEdgeDedupKey } from "@/lib/graph/graphVizModel";
import { computeSemanticWeights, shouldShowEdgeLabel } from "@/lib/observatory/focusEngine";
import type { SemanticGraph } from "@/types/semanticGraph";

const miniGraph: SemanticGraph = {
  books: [],
  glossary: [
    { id: "c1", slug: "a", title: "A", shortDefinition: "a" },
    { id: "c2", slug: "b", title: "B", shortDefinition: "b" },
    { id: "c3", slug: "c", title: "C", shortDefinition: "c" },
  ],
  patterns: [],
  sources: [],
  relationships: [
    { source: "c1", target: "c2", relationship: "outruns" },
    { source: "c2", target: "c3", relationship: "preserves" },
  ],
};

describe("computeSemanticWeights", () => {
  it("marks focus and neighbors", () => {
    const index = buildGraphIndex(miniGraph);
    const visible = new Set(["c1", "c2", "c3"]);
    const edges = [
      {
        edgeKey: vizEdgeDedupKey("c1", "c2", "outruns"),
        sourceId: "c1",
        targetId: "c2",
      },
      {
        edgeKey: vizEdgeDedupKey("c2", "c3", "preserves"),
        sourceId: "c2",
        targetId: "c3",
      },
    ];
    const w = computeSemanticWeights({
      index,
      visibleNodeIds: visible,
      visibleEdges: edges,
      focusCanonicalId: "c1",
      relationshipSelection: null,
      pathNodeIds: new Set(),
      pathPairKeys: new Set(),
    });
    expect(w.nodes.get("c1")).toBe("focus");
    expect(w.nodes.get("c2")).toBe("neighbor");
    expect(w.nodes.get("c3")).toBe("dim");
    expect(w.edges.get(edges[0]!.edgeKey)).toBe("incident");
  });

  it("marks selected relationship", () => {
    const index = buildGraphIndex(miniGraph);
    const edgeKey = vizEdgeDedupKey("c1", "c2", "outruns");
    const w = computeSemanticWeights({
      index,
      visibleNodeIds: new Set(["c1", "c2", "c3"]),
      visibleEdges: [
        { edgeKey, sourceId: "c1", targetId: "c2" },
        { edgeKey: vizEdgeDedupKey("c2", "c3", "preserves"), sourceId: "c2", targetId: "c3" },
      ],
      focusCanonicalId: "c1",
      relationshipSelection: { edgeKey, sourceId: "c1", targetId: "c2" },
      pathNodeIds: new Set(),
      pathPairKeys: new Set(),
    });
    expect(w.edges.get(edgeKey)).toBe("selected");
    expect(w.nodes.get("c1")).toBe("focus");
    expect(w.nodes.get("c2")).toBe("neighbor");
  });
});

describe("shouldShowEdgeLabel", () => {
  it("shows labels for selected and hover", () => {
    expect(shouldShowEdgeLabel("dim", "k", "k", false)).toBe(true);
    expect(shouldShowEdgeLabel("dim", "k", null, false)).toBe(false);
    expect(shouldShowEdgeLabel("incident", "k", null, false)).toBe(true);
  });
});
