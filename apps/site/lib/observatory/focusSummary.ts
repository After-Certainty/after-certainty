import type { GraphIndex, GraphNode } from "@/lib/graph/graph";
import { isSymmetricRelationship } from "@/lib/graph/relationshipTaxonomy";
import { formatRelationshipLabelForDisplay } from "@/lib/graph/relationshipVisuals";
import type { RelationshipSelection } from "@/lib/observatory/types";

export function nodeLabel(index: GraphIndex, canonicalId: string): string {
  const n = index.getNodeByCanonicalId(canonicalId);
  if (!n) return "Unknown";
  return n.kind === "source" ? n.entity.name : n.entity.title;
}

export function entityFocusSummary(node: GraphNode): string {
  const title = node.kind === "source" ? node.entity.name : node.entity.title;
  const kindLabel = node.kind.charAt(0).toUpperCase() + node.kind.slice(1);
  return `${kindLabel} · ${title}`;
}

export function relationshipFocusSummary(
  index: GraphIndex,
  selection: NonNullable<RelationshipSelection>,
): string {
  const predicate = formatRelationshipLabelForDisplay(selection.predicate);
  const a = nodeLabel(index, selection.sourceId);
  const b = nodeLabel(index, selection.targetId);
  if (isSymmetricRelationship(selection.predicate)) {
    return `${a} ↔ ${b} · ${predicate}`;
  }
  return `${a} · ${predicate} · ${b}`;
}
