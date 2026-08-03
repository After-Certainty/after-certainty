import { describe, expect, it } from "vitest";

import { patternIndexEyebrow, patternPreviewFields } from "@/lib/explore/pattern-preview";
import type { Pattern } from "@/types/semanticGraph";

function pattern(partial: Partial<Pattern> & Pick<Pattern, "id" | "slug" | "title">): Pattern {
  return {
    summary: partial.summary ?? "",
    ...partial,
  };
}

describe("patternIndexEyebrow", () => {
  it("labels master and supporting dynamics", () => {
    expect(
      patternIndexEyebrow(pattern({ id: "1", slug: "m", title: "M", patternRole: "master" })),
    ).toBe("Master pattern");
    expect(
      patternIndexEyebrow(
        pattern({
          id: "2",
          slug: "s",
          title: "S",
          patternRole: "supporting",
          realityDynamic: "obscuring",
        }),
      ),
    ).toBe("Supporting · Obscuring");
    expect(
      patternIndexEyebrow(
        pattern({
          id: "3",
          slug: "c",
          title: "C",
          patternRole: "supporting",
          realityDynamic: "corrective",
        }),
      ),
    ).toBe("Supporting · Corrective");
  });

  it("falls back for portfolio patterns", () => {
    expect(patternIndexEyebrow(pattern({ id: "4", slug: "p", title: "P" }))).toBe("Pattern");
  });
});

describe("patternPreviewFields", () => {
  it("prefers observation for description and problem for why it matters", () => {
    const fields = patternPreviewFields(
      pattern({
        id: "1",
        slug: "x",
        title: "X",
        observation: "It names a recurring form. It stays short.",
        problem: "Certainty hardens before contact returns.",
        summary: "Long composed summary that should not win.",
      }),
    );
    expect(fields.description).toContain("recurring form");
    expect(fields.secondaryLabel).toBe("Why it matters");
    expect(fields.secondary).toContain("Certainty hardens");
  });

  it("uses recognition signals when problem is the description source", () => {
    const fields = patternPreviewFields(
      pattern({
        id: "2",
        slug: "y",
        title: "Y",
        problem: "The recurring difficulty shows up early.",
        recognitionSignals: ["People defend the map over the terrain."],
      }),
    );
    expect(fields.description).toContain("recurring difficulty");
    expect(fields.secondaryLabel).toBe("Warning signs");
    expect(fields.secondary).toContain("defend the map");
  });

  it("omits secondary when only a short description is available", () => {
    const fields = patternPreviewFields(
      pattern({
        id: "3",
        slug: "z",
        title: "Z",
        summary: "Only a summary exists for this portfolio pattern.",
      }),
    );
    expect(fields.description).toContain("Only a summary");
    expect(fields.secondaryLabel).toBeNull();
    expect(fields.secondary).toBeNull();
  });

  it("degrades for meaning-forms-early-shaped thin metadata (no problem/observation)", () => {
    const fields = patternPreviewFields(
      pattern({
        id: "4",
        slug: "meaning-forms-early",
        title: "Meaning Forms Early",
        setup: "Meaning consolidates before the frame is tested.",
        summary: "Composed summary from setup and example only.",
        counterbalances: ["Keep revising the frame against contact."],
      }),
    );
    // Preview prefers observation → problem → summary (setup is at-a-glance only).
    expect(fields.description).toContain("Composed summary");
    expect(fields.secondaryLabel).toBe("Counterbalance");
    expect(fields.secondary).toContain("revising the frame");
  });
});
