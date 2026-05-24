import { describe, expect, it } from "vitest";

import { buildGraphIndex } from "@/lib/graph/graph";
import {
  masterTermForConceptId,
  ontologyLensAllowedConceptIds,
  ontologyRoleForConcept,
} from "@/lib/graph/ontology";
import type { SemanticGraph } from "@/types/semanticGraph";

const graph: SemanticGraph = {
  books: [],
  glossary: [
    { id: "c1", slug: "circulation", title: "Circulation", shortDefinition: "x" },
    { id: "c2", slug: "correction", title: "Correction", shortDefinition: "y" },
    { id: "c3", slug: "scale", title: "Scale", shortDefinition: "z" },
  ],
  patterns: [],
  sources: [],
  relationships: [
    { source: "c1", target: "c2", relationship: "structural_tension" },
    { source: "c3", target: "c2", relationship: "thins" },
  ],
  ontology: {
    masterTerms: [{ id: "c1", slug: "circulation", title: "Circulation", preserves: "continuity" }],
    structuralPressures: [{ id: "c3", slug: "scale", title: "Scale", effect: "weakens proximity" }],
  },
};

describe("ontology helpers", () => {
  it("resolves roles and lens neighborhoods", () => {
    expect(ontologyRoleForConcept(graph, "c1")).toBe("master");
    expect(ontologyRoleForConcept(graph, "c3")).toBe("pressure");
    expect(masterTermForConceptId(graph, "c1")?.preserves).toBe("continuity");

    const index = buildGraphIndex(graph);
    const masterLens = ontologyLensAllowedConceptIds(index, "master");
    expect(masterLens.has("c1")).toBe(true);
    expect(masterLens.has("c2")).toBe(true);

    const pressureLens = ontologyLensAllowedConceptIds(index, "pressure");
    expect(pressureLens.has("c3")).toBe(true);
    expect(pressureLens.has("c2")).toBe(true);
  });
});
