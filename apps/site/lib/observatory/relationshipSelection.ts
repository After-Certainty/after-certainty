import type { GraphIndex } from "@/lib/graph/graph";
import { vizEdgeDedupKey } from "@/lib/graph/graphVizModel";
import { relationshipEndpointsResolved } from "@/lib/graph/graphTraversal";
import type { Relationship } from "@/types/semanticGraph";
import type { RelationshipSelection } from "@/lib/observatory/types";

/** Resolve a manifest relationship row for a visible viz edge key. */
export function relationshipForEdgeKey(
  index: GraphIndex,
  edgeKey: string,
  sourceId: string,
  targetId: string,
  predicate: string,
  description?: string,
  weight?: number,
): RelationshipSelection {
  const rel: Relationship = {
    source: sourceId,
    target: targetId,
    relationship: predicate,
    description,
    weight,
  };

  for (const r of index.graph.relationships) {
    const ends = relationshipEndpointsResolved(index, r);
    if (!ends) continue;
    const key = vizEdgeDedupKey(ends.sourceId, ends.targetId, r.relationship);
    if (key === edgeKey) {
      return {
        edgeKey,
        sourceId: ends.sourceId,
        targetId: ends.targetId,
        predicate: r.relationship,
        relationship: r,
      };
    }
  }

  return {
    edgeKey,
    sourceId,
    targetId,
    predicate,
    relationship: rel,
  };
}

export function relationshipSelectionFromRelationship(
  index: GraphIndex,
  r: Relationship,
): RelationshipSelection | null {
  const ends = relationshipEndpointsResolved(index, r);
  if (!ends) return null;
  const edgeKey = vizEdgeDedupKey(ends.sourceId, ends.targetId, r.relationship);
  return {
    edgeKey,
    sourceId: ends.sourceId,
    targetId: ends.targetId,
    predicate: r.relationship,
    relationship: r,
  };
}
