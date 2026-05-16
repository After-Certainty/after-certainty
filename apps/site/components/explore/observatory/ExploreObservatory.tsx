"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";

import { ExploreFlowCanvas } from "@/components/explore/observatory/ExploreFlowCanvas";
import { ExploreObservatoryHub } from "@/components/explore/observatory/ExploreObservatoryHub";
import { ObservatoryEntityPanel } from "@/components/explore/observatory/ObservatoryEntityPanel";
import {
  progressiveNeighborsPerKindForTier,
  useObservatoryTier,
} from "@/lib/explore/useObservatoryTier";
import { buildGraphIndex, type GraphNode } from "@/lib/graph/graph";
import {
  buildGraphVizModel,
  buildProgressiveGraphVizModel,
  defaultFocusCanonicalId,
  distinctRelationshipPredicates,
  vizEdgeDedupKey,
} from "@/lib/graph/graphVizModel";
import { computeGraphInsights } from "@/lib/graph/graphInsights";
import { buildUndirectedAdjacency, shortestPathUndirected } from "@/lib/graph/graphPaths";
import { mergeNodePositions } from "@/lib/explore/observatoryLayout";
import {
  EXPLORE_VIEW_OBSERVATORY,
  exploreDefaultHomeFocalCanonicalId,
  exploreObservatoryFocusHref,
  explorePaths,
  exploreViewFromSearchParams,
  exploreHrefForCanonicalId,
  type ExploreCompactView,
} from "@/lib/graph/explorePaths";
import { relationshipEndpointsResolved } from "@/lib/graph/graphTraversal";
import { formatRelationshipLabelForDisplay, normalizePredicateKey } from "@/lib/graph/relationshipVisuals";
import type { GraphEntityKind, Relationship, SemanticGraph } from "@/types/semanticGraph";
import type { SemanticFlowEdgeData } from "@/components/explore/observatory/SemanticFlowEdge";
import type { SemanticFlowNodeData } from "@/components/explore/observatory/SemanticFlowNode";

const ALL_KINDS: GraphEntityKind[] = ["concept", "pattern", "book", "source"];

type LayoutTidySnapshot = { type: "preserve-pins"; pins: Map<string, { x: number; y: number }> };

/** Empty `kindsFilter` = all entity kinds (matches graph filter UI). */
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

function undirectedPairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export type ExploreObservatoryProps = {
  initialGraph: SemanticGraph;
  coverBySlug?: Record<string, string | undefined>;
  /** From `/explore?focusKind=&focusSlug=` when valid */
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
        When the release manifest publishes concepts and relationships, this room becomes a navigable semantic landscape.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm">
        <Link className="text-accent underline-offset-4 hover:underline" href={explorePaths.concepts}>
          Concepts
        </Link>
        <Link className="text-accent underline-offset-4 hover:underline" href={explorePaths.patterns}>
          Patterns
        </Link>
        <Link className="text-accent underline-offset-4 hover:underline" href={explorePaths.books}>
          Books
        </Link>
      </div>
    </div>
  );
}

/** Compact graph vs hub is controlled by `?view=observatory`, not focus params alone. */
function resolveCompactView(params: URLSearchParams): ExploreCompactView {
  return exploreViewFromSearchParams(params);
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
  const deepLinkSeedId = useMemo(() => {
    if (initialFocusCanonicalId && index.getNodeByCanonicalId(initialFocusCanonicalId)) {
      return initialFocusCanonicalId;
    }
    return null;
  }, [index, initialFocusCanonicalId]);

  /** True when `/explore?focusKind=&focusSlug=` resolved to a focal id (URL-driven focus). */
  const urlFocusFromQuery = initialFocusCanonicalId != null;

  const compactView = useMemo((): ExploreCompactView => {
    if (!isCompact) return "hub";
    return resolveCompactView(new URLSearchParams(searchParams.toString()));
  }, [isCompact, searchParams]);

  const [expandedRootIds, setExpandedRootIds] = useState<string[]>(() => {
    if (initialFocusCanonicalId != null && index.getNodeByCanonicalId(initialFocusCanonicalId)) {
      return [initialFocusCanonicalId];
    }
    const home = exploreDefaultHomeFocalCanonicalId(index);
    return home ? [home] : [];
  });

  const [kinds, setKinds] = useState<GraphEntityKind[]>([]);
  const [layers, setLayers] = useState<string[]>([]);
  const [predicates, setPredicates] = useState<string[]>([]);
  const [maxDepth, setMaxDepth] = useState(2);
  const [maxNodes, setMaxNodes] = useState(36);
  const [includeRelated, setIncludeRelated] = useState(true);
  const [pinned, setPinned] = useState<Set<string>>(() => new Set());

  const [focusId, setFocusId] = useState<string | null>(() => {
    if (initialFocusCanonicalId != null && index.getNodeByCanonicalId(initialFocusCanonicalId)) {
      return initialFocusCanonicalId;
    }
    return exploreDefaultHomeFocalCanonicalId(index) ?? defaultFocal;
  });
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (initialFocusCanonicalId != null && index.getNodeByCanonicalId(initialFocusCanonicalId)) {
      return initialFocusCanonicalId;
    }
    return exploreDefaultHomeFocalCanonicalId(index) ?? defaultFocal;
  });

  const [pathFromId, setPathFromId] = useState<string | null>(null);
  const [pathToId, setPathToId] = useState<string | null>(null);
  /** Matches {@link vizEdgeDedupKey} for an edge chosen from the focus panel. */
  const [panelEdgeHighlightKey, setPanelEdgeHighlightKey] = useState<string | null>(null);

  const setSelectedNodeId = useCallback((id: string | null) => {
    setPanelEdgeHighlightKey(null);
    setSelectedId(id);
  }, []);

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [bottomOpen, setBottomOpen] = useState(true);
  const [refitSignal, setRefitSignal] = useState(0);
  const [layoutRevision, setLayoutRevision] = useState(0);
  const layoutTidyRef = useRef<LayoutTidySnapshot | null>(null);

  const predicateOptions = useMemo(() => distinctRelationshipPredicates(initialGraph), [initialGraph]);
  const allPredicateKeys = useMemo(
    () => [...new Set(predicateOptions.map((p) => normalizePredicateKey(p)))],
    [predicateOptions],
  );

  const effectiveFocusId = useMemo(() => {
    if (focusId && index.getNodeByCanonicalId(focusId)) return focusId;
    return defaultFocusCanonicalId(index);
  }, [index, focusId]);

  const progressiveSubgraph = expandedRootIds.length > 0;
  const progressiveNeighborsPerKind = progressiveNeighborsPerKindForTier(tier);

  const enterCompactObservatory = useCallback(() => {
    setExpandedRootIds((prev) => {
      if (prev.length > 0) return prev;
      const home = exploreDefaultHomeFocalCanonicalId(index) ?? defaultFocal;
      if (home) {
        setFocusId(home);
        setSelectedNodeId(home);
        return [home];
      }
      return prev;
    });
    const url = new URL(window.location.href);
    url.searchParams.set("view", EXPLORE_VIEW_OBSERVATORY);
    router.push(`${url.pathname}${url.search}`, { scroll: false });
  }, [index, defaultFocal, router, setSelectedNodeId]);

  const exitCompactObservatory = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("view");
    const next = `${url.pathname}${url.search}`;
    router.replace(next || url.pathname, { scroll: false });
  }, [router]);

  const viz = useMemo(() => {
    const shelfPaddingBooks =
      progressiveSubgraph
        ? 0
        : kinds.length === 0 || kinds.includes("book")
          ? Math.min(16, Math.max(0, Math.floor(maxNodes * 0.4)))
          : 0;
    const opt = {
      focusCanonicalId: effectiveFocusId,
      maxDepth,
      maxNodes,
      kinds,
      layers,
      predicates,
      includeRelatedEntityLinks: includeRelated,
      pinnedCanonicalIds: [...pinned],
      shelfPaddingBooks,
      progressiveNeighborsPerKind: progressiveSubgraph ? progressiveNeighborsPerKind : undefined,
    };
    if (progressiveSubgraph) {
      return buildProgressiveGraphVizModel(index, opt, expandedRootIds);
    }
    return buildGraphVizModel(index, opt);
  }, [
    index,
    effectiveFocusId,
    maxDepth,
    maxNodes,
    kinds,
    layers,
    predicates,
    includeRelated,
    pinned,
    progressiveSubgraph,
    expandedRootIds,
    progressiveNeighborsPerKind,
  ]);

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

  const insights = useMemo(() => {
    const vis = new Set(viz.nodeIds);
    return computeGraphInsights(index, vis, initialGraph.relationships);
  }, [index, viz.nodeIds, initialGraph.relationships]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<SemanticFlowNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<SemanticFlowEdgeData>>([]);

  useEffect(() => {
    const fid = effectiveFocusId ?? viz.nodeIds[0] ?? "";
    if (!fid) {
      setNodes([]);
      setEdges([]);
      return;
    }
    setNodes((prev) => {
      const snapshot = layoutTidyRef.current;
      if (snapshot?.type === "preserve-pins") {
        layoutTidyRef.current = null;
      }
      const prevPos =
        snapshot?.type === "preserve-pins"
          ? snapshot.pins
          : new Map(prev.map((p) => [p.id, p.position]));
      const posMap = mergeNodePositions(fid, viz.nodeIds, prevPos);
      const next: Node<SemanticFlowNodeData>[] = [];
      for (const id of viz.nodeIds) {
        const gn = index.getNodeByCanonicalId(id);
        if (!gn) continue;
        next.push({
          id,
          type: "semantic",
          position: posMap.get(id) ?? { x: 0, y: 0 },
          draggable: !pinned.has(id),
          data: {
            graphNode: gn,
            isFocus: id === effectiveFocusId,
            isSelected: id === selectedId,
            isPinned: pinned.has(id),
            onPath: pathNodeIds.has(id),
            detailHref: exploreHrefForCanonicalId(index, id) ?? undefined,
          },
        });
      }
      return next;
    });

    setEdges(
      viz.edges.map((e) => ({
        id: e.id,
        source: e.sourceId,
        target: e.targetId,
        type: "semantic",
        data: {
          relationship: e.relationship,
          pathTraced: pathPairKeys.has(undirectedPairKey(e.sourceId, e.targetId)),
          panelSelected:
            panelEdgeHighlightKey != null &&
            panelEdgeHighlightKey === vizEdgeDedupKey(e.sourceId, e.targetId, e.relationship),
        },
      })),
    );
  }, [
    index,
    viz,
    effectiveFocusId,
    selectedId,
    pinned,
    pathNodeIds,
    pathPairKeys,
    panelEdgeHighlightKey,
    layoutRevision,
    setNodes,
    setEdges,
  ]);

  const handleTidyLayout = useCallback(() => {
    const fid = effectiveFocusId ?? viz.nodeIds[0] ?? "";
    if (!fid || viz.nodeIds.length === 0) return;
    layoutTidyRef.current = {
      type: "preserve-pins",
      pins: new Map(nodes.filter((n) => pinned.has(n.id)).map((n) => [n.id, n.position] as const)),
    };
    setLayoutRevision((r) => r + 1);
    setRefitSignal((s) => s + 1);
  }, [effectiveFocusId, viz.nodeIds, nodes, pinned]);

  const onPanelRelationshipHighlight = useCallback(
    (r: Relationship) => {
      const ends = relationshipEndpointsResolved(index, r);
      if (!ends) return;
      const key = vizEdgeDedupKey(ends.sourceId, ends.targetId, r.relationship);
      setPanelEdgeHighlightKey((prev) => (prev === key ? null : key));
    },
    [index],
  );

  const selectedNode: GraphNode | null = useMemo(() => {
    if (!selectedId) return null;
    return index.getNodeByCanonicalId(selectedId);
  }, [index, selectedId]);

  const handleNodeClick = useCallback(
    (id: string) => {
      setExpandedRootIds((prev) => {
        if (prev.length === 0) return prev;
        return prev.includes(id) ? prev : [...prev, id];
      });
      setSelectedNodeId(id);
      setFocusId(id);
      if (!isCompact) setRightOpen(true);
    },
    [isCompact, setSelectedNodeId],
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
          setExpandedRootIds([id]);
          setFocusId(id);
          setSelectedNodeId(id);
          setRefitSignal((s) => s + 1);
          setRightOpen(false);
          return;
        }
      }
      router.push(href);
    },
    [index, router, setSelectedNodeId],
  );

  const toggleKind = useCallback((k: GraphEntityKind) => {
    setKinds((prev) => {
      if (prev.length === 0) {
        return ALL_KINDS.filter((x) => x !== k);
      }
      if (prev.includes(k)) {
        const next = prev.filter((x) => x !== k);
        return next.length === 0 ? [] : next;
      }
      const next = [...prev, k];
      return next.length === ALL_KINDS.length ? [] : next;
    });
  }, []);

  const togglePredicate = useCallback(
    (raw: string) => {
      const key = normalizePredicateKey(raw);
      setPredicates((prev) => {
        if (prev.length === 0 && allPredicateKeys.length > 0) {
          const full = new Set(allPredicateKeys);
          full.delete(key);
          return [...full];
        }
        if (prev.includes(key)) {
          const next = prev.filter((p) => p !== key);
          if (next.length === 0) return [];
          return next;
        }
        return [...prev, key];
      });
    },
    [allPredicateKeys],
  );

  const resetAll = useCallback(() => {
    setKinds([]);
    setLayers([]);
    setPredicates([]);
    setMaxDepth(2);
    setMaxNodes(36);
    setIncludeRelated(true);
    setPinned(new Set());
    if (urlFocusFromQuery && deepLinkSeedId) {
      setExpandedRootIds([deepLinkSeedId]);
      setFocusId(deepLinkSeedId);
      setSelectedNodeId(deepLinkSeedId);
    } else {
      const home = exploreDefaultHomeFocalCanonicalId(index);
      if (home) {
        setExpandedRootIds([home]);
        setFocusId(home);
        setSelectedNodeId(home);
      } else {
        setExpandedRootIds([]);
        setFocusId(defaultFocal);
        setSelectedNodeId(defaultFocal);
      }
    }
    setPathFromId(null);
    setPathToId(null);
  }, [index, urlFocusFromQuery, deepLinkSeedId, defaultFocal, setSelectedNodeId]);

  const surprise = useCallback(() => {
    const pick = pickRandomCanonicalId(index, kinds);
    if (pick == null) return;
    setExpandedRootIds([pick]);
    setFocusId(pick);
    setSelectedNodeId(pick);
    setRightOpen(true);
  }, [index, kinds, setSelectedNodeId]);

  const togglePin = useCallback((id: string) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const showCompactObservatory = isCompact && compactView === "observatory";

  const flowCanvas = (
    <ExploreFlowCanvas
      nodes={nodes}
      edges={edges}
      focusId={effectiveFocusId}
      refitSignal={refitSignal}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      onPaneClick={() => setSelectedNodeId(null)}
      onTidyLayout={handleTidyLayout}
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
        </div>
      ) : null}

      {!isCompact ? (
      <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:grid lg:min-h-0 lg:max-h-full lg:grid-cols-[minmax(0,17rem)_1fr_minmax(0,18rem)] lg:grid-rows-[minmax(0,1fr)_auto]">
        {/* Mobile / tablet drawer toggles */}
        <div className="hidden items-center justify-between gap-2 border-b border-border/30 px-4 py-3 lg:hidden">
          <button
            type="button"
            className="rounded-sm border border-border px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-fg"
            onClick={() => setLeftOpen(true)}
          >
            Atlas
          </button>
          <p className="text-center font-display text-sm text-fg">Explore</p>
          <button
            type="button"
            className="rounded-sm border border-border px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-fg"
            onClick={() => setRightOpen(true)}
          >
            Focus
          </button>
        </div>

        {/* Left overlay */}
        <div
          className={[
            "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
            leftOpen ? "opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
          aria-hidden={!leftOpen}
          onClick={() => setLeftOpen(false)}
        />
        <aside
          className={[
            "fixed bottom-0 left-0 top-16 z-50 w-[min(18rem,88vw)] overflow-y-auto border-r border-border/40 bg-bg/98 p-5 shadow-2xl transition-transform duration-300 lg:static lg:z-0 lg:row-start-1 lg:col-start-1 lg:flex lg:max-h-full lg:min-h-0 lg:w-auto lg:translate-x-0 lg:overflow-y-auto lg:border-r lg:bg-transparent lg:p-6 lg:shadow-none",
            leftOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <div className="space-y-10">
            <button
              type="button"
              className="mb-2 text-[11px] uppercase tracking-[0.2em] text-accent lg:hidden"
              onClick={() => setLeftOpen(false)}
            >
              Close
            </button>
            <section className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.26em] text-muted">Explore the landscape</p>
              <nav className="flex flex-col gap-2 text-sm text-fg">
                <Link className="hover:text-accent" href={explorePaths.concepts} onClick={() => setLeftOpen(false)}>
                  Core concepts
                </Link>
                <Link className="hover:text-accent" href={explorePaths.patterns} onClick={() => setLeftOpen(false)}>
                  Patterns
                </Link>
                <Link className="hover:text-accent" href={explorePaths.books} onClick={() => setLeftOpen(false)}>
                  Books
                </Link>
                <Link className="hover:text-accent" href={explorePaths.sources} onClick={() => setLeftOpen(false)}>
                  Thinkers &amp; sources
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
              <p className="text-[11px] uppercase tracking-[0.26em] text-muted">Filter by relationship</p>
              {predicateOptions.length === 0 ? (
                <p className="text-sm text-muted">No typed relationships in the graph yet.</p>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto text-sm">
                  {predicateOptions.map((p) => {
                    const key = normalizePredicateKey(p);
                    const active = predicates.length === 0 || predicates.includes(key);
                    return (
                      <label key={p} className="flex cursor-pointer items-center gap-2 text-fg">
                        <input
                          type="checkbox"
                          className="accent-accent"
                          checked={active}
                          onChange={() => togglePredicate(p)}
                        />
                        <span className="leading-snug">{formatRelationshipLabelForDisplay(p)}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.26em] text-muted">Graph controls</p>
              <label className="block text-[11px] text-muted">
                Neighborhood depth · {maxDepth}
                <input
                  type="range"
                  min={1}
                  max={3}
                  value={maxDepth}
                  className="mt-2 w-full accent-accent"
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
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
                  onChange={(e) => setMaxNodes(Number(e.target.value))}
                />
              </label>
              {!progressiveSubgraph ? (
                <p className="text-[11px] leading-relaxed text-muted">
                  The canvas is a focal neighborhood, not the full index — part of the cap is reserved so volumes stay
                  visible even when concepts fill the walk.
                </p>
              ) : null}
              <label className="flex cursor-pointer items-center gap-2 text-sm text-fg">
                <input
                  type="checkbox"
                  className="accent-accent"
                  checked={includeRelated}
                  onChange={() => setIncludeRelated((v) => !v)}
                />
                Related links
              </label>
              <div className="flex flex-wrap gap-2">
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

        {/* Center */}
        <main className="relative flex min-h-0 min-w-0 flex-col border-border/30 lg:row-start-1 lg:col-start-2 lg:max-h-full lg:overflow-hidden lg:border-x">
          <div className="min-h-0 flex-1 lg:h-full lg:min-h-0">{flowCanvas}</div>
        </main>

        {/* Right overlay */}
        <div
          className={[
            "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
            rightOpen ? "opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
          aria-hidden={!rightOpen}
          onClick={() => setRightOpen(false)}
        />
        <aside
          className={[
            "fixed bottom-0 right-0 top-16 z-50 w-[min(20rem,92vw)] overflow-y-auto border-l border-border/40 bg-bg/98 p-5 shadow-2xl transition-transform duration-300 lg:static lg:z-0 lg:row-start-1 lg:col-start-3 lg:flex lg:max-h-full lg:min-h-0 lg:w-auto lg:translate-x-0 lg:overflow-y-auto lg:border-l lg:bg-transparent lg:p-6 lg:shadow-none",
            rightOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <button
            type="button"
            className="mb-4 text-[11px] uppercase tracking-[0.2em] text-accent lg:hidden"
            onClick={() => setRightOpen(false)}
          >
            Close
          </button>
          <ObservatoryEntityPanel
            index={index}
            node={selectedNode}
            coverBySlug={coverBySlug}
            highlightedRelationshipKey={panelEdgeHighlightKey}
            onHighlightRelationship={onPanelRelationshipHighlight}
            onTogglePin={togglePin}
            isPinned={selectedId ? pinned.has(selectedId) : false}
            onRelatedTerrainLinkNavigate={() => setRightOpen(false)}
          />
        </aside>

        {/* Bottom dock */}
        <section className="border-t border-border/30 bg-bg/80 px-4 py-4 lg:col-span-3 lg:row-start-2 lg:shrink-0 lg:px-8">
          <button
            type="button"
            className="mb-3 flex w-full items-center justify-between text-left text-[11px] uppercase tracking-[0.22em] text-muted lg:pointer-events-none lg:mb-0 lg:cursor-default"
            onClick={() => setBottomOpen((o) => !o)}
          >
            <span>Paths &amp; insights</span>
            <span className="lg:hidden">{bottomOpen ? "−" : "+"}</span>
          </button>
          <div className={["grid gap-8 lg:grid-cols-2", bottomOpen ? "block" : "hidden lg:grid"].join(" ")}>
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Path in current view</p>
              <div className="flex flex-wrap gap-2">
                <select
                  className="max-w-[11rem] rounded-sm border border-border bg-bg-elevated px-2 py-2 text-xs text-fg"
                  value={pathFromId ?? ""}
                  onChange={(e) => setPathFromId(e.target.value || null)}
                >
                  <option value="">From…</option>
                  {viz.nodeIds.map((id) => (
                    <option key={id} value={id}>
                      {labelFor(id, index)}
                    </option>
                  ))}
                </select>
                <select
                  className="max-w-[11rem] rounded-sm border border-border bg-bg-elevated px-2 py-2 text-xs text-fg"
                  value={pathToId ?? ""}
                  onChange={(e) => setPathToId(e.target.value || null)}
                >
                  <option value="">To…</option>
                  {viz.nodeIds.map((id) => (
                    <option key={`t-${id}`} value={id}>
                      {labelFor(id, index)}
                    </option>
                  ))}
                </select>
              </div>
              {pathChain && pathChain.length ? (
                <p className="font-display text-sm leading-relaxed text-fg">{pathChain.map((id) => labelFor(id, index)).join(" → ")}</p>
              ) : pathFromId && pathToId ? (
                <p className="text-sm text-muted">No path within the current filtered neighborhood.</p>
              ) : null}
            </div>
            <div className="space-y-3 text-sm text-muted">
              <p className="text-[11px] uppercase tracking-[0.24em]">Neighborhood signals</p>
              <ul className="space-y-2 leading-relaxed">
                <li>Density (approx.): {(insights.edgeDensity * 100).toFixed(1)}%</li>
                {insights.tensionEdges[0] ? (
                  <li>
                    Tension: {formatRelationshipLabelForDisplay(insights.tensionEdges[0].relationship)}{" "}
                    <span className="text-fg">
                      {labelFor(insights.tensionEdges[0].sourceId, index)} ↔ {labelFor(insights.tensionEdges[0].targetId, index)}
                    </span>
                  </li>
                ) : null}
                {insights.bridgeLikeNodeIds[0] ? (
                  <li>
                    Connectors:{" "}
                    {insights.bridgeLikeNodeIds
                      .slice(0, 4)
                      .map((id) => labelFor(id, index))
                      .join(", ")}
                  </li>
                ) : null}
                {insights.isolatedNodeIds.length ? (
                  <li>Isolated in view: {insights.isolatedNodeIds.slice(0, 5).map((id) => labelFor(id, index)).join(", ")}</li>
                ) : null}
              </ul>
            </div>
          </div>
        </section>
      </div>
      ) : null}
    </div>
  );
}

function labelFor(id: string, index: ReturnType<typeof buildGraphIndex>): string {
  const n = index.getNodeByCanonicalId(id);
  if (!n) return id;
  return n.kind === "source" ? n.entity.name : n.entity.title;
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
