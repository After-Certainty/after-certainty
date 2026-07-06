import type { GraphIndex, GraphNode } from "@/lib/graph/graph";
import {
  relatedContentForBook,
  relatedContentForConcept,
  relatedContentForPattern,
  relatedContentForSource,
  relatedContentForThinker,
  type RelatedContentBundle,
} from "@/lib/graph/relatedContent";

function bundleForNode(index: GraphIndex, node: GraphNode): RelatedContentBundle {
  switch (node.kind) {
    case "concept":
      return relatedContentForConcept(index, node.entity);
    case "pattern":
      return relatedContentForPattern(index, node.entity);
    case "book":
      return relatedContentForBook(index, node.entity);
    case "source":
      return relatedContentForSource(index, node.entity);
    case "thinker":
      return relatedContentForThinker(index, node.entity);
  }
}

function mergeUnique<T extends { id: string }>(a: T[], b: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of [...a, ...b]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

/** Merge related terrain from two focal entities (relationship detail view). */
export function mergeRelatedTerrain(
  index: GraphIndex,
  nodeA: GraphNode,
  nodeB: GraphNode,
): RelatedContentBundle {
  const a = bundleForNode(index, nodeA);
  const b = bundleForNode(index, nodeB);
  return {
    concepts: mergeUnique(a.concepts, b.concepts),
    patterns: mergeUnique(a.patterns, b.patterns),
    books: mergeUnique(a.books, b.books),
    sources: mergeUnique(a.sources, b.sources),
    thinkers: mergeUnique(a.thinkers, b.thinkers),
  };
}
