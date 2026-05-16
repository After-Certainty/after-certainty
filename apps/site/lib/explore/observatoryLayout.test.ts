import { describe, expect, it } from "vitest";

import { mergeNodePositions, radialPositionsForNodes } from "@/lib/explore/observatoryLayout";

describe("observatoryLayout", () => {
  it("places focus at origin and others on a ring", () => {
    const m = radialPositionsForNodes("a", ["a", "b", "c"]);
    expect(m.get("a")).toEqual({ x: 0, y: 0 });
    expect(m.size).toBe(3);
  });

  it("preserves previous positions when merging", () => {
    const prev = new Map([
      ["a", { x: 0, y: 0 }],
      ["b", { x: 50, y: 50 }],
    ]);
    const next = mergeNodePositions("a", ["a", "b", "c"], prev);
    expect(next.get("b")).toEqual({ x: 50, y: 50 });
    expect(next.has("c")).toBe(true);
  });

  it("widens the ring when many satellites need chord clearance", () => {
    const ids = ["f", ...Array.from({ length: 8 }, (_, i) => `n${i}`)];
    const m = radialPositionsForNodes("f", ids);
    const n0 = m.get("n0")!;
    const n1 = m.get("n1")!;
    const dx = n0.x - n1.x;
    const dy = n0.y - n1.y;
    const chord = Math.hypot(dx, dy);
    expect(chord).toBeGreaterThan(120);
  });
});
