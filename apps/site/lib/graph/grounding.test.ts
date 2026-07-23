import { describe, expect, it } from "vitest";

import semanticManifest from "@/data/semantic-manifest.json";
import { buildPublicGroundingViewModel } from "@/lib/graph/grounding";
import type { SemanticGraph } from "@/types/semanticGraph";

const graph = semanticManifest as unknown as SemanticGraph;

describe("public grounding", () => {
  it("maps original_synthesis to public language with supporting works", () => {
    const pattern = graph.patterns.find((p) => p.grounding?.type === "original_synthesis");
    expect(pattern).toBeTruthy();
    const vm = buildPublicGroundingViewModel(pattern!.grounding, graph);
    expect(vm).not.toBeNull();
    expect(vm!.label).toBe("Original synthesis");
    expect(vm!.description).toMatch(/original After Certainty synthesis/i);
    expect(vm!.supportingWorks.length).toBeGreaterThan(0);
    expect(vm!.supportingWorks[0]?.href).toMatch(/^\/explore\/books\//);
  });

  it("returns null for missing or unknown grounding", () => {
    expect(buildPublicGroundingViewModel(undefined, graph)).toBeNull();
    expect(buildPublicGroundingViewModel({ type: "not_a_real_type", note: "x" }, graph)).toBeNull();
  });

  it("omits unresolved work references", () => {
    const vm = buildPublicGroundingViewModel(
      {
        type: "original_synthesis",
        developedFrom: [{ work: "does-not-exist-slug" }],
      },
      graph,
    );
    expect(vm).not.toBeNull();
    expect(vm!.supportingWorks).toEqual([]);
  });
});
