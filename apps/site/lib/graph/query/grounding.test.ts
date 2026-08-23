import { describe, expect, it } from "vitest";

import { buildPublicGroundingViewModel } from "@/lib/graph/query/grounding";
import type { SemanticGraph } from "@/types/semanticGraph";

const emptyGraph = (): SemanticGraph => ({
  books: [],
  glossary: [],
  patterns: [],
  situations: [],
  sources: [],
  relationships: [],
});

const graphWithWorks: SemanticGraph = {
  ...emptyGraph(),
  books: [
    {
      id: "book-after-certainty",
      slug: "after-certainty",
      title: "After Certainty",
      concepts: [],
      patterns: [],
      sources: [],
    },
  ],
  patterns: [
    {
      id: "pattern-fixture-synthesis",
      slug: "fixture-synthesis",
      title: "Fixture Synthesis",
      summary: "A pattern with original synthesis grounding.",
      relatedConcepts: [],
      relatedBooks: ["book-after-certainty"],
      grounding: {
        type: "original_synthesis",
        developedFrom: [{ work: "after-certainty" }],
      },
    },
  ],
};

describe("public grounding", () => {
  it("maps original_synthesis to public language with supporting works", () => {
    const pattern = graphWithWorks.patterns.find((p) => p.grounding?.type === "original_synthesis");
    expect(pattern).toBeTruthy();
    const vm = buildPublicGroundingViewModel(pattern!.grounding, graphWithWorks);
    expect(vm).not.toBeNull();
    expect(vm!.label).toBe("Original synthesis");
    expect(vm!.description).toMatch(/original After Certainty synthesis/i);
    expect(vm!.supportingWorks.length).toBeGreaterThan(0);
    expect(vm!.supportingWorks[0]?.href).toMatch(/^\/explore\/books\//);
  });

  it("returns null for missing or unknown grounding", () => {
    expect(buildPublicGroundingViewModel(undefined, graphWithWorks)).toBeNull();
    expect(
      buildPublicGroundingViewModel({ type: "not_a_real_type", note: "x" }, graphWithWorks),
    ).toBeNull();
  });

  it("omits unresolved work references", () => {
    const vm = buildPublicGroundingViewModel(
      {
        type: "original_synthesis",
        developedFrom: [{ work: "does-not-exist-slug" }],
      },
      graphWithWorks,
    );
    expect(vm).not.toBeNull();
    expect(vm!.supportingWorks).toEqual([]);
  });
});
