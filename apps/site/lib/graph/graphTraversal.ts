import type { GraphIndex, GraphNode } from "@/lib/graph/graph";
import type { GraphFocalNode, Relationship } from "@/types/semanticGraph";

/** Resolved endpoints for a relationship; `null` if either side does not map to a known entity. */
export function relationshipEndpointsResolved(
  index: GraphIndex,
  r: Relationship,
): { sourceId: string; targetId: string } | null {
  const sourceId = index.resolveCanonicalId(r.source);
  const targetId = index.resolveCanonicalId(r.target);
  if (!sourceId || !targetId) return null;
  return { sourceId, targetId };
}

/**
 * Relationships where both endpoints resolve to known entities.
 * Extension: filter by predicate, weight, or temporal scope for overlays / reading paths.
 */
export function getValidRelationships(index: GraphIndex): Relationship[] {
  let dropped = 0;
  const valid: Relationship[] = [];
  for (const r of index.graph.relationships) {
    if (relationshipEndpointsResolved(index, r)) {
      valid.push(r);
    } else {
      dropped += 1;
    }
  }
  if (dropped > 0 && process.env.NODE_ENV === "development") {
    console.warn(`[semantic-graph] dropped ${dropped} relationship(s) with unknown endpoint(s)`);
  }
  return valid;
}

export function getIncomingRelationships(index: GraphIndex, canonicalFocalId: string): Relationship[] {
  return index.graph.relationships.filter((r) => {
    const ends = relationshipEndpointsResolved(index, r);
    return Boolean(ends && ends.targetId === canonicalFocalId);
  });
}

export function getOutgoingRelationships(index: GraphIndex, canonicalFocalId: string): Relationship[] {
  return index.graph.relationships.filter((r) => {
    const ends = relationshipEndpointsResolved(index, r);
    return Boolean(ends && ends.sourceId === canonicalFocalId);
  });
}

function addNeighbor(
  index: GraphIndex,
  ref: string,
  focalId: string,
  bucket: Map<string, GraphNode>,
): void {
  const n = index.resolveNode(ref);
  if (!n || n.id === focalId) return;
  if (!bucket.has(n.id)) bucket.set(n.id, n);
}

/**
 * Bounded neighborhood for UI cards (not full graph analytics).
 *
 * Extension points:
 * - Force-directed layout (D3 / Cytoscape) can reuse `relationshipEndpointsResolved` + this BFS.
 * - Edge weight / "preserves vs threatens" semantics can filter or sort neighbors before display.
 * - Semantic recommendations and reading journeys can inject additional refs here.
 */
export function getConnectedGraphNeighborhood(
  index: GraphIndex,
  focal: GraphFocalNode,
  options?: { maxDepth?: number; maxNodes?: number },
): GraphNode[] {
  const maxDepth = Math.min(2, Math.max(1, options?.maxDepth ?? 1));
  const maxNodes = options?.maxNodes ?? 24;
  const focalId = focal.id;

  const depth1 = new Map<string, GraphNode>();

  for (const r of index.graph.relationships) {
    const ends = relationshipEndpointsResolved(index, r);
    if (!ends) continue;
    if (ends.sourceId === focalId) addNeighbor(index, ends.targetId, focalId, depth1);
    else if (ends.targetId === focalId) addNeighbor(index, ends.sourceId, focalId, depth1);
  }

  const focalNode = index.getNodeByCanonicalId(focalId);
  if (focalNode) {
    if (focalNode.kind === "concept") {
      const e = focalNode.entity;
      for (const ref of [...(e.relatedConcepts ?? []), ...(e.relatedPatterns ?? []), ...(e.relatedBooks ?? [])]) {
        addNeighbor(index, ref, focalId, depth1);
      }
    } else if (focalNode.kind === "pattern") {
      const e = focalNode.entity;
      for (const ref of [...(e.relatedConcepts ?? []), ...(e.relatedBooks ?? [])]) {
        addNeighbor(index, ref, focalId, depth1);
      }
    } else if (focalNode.kind === "book") {
      const e = focalNode.entity;
      for (const ref of [...(e.concepts ?? []), ...(e.patterns ?? []), ...(e.sources ?? [])]) {
        addNeighbor(index, ref, focalId, depth1);
      }
    } else if (focalNode.kind === "source") {
      const e = focalNode.entity;
      for (const ref of [...(e.concepts ?? []), ...(e.patterns ?? []), ...(e.relatedBooks ?? [])]) {
        addNeighbor(index, ref, focalId, depth1);
      }
    }
  }

  const combined = new Map<string, GraphNode>(depth1);

  if (maxDepth >= 2) {
    const depth2 = new Map<string, GraphNode>();
    for (const n of depth1.values()) {
      for (const r of index.graph.relationships) {
        const ends = relationshipEndpointsResolved(index, r);
        if (!ends) continue;
        if (ends.sourceId === n.id) addNeighbor(index, ends.targetId, focalId, depth2);
        else if (ends.targetId === n.id) addNeighbor(index, ends.sourceId, focalId, depth2);
      }
    }
    for (const [id, node] of depth2) {
      if (id === focalId || depth1.has(id)) continue;
      if (!combined.has(id)) combined.set(id, node);
    }
  }

  return Array.from(combined.values()).slice(0, maxNodes);
}
