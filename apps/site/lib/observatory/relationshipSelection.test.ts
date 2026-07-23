import { describe, expect, it } from "vitest";

import { buildGraphIndex } from "@/lib/graph/graph";
import { vizEdgeDedupKey } from "@/lib/graph/graphVizModel";
import {
  relationshipForEdgeKey,
  relationshipSelectionFromRelationship,
} from "@/lib/observatory/relationshipSelection";
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
  relationships: [{ source: "c1", target: "c2", relationship: "Preserves", description: "holds" }],
};

describe("relationshipSelection", () => {
  it("builds selection from a manifest relationship row", () => {
    const index = buildGraphIndex(graph);
    const sel = relationshipSelectionFromRelationship(index, graph.relationships[0]!);
    expect(sel).not.toBeNull();
    expect(sel!.edgeKey).toBe(vizEdgeDedupKey("c1", "c2", "Preserves"));
    expect(sel!.sourceId).toBe("c1");
    expect(sel!.targetId).toBe("c2");
    expect(sel!.relationship.description).toBe("holds");
  });

  it("resolves relationshipForEdgeKey from graph when present", () => {
    const index = buildGraphIndex(graph);
    const edgeKey = vizEdgeDedupKey("c1", "c2", "Preserves");
    const sel = relationshipForEdgeKey(index, edgeKey, "c1", "c2", "Preserves");
    expect(sel.predicate).toBe("Preserves");
    expect(sel.relationship.description).toBe("holds");
  });

  it("falls back to synthetic relationship when edge is not in manifest", () => {
    const index = buildGraphIndex(graph);
    const edgeKey = vizEdgeDedupKey("c1", "c2", "Synthetic");
    const sel = relationshipForEdgeKey(index, edgeKey, "c1", "c2", "Synthetic", "note", 2);
    expect(sel.predicate).toBe("Synthetic");
    expect(sel.relationship.description).toBe("note");
    expect(sel.relationship.weight).toBe(2);
  });
});
