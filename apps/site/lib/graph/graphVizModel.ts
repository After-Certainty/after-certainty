/**
 * Ego-centric subgraph selection for visualization.
 * Extension: smarter pruning (betweenness, weighted walks), semantic overlays, reading-path-only subgraphs.
 */

import type { GraphIndex } from "@/lib/graph/graph";
import type { GraphEntityKind, Relationship } from "@/types/semanticGraph";
import { relationshipEndpointsResolved } from "@/lib/graph/graphTraversal";
import { normalizePredicateKey } from "@/lib/graph/relationshipVisuals";

export type GraphVizBuildOptions = {
  focusCanonicalId: string | null;
  maxDepth: number;
  maxNodes: number;
  /** Empty = all entity kinds visible */
  kinds: GraphEntityKind[];
  /** Empty = all layers; when non-empty, concepts without `layer` are excluded */
  layers: string[];
  /** Normalized predicate keys (see `normalizePredicateKey`); empty = all relationship types */
  predicates: string[];
  includeRelatedEntityLinks: boolean;
  pinnedCanonicalIds: readonly string[];
  /**
   * Reserve up to this many slots for books not reached by BFS (the ego-graph otherwise
   * often fills with concepts/patterns first). Set 0 to disable.
   */
  shelfPaddingBooks?: number;
  /**
   * Progressive subgraph only (`buildProgressiveGraphVizModel`): max neighbors taken per entity kind
   * for each expanded root (random subset when a kind overflows). Default `3`. Set to `0` to include
   * every neighbor (uncapped).
   */
  progressiveNeighborsPerKind?: number;
  /** When set, only these concept canonical ids pass concept node filters (books/patterns/sources unaffected). */
  ontologyAllowedConceptIds?: ReadonlySet<string> | null;
};

export type VizEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  description?: string;
  weight?: number;
  /** Index into `index.graph.relationships` when edge is manifest-backed. */
  manifestIndex?: number;
  isSyntheticRelated: boolean;
};

export function passesNodeFilters(
  index: GraphIndex,
  id: string,
  opt: Pick<GraphVizBuildOptions, "kinds" | "layers" | "ontologyAllowedConceptIds">,
): boolean {
  const n = index.getNodeByCanonicalId(id);
  if (!n) return false;
  if (opt.kinds.length > 0 && !opt.kinds.includes(n.kind)) return false;
  if (opt.layers.length > 0) {
    if (n.kind === "concept") {
      const ly = n.entity.layer;
      if (!ly || !opt.layers.includes(ly)) return false;
    }
  }
  if (opt.ontologyAllowedConceptIds && n.kind === "concept" && !opt.ontologyAllowedConceptIds.has(id)) {
    return false;
  }
  return true;
}

function passesPredicateFilter(r: Relationship, predicates: string[]): boolean {
  if (predicates.length === 0) return true;
  const key = normalizePredicateKey(r.relationship);
  return predicates.includes(key);
}

function collectNeighbors(index: GraphIndex, id: string, opt: GraphVizBuildOptions): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (x: string) => {
    if (seen.has(x)) return;
    seen.add(x);
    out.push(x);
  };

  for (const r of index.graph.relationships) {
    const ends = relationshipEndpointsResolved(index, r);
    if (!ends) continue;
    if (ends.sourceId !== id && ends.targetId !== id) continue;
    if (!passesPredicateFilter(r, opt.predicates)) continue;
    const other = ends.sourceId === id ? ends.targetId : ends.sourceId;
    push(other);
  }

  if (opt.includeRelatedEntityLinks) {
    const n = index.getNodeByCanonicalId(id);
    if (!n) return out;
    const refs: string[] = [];
    if (n.kind === "concept") {
      refs.push(
        ...(n.entity.relatedConcepts ?? []),
        ...(n.entity.relatedPatterns ?? []),
        ...(n.entity.relatedBooks ?? []),
      );
    } else if (n.kind === "pattern") {
      refs.push(...(n.entity.relatedConcepts ?? []), ...(n.entity.relatedBooks ?? []));
    } else if (n.kind === "book") {
      refs.push(...(n.entity.concepts ?? []), ...(n.entity.patterns ?? []), ...(n.entity.sources ?? []));
    } else if (n.kind === "source") {
      refs.push(...(n.entity.concepts ?? []), ...(n.entity.patterns ?? []), ...(n.entity.relatedBooks ?? []));
    }
    for (const ref of refs) {
      const cid = index.resolveCanonicalId(ref);
      if (cid) push(cid);
    }
  }

  return out;
}

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = t;
  }
}

/**
 * Neighbors for one expanded root in progressive mode: optional cap per `GraphEntityKind` (random subset).
 */
function collectNeighborsProgressive(
  index: GraphIndex,
  rootId: string,
  opt: GraphVizBuildOptions,
  perKindLimit: number,
): string[] {
  const raw = collectNeighbors(index, rootId, opt);
  if (perKindLimit <= 0) {
    return raw.filter((nid) => passesNodeFilters(index, nid, opt));
  }

  const byKind = new Map<GraphEntityKind, string[]>();
  for (const nid of raw) {
    if (!passesNodeFilters(index, nid, opt)) continue;
    const node = index.getNodeByCanonicalId(nid);
    if (!node) continue;
    let bucket = byKind.get(node.kind);
    if (!bucket) {
      bucket = [];
      byKind.set(node.kind, bucket);
    }
    bucket.push(nid);
  }

  const out: string[] = [];
  for (const [, ids] of byKind) {
    if (ids.length <= perKindLimit) {
      out.push(...ids);
    } else {
      shuffleInPlace(ids);
      out.push(...ids.slice(0, perKindLimit));
    }
  }
  return out;
}

function bfsNodeIds(index: GraphIndex, opt: GraphVizBuildOptions): string[] {
  const focus = opt.focusCanonicalId;
  if (!focus || !passesNodeFilters(index, focus, opt)) return [];

  const visited = new Set<string>();
  const order: string[] = [];
  const queue: Array<{ id: string; depth: number }> = [{ id: focus, depth: 0 }];
  visited.add(focus);
  order.push(focus);

  while (queue.length > 0 && order.length < opt.maxNodes) {
    const { id, depth } = queue.shift()!;
    if (depth >= opt.maxDepth) continue;
    for (const nbr of collectNeighbors(index, id, opt)) {
      if (!passesNodeFilters(index, nbr, opt)) continue;
      if (visited.has(nbr)) continue;
      visited.add(nbr);
      order.push(nbr);
      queue.push({ id: nbr, depth: depth + 1 });
      if (order.length >= opt.maxNodes) break;
    }
  }

  return order;
}

/** Stable key matching dedup logic in {@link computeVizEdges} (e.g. panel selection → edge highlight). */
export function vizEdgeDedupKey(sourceId: string, targetId: string, relationship: string): string {
  const pair = sourceId < targetId ? `${sourceId}||${targetId}` : `${targetId}||${sourceId}`;
  return `${pair}::${normalizePredicateKey(relationship)}`;
}

function computeVizEdges(index: GraphIndex, nodeSet: ReadonlySet<string>, opt: GraphVizBuildOptions): VizEdge[] {
  const nodeIds = [...nodeSet];
  const edgeKeySeen = new Set<string>();
  const edges: VizEdge[] = [];
  let edgeCounter = 0;

  const pushEdge = (
    sourceId: string,
    targetId: string,
    relationship: string,
    meta?: Pick<VizEdge, "description" | "weight" | "manifestIndex" | "isSyntheticRelated">,
  ) => {
    if (!nodeSet.has(sourceId) || !nodeSet.has(targetId)) return;
    const ek = vizEdgeDedupKey(sourceId, targetId, relationship);
    if (edgeKeySeen.has(ek)) return;
    edgeKeySeen.add(ek);
    edgeCounter += 1;
    edges.push({
      id: `e-${edgeCounter}`,
      sourceId,
      targetId,
      relationship,
      description: meta?.description,
      weight: meta?.weight,
      manifestIndex: meta?.manifestIndex,
      isSyntheticRelated: meta?.isSyntheticRelated ?? false,
    });
  };

  for (let manifestIndex = 0; manifestIndex < index.graph.relationships.length; manifestIndex += 1) {
    const r = index.graph.relationships[manifestIndex]!;
    if (!passesPredicateFilter(r, opt.predicates)) continue;
    const ends = relationshipEndpointsResolved(index, r);
    if (!ends) continue;
    pushEdge(ends.sourceId, ends.targetId, r.relationship, {
      description: r.description,
      weight: r.weight,
      manifestIndex,
      isSyntheticRelated: false,
    });
  }

  if (opt.includeRelatedEntityLinks) {
    for (const id of nodeIds) {
      const n = index.getNodeByCanonicalId(id);
      if (!n) continue;
      const refs: string[] = [];
      if (n.kind === "concept") {
        refs.push(
          ...(n.entity.relatedConcepts ?? []),
          ...(n.entity.relatedPatterns ?? []),
          ...(n.entity.relatedBooks ?? []),
        );
      } else if (n.kind === "pattern") {
        refs.push(...(n.entity.relatedConcepts ?? []), ...(n.entity.relatedBooks ?? []));
      } else if (n.kind === "book") {
        refs.push(...(n.entity.concepts ?? []), ...(n.entity.patterns ?? []), ...(n.entity.sources ?? []));
      } else if (n.kind === "source") {
        refs.push(...(n.entity.concepts ?? []), ...(n.entity.patterns ?? []), ...(n.entity.relatedBooks ?? []));
      }
      for (const ref of refs) {
        const cid = index.resolveCanonicalId(ref);
        if (!cid) continue;
        if (!nodeSet.has(cid)) continue;
        pushEdge(id, cid, "related", { isSyntheticRelated: true });
      }
    }
  }

  return edges;
}

/**
 * Union of 1-hop neighborhoods around each expanded root (used for deep-linked /explore focus).
 * Clicking a visible node adds it as a new root so its neighbors appear.
 */
export function buildProgressiveGraphVizModel(
  index: GraphIndex,
  opt: GraphVizBuildOptions,
  expandedRootIds: readonly string[],
): { nodeIds: string[]; edges: VizEdge[] } {
  const perKindLimit =
    opt.progressiveNeighborsPerKind === undefined ? 3 : opt.progressiveNeighborsPerKind;
  const nodeSet = new Set<string>();
  const rootOrderSeen = new Set<string>();

  for (const root of expandedRootIds) {
    if (rootOrderSeen.has(root)) continue;
    rootOrderSeen.add(root);
    if (!passesNodeFilters(index, root, opt)) continue;
    nodeSet.add(root);
    for (const nbr of collectNeighborsProgressive(index, root, opt, perKindLimit)) {
      nodeSet.add(nbr);
    }
  }

  for (const pid of opt.pinnedCanonicalIds) {
    if (passesNodeFilters(index, pid, opt)) nodeSet.add(pid);
  }

  if (nodeSet.size > opt.maxNodes) {
    const trimmed = new Set<string>();
    for (const pid of opt.pinnedCanonicalIds) {
      if (trimmed.size >= opt.maxNodes) break;
      if (passesNodeFilters(index, pid, opt) && nodeSet.has(pid)) trimmed.add(pid);
    }
    for (const root of expandedRootIds) {
      if (trimmed.size >= opt.maxNodes) break;
      if (!passesNodeFilters(index, root, opt) || !nodeSet.has(root)) continue;
      trimmed.add(root);
    }
    const remainder = [...nodeSet].filter((id) => !trimmed.has(id)).sort((a, b) => a.localeCompare(b));
    for (const id of remainder) {
      if (trimmed.size >= opt.maxNodes) break;
      trimmed.add(id);
    }
    nodeSet.clear();
    for (const id of trimmed) nodeSet.add(id);
  }

  return { nodeIds: [...nodeSet], edges: computeVizEdges(index, nodeSet, opt) };
}

export function buildGraphVizModel(index: GraphIndex, opt: GraphVizBuildOptions): { nodeIds: string[]; edges: VizEdge[] } {
  const shelf = Math.max(0, opt.shelfPaddingBooks ?? 0);
  const bfsMax = Math.max(1, opt.maxNodes - shelf);
  const bfs = bfsNodeIds(index, { ...opt, maxNodes: bfsMax });
  const nodeSet = new Set<string>(bfs);

  for (const pid of opt.pinnedCanonicalIds) {
    if (passesNodeFilters(index, pid, opt)) nodeSet.add(pid);
  }

  if (shelf > 0 && (opt.kinds.length === 0 || opt.kinds.includes("book"))) {
    const books = [...index.graph.books].sort((a, b) => a.title.localeCompare(b.title));
    for (const b of books) {
      if (nodeSet.size >= opt.maxNodes) break;
      if (!passesNodeFilters(index, b.id, opt)) continue;
      if (nodeSet.has(b.id)) continue;
      nodeSet.add(b.id);
    }
  }

  return { nodeIds: [...nodeSet], edges: computeVizEdges(index, nodeSet, opt) };
}

/** Distinct non-empty layer labels from glossary (for filter UI). */
export function distinctConceptLayers(index: GraphIndex): string[] {
  const set = new Set<string>();
  for (const c of index.graph.glossary) {
    if (c.layer && c.layer.trim()) set.add(c.layer.trim());
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Distinct relationship predicates (raw strings, sorted). */
export function distinctRelationshipPredicates(graph: { relationships: Relationship[] }): string[] {
  const set = new Set<string>();
  for (const r of graph.relationships) {
    if (r.relationship.trim()) set.add(r.relationship.trim());
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function defaultFocusCanonicalId(index: GraphIndex): string | null {
  if (index.graph.glossary[0]) return index.graph.glossary[0].id;
  if (index.graph.patterns[0]) return index.graph.patterns[0].id;
  if (index.graph.books[0]) return index.graph.books[0].id;
  if (index.graph.sources[0]) return index.graph.sources[0].id;
  return null;
}
