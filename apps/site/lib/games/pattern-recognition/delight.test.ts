import { describe, expect, it } from "vitest";

import {
  DELIGHT_DURATION_MS,
  V1_DELIGHT_VARIANT,
  layoutConstellation,
  selectDelightVariant,
  sessionPatternIds,
} from "./delight";

describe("session completion delight helpers", () => {
  it("selects the deterministic V1 variant", () => {
    expect(selectDelightVariant()).toBe("pattern-constellation");
    expect(selectDelightVariant()).toBe(V1_DELIGHT_VARIANT);
  });

  it("keeps delight brief", () => {
    expect(DELIGHT_DURATION_MS).toBeGreaterThanOrEqual(1200);
    expect(DELIGHT_DURATION_MS).toBeLessThanOrEqual(2200);
  });

  it("dedupes dominant pattern ids and caps at five", () => {
    const ids = sessionPatternIds([
      { dominantPattern: "a" },
      { dominantPattern: "b" },
      { dominantPattern: "a" },
      { dominantPattern: "c" },
      { dominantPattern: "d" },
      { dominantPattern: "e" },
      { dominantPattern: "f" },
    ]);
    expect(ids).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("layouts a connected constellation for session patterns", () => {
    const { nodes, edges } = layoutConstellation(["p1", "p2", "p3", "p4"]);
    expect(nodes).toHaveLength(4);
    expect(edges.length).toBeGreaterThanOrEqual(3);
    for (const edge of edges) {
      expect(nodes[edge.from]).toBeDefined();
      expect(nodes[edge.to]).toBeDefined();
    }
  });

  it("falls back to a tiny default graph when empty", () => {
    const { nodes, edges } = layoutConstellation([]);
    expect(nodes.length).toBeGreaterThanOrEqual(3);
    expect(edges.length).toBeGreaterThanOrEqual(2);
  });
});
