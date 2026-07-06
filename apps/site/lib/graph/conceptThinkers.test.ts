import { describe, expect, it } from "vitest";

import { buildGraphIndex } from "@/lib/graph/graph";
import { resolveThinkersForConcept } from "@/lib/graph/conceptThinkers";
import { buildGraphVizModel } from "@/lib/graph/graphVizModel";
import { getConnectedGraphNeighborhood } from "@/lib/graph/graphTraversal";
import { exploreHrefForNode, exploreObservatoryFocusHref } from "@/lib/graph/explorePaths";
import type { SemanticGraph } from "@/types/semanticGraph";

const graph: SemanticGraph = {
  books: [],
  glossary: [
    {
      id: "concept-adaptation",
      slug: "adaptation",
      title: "Adaptation",
      shortDefinition: "Adaptive change",
    },
  ],
  patterns: [],
  sources: [
    {
      id: "source-edmondson",
      slug: "edmondson-source",
      name: "Edmondson — Psychological Safety",
      type: "philosopher",
      concepts: ["concept-adaptation"],
      creatorSlugs: ["amy-c-edmondson"],
    },
  ],
  thinkers: [
    {
      id: "thinker-amy-c-edmondson",
      slug: "amy-c-edmondson",
      name: "Amy C. Edmondson",
      type: "person",
      works: ["source-edmondson"],
      concepts: ["concept-adaptation"],
    },
  ],
  relationships: [],
};

describe("resolveThinkersForConcept", () => {
  it("resolves thinkers linked via concepts and source metadata", () => {
    const index = buildGraphIndex(graph);
    const concept = index.conceptBySlug.get("adaptation")!;
    const thinkers = resolveThinkersForConcept(index, concept);
    expect(thinkers.map((t) => t.slug)).toEqual(["amy-c-edmondson"]);
  });
});

describe("thinker graph integration", () => {
  const index = buildGraphIndex(graph);

  it("indexes thinkers and builds explore hrefs", () => {
    const thinkerNode = index.getNodeByCanonicalId("thinker-amy-c-edmondson");
    expect(thinkerNode?.kind).toBe("thinker");
    expect(exploreHrefForNode(thinkerNode!)).toBe("/explore/thinkers/amy-c-edmondson");
    expect(exploreObservatoryFocusHref("thinker", "amy-c-edmondson")).toBe(
      "/explore?focusKind=thinker&focusSlug=amy-c-edmondson&view=observatory",
    );
  });

  it("includes thinkers in concept neighborhood and viz model", () => {
    const neighbors = getConnectedGraphNeighborhood(index, {
      kind: "concept",
      id: "concept-adaptation",
      slug: "adaptation",
    });
    expect(neighbors.some((n) => n.kind === "thinker")).toBe(true);

    const { nodeIds } = buildGraphVizModel(index, {
      focusCanonicalId: "concept-adaptation",
      maxDepth: 1,
      maxNodes: 20,
      kinds: [],
      layers: [],
      predicates: [],
      includeRelatedEntityLinks: true,
      pinnedCanonicalIds: [],
    });
    expect(nodeIds).toContain("thinker-amy-c-edmondson");
  });
});
