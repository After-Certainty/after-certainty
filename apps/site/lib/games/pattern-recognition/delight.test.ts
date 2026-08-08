import { describe, expect, it } from "vitest";

import {
  CONSTELLATION_VIEWBOX,
  DELIGHT_DURATION_MS,
  V1_DELIGHT_VARIANT,
  buildSessionPatterns,
  layoutConstellation,
  resolveLabelPlacement,
  selectDelightVariant,
  wrapPatternLabel,
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

  it("places edge labels inward and close to their nodes", () => {
    const patterns = [
      { id: "center", title: "Reality Answers Back", score: 9, isDominant: true },
      { id: "left", title: "Invisible Work", score: 4, isDominant: true },
      { id: "ul", title: "Legibility", score: 3, isDominant: false },
      { id: "ur", title: "Boundary Conditions", score: 3, isDominant: false },
      { id: "right", title: "Exceptions Are Forever", score: 3, isDominant: true },
      { id: "lr", title: "Feedback Delay", score: 2, isDominant: false },
      { id: "ll", title: "Disagreement is Suppression", score: 2, isDominant: false },
    ];
    const { nodes } = layoutConstellation(patterns);
    expect(nodes).toHaveLength(7);

    const byX = [...nodes].sort((a, b) => a.x - b.x);
    const byY = [...nodes].sort((a, b) => a.y - b.y);
    const left = byX[0]!;
    const right = byX[byX.length - 1]!;
    const top = byY[0]!;
    const bottom = byY[byY.length - 1]!;
    const center = nodes[0]!;

    // Left edge → label to the right (inward)
    expect(left.label.position).toBe("right");
    expect(left.label.x).toBeGreaterThan(left.x);
    expect(left.label.anchor).toBe("start");

    // Right edge → label to the left (inward)
    expect(right.label.position).toBe("left");
    expect(right.label.x).toBeLessThan(right.x);
    expect(right.label.anchor).toBe("end");

    // Top → below / diagonal inward
    expect(top.label.position).toMatch(/^below/);
    expect(top.label.y).toBeGreaterThan(top.y);

    // Bottom → above / diagonal inward
    expect(bottom.label.position).toMatch(/^above/);
    expect(bottom.label.y).toBeLessThan(bottom.y);

    // Center slot → below, nearby
    expect(center.label.position).toBe("below");
    expect(center.label.y - center.y).toBeLessThan(40);

    for (const node of nodes) {
      expect(node.label.x).toBeGreaterThanOrEqual(8);
      expect(node.label.x).toBeLessThanOrEqual(CONSTELLATION_VIEWBOX.width - 8);
      expect(node.label.y).toBeGreaterThanOrEqual(8);
      expect(node.label.y).toBeLessThanOrEqual(CONSTELLATION_VIEWBOX.height - 8);
      // Labels stay near their node (not free-floating across the canvas).
      const dx = Math.abs(node.label.x - node.x);
      const dy = Math.abs(node.label.y - node.y);
      expect(Math.hypot(dx, dy)).toBeLessThan(56);
    }
  });

  it("wraps long labels onto two lines before ellipsis", () => {
    expect(wrapPatternLabel("Legibility")).toEqual(["Legibility"]);
    const wrapped = wrapPatternLabel("Disagreement is Suppression");
    expect(wrapped.length).toBe(2);
    expect(wrapped.join(" ")).not.toMatch(/…/);
    expect(wrapped.every((line) => line.length <= 16)).toBe(true);

    const veryLong = wrapPatternLabel("Responsibility Persists Beyond Control");
    expect(veryLong.length).toBe(2);
  });

  it("resolveLabelPlacement clamps into the viewBox", () => {
    const label = resolveLabelPlacement({
      nodeX: 10,
      nodeY: 150,
      r: 6,
      position: "left",
      lines: ["Too Far Left"],
    });
    expect(label.x).toBeGreaterThanOrEqual(10);
    expect(label.anchor).toBe("end");
  });

  it("falls back to a small default graph when empty", () => {
    const { nodes, edges } = layoutConstellation([]);
    expect(nodes.length).toBeGreaterThanOrEqual(3);
    expect(edges.length).toBeGreaterThanOrEqual(2);
  });
});
