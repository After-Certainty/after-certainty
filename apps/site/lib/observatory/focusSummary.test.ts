import { describe, expect, it } from "vitest";

import { buildGraphIndex } from "@/lib/graph/graph";
import {
  entityFocusSummary,
  nodeLabel,
  relationshipFocusSummary,
} from "@/lib/observatory/focusSummary";
import type { SemanticGraph } from "@/types/semanticGraph";

const graph: SemanticGraph = {
  books: [],
  glossary: [
    { id: "c1", slug: "a", title: "After certainty", shortDefinition: "a" },
    { id: "c2", slug: "b", title: "Grounded hope", shortDefinition: "b" },
  ],
  patterns: [],
  sources: [{ id: "s1", slug: "t", name: "Thinker One", summary: "s" }],
  relationships: [{ source: "c1", target: "c2", relationship: "outruns" }],
};

describe("focusSummary", () => {
  const index = buildGraphIndex(graph);

  it("nodeLabel uses title or source name", () => {
    expect(nodeLabel(index, "c1")).toBe("After certainty");
    expect(nodeLabel(index, "s1")).toBe("Thinker One");
    expect(nodeLabel(index, "missing")).toBe("Unknown");
  });

  it("entityFocusSummary includes capitalized kind", () => {
    const node = index.getNodeByCanonicalId("c1")!;
    expect(entityFocusSummary(node)).toBe("Concept · After certainty");
  });

  it("relationshipFocusSummary joins endpoints and predicate", () => {
    const summary = relationshipFocusSummary(index, {
      edgeKey: "c1|c2|outruns",
      sourceId: "c1",
      targetId: "c2",
      predicate: "outruns",
      relationship: { source: "c1", target: "c2", relationship: "outruns" },
    });
    expect(summary).toContain("After certainty");
    expect(summary).toContain("Grounded hope");
    expect(summary).toMatch(/outruns/i);
  });
});
