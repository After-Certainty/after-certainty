import type { GraphIndex } from "@/lib/graph/graph";
import { computeGraphInsights, type InsightEdge } from "@/lib/graph/graphInsights";
import { relationshipEndpointsResolved } from "@/lib/graph/graphTraversal";
import { normalizePredicateKey } from "@/lib/graph/relationshipVisuals";
import type { Relationship } from "@/types/semanticGraph";

export type ConnectivityBand = "isolated" | "thread" | "woven";
export type TensionLevel = "quiet" | "strained" | "contested";

export type NeighborhoodSignals = {
  edgeDensity: number;
  dominantPredicates: { predicate: string; count: number }[];
  tensionLevel: TensionLevel;
  lensDiversity: number;
  connectivity: ConnectivityBand;
  strongestEdges: InsightEdge[];
  bridgeConcepts: string[];
  bridgeNodeIds: string[];
  isolatedNodeIds: string[];
  summaryLine: string;
};

const TENSION_RE = /threatens|distorts|undermines|erodes|contests|fragile|weakens|pressures/i;

function labelForId(index: GraphIndex, id: string): string {
  const n = index.getNodeByCanonicalId(id);
  if (!n) return id;
  return n.kind === "source" ? n.entity.name : n.entity.title;
}

function connectivityBand(visibleCount: number, edgeCount: number, isolatedCount: number): ConnectivityBand {
  if (visibleCount <= 1) return "isolated";
  const avgDegree = visibleCount > 0 ? (edgeCount * 2) / visibleCount : 0;
  if (isolatedCount > visibleCount * 0.4 || avgDegree < 1.2) return "isolated";
  if (avgDegree < 2.4) return "thread";
  return "woven";
}

function tensionLevelFromEdges(edges: InsightEdge[]): TensionLevel {
  if (edges.length === 0) return "quiet";
  const tensionCount = edges.filter((e) => TENSION_RE.test(e.relationship)).length;
  const ratio = tensionCount / edges.length;
  if (ratio >= 0.35) return "contested";
  if (ratio >= 0.12) return "strained";
  return "quiet";
}

export function computeNeighborhoodSignals(
  index: GraphIndex,
  visibleNodeIds: ReadonlySet<string>,
  relationships: Relationship[],
): NeighborhoodSignals {
  const insights = computeGraphInsights(index, visibleNodeIds, relationships);

  const predicateCounts = new Map<string, number>();
  const layers = new Set<string>();
  const kinds = new Set<string>();
  const visibleEdges: InsightEdge[] = [];

  for (const id of visibleNodeIds) {
    const n = index.getNodeByCanonicalId(id);
    if (!n) continue;
    kinds.add(n.kind);
    if (n.kind === "concept" && n.entity.layer?.trim()) layers.add(n.entity.layer.trim());
  }

  for (const r of relationships) {
    const ends = relationshipEndpointsResolved(index, r);
    if (!ends) continue;
    if (!visibleNodeIds.has(ends.sourceId) || !visibleNodeIds.has(ends.targetId)) continue;
    const key = normalizePredicateKey(r.relationship);
    predicateCounts.set(key, (predicateCounts.get(key) ?? 0) + 1);
    visibleEdges.push({
      sourceId: ends.sourceId,
      targetId: ends.targetId,
      relationship: r.relationship,
      weight: typeof r.weight === "number" ? r.weight : 1,
    });
  }

  const dominantPredicates = [...predicateCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([predicate, count]) => ({ predicate, count }));

  const tensionLevel = tensionLevelFromEdges(visibleEdges);
  const connectivity = connectivityBand(
    visibleNodeIds.size,
    visibleEdges.length,
    insights.isolatedNodeIds.length,
  );
  const lensDiversity = layers.size + kinds.size;
  const bridgeNodeIds = insights.bridgeLikeNodeIds;
  const bridgeConcepts = bridgeNodeIds.map((id) => labelForId(index, id));

  const tensionWord =
    tensionLevel === "contested" ? "contested" : tensionLevel === "strained" ? "strained" : "quiet";
  const connectWord =
    connectivity === "woven" ? "woven" : connectivity === "thread" ? "threadlike" : "sparse";
  const predPhrase =
    dominantPredicates[0]?.predicate != null
      ? dominantPredicates[0].predicate.replace(/_/g, " ")
      : "untyped links";

  const summaryLine = `${connectWord} neighborhood · tension ${tensionWord} · ${predPhrase} prominent`;

  return {
    edgeDensity: insights.edgeDensity,
    dominantPredicates,
    tensionLevel,
    lensDiversity,
    connectivity,
    strongestEdges: insights.strongestRelationships.slice(0, 2),
    bridgeConcepts,
    bridgeNodeIds,
    isolatedNodeIds: insights.isolatedNodeIds,
    summaryLine,
  };
}
