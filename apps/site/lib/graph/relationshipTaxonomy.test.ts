import { describe, expect, it } from "vitest";

import { buildGraphIndex } from "@/lib/graph/graph";
import {
  dynamicPredicateKeys,
  dynamicVerbGroup,
  groupPredicatesByFamily,
  isSymmetricRelationship,
  relationshipFamily,
  relationshipsForConcept,
  tensionPredicateKeys,
} from "@/lib/graph/relationshipTaxonomy";
import type { SemanticGraph } from "@/types/semanticGraph";

const miniGraph: SemanticGraph = {
  books: [],
  glossary: [
    { id: "c1", slug: "a", title: "A", shortDefinition: "a" },
    { id: "c2", slug: "b", title: "B", shortDefinition: "b" },
    { id: "c3", slug: "c", title: "C", shortDefinition: "c" },
  ],
  patterns: [],
  situations: [],
  sources: [],
  relationships: [
    { source: "c1", target: "c2", relationship: "structural_tension", description: "x vs y" },
    { source: "c2", target: "c3", relationship: "thins", description: "erosion" },
    { source: "c3", target: "c1", relationship: "preserves", description: "hold" },
  ],
};

describe("relationshipTaxonomy", () => {
  it("classifies families and groups", () => {
    expect(relationshipFamily("structural_tension")).toBe("tension");
    expect(relationshipFamily("thins")).toBe("dynamic");
    expect(isSymmetricRelationship("structural_tension")).toBe(true);
    expect(isSymmetricRelationship("thins")).toBe(false);

    const grouped = groupPredicatesByFamily(miniGraph);
    expect(grouped.tension).toEqual(["structural_tension"]);
    expect(grouped.dynamic).toContain("thins");
    expect(tensionPredicateKeys(miniGraph)).toEqual(["structural_tension"]);
    expect(dynamicPredicateKeys(miniGraph)).toContain("thins");
  });

  it("splits concept relationships by tension vs direction", () => {
    const index = buildGraphIndex(miniGraph);
    const atC2 = relationshipsForConcept(index, "c2");
    expect(atC2.tensions).toHaveLength(1);
    expect(atC2.outgoingDynamics).toHaveLength(1);
    expect(atC2.incomingDynamics).toHaveLength(0);

    const atC1 = relationshipsForConcept(index, "c1");
    expect(atC1.tensions).toHaveLength(1);
    expect(atC1.incomingDynamics).toHaveLength(1);
    expect(atC1.incomingDynamics[0]?.relationship).toBe("preserves");
  });

  it("classifies sustaining verbs", () => {
    expect(dynamicVerbGroup("preserves")).toBe("sustaining");
    expect(dynamicVerbGroup("renews")).toBe("sustaining");
    expect(dynamicVerbGroup("stabilizes")).toBe("sustaining");
    expect(dynamicVerbGroup("enables")).toBe("sustaining");
  });

  it("classifies erosive verbs", () => {
    expect(dynamicVerbGroup("thins")).toBe("erosive");
    expect(dynamicVerbGroup("pressures")).toBe("erosive");
    expect(dynamicVerbGroup("weakens")).toBe("erosive");
    expect(dynamicVerbGroup("hardens")).toBe("erosive");
    expect(dynamicVerbGroup("constrains")).toBe("erosive");
    expect(dynamicVerbGroup("distorts")).toBe("erosive");
  });

  it("classifies reproductive verbs", () => {
    expect(dynamicVerbGroup("reproduces")).toBe("reproductive");
  });

  it("returns null for unclassified dynamic verbs", () => {
    expect(dynamicVerbGroup("contrasts")).toBeNull();
    expect(dynamicVerbGroup("requires")).toBeNull();
    expect(dynamicVerbGroup("precedes")).toBeNull();
    expect(dynamicVerbGroup("intensifies")).toBeNull();
    expect(dynamicVerbGroup("complements")).toBeNull();
  });
});
