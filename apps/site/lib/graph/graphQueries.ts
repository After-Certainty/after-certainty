import type {
  Book,
  GlossaryConcept,
  Pattern,
  SemanticGraph,
  Source,
  Thinker,
} from "@/types/semanticGraph";
import type { GraphIndex } from "@/lib/graph/graph";
import { resolveThinkers } from "@/lib/graph/thinkers";
import {
  getIncomingRelationships,
  getOutgoingRelationships,
  relationshipEndpointsResolved,
} from "@/lib/graph/graphTraversal";

export function getConceptBySlug(index: GraphIndex, slug: string): GlossaryConcept | undefined {
  return index.conceptBySlug.get(slug);
}

export function getPatternBySlug(index: GraphIndex, slug: string): Pattern | undefined {
  return index.patternBySlug.get(slug);
}

export function getBookBySlug(index: GraphIndex, slug: string): Book | undefined {
  return index.bookBySlug.get(slug);
}

export function getSourceBySlug(index: GraphIndex, slug: string): Source | undefined {
  return index.sourceBySlug.get(slug);
}

export function getThinkerBySlug(graph: SemanticGraph, slug: string): Thinker | undefined {
  return resolveThinkers(graph).find((thinker) => thinker.slug === slug);
}

function compactById<T extends { id: string }>(
  refs: string[] | undefined,
  resolve: (ref: string) => T | undefined,
): T[] {
  if (!refs?.length) return [];
  const out: T[] = [];
  const seen = new Set<string>();
  for (const ref of refs) {
    const item = resolve(ref);
    if (!item) continue;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

export function getRelatedConcepts(
  index: GraphIndex,
  refs: string[] | undefined,
): GlossaryConcept[] {
  return compactById(refs, (ref) => {
    const n = index.resolveNode(ref);
    return n?.kind === "concept" ? n.entity : undefined;
  });
}

export function getRelatedPatterns(index: GraphIndex, refs: string[] | undefined): Pattern[] {
  return compactById(refs, (ref) => {
    const n = index.resolveNode(ref);
    return n?.kind === "pattern" ? n.entity : undefined;
  });
}

export function getRelatedBooks(index: GraphIndex, refs: string[] | undefined): Book[] {
  return compactById(refs, (ref) => {
    const n = index.resolveNode(ref);
    return n?.kind === "book" ? n.entity : undefined;
  });
}

export function getRelatedSources(index: GraphIndex, refs: string[] | undefined): Source[] {
  return compactById(refs, (ref) => {
    const n = index.resolveNode(ref);
    return n?.kind === "source" ? n.entity : undefined;
  });
}

export function getAdjacentSourcesFromRelationships(
  index: GraphIndex,
  focalCanonicalId: string,
): Source[] {
  const seen = new Set<string>();
  const out: Source[] = [];
  const consider = (otherId: string) => {
    const n = index.getNodeByCanonicalId(otherId);
    if (n?.kind === "source" && !seen.has(n.id)) {
      seen.add(n.id);
      out.push(n.entity);
    }
  };
  for (const r of getIncomingRelationships(index, focalCanonicalId)) {
    const ends = relationshipEndpointsResolved(index, r);
    if (ends) consider(ends.sourceId);
  }
  for (const r of getOutgoingRelationships(index, focalCanonicalId)) {
    const ends = relationshipEndpointsResolved(index, r);
    if (ends) consider(ends.targetId);
  }
  return out;
}
