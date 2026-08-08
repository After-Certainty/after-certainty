import { describe, expect, it } from "vitest";

import {
  DELIGHT_DURATION_MS,
  V1_DELIGHT_VARIANT,
  buildSessionPatterns,
  layoutConstellation,
  selectDelightVariant,
  shortenPatternLabel,
} from "./delight";

describe("session completion delight helpers", () => {
  it("selects the deterministic V1 variant", () => {
    expect(selectDelightVariant()).toBe("pattern-constellation");
    expect(selectDelightVariant()).toBe(V1_DELIGHT_VARIANT);
  });

  it("settles within roughly two seconds", () => {
    expect(DELIGHT_DURATION_MS).toBeGreaterThanOrEqual(1800);
    expect(DELIGHT_DURATION_MS).toBeLessThanOrEqual(2200);
  });

  it("builds unique session patterns from dominants and secondaries", () => {
    const patterns = buildSessionPatterns([
      {
        dominantPattern: "exceptions-are-forever",
        secondaryPatterns: ["invisible-work"],
        titleByPatternId: {
          "exceptions-are-forever": "Exceptions Are Forever",
          "invisible-work": "Invisible Work",
        },
      },
      {
        dominantPattern: "exceptions-are-forever",
        secondaryPatterns: ["legibility"],
        titleByPatternId: {
          "exceptions-are-forever": "Exceptions Are Forever",
          legibility: "Legibility",
        },
      },
      {
        dominantPattern: "boundary-conditions",
        secondaryPatterns: [],
        titleByPatternId: { "boundary-conditions": "Boundary Conditions" },
      },
    ]);

    expect(patterns[0]?.id).toBe("exceptions-are-forever");
    expect(patterns.map((p) => p.id)).toContain("invisible-work");
    expect(patterns.map((p) => p.id)).toContain("legibility");
    expect(patterns.map((p) => p.id)).toContain("boundary-conditions");
    expect(patterns.length).toBeLessThanOrEqual(7);
  });

  it("layouts a deliberate sparse constellation with labels", () => {
    const patterns = buildSessionPatterns([
      {
        dominantPattern: "a",
        secondaryPatterns: ["b", "c"],
        titleByPatternId: { a: "A", b: "B", c: "C" },
      },
      {
        dominantPattern: "d",
        secondaryPatterns: ["e"],
        titleByPatternId: { d: "D", e: "E" },
      },
      {
        dominantPattern: "f",
        secondaryPatterns: [],
        titleByPatternId: { f: "F" },
      },
    ]);
    const { nodes, edges } = layoutConstellation(patterns);
    expect(nodes.length).toBeGreaterThanOrEqual(5);
    expect(nodes.length).toBeLessThanOrEqual(7);
    expect(edges.length).toBeGreaterThanOrEqual(4);
    expect(edges.length).toBeLessThanOrEqual(9);
    // Central / highest-score node is first slot and larger.
    expect(nodes[0]!.r).toBeGreaterThanOrEqual(7);
    for (const node of nodes) {
      expect(node.label).toBeDefined();
      expect(node.title.length).toBeGreaterThan(0);
    }
    for (const edge of edges) {
      expect(nodes[edge.from]).toBeDefined();
      expect(nodes[edge.to]).toBeDefined();
    }
  });

  it("falls back to a small default graph when empty", () => {
    const { nodes, edges } = layoutConstellation([]);
    expect(nodes.length).toBeGreaterThanOrEqual(3);
    expect(edges.length).toBeGreaterThanOrEqual(2);
  });

  it("shortens long labels for mobile SVG text", () => {
    expect(shortenPatternLabel("Short")).toBe("Short");
    expect(shortenPatternLabel("A Very Long Pattern Title Indeed").endsWith("…")).toBe(true);
  });
});
