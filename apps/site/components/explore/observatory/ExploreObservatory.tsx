"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";

import { ObservatoryBottomDock } from "@/components/explore/observatory/dock/ObservatoryBottomDock";
import { ObservatoryCompactFocusDock } from "@/components/explore/observatory/dock/ObservatoryCompactFocusDock";
import { ExploreFlowCanvas } from "@/components/explore/observatory/ExploreFlowCanvas";
import { ExploreObservatoryHub } from "@/components/explore/observatory/ExploreObservatoryHub";
import {
  useObservatoryFlowSync,
  type LayoutTidySnapshot,
} from "@/components/explore/observatory/hooks/useObservatoryFlowSync";
import { useObservatoryViz } from "@/components/explore/observatory/hooks/useObservatoryViz";
import { ObservatoryPaneToggle } from "@/components/explore/observatory/ObservatoryPaneToggle";
import { ObservatoryInterpretationPanel } from "@/components/explore/observatory/panel/ObservatoryInterpretationPanel";
import { createObservatoryStore } from "@/components/explore/observatory/state/observatoryStore";
import { useObservatoryTier } from "@/lib/explore/useObservatoryTier";
import { buildGraphIndex, type GraphNode } from "@/lib/graph/graph";
import {
  defaultFocusCanonicalId,
  distinctRelationshipPredicates,
  vizEdgeDedupKey,
} from "@/lib/graph/graphVizModel";
import { buildUndirectedAdjacency, shortestPathUndirected } from "@/lib/graph/graphPaths";
import {
  EXPLORE_VIEW_OBSERVATORY,
  edgeKeyFromSearchParams,
  exploreDefaultHomeFocalCanonicalId,
  exploreObservatoryFocusHref,
  explorePaths,
  exploreViewFromSearchParams,
  relationshipPresetFromSearchParams,
  type ExploreCompactView,
  type ExploreRelationshipPreset,
} from "@/lib/graph/explorePaths";
import {
  dynamicPredicateKeys,
  groupPredicatesByFamily,
  isSymmetricRelationship,
  STRUCTURAL_TENSION_PREDICATE,
  tensionPredicateKeys,
} from "@/lib/graph/relationshipTaxonomy";
import type { OntologyLens } from "@/lib/graph/ontology";
import { isAtFreshFocusEntry } from "@/lib/observatory/focusEntry";
import { entityFocusSummary, relationshipFocusSummary } from "@/lib/observatory/focusSummary";
import { computeNeighborhoodSignals } from "@/lib/observatory/neighborhoodSignals";
import {
  relationshipForEdgeKey,
  relationshipSelectionFromRelationship,
} from "@/lib/observatory/relationshipSelection";
import {
  normalizePredicateKey,
  formatRelationshipLabelForDisplay,
} from "@/lib/graph/relationshipVisuals";
import type { GraphEntityKind, Relationship, SemanticGraph } from "@/types/semanticGraph";
import type { SemanticFlowEdgeData } from "@/components/explore/observatory/SemanticFlowEdge";
import type { SemanticFlowNodeData } from "@/components/explore/observatory/SemanticFlowNode";
import type { FocusCameraTarget } from "@/components/explore/observatory/hooks/useFocusCamera";
import type { InsightEdge } from "@/lib/graph/graphInsights";
import { trackSelectContent } from "@/lib/analytics/track";

const ALL_KINDS: GraphEntityKind[] = [
  "concept",
  "pattern",
  "situation",
  "book",
  "source",
  "thinker",
];

function undirectedPairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function pickRandomCanonicalId(
  index: ReturnType<typeof buildGraphIndex>,
  kindsFilter: readonly GraphEntityKind[],
): string | null {
  const allowed = kindsFilter.length === 0 ? null : new Set(kindsFilter);
  const pool = [...index.idSet].filter((id) => {
    const n = index.getNodeByCanonicalId(id);
    if (!n) return false;
    if (allowed && !allowed.has(n.kind)) return false;
    return true;
  });
  if (pool.length === 0) return defaultFocusCanonicalId(index);
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export type ExploreObservatoryProps = {
  initialGraph: SemanticGraph;
  coverBySlug?: Record<string, string | undefined>;
  initialFocusCanonicalId?: string | null;
};

function hasGraphContent(graph: SemanticGraph): boolean {
  return (
    graph.glossary.length +
      graph.patterns.length +
      graph.books.length +
      graph.sources.length +
      graph.relationships.length >
    0
  );
}

function ObservatoryEmpty() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-lg flex-col justify-center px-6 py-20 text-center">
      <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Semantic observatory</p>
      <h1 className="mt-5 font-display text-3xl font-medium text-fg">The atlas is still quiet</h1>
      <p className="mt-6 text-sm leading-relaxed text-muted">
        When the release manifest publishes concepts and relationships, this room becomes a
        navigable semantic landscape.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm">
        <Link
          className="text-accent underline-offset-4 hover:underline"
          href={explorePaths.concepts}
        >
          Concepts
        </Link>
        <Link
          className="text-accent underline-offset-4 hover:underline"
          href={explorePaths.patterns}
        >
          Patterns
        </Link>
        <Link className="text-accent underline-offset-4 hover:underline" href={explorePaths.books}>
          Books
        </Link>
      </div>
    </div>
  );
}

function resolveCompactView(params: URLSearchParams): ExploreCompactView {
  return exploreViewFromSearchParams(params);
}

function useObservatoryStoreApi(seed: {
  focusId: string | null;
  selectedId: string | null;
  expandedRootIds: string[];
}) {
  const [store] = useState(() => createObservatoryStore(seed));
  return store;
}

function ExploreObservatoryInner({
  initialGraph,
  coverBySlug = {},
  initialFocusCanonicalId = null,
}: ExploreObservatoryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tier, isCompact } = useObservatoryTier();
  const index = useMemo(() => buildGraphIndex(initialGraph), [initialGraph]);
  const defaultFocal = useMemo(() => defaultFocusCanonicalId(index), [index]);

  const seedFocus =
    initialFocusCanonicalId && index.getNodeByCanonicalId(initialFocusCanonicalId)
      ? initialFocusCanonicalId
      : (exploreDefaultHomeFocalCanonicalId(index) ?? defaultFocal);

  const store = useObservatoryStoreApi({
    focusId: seedFocus,
    selectedId: seedFocus,
    expandedRootIds: seedFocus ? [seedFocus] : [],
  });

  const expandedRootIds = store((s) => s.expandedRootIds);
  const kinds = store((s) => s.kinds);
  const layers = store((s) => s.layers);
  const predicates = store((s) => s.predicates);
  const ontologyLens = store((s) => s.ontologyLens);
  const maxDepth = store((s) => s.maxDepth);
  const maxNodes = store((s) => s.maxNodes);
  const includeRelated = store((s) => s.includeRelated);
  const pinnedIds = store((s) => s.pinnedIds);
  const focusId = store((s) => s.focusId);
  const selectedId = store((s) => s.selectedId);
  const pathFromId = store((s) => s.pathFromId);
  const pathToId = store((s) => s.pathToId);
  const relationshipSelection = store((s) => s.relationshipSelection);
  const panelMode = store((s) => s.panelMode);
  const leftOpen = store((s) => s.leftOpen);
  const rightOpen = store((s) => s.rightOpen);
  const bottomOpen = store((s) => s.bottomOpen);
  const compactFocusOpen = store((s) => s.compactFocusOpen);
  const refitSignal = store((s) => s.refitSignal);
  const layoutRevision = store((s) => s.layoutRevision);
  const hoveredEdgeKey = store((s) => s.hoveredEdgeKey);
  const showRelationshipLabels = store((s) => s.showRelationshipLabels);
  const desktopPanesBootstrapped = useRef(false);

  useLayoutEffect(() => {
    if (isCompact || desktopPanesBootstrapped.current) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    if (!mq.matches) return;
    desktopPanesBootstrapped.current = true;
    const s = store.getState();
    if (!s.leftOpen) s.setLeftOpen(true);
    if (!s.rightOpen) s.setRightOpen(true);
  }, [isCompact, store]);

  const canvasLayoutKey = `${leftOpen}-${rightOpen}`;

  const lgGridClass = useMemo(() => {
    if (leftOpen && rightOpen)
      return "lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,18rem)]";
    if (leftOpen) return "lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]";
    if (rightOpen) return "lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]";
    return "lg:grid-cols-1";
  }, [leftOpen, rightOpen]);

  const mainGridColClass = useMemo(() => {
    if (leftOpen && rightOpen) return "lg:col-start-2";
    if (leftOpen) return "lg:col-start-2";
    return "lg:col-start-1";
  }, [leftOpen, rightOpen]);

  const rightAsideColClass = useMemo(() => {
    if (!rightOpen) return "";
    if (leftOpen) return "lg:col-start-3";
    return "lg:col-start-2";
  }, [leftOpen, rightOpen]);

  const urlFocusFromQuery = initialFocusCanonicalId != null;
  const deepLinkSeedId = useMemo(() => {
    if (initialFocusCanonicalId && index.getNodeByCanonicalId(initialFocusCanonicalId)) {
      return initialFocusCanonicalId;
    }
    return null;
  }, [index, initialFocusCanonicalId]);

  const compactView = useMemo((): ExploreCompactView => {
    if (!isCompact) return "hub";
    return resolveCompactView(new URLSearchParams(searchParams.toString()));
  }, [isCompact, searchParams]);

  const { viz, effectiveFocusId } = useObservatoryViz({
    index,
    focusId,
    expandedRootIds,
    kinds,
    layers,
    predicates,
    ontologyLens,
    maxDepth,
    maxNodes,
    includeRelated,
    pinnedIds,
    tier,
  });

  const pathChain = useMemo(() => {
    if (!pathFromId || !pathToId) return null;
    const nodeSet = new Set(viz.nodeIds);
    const pairs = viz.edges.map((e) => ({ a: e.sourceId, b: e.targetId }));
    const adj = buildUndirectedAdjacency(pairs, nodeSet);
    return shortestPathUndirected(adj, pathFromId, pathToId);
  }, [pathFromId, pathToId, viz]);

  const pathNodeIds = useMemo(() => new Set(pathChain ?? []), [pathChain]);
  const pathPairKeys = useMemo(() => {
    const s = new Set<string>();
    if (!pathChain) return s;
    for (let i = 0; i < pathChain.length - 1; i += 1) {
      s.add(undirectedPairKey(pathChain[i]!, pathChain[i + 1]!));
    }
    return s;
  }, [pathChain]);

  const signals = useMemo(() => {
    const vis = new Set(viz.nodeIds);
    return computeNeighborhoodSignals(index, vis, initialGraph.relationships);
  }, [index, viz.nodeIds, initialGraph.relationships]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<SemanticFlowNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<SemanticFlowEdgeData>>([]);
  const layoutTidyRef = useRef<LayoutTidySnapshot | null>(null);
  const lastTrackedFocusRef = useRef<string | null>(null);

  const trackCanvasFocus = useCallback(
    (canonicalId: string) => {
      if (lastTrackedFocusRef.current === canonicalId) return;
      lastTrackedFocusRef.current = canonicalId;
      const gn = index.getNodeByCanonicalId(canonicalId);
      if (!gn) return;
      trackSelectContent({ content_type: gn.kind, item_id: gn.slug, method: "canvas" });
    },
    [index],
  );

  useObservatoryFlowSync({
    index,
    viz,
    effectiveFocusId,
    selectedId,
    pinnedIds,
    pathNodeIds,
    pathPairKeys,
    relationshipSelection,
    hoveredEdgeKey,
    showRelationshipLabels,
    layoutRevision,
    layoutTidyRef,
    setNodes,
    setEdges,
  });

  const predicateOptions = useMemo(
    () => distinctRelationshipPredicates(initialGraph),
    [initialGraph],
  );
  const groupedPredicates = useMemo(() => groupPredicatesByFamily(initialGraph), [initialGraph]);
  const allPredicateKeys = useMemo(
    () => [...new Set(predicateOptions.map((p) => normalizePredicateKey(p)))],
    [predicateOptions],
  );
  const hasOntology = Boolean(
    initialGraph.ontology?.masterTerms.length || initialGraph.ontology?.structuralPressures.length,
  );

  const applyRelationshipPreset = useCallback(
    (preset: ExploreRelationshipPreset) => {
      if (preset === "tensions") {
        store.getState().setPredicates(tensionPredicateKeys(initialGraph));
      } else {
        store.getState().setPredicates(dynamicPredicateKeys(initialGraph));
      }
    },
    [initialGraph, store],
  );

  useEffect(() => {
    const preset = relationshipPresetFromSearchParams(new URLSearchParams(searchParams.toString()));
    if (!preset) return;
    applyRelationshipPreset(preset);
  }, [searchParams, applyRelationshipPreset]);

  const selectedNode: GraphNode | null = selectedId ? index.getNodeByCanonicalId(selectedId) : null;

  const highlightedRelationshipKey = relationshipSelection?.edgeKey ?? null;

  useEffect(() => {
    const edgeKey = edgeKeyFromSearchParams(new URLSearchParams(searchParams.toString()));
    if (!edgeKey) return;
    const match = viz.edges.find(
      (e) => vizEdgeDedupKey(e.sourceId, e.targetId, e.relationship) === edgeKey,
    );
    if (!match) return;
    const sel = relationshipForEdgeKey(
      index,
      edgeKey,
      match.sourceId,
      match.targetId,
      match.relationship,
      match.description,
      match.weight,
    );
    store.getState().selectRelationship(sel);
    store.getState().setFocusId(match.sourceId);
    trackCanvasFocus(match.sourceId);
  }, [index, searchParams, viz.edges, store, trackCanvasFocus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") store.getState().clearRelationship();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store]);

  const cameraTarget: FocusCameraTarget = relationshipSelection
    ? {
        type: "relationship",
        nodeIds: [relationshipSelection.sourceId, relationshipSelection.targetId],
      }
    : effectiveFocusId
      ? { type: "node", nodeId: effectiveFocusId }
      : null;

  const handleTidyLayout = useCallback(() => {
    const fid = effectiveFocusId ?? viz.nodeIds[0] ?? "";
    if (!fid || viz.nodeIds.length === 0) return;
    const atRevision = store.getState().layoutRevision + 1;
    layoutTidyRef.current = {
      type: "preserve-pins",
      atRevision,
      pins: new Map(
        nodes.filter((n) => pinnedIds.has(n.id)).map((n) => [n.id, n.position] as const),
      ),
    };
    store.getState().bumpLayoutRevision();
  }, [effectiveFocusId, viz.nodeIds, nodes, pinnedIds, store]);

  const handleFocusZoom = useCallback(() => {
    store.getState().bumpRefitSignal();
  }, [store]);

  const atFreshFocusEntry = isAtFreshFocusEntry(
    {
      expandedRootIds,
      focusId,
      pinnedCount: pinnedIds.size,
      pathFromId,
      pathToId,
      relationshipSelection,
      kinds,
      layers,
      predicates,
      maxDepth,
      maxNodes,
      includeRelated,
    },
    effectiveFocusId,
  );

  const canPrune = effectiveFocusId != null && !atFreshFocusEntry;

  const handlePrune = useCallback(() => {
    const fid = effectiveFocusId;
    if (!fid) return;
    const gn = index.getNodeByCanonicalId(fid);
    if (!gn) return;

    store.getState().resetToFocusEntry(fid);
    setNodes([]);
    const atRevision = store.getState().layoutRevision + 1;
    layoutTidyRef.current = {
      type: "preserve-pins",
      atRevision,
      pins: new Map(),
    };
    store.getState().bumpLayoutRevision();

    const href = exploreObservatoryFocusHref(gn.kind, gn.slug);
    router.replace(href, { scroll: false });
  }, [effectiveFocusId, index, router, setNodes, store]);

  const onPanelRelationshipHighlight = useCallback(
    (r: Relationship) => {
      const sel = relationshipSelectionFromRelationship(index, r);
      if (!sel) return;
      const cur = store.getState().relationshipSelection;
      if (cur?.edgeKey === sel.edgeKey) {
        store.getState().clearRelationship();
      } else {
        store.getState().selectRelationship(sel);
        if (!isSymmetricRelationship(r.relationship)) {
          store.getState().setFocusId(sel.sourceId);
          trackCanvasFocus(sel.sourceId);
        }
        if (!isCompact) store.getState().setRightOpen(true);
      }
    },
    [index, isCompact, store, trackCanvasFocus],
  );

  const onFocusRelationshipEndpoint = useCallback(
    (canonicalId: string) => {
      store.getState().focusNode(canonicalId, { openPanel: !isCompact });
      trackCanvasFocus(canonicalId);
      if (!isCompact) store.getState().setRightOpen(true);
    },
    [isCompact, store, trackCanvasFocus],
  );

  const handleEdgeClick = useCallback(
    (edgeKey: string) => {
      const match = viz.edges.find(
        (e) => vizEdgeDedupKey(e.sourceId, e.targetId, e.relationship) === edgeKey,
      );
      if (!match) return;
      const sel = relationshipForEdgeKey(
        index,
        edgeKey,
        match.sourceId,
        match.targetId,
        match.relationship,
        match.description,
        match.weight,
      );
      const cur = store.getState().relationshipSelection;
      if (cur?.edgeKey === edgeKey) {
        store.getState().clearRelationship();
      } else {
        store.getState().selectRelationship(sel);
        if (!isSymmetricRelationship(match.relationship)) {
          store.getState().setFocusId(match.sourceId);
          trackCanvasFocus(match.sourceId);
        }
        if (!isCompact) store.getState().setRightOpen(true);
      }
    },
    [index, viz.edges, isCompact, store, trackCanvasFocus],
  );

  const handleSignalEdge = useCallback(
    (edge: InsightEdge) => {
      const key = vizEdgeDedupKey(edge.sourceId, edge.targetId, edge.relationship);
      handleEdgeClick(key);
    },
    [handleEdgeClick],
  );

  const handleNodeClick = useCallback(
    (id: string) => {
      store.getState().setExpandedRootIds((prev) => {
        if (prev.length === 0) return prev;
        return prev.includes(id) ? prev : [...prev, id];
      });
      store.getState().focusNode(id, { openPanel: !isCompact });
      trackCanvasFocus(id);
      if (!isCompact) store.getState().setRightOpen(true);
    },
    [isCompact, store, trackCanvasFocus],
  );

  const handleNodeDoubleClick = useCallback(
    (id: string) => {
      const gn = index.getNodeByCanonicalId(id);
      if (!gn) return;
      const href = exploreObservatoryFocusHref(gn.kind, gn.slug);
      if (typeof window !== "undefined") {
        const cur = new URL(window.location.href);
        const nxt = new URL(href, window.location.origin);
        const sameFocus =
          cur.pathname === nxt.pathname &&
          cur.searchParams.get("focusKind") === nxt.searchParams.get("focusKind") &&
          cur.searchParams.get("focusSlug") === nxt.searchParams.get("focusSlug");
        if (sameFocus) {
          store.getState().setExpandedRootIds([id]);
          store.getState().focusNode(id);
          store.getState().setRightOpen(false);
          return;
        }
      }
      router.push(href);
    },
    [index, router, store],
  );

  const handlePaneClick = useCallback(() => {
    store.getState().clearRelationship();
    store.getState().selectNode(null);
  }, [store]);

  const enterCompactObservatory = useCallback(() => {
    store.getState().setExpandedRootIds((prev) => {
      if (prev.length > 0) return prev;
      const home = exploreDefaultHomeFocalCanonicalId(index) ?? defaultFocal;
      if (home) {
        store.getState().focusNode(home);
        return [home];
      }
      return prev;
    });
    const url = new URL(window.location.href);
    url.searchParams.set("view", EXPLORE_VIEW_OBSERVATORY);
    router.push(`${url.pathname}${url.search}`, { scroll: false });
  }, [index, defaultFocal, router, store]);

  const exitCompactObservatory = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("view");
    router.replace(`${url.pathname}${url.search}` || url.pathname, { scroll: false });
  }, [router]);

  const toggleKind = useCallback(
    (k: GraphEntityKind) => {
      store.getState().setKinds((prev) => {
        if (prev.length === 0) return ALL_KINDS.filter((x) => x !== k);
        if (prev.includes(k)) {
          const next = prev.filter((x) => x !== k);
          return next.length === 0 ? [] : next;
        }
        const next = [...prev, k];
        return next.length === ALL_KINDS.length ? [] : next;
      });
    },
    [store],
  );

  const togglePredicate = useCallback(
    (raw: string) => {
      const key = normalizePredicateKey(raw);
      store.getState().setPredicates((prev) => {
        if (prev.length === 0 && allPredicateKeys.length > 0) {
          const full = new Set(allPredicateKeys);
          full.delete(key);
          return [...full];
        }
        if (prev.includes(key)) {
          const next = prev.filter((p) => p !== key);
          return next.length === 0 ? [] : next;
        }
        return [...prev, key];
      });
    },
    [allPredicateKeys, store],
  );

  const resetAll = useCallback(() => {
    store.getState().setKinds([]);
    store.getState().setLayers([]);
    store.getState().setPredicates([]);
    store.getState().setMaxDepth(2);
    store.getState().setMaxNodes(36);
    store.getState().setIncludeRelated(true);
    store.getState().setPinnedIds(new Set());
    store.getState().setPathFromId(null);
    store.getState().setPathToId(null);
    store.getState().clearRelationship();
    if (urlFocusFromQuery && deepLinkSeedId) {
      store.getState().setExpandedRootIds([deepLinkSeedId]);
      store.getState().focusNode(deepLinkSeedId);
    } else {
      const home = exploreDefaultHomeFocalCanonicalId(index);
      if (home) {
        store.getState().setExpandedRootIds([home]);
        store.getState().focusNode(home);
      } else {
        store.getState().setExpandedRootIds([]);
        if (defaultFocal) store.getState().focusNode(defaultFocal);
      }
    }
  }, [index, urlFocusFromQuery, deepLinkSeedId, defaultFocal, store]);

  const surprise = () => {
    const pick = pickRandomCanonicalId(index, kinds);
    if (pick == null) return;
    store.getState().setExpandedRootIds([pick]);
    store.getState().focusNode(pick, { openPanel: true });
    store.getState().setRightOpen(true);
  };

  const showCompactObservatory = isCompact && compactView === "observatory";
  const showCompactPanel =
    showCompactObservatory && (panelMode === "entity" || panelMode === "relationship");

  let compactFocusSummary = "";
  if (panelMode === "relationship" && relationshipSelection) {
    compactFocusSummary = relationshipFocusSummary(index, relationshipSelection);
  } else if (panelMode === "entity" && selectedNode) {
    compactFocusSummary = entityFocusSummary(selectedNode);
  }

  const flowCanvas = (
    <ExploreFlowCanvas
      nodes={nodes}
      edges={edges}
      cameraTarget={cameraTarget}
      refitSignal={refitSignal}
      layoutRevision={layoutRevision}
      canvasLayoutKey={canvasLayoutKey}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      onEdgeClick={handleEdgeClick}
      onEdgeMouseEnter={(key) => store.getState().setHoveredEdgeKey(key)}
      onPaneClick={handlePaneClick}
      onTidyLayout={handleTidyLayout}
      onFocusZoom={handleFocusZoom}
      canFocusZoom={cameraTarget != null}
      onPrune={handlePrune}
      canPrune={canPrune}
      fullHeight={showCompactObservatory}
    />
  );

  if (isCompact && compactView === "hub") {
    return <ExploreObservatoryHub onEnterObservatory={enterCompactObservatory} />;
  }

  return (
    <div className="relative flex min-h-[calc(100dvh-5rem)] flex-col border-b border-border/30 bg-bg lg:h-[calc(100dvh-4rem)] lg:min-h-0 lg:max-h-[calc(100dvh-4rem)] lg:overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,var(--glow),transparent)]"
        aria-hidden
      />

      {showCompactObservatory ? (
        <div className="fixed inset-x-0 bottom-0 top-16 z-50 flex flex-col bg-bg">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/30 px-4 py-3">
            <p className="font-display text-sm text-fg">Observatory</p>
            <button
              type="button"
              className="rounded-sm border border-border px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-fg hover:border-accent/45"
              onClick={exitCompactObservatory}
            >
              Exit
            </button>
          </div>
          <div className="relative min-h-0 flex-1">{flowCanvas}</div>
          {showCompactPanel ? (
            <ObservatoryCompactFocusDock
              summary={compactFocusSummary}
              isOpen={compactFocusOpen}
              onToggle={() => store.getState().setCompactFocusOpen(!compactFocusOpen)}
              onSummaryClick={() => {
                if (!compactFocusOpen) store.getState().setCompactFocusOpen(true);
              }}
            >
              <ObservatoryInterpretationPanel
                index={index}
                panelMode={panelMode}
                node={selectedNode}
                relationshipSelection={relationshipSelection}
                coverBySlug={coverBySlug}
                highlightedRelationshipKey={highlightedRelationshipKey}
                isPinned={selectedId ? pinnedIds.has(selectedId) : false}
                onHighlightRelationship={onPanelRelationshipHighlight}
                onTogglePin={(id) => store.getState().togglePin(id)}
                onFocusRelationshipEndpoint={onFocusRelationshipEndpoint}
              />
            </ObservatoryCompactFocusDock>
          ) : null}
        </div>
      ) : null}

      {!isCompact ? (
        <div
          className={[
            "relative z-10 flex min-h-0 flex-1 flex-col lg:grid lg:min-h-0 lg:max-h-full lg:grid-rows-[minmax(0,1fr)_auto]",
            lgGridClass,
          ].join(" ")}
        >
          <div className="hidden items-center justify-between gap-2 border-b border-border/30 px-4 py-3 lg:hidden">
            <button
              type="button"
              className="rounded-sm border border-border px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-fg"
              onClick={() => store.getState().setLeftOpen(true)}
            >
              Atlas
            </button>
            <p className="text-center font-display text-sm text-fg">Explore</p>
            <button
              type="button"
              className="rounded-sm border border-border px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-fg"
              onClick={() => store.getState().setRightOpen(true)}
            >
              Focus
            </button>
          </div>

          <div
            className={[
              "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
              leftOpen ? "opacity-100" : "pointer-events-none opacity-0",
            ].join(" ")}
            aria-hidden={!leftOpen}
            onClick={() => store.getState().setLeftOpen(false)}
          />
          <aside
            className={[
              "relative fixed bottom-0 left-0 top-16 z-50 w-[min(18rem,88vw)] overflow-y-auto border-r border-border/40 bg-bg/98 p-5 shadow-2xl transition-transform duration-300 lg:static lg:z-0 lg:row-span-2 lg:row-start-1 lg:col-start-1 lg:max-h-full lg:min-h-0 lg:w-auto lg:overflow-y-auto lg:border-r lg:bg-transparent lg:p-6 lg:shadow-none",
              leftOpen ? "translate-x-0 lg:flex lg:flex-col" : "-translate-x-full lg:hidden",
            ].join(" ")}
          >
            <ObservatoryPaneToggle
              side="left"
              expanded={leftOpen}
              onToggle={() => store.getState().setLeftOpen(!leftOpen)}
              placement="panel"
              label={leftOpen ? "Collapse atlas panel" : "Expand atlas panel"}
            />
            <div className="space-y-10">
              <button
                type="button"
                className="mb-2 text-[11px] uppercase tracking-[0.2em] text-accent lg:hidden"
                onClick={() => store.getState().setLeftOpen(false)}
              >
                Close
              </button>
              <section className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.26em] text-muted">
                  Explore the landscape
                </p>
                <nav className="flex flex-col gap-2 text-sm text-fg">
                  <Link
                    className="hover:text-accent"
                    href={explorePaths.concepts}
                    onClick={() => store.getState().setLeftOpen(false)}
                  >
                    Core concepts
                  </Link>
                  <Link
                    className="hover:text-accent"
                    href={explorePaths.patterns}
                    onClick={() => store.getState().setLeftOpen(false)}
                  >
                    Patterns
                  </Link>
                  <Link
                    className="hover:text-accent"
                    href={explorePaths.books}
                    onClick={() => store.getState().setLeftOpen(false)}
                  >
                    Books
                  </Link>
                  <Link
                    className="hover:text-accent"
                    href={explorePaths.thinkers}
                    onClick={() => store.getState().setLeftOpen(false)}
                  >
                    Thinkers
                  </Link>
                  <Link
                    className="hover:text-accent"
                    href={explorePaths.sources}
                    onClick={() => store.getState().setLeftOpen(false)}
                  >
                    Sources
                  </Link>
                </nav>
              </section>

              <section className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.26em] text-muted">Entity kinds</p>
                <div className="flex flex-col gap-2 text-sm">
                  {ALL_KINDS.map((k) => (
                    <label key={k} className="flex cursor-pointer items-center gap-2 text-fg">
                      <input
                        type="checkbox"
                        className="accent-accent"
                        checked={kinds.length === 0 || kinds.includes(k)}
                        onChange={() => toggleKind(k)}
                      />
                      <span className="capitalize">{k}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.26em] text-muted">
                  Filter by relationship
                </p>
                {predicateOptions.length === 0 ? (
                  <p className="text-sm text-muted">No typed relationships in the graph yet.</p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-sm border border-border px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-fg hover:border-accent/45"
                        onClick={() => store.getState().setPredicates([])}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        className="rounded-sm border border-border px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-fg hover:border-accent/45"
                        onClick={() => applyRelationshipPreset("tensions")}
                      >
                        Tensions only
                      </button>
                      <button
                        type="button"
                        className="rounded-sm border border-border px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-fg hover:border-accent/45"
                        onClick={() => applyRelationshipPreset("dynamics")}
                      >
                        Dynamics only
                      </button>
                    </div>
                    <div className="max-h-56 space-y-4 overflow-y-auto text-sm">
                      {groupedPredicates.tension.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                            Structural tensions
                          </p>
                          <label className="flex cursor-pointer items-center gap-2 text-fg">
                            <input
                              type="checkbox"
                              className="accent-accent"
                              checked={
                                predicates.length === 0 ||
                                predicates.includes(STRUCTURAL_TENSION_PREDICATE)
                              }
                              onChange={() => togglePredicate(STRUCTURAL_TENSION_PREDICATE)}
                            />
                            <span className="leading-snug">All structural tensions</span>
                          </label>
                        </div>
                      ) : null}
                      {groupedPredicates.dynamic.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                            Dynamics
                          </p>
                          {groupedPredicates.dynamic.map((p) => {
                            const key = normalizePredicateKey(p);
                            const active = predicates.length === 0 || predicates.includes(key);
                            return (
                              <label
                                key={p}
                                className="flex cursor-pointer items-center gap-2 text-fg"
                              >
                                <input
                                  type="checkbox"
                                  className="accent-accent"
                                  checked={active}
                                  onChange={() => togglePredicate(p)}
                                />
                                <span className="leading-snug">
                                  {formatRelationshipLabelForDisplay(p)}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </section>

              {hasOntology ? (
                <section className="space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.26em] text-muted">
                    Ontology lens
                  </p>
                  <div className="space-y-2 text-sm">
                    {(
                      [
                        { lens: null, label: "Off" },
                        { lens: "master" as OntologyLens, label: "Master terms" },
                        { lens: "pressure" as OntologyLens, label: "Structural pressures" },
                      ] as const
                    ).map(({ lens, label }) => (
                      <label key={label} className="flex cursor-pointer items-center gap-2 text-fg">
                        <input
                          type="radio"
                          name="ontology-lens"
                          className="accent-accent"
                          checked={ontologyLens === lens}
                          onChange={() => store.getState().setOntologyLens(lens)}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.26em] text-muted">Graph controls</p>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-fg">
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={showRelationshipLabels}
                    onChange={() =>
                      store.getState().setShowRelationshipLabels(!showRelationshipLabels)
                    }
                  />
                  Show relationship labels
                </label>
                <label className="block text-[11px] text-muted">
                  Neighborhood depth · {maxDepth}
                  <input
                    type="range"
                    min={1}
                    max={3}
                    value={maxDepth}
                    className="mt-2 w-full accent-accent"
                    onChange={(e) => store.getState().setMaxDepth(Number(e.target.value))}
                  />
                </label>
                <label className="block text-[11px] text-muted">
                  Density cap · {maxNodes} nodes
                  <input
                    type="range"
                    min={12}
                    max={72}
                    step={6}
                    value={maxNodes}
                    className="mt-2 w-full accent-accent"
                    onChange={(e) => store.getState().setMaxNodes(Number(e.target.value))}
                  />
                </label>
                {expandedRootIds.length === 0 ? (
                  <p className="text-[11px] leading-relaxed text-muted">
                    The canvas is a focal neighborhood, not the full index — part of the cap is
                    reserved so volumes stay visible even when concepts fill the walk.
                  </p>
                ) : null}
                <label className="flex cursor-pointer items-center gap-2 text-sm text-fg">
                  <input
                    type="checkbox"
                    className="accent-accent"
                    checked={includeRelated}
                    onChange={() => store.getState().setIncludeRelated(!includeRelated)}
                  />
                  Related links
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-sm border border-border px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-fg hover:border-accent/45 disabled:cursor-not-allowed disabled:opacity-45"
                    onClick={handleFocusZoom}
                    disabled={cameraTarget == null}
                  >
                    Focus zoom
                  </button>
                  <button
                    type="button"
                    className="rounded-sm border border-border px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-fg hover:border-accent/45 disabled:cursor-not-allowed disabled:opacity-45"
                    onClick={handlePrune}
                    disabled={!canPrune}
                  >
                    Prune
                  </button>
                  <button
                    type="button"
                    className="rounded-sm border border-border px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-fg hover:border-accent/45"
                    onClick={handleTidyLayout}
                  >
                    Spread layout
                  </button>
                  <button
                    type="button"
                    className="rounded-sm border border-border px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-fg hover:border-accent/45"
                    onClick={resetAll}
                  >
                    Reset focus
                  </button>
                  <button
                    type="button"
                    className="rounded-sm border border-border px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-accent hover:border-accent/45"
                    onClick={surprise}
                  >
                    Surprise me
                  </button>
                </div>
              </section>
            </div>
          </aside>

          <main
            className={[
              "relative flex min-h-0 min-w-0 flex-col border-border/30 lg:row-start-1 lg:min-h-0 lg:overflow-hidden",
              mainGridColClass,
              leftOpen || rightOpen ? "lg:border-x" : "",
            ].join(" ")}
          >
            {!leftOpen ? (
              <ObservatoryPaneToggle
                side="left"
                expanded={false}
                onToggle={() => store.getState().setLeftOpen(true)}
                placement="canvas"
                label="Expand atlas panel"
                className="hidden lg:flex"
              />
            ) : null}
            {!rightOpen ? (
              <ObservatoryPaneToggle
                side="right"
                expanded={false}
                onToggle={() => store.getState().setRightOpen(true)}
                placement="canvas"
                label="Expand focus panel"
                className="hidden lg:flex"
              />
            ) : null}
            <div className="min-h-0 flex-1 lg:min-h-0">{flowCanvas}</div>
          </main>

          <div
            className={[
              "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
              rightOpen ? "opacity-100" : "pointer-events-none opacity-0",
            ].join(" ")}
            aria-hidden={!rightOpen}
            onClick={() => store.getState().setRightOpen(false)}
          />
          <aside
            className={[
              "relative fixed bottom-0 right-0 top-16 z-50 w-[min(20rem,92vw)] overflow-y-auto border-l border-border/40 bg-bg/98 p-5 shadow-2xl transition-transform duration-300 lg:static lg:z-0 lg:row-span-2 lg:row-start-1 lg:max-h-full lg:min-h-0 lg:w-auto lg:overflow-y-auto lg:border-l lg:bg-transparent lg:p-6 lg:shadow-none",
              rightOpen
                ? ["translate-x-0 lg:flex lg:flex-col", rightAsideColClass].join(" ")
                : "translate-x-full lg:hidden",
            ].join(" ")}
          >
            <ObservatoryPaneToggle
              side="right"
              expanded={rightOpen}
              onToggle={() => store.getState().setRightOpen(!rightOpen)}
              placement="panel"
              label={rightOpen ? "Collapse focus panel" : "Expand focus panel"}
            />
            <button
              type="button"
              className="mb-4 text-[11px] uppercase tracking-[0.2em] text-accent lg:hidden"
              onClick={() => store.getState().setRightOpen(false)}
            >
              Close
            </button>
            <ObservatoryInterpretationPanel
              index={index}
              panelMode={panelMode}
              node={selectedNode}
              relationshipSelection={relationshipSelection}
              coverBySlug={coverBySlug}
              highlightedRelationshipKey={highlightedRelationshipKey}
              isPinned={selectedId ? pinnedIds.has(selectedId) : false}
              onHighlightRelationship={onPanelRelationshipHighlight}
              onTogglePin={(id) => store.getState().togglePin(id)}
              onRelatedTerrainLinkNavigate={() => store.getState().setRightOpen(false)}
              onFocusRelationshipEndpoint={onFocusRelationshipEndpoint}
            />
          </aside>

          <div className={["lg:row-start-2", mainGridColClass].join(" ")}>
            <ObservatoryBottomDock
              index={index}
              nodeIds={viz.nodeIds}
              pathFromId={pathFromId}
              pathToId={pathToId}
              pathChain={pathChain}
              signals={signals}
              isOpen={bottomOpen}
              onToggle={() => store.getState().setBottomOpen((o) => !o)}
              onPathFromChange={(id) => store.getState().setPathFromId(id)}
              onPathToChange={(id) => store.getState().setPathToId(id)}
              onSelectEdge={handleSignalEdge}
              onFocusNodeId={(id) => {
                store.getState().focusNode(id, { openPanel: true });
                store.getState().setRightOpen(true);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ExploreObservatory(props: ExploreObservatoryProps) {
  if (!hasGraphContent(props.initialGraph)) {
    return <ObservatoryEmpty />;
  }
  return (
    <ReactFlowProvider>
      <Suspense
        fallback={
          <div className="flex min-h-[calc(100dvh-5rem)] items-center justify-center text-sm text-muted">
            Loading observatory…
          </div>
        }
      >
        <ExploreObservatoryInner {...props} />
      </Suspense>
    </ReactFlowProvider>
  );
}
