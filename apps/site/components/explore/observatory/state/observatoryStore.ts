"use client";

import { create } from "zustand";

import {
  DEFAULT_OBSERVATORY_INCLUDE_RELATED,
  DEFAULT_OBSERVATORY_MAX_DEPTH,
  DEFAULT_OBSERVATORY_MAX_NODES,
} from "@/lib/observatory/focusEntry";
import type { RelationshipSelection } from "@/lib/observatory/types";
import type { PanelMode } from "@/types/observatory";
import type { GraphEntityKind } from "@/types/semanticGraph";

export type ObservatoryStoreState = {
  expandedRootIds: string[];
  kinds: GraphEntityKind[];
  layers: string[];
  predicates: string[];
  maxDepth: number;
  maxNodes: number;
  includeRelated: boolean;
  pinnedIds: Set<string>;
  focusId: string | null;
  selectedId: string | null;
  pathFromId: string | null;
  pathToId: string | null;
  relationshipSelection: RelationshipSelection;
  panelMode: PanelMode;
  leftOpen: boolean;
  rightOpen: boolean;
  bottomOpen: boolean;
  refitSignal: number;
  layoutRevision: number;
  hoveredEdgeKey: string | null;
  showRelationshipLabels: boolean;
};

export type ObservatoryStoreActions = {
  setExpandedRootIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  setKinds: (kinds: GraphEntityKind[] | ((prev: GraphEntityKind[]) => GraphEntityKind[])) => void;
  setLayers: (layers: string[] | ((prev: string[]) => string[])) => void;
  setPredicates: (predicates: string[] | ((prev: string[]) => string[])) => void;
  setMaxDepth: (n: number) => void;
  setMaxNodes: (n: number) => void;
  setIncludeRelated: (v: boolean) => void;
  setPinnedIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setFocusId: (id: string | null) => void;
  setSelectedId: (id: string | null) => void;
  setPathFromId: (id: string | null) => void;
  setPathToId: (id: string | null) => void;
  selectRelationship: (sel: RelationshipSelection) => void;
  clearRelationship: () => void;
  setHoveredEdgeKey: (key: string | null) => void;
  setPanelMode: (mode: PanelMode) => void;
  setLeftOpen: (open: boolean) => void;
  setRightOpen: (open: boolean) => void;
  setBottomOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  bumpRefitSignal: () => void;
  bumpLayoutRevision: () => void;
  setShowRelationshipLabels: (v: boolean) => void;
  /** Reset graph exploration to a fresh deep-link entry on this focal node. */
  resetToFocusEntry: (focusId: string) => void;
  focusNode: (id: string, options?: { openPanel?: boolean }) => void;
  selectNode: (id: string | null) => void;
  togglePin: (id: string) => void;
};

export type ObservatoryStore = ObservatoryStoreState & ObservatoryStoreActions;

export function createObservatoryStoreInitialState(seed: {
  focusId: string | null;
  selectedId: string | null;
  expandedRootIds: string[];
}): ObservatoryStoreState {
  return {
    expandedRootIds: seed.expandedRootIds,
    kinds: [],
    layers: [],
    predicates: [],
    maxDepth: DEFAULT_OBSERVATORY_MAX_DEPTH,
    maxNodes: DEFAULT_OBSERVATORY_MAX_NODES,
    includeRelated: DEFAULT_OBSERVATORY_INCLUDE_RELATED,
    pinnedIds: new Set(),
    focusId: seed.focusId,
    selectedId: seed.selectedId,
    pathFromId: null,
    pathToId: null,
    relationshipSelection: null,
    panelMode: seed.selectedId ? "entity" : "empty",
    leftOpen: false,
    rightOpen: false,
    bottomOpen: false,
    refitSignal: 0,
    layoutRevision: 0,
    hoveredEdgeKey: null,
    showRelationshipLabels: false,
  };
}

export function createObservatoryStore(seed: Parameters<typeof createObservatoryStoreInitialState>[0]) {
  return create<ObservatoryStore>((set, get) => ({
    ...createObservatoryStoreInitialState(seed),
    setExpandedRootIds: (ids) =>
      set({ expandedRootIds: typeof ids === "function" ? ids(get().expandedRootIds) : ids }),
    setKinds: (kinds) => set({ kinds: typeof kinds === "function" ? kinds(get().kinds) : kinds }),
    setLayers: (layers) => set({ layers: typeof layers === "function" ? layers(get().layers) : layers }),
    setPredicates: (predicates) =>
      set({ predicates: typeof predicates === "function" ? predicates(get().predicates) : predicates }),
    setMaxDepth: (maxDepth) => set({ maxDepth }),
    setMaxNodes: (maxNodes) => set({ maxNodes }),
    setIncludeRelated: (includeRelated) => set({ includeRelated }),
    setPinnedIds: (pinnedIds) =>
      set({ pinnedIds: typeof pinnedIds === "function" ? pinnedIds(get().pinnedIds) : pinnedIds }),
    setFocusId: (focusId) => set({ focusId }),
    setSelectedId: (selectedId) => set({ selectedId }),
    setPathFromId: (pathFromId) => set({ pathFromId }),
    setPathToId: (pathToId) => set({ pathToId }),
    selectRelationship: (relationshipSelection) =>
      set({
        relationshipSelection,
        panelMode: relationshipSelection ? "relationship" : "empty",
        hoveredEdgeKey: relationshipSelection?.edgeKey ?? null,
      }),
    clearRelationship: () =>
      set({
        relationshipSelection: null,
        panelMode: get().selectedId ? "entity" : "empty",
        hoveredEdgeKey: null,
      }),
    setHoveredEdgeKey: (hoveredEdgeKey) => set({ hoveredEdgeKey }),
    setPanelMode: (panelMode) => set({ panelMode }),
    setLeftOpen: (leftOpen) => set({ leftOpen }),
    setRightOpen: (rightOpen) => set({ rightOpen }),
    setBottomOpen: (bottomOpen) =>
      set({ bottomOpen: typeof bottomOpen === "function" ? bottomOpen(get().bottomOpen) : bottomOpen }),
    bumpRefitSignal: () => set((s) => ({ refitSignal: s.refitSignal + 1 })),
    bumpLayoutRevision: () => set((s) => ({ layoutRevision: s.layoutRevision + 1 })),
    setShowRelationshipLabels: (showRelationshipLabels) => set({ showRelationshipLabels }),
    resetToFocusEntry: (focusId) =>
      set({
        expandedRootIds: [focusId],
        focusId,
        selectedId: focusId,
        kinds: [],
        layers: [],
        predicates: [],
        maxDepth: DEFAULT_OBSERVATORY_MAX_DEPTH,
        maxNodes: DEFAULT_OBSERVATORY_MAX_NODES,
        includeRelated: DEFAULT_OBSERVATORY_INCLUDE_RELATED,
        pinnedIds: new Set(),
        pathFromId: null,
        pathToId: null,
        relationshipSelection: null,
        panelMode: "entity",
        hoveredEdgeKey: null,
        showRelationshipLabels: false,
      }),
    focusNode: (id, options) => {
      set((s) => ({
        focusId: id,
        selectedId: id,
        relationshipSelection: null,
        panelMode: "entity",
        hoveredEdgeKey: null,
        rightOpen: options?.openPanel ?? s.rightOpen,
      }));
    },
    selectNode: (id) => {
      set({
        selectedId: id,
        relationshipSelection: null,
        panelMode: id ? "entity" : "empty",
        hoveredEdgeKey: null,
      });
    },
    togglePin: (id) => {
      set((s) => {
        const next = new Set(s.pinnedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return { pinnedIds: next };
      });
    },
  }));
}
