import { describe, expect, it } from "vitest";

import {
  DEFAULT_OBSERVATORY_INCLUDE_RELATED,
  DEFAULT_OBSERVATORY_MAX_DEPTH,
  DEFAULT_OBSERVATORY_MAX_NODES,
  isAtFreshFocusEntry,
  type FreshFocusEntryCriteria,
} from "@/lib/observatory/focusEntry";

function freshCriteria(overrides: Partial<FreshFocusEntryCriteria> = {}): FreshFocusEntryCriteria {
  return {
    expandedRootIds: ["c1"],
    focusId: "c1",
    pinnedCount: 0,
    pathFromId: null,
    pathToId: null,
    relationshipSelection: null,
    kinds: [],
    layers: [],
    predicates: [],
    maxDepth: DEFAULT_OBSERVATORY_MAX_DEPTH,
    maxNodes: DEFAULT_OBSERVATORY_MAX_NODES,
    includeRelated: DEFAULT_OBSERVATORY_INCLUDE_RELATED,
    ...overrides,
  };
}

describe("isAtFreshFocusEntry", () => {
  it("returns true for default deep-link exploration state", () => {
    expect(isAtFreshFocusEntry(freshCriteria(), "c1")).toBe(true);
  });

  it("returns false without a focus id", () => {
    expect(isAtFreshFocusEntry(freshCriteria(), null)).toBe(false);
  });

  it("returns false when multiple roots are expanded", () => {
    expect(isAtFreshFocusEntry(freshCriteria({ expandedRootIds: ["c1", "c2"] }), "c1")).toBe(false);
  });

  it("returns false when filters or paths are active", () => {
    expect(isAtFreshFocusEntry(freshCriteria({ kinds: ["book"] }), "c1")).toBe(false);
    expect(isAtFreshFocusEntry(freshCriteria({ pathFromId: "c1" }), "c1")).toBe(false);
    expect(isAtFreshFocusEntry(freshCriteria({ pinnedCount: 1 }), "c1")).toBe(false);
    expect(
      isAtFreshFocusEntry(
        freshCriteria({
          relationshipSelection: {
            edgeKey: "k",
            sourceId: "c1",
            targetId: "c2",
            predicate: "x",
            relationship: { source: "c1", target: "c2", relationship: "x" },
          },
        }),
        "c1",
      ),
    ).toBe(false);
  });
});
