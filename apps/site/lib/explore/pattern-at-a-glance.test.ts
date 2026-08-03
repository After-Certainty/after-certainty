import { describe, expect, it } from "vitest";

import {
  patternAtAGlance,
  patternDetailTeaser,
  patternForceCycleLine,
} from "@/lib/explore/pattern-at-a-glance";
import type { Pattern } from "@/types/semanticGraph";

function pattern(partial: Partial<Pattern> & Pick<Pattern, "id" | "slug" | "title">): Pattern {
  return {
    summary: partial.summary ?? "",
    ...partial,
  };
}

describe("patternAtAGlance", () => {
  it("prefers observation / problem / recognition / counterbalance", () => {
    const items = patternAtAGlance(
      pattern({
        id: "1",
        slug: "rich",
        title: "Rich",
        summary: "Composed summary that should not win when observation exists.",
        observation: "It names how certainty hardens under pressure.",
        problem: "Without it, pressure collapses into false closure.",
        recognitionSignals: ["People treat the map as the territory."],
        counterbalances: ["Return to contact with what resists the story."],
      }),
    );
    expect(items.map((i) => i.slot)).toEqual([
      "whatItDoes",
      "whyItMatters",
      "keyRisk",
      "counterbalance",
    ]);
    expect(items[0]!.text).toContain("certainty hardens");
    expect(items[2]!.text).toContain("map as the territory");
  });

  it("falls back what-it-does to setup then summary", () => {
    const fromSetup = patternAtAGlance(
      pattern({
        id: "2",
        slug: "setup",
        title: "Setup",
        setup: "A lived situation appears before the pattern is named.",
        summary: "Summary fallback.",
      }),
    );
    expect(fromSetup[0]).toMatchObject({ slot: "whatItDoes" });
    expect(fromSetup[0]!.text).toContain("lived situation");

    const fromSummary = patternAtAGlance(
      pattern({
        id: "3",
        slug: "sum",
        title: "Sum",
        summary: "Only the composed summary is available here.",
      }),
    );
    expect(fromSummary).toHaveLength(1);
    expect(fromSummary[0]!.slot).toBe("whatItDoes");
  });

  it("omits empty slots and uses trajectory risk fallbacks", () => {
    const items = patternAtAGlance(
      pattern({
        id: "4",
        slug: "thin",
        title: "Thin",
        summary: "A thin pattern with only summary and trajectory.",
        trajectory: {
          failureModes: ["The corrective move becomes another mask."],
        },
      }),
    );
    expect(items.map((i) => i.slot)).toEqual(["whatItDoes", "keyRisk"]);
    expect(items.find((i) => i.slot === "whyItMatters")).toBeUndefined();
    expect(items.find((i) => i.slot === "keyRisk")!.text).toContain("another mask");
  });
});

describe("patternDetailTeaser", () => {
  it("prefers observation over summary", () => {
    expect(
      patternDetailTeaser(
        pattern({
          id: "5",
          slug: "t",
          title: "T",
          observation: "First thesis sentence. Second follows.",
          summary: "Long composed summary that should wait for disclosure.",
        }),
      ),
    ).toContain("First thesis sentence");
  });
});

describe("patternForceCycleLine", () => {
  it("closes the cycle with the first force title", () => {
    expect(patternForceCycleLine(["Perception", "Power", "Time", "Contact"])).toBe(
      "Perception → Power → Time → Contact → Perception",
    );
  });

  it("returns null for an empty list", () => {
    expect(patternForceCycleLine([])).toBeNull();
  });
});
