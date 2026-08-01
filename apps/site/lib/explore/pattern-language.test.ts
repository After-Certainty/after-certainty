import { describe, expect, it } from "vitest";

import { buildGraphIndex } from "@/lib/graph/graph";
import {
  forcesInCycleOrder,
  getForceForPattern,
  getMasterPattern,
  supportingPatternsForForce,
} from "@/lib/explore/pattern-language";
import type { SemanticGraph } from "@/types/semanticGraph";

const miniGraph: SemanticGraph = {
  books: [],
  glossary: [],
  patterns: [
    {
      id: "pattern-reality-answers-back",
      slug: "reality-answers-back",
      title: "Reality Answers Back",
      summary: "Master",
      patternRole: "master",
    },
    {
      id: "pattern-compression-loses-the-person",
      slug: "compression-loses-the-person",
      title: "Compression Loses the Person",
      summary: "Supporting",
      patternRole: "supporting",
      organizingForce: "perception",
      realityDynamic: "obscuring",
      relatedBooks: ["book-the-case-that-does-not-fit"],
    },
    {
      id: "pattern-understanding-circulates",
      slug: "understanding-circulates",
      title: "Understanding Circulates",
      summary: "Supporting",
      patternRole: "supporting",
      organizingForce: "perception",
      realityDynamic: "corrective",
    },
  ],
  sources: [],
  relationships: [
    {
      source: "force-perception",
      target: "pattern-compression-loses-the-person",
      relationship: "organizes",
    },
    {
      source: "pattern-attention-finds-a-focus",
      target: "pattern-authority-follows-attention",
      relationship: "precedes",
    },
  ],
  forces: [
    {
      id: "force-perception",
      slug: "perception",
      title: "Perception",
      description: "How we see.",
      relatedPatterns: [
        "pattern-compression-loses-the-person",
        "pattern-understanding-circulates",
      ],
    },
    {
      id: "force-power",
      slug: "power",
      title: "Power",
      description: "How influence works.",
      relatedPatterns: [],
    },
  ],
};

describe("pattern-language helpers", () => {
  it("resolves master, force grouping, and cycle order", () => {
    const index = buildGraphIndex(miniGraph);
    const master = getMasterPattern(index);
    expect(master?.slug).toBe("reality-answers-back");

    const compression = index.patternBySlug.get("compression-loses-the-person")!;
    expect(getForceForPattern(index, compression)?.slug).toBe("perception");
    expect(supportingPatternsForForce(index, "perception").map((p) => p.slug)).toEqual([
      "compression-loses-the-person",
      "understanding-circulates",
    ]);
    expect(forcesInCycleOrder(index).map((f) => f.slug)).toEqual(["perception", "power"]);
  });

  it("indexes force endpoints for relationship resolution", () => {
    const index = buildGraphIndex(miniGraph);
    expect(index.resolveCanonicalId("force-perception")).toBe("force-perception");
    expect(index.forceBySlug.get("perception")?.title).toBe("Perception");
  });
});
