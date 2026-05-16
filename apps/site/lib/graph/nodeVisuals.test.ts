import { describe, expect, it } from "vitest";

import { buildGraphIndex } from "@/lib/graph/graph";
import { visualProfileForGraphNode } from "@/lib/graph/nodeVisuals";
import type { SemanticGraph } from "@/types/semanticGraph";

const graph: SemanticGraph = {
  books: [{ id: "b1", slug: "bk", title: "B", concepts: [], patterns: [], sources: [] }],
  glossary: [
    {
      id: "c0",
      slug: "neutral",
      title: "N",
      shortDefinition: "x",
    },
    {
      id: "c1",
      slug: "pressure",
      title: "P",
      shortDefinition: "x",
      semanticTone: "pressure",
    },
    {
      id: "c2",
      slug: "capability",
      title: "C",
      shortDefinition: "x",
      semanticTone: "capability",
    },
  ],
  patterns: [{ id: "p1", slug: "pat", title: "Pat", summary: "s" }],
  sources: [{ id: "s1", slug: "src", name: "Src", type: "t" }],
  relationships: [],
};

describe("visualProfileForGraphNode", () => {
  const index = buildGraphIndex(graph);

  it("maps concept semantic tones and default concept styling", () => {
    expect(visualProfileForGraphNode(index.getNodeByCanonicalId("c0")!).accent).toBe("gold");
    expect(visualProfileForGraphNode(index.getNodeByCanonicalId("c1")!).accent).toBe("ember");
    expect(visualProfileForGraphNode(index.getNodeByCanonicalId("c2")!).accent).toBe("teal");
  });

  it("maps pattern, book, and source nodes", () => {
    expect(visualProfileForGraphNode(index.getNodeByCanonicalId("p1")!)).toMatchObject({
      kind: "pattern",
      shape: "diamond",
      accent: "violet",
    });
    expect(visualProfileForGraphNode(index.getNodeByCanonicalId("b1")!)).toMatchObject({
      kind: "book",
      shape: "rect",
      accent: "gold",
    });
    expect(visualProfileForGraphNode(index.getNodeByCanonicalId("s1")!)).toMatchObject({
      kind: "source",
      shape: "pill",
      accent: "slate",
    });
  });
});
