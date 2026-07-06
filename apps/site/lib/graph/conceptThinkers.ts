import type { GraphIndex } from "@/lib/graph/graph";
import { resolveThinkers } from "@/lib/graph/thinkers";
import type { GlossaryConcept, Thinker } from "@/types/semanticGraph";

function sourcesForConceptId(index: GraphIndex, conceptId: string) {
  return index.graph.sources.filter((source) => source.concepts?.includes(conceptId));
}

/**
 * Resolve thinkers associated with a concept via manifest `thinkers.concepts`,
 * linked sources (`source.concepts` + `creatorSlugs`), and thinker `works`.
 */
export function resolveThinkersForConcept(index: GraphIndex, concept: GlossaryConcept): Thinker[] {
  const thinkers = resolveThinkers(index.graph);
  const byId = new Map<string, Thinker>();
  const conceptSources = sourcesForConceptId(index, concept.id);
  const conceptSourceIds = new Set(conceptSources.map((source) => source.id));
  const slugsFromSources = new Set(conceptSources.flatMap((source) => source.creatorSlugs ?? []));

  for (const thinker of thinkers) {
    if (thinker.concepts?.includes(concept.id)) {
      byId.set(thinker.id, thinker);
      continue;
    }
    if (slugsFromSources.has(thinker.slug)) {
      byId.set(thinker.id, thinker);
      continue;
    }
    if (thinker.works.some((workId) => conceptSourceIds.has(workId))) {
      byId.set(thinker.id, thinker);
    }
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Canonical thinker ids linked to a concept (for graph neighborhood / viz). */
export function thinkerIdsForConcept(index: GraphIndex, conceptId: string): string[] {
  const node = index.getNodeByCanonicalId(conceptId);
  if (!node || node.kind !== "concept") return [];
  return resolveThinkersForConcept(index, node.entity).map((thinker) => thinker.id);
}

/** Entity refs for a thinker node (concepts, patterns, works, related books). */
export function relatedRefsForThinker(thinker: Thinker): string[] {
  return [
    ...(thinker.concepts ?? []),
    ...(thinker.patterns ?? []),
    ...(thinker.works ?? []),
    ...(thinker.relatedBooks ?? []),
  ];
}
