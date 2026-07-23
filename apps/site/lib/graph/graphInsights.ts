/**
 * Lightweight graph observations for the visible subgraph (MVP heuristics).
 * "Bridges" here means high-degree connectors — not articulation-point analysis.
 * Extension: modularity, true betweenness, weighted strength, thematic overlays.
 */

import type { Relationship } from "@/types/semanticGraph";
import type { GraphIndex } from "@/lib/graph/graph";
import { relationshipEndpointsResolved } from "@/lib/graph/graphTraversal";

export type InsightEdge = {
  sourceId: string;
  targetId: string;
  relationship: string;
  weight: number;
};

export type GraphInsightSnapshot = {
  strongestRelationships: InsightEdge[];
  tensionEdges: InsightEdge[];
  isolatedNodeIds: string[];
  /** High-degree nodes in the visible set — heuristic "bridges", not articulation points. */
  bridgeLikeNodeIds: string[];
  edgeDensity: number;
};

const TENSION_RE = /threatens|distorts|undermines|erodes|contests|fragile/i;

function edgeStrength(r: Relationship): number {
  if (typeof r.weight === "number" && Number.isFinite(r.weight)) return r.weight;
  return 1;
}

export function computeGraphInsights(
  index: GraphIndex,
  visibleNodeIds: ReadonlySet<string>,
  relationships: Relationship[],
): GraphInsightSnapshot {
  const validEdges: InsightEdge[] = [];
  const deg = new Map<string, number>();

  for (const id of visibleNodeIds) deg.set(id, 0);

  for (const r of relationships) {
    const ends = relationshipEndpointsResolved(index, r);
    if (!ends) continue;
    if (!visibleNodeIds.has(ends.sourceId) || !visibleNodeIds.has(ends.targetId)) continue;
    const w = edgeStrength(r);
    validEdges.push({
      sourceId: ends.sourceId,
      targetId: ends.targetId,
      relationship: r.relationship,
      weight: w,
    });
    deg.set(ends.sourceId, (deg.get(ends.sourceId) ?? 0) + 1);
    deg.set(ends.targetId, (deg.get(ends.targetId) ?? 0) + 1);
  }

  const sorted = [...validEdges].sort((a, b) => b.weight - a.weight);
  const strongestRelationships = sorted.slice(0, 8);

  const tensionEdges = validEdges.filter((e) => TENSION_RE.test(e.relationship)).slice(0, 8);

  const isolatedNodeIds = [...visibleNodeIds].filter((id) => (deg.get(id) ?? 0) === 0);

  const bridgeLikeNodeIds = [...deg.entries()]
    .filter(([id, d]) => d >= 3 && visibleNodeIds.has(id))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id]) => id);

  const n = visibleNodeIds.size;
  const maxUndirected = n >= 2 ? (n * (n - 1)) / 2 : 0;
  const edgeDensity = maxUndirected > 0 ? validEdges.length / maxUndirected : 0;

  return {
    strongestRelationships,
    tensionEdges,
    isolatedNodeIds,
    bridgeLikeNodeIds,
    edgeDensity,
  };
}
