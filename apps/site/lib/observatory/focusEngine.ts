import type { GraphIndex } from "@/lib/graph/graph";
import { relationshipEndpointsResolved } from "@/lib/graph/graphTraversal";
import type { EdgeSemanticTier, NodeSemanticTier, SemanticWeights } from "@/lib/observatory/types";

export type FocusEngineInput = {
  index: GraphIndex;
  visibleNodeIds: ReadonlySet<string>;
  visibleEdges: ReadonlyArray<{ edgeKey: string; sourceId: string; targetId: string }>;
  focusCanonicalId: string | null;
  relationshipSelection: { edgeKey: string; sourceId: string; targetId: string } | null;
  pathNodeIds: ReadonlySet<string>;
  pathPairKeys: ReadonlySet<string>;
};

function undirectedPairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function neighborIds(
  index: GraphIndex,
  nodeId: string,
  visibleNodeIds: ReadonlySet<string>,
): Set<string> {
  const out = new Set<string>();
  for (const r of index.graph.relationships) {
    const ends = relationshipEndpointsResolved(index, r);
    if (!ends) continue;
    if (ends.sourceId === nodeId && visibleNodeIds.has(ends.targetId)) out.add(ends.targetId);
    if (ends.targetId === nodeId && visibleNodeIds.has(ends.sourceId)) out.add(ends.sourceId);
  }
  return out;
}

/**
 * Assigns calm semantic emphasis tiers for nodes and edges in the visible subgraph.
 */
export function computeSemanticWeights(input: FocusEngineInput): SemanticWeights {
  const {
    index,
    visibleNodeIds,
    visibleEdges,
    focusCanonicalId,
    relationshipSelection,
    pathNodeIds,
    pathPairKeys,
  } = input;

  const nodes = new Map<string, NodeSemanticTier>();
  const edges = new Map<string, EdgeSemanticTier>();

  for (const id of visibleNodeIds) {
    nodes.set(id, "dim");
  }

  if (relationshipSelection) {
    const { sourceId, targetId, edgeKey } = relationshipSelection;
    if (visibleNodeIds.has(sourceId)) nodes.set(sourceId, "neighbor");
    if (visibleNodeIds.has(targetId)) nodes.set(targetId, "neighbor");
    if (focusCanonicalId && visibleNodeIds.has(focusCanonicalId)) {
      nodes.set(focusCanonicalId, "focus");
      const other = focusCanonicalId === sourceId ? targetId : sourceId;
      if (visibleNodeIds.has(other)) nodes.set(other, "neighbor");
    } else if (visibleNodeIds.has(sourceId)) {
      nodes.set(sourceId, "focus");
    }
    for (const e of visibleEdges) {
      const pairKey = undirectedPairKey(e.sourceId, e.targetId);
      if (e.edgeKey === edgeKey) {
        edges.set(e.edgeKey, "selected");
      } else if (pathPairKeys.has(pairKey)) {
        edges.set(e.edgeKey, "path");
      } else if (
        focusCanonicalId &&
        (e.sourceId === focusCanonicalId || e.targetId === focusCanonicalId)
      ) {
        edges.set(e.edgeKey, "incident");
      } else {
        edges.set(e.edgeKey, "dim");
      }
    }
    for (const id of pathNodeIds) {
      if (!visibleNodeIds.has(id)) continue;
      if (nodes.get(id) !== "focus") nodes.set(id, "path");
    }
    return { nodes, edges };
  }

  if (focusCanonicalId && visibleNodeIds.has(focusCanonicalId)) {
    nodes.set(focusCanonicalId, "focus");
    for (const nbr of neighborIds(index, focusCanonicalId, visibleNodeIds)) {
      nodes.set(nbr, "neighbor");
    }
  }

  for (const id of pathNodeIds) {
    if (!visibleNodeIds.has(id)) continue;
    const cur = nodes.get(id);
    if (cur === "focus") continue;
    nodes.set(id, "path");
  }

  for (const e of visibleEdges) {
    const pairKey = undirectedPairKey(e.sourceId, e.targetId);
    let tier: EdgeSemanticTier = "dim";
    if (pathPairKeys.has(pairKey)) {
      tier = "path";
    } else if (
      focusCanonicalId &&
      (e.sourceId === focusCanonicalId || e.targetId === focusCanonicalId)
    ) {
      tier = "incident";
    }
    edges.set(e.edgeKey, tier);
  }

  return { nodes, edges };
}

export function shouldShowEdgeLabel(
  tier: EdgeSemanticTier,
  edgeKey: string,
  hoveredEdgeKey: string | null,
  showAllLabels: boolean,
): boolean {
  if (showAllLabels) return tier !== "dim";
  if (hoveredEdgeKey === edgeKey) return true;
  return tier === "selected" || tier === "incident" || tier === "path";
}
