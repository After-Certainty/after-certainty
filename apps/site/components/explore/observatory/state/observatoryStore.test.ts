import { describe, expect, it } from "vitest";

import { createObservatoryStore } from "@/components/explore/observatory/state/observatoryStore";
import {
  DEFAULT_OBSERVATORY_INCLUDE_RELATED,
  DEFAULT_OBSERVATORY_MAX_DEPTH,
  DEFAULT_OBSERVATORY_MAX_NODES,
} from "@/lib/observatory/focusEntry";

describe("observatoryStore", () => {
  it("resetToFocusEntry restores fresh deep-link graph exploration state", () => {
    const store = createObservatoryStore({
      focusId: "c1",
      selectedId: "c1",
      expandedRootIds: ["c1", "c2", "c3"],
    });

    store.getState().setKinds(["book"]);
    store.getState().setLayers(["Primitives"]);
    store.getState().setPredicates(["illustrates"]);
    store.getState().setMaxDepth(3);
    store.getState().setMaxNodes(48);
    store.getState().setIncludeRelated(false);
    store.getState().setPinnedIds(new Set(["c2"]));
    store.getState().setPathFromId("c1");
    store.getState().setPathToId("c3");
    store.getState().setShowRelationshipLabels(true);
    store.getState().selectRelationship({
      edgeKey: "c1|c2|outruns",
      sourceId: "c1",
      targetId: "c2",
      predicate: "outruns",
      relationship: { source: "c1", target: "c2", relationship: "outruns" },
    });

    store.getState().resetToFocusEntry("c9");

    const s = store.getState();
    expect(s.expandedRootIds).toEqual(["c9"]);
    expect(s.focusId).toBe("c9");
    expect(s.selectedId).toBe("c9");
    expect(s.kinds).toEqual([]);
    expect(s.layers).toEqual([]);
    expect(s.predicates).toEqual([]);
    expect(s.maxDepth).toBe(DEFAULT_OBSERVATORY_MAX_DEPTH);
    expect(s.maxNodes).toBe(DEFAULT_OBSERVATORY_MAX_NODES);
    expect(s.includeRelated).toBe(DEFAULT_OBSERVATORY_INCLUDE_RELATED);
    expect(s.pinnedIds.size).toBe(0);
    expect(s.pathFromId).toBeNull();
    expect(s.pathToId).toBeNull();
    expect(s.relationshipSelection).toBeNull();
    expect(s.panelMode).toBe("entity");
    expect(s.hoveredEdgeKey).toBeNull();
    expect(s.showRelationshipLabels).toBe(false);
  });

  it("focusNode and selectRelationship reset compactFocusOpen to collapsed", () => {
    const store = createObservatoryStore({
      focusId: "c1",
      selectedId: "c1",
      expandedRootIds: ["c1"],
    });

    store.getState().setCompactFocusOpen(true);
    expect(store.getState().compactFocusOpen).toBe(true);

    store.getState().focusNode("c2");
    expect(store.getState().compactFocusOpen).toBe(false);

    store.getState().setCompactFocusOpen(true);
    store.getState().selectRelationship({
      edgeKey: "c1|c2|outruns",
      sourceId: "c1",
      targetId: "c2",
      predicate: "outruns",
      relationship: { source: "c1", target: "c2", relationship: "outruns" },
    });
    expect(store.getState().compactFocusOpen).toBe(false);
  });

  it("setCompactFocusOpen persists until the next selection change", () => {
    const store = createObservatoryStore({
      focusId: "c1",
      selectedId: "c1",
      expandedRootIds: ["c1"],
    });

    store.getState().setCompactFocusOpen(true);
    expect(store.getState().compactFocusOpen).toBe(true);
    store.getState().setCompactFocusOpen(false);
    expect(store.getState().compactFocusOpen).toBe(false);
  });

  it("bumpLayoutRevision increments layoutRevision", () => {
    const store = createObservatoryStore({
      focusId: "c1",
      selectedId: "c1",
      expandedRootIds: ["c1"],
    });
    expect(store.getState().layoutRevision).toBe(0);
    store.getState().bumpLayoutRevision();
    expect(store.getState().layoutRevision).toBe(1);
  });
});
