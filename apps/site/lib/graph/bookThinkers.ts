import type { GraphIndex } from "@/lib/graph/graph";
import { getRelatedSources } from "@/lib/graph/graphQueries";
import { resolveThinkers } from "@/lib/graph/thinkers";
import type { Book, SemanticGraph, Source, Thinker } from "@/types/semanticGraph";

export type BookThinkerContent = {
  /** When true, render linked sources under "Major thinkers" (legacy manifest). */
  useLegacyThinkersSection: boolean;
  thinkers: Thinker[];
  researchSources: Source[];
};

export function resolveThinkersForBook(
  index: GraphIndex,
  book: Book,
  graph: SemanticGraph,
): BookThinkerContent {
  const researchSources = getRelatedSources(index, book.sources);

  const hasManifestThinkers = (graph.thinkers?.length ?? 0) > 0;
  const hasEnrichedLinkedSources = researchSources.some(
    (source) => (source.creatorSlugs?.length ?? 0) > 0,
  );

  if (!hasManifestThinkers && !hasEnrichedLinkedSources) {
    return {
      useLegacyThinkersSection: true,
      thinkers: [],
      researchSources,
    };
  }

  const bookSourceIds = new Set(researchSources.map((source) => source.id));
  const thinkerSlugsFromSources = new Set(
    researchSources.flatMap((source) => source.creatorSlugs ?? []),
  );

  const thinkers = resolveThinkers(graph)
    .filter((thinker) => {
      if (thinker.works.some((workId) => bookSourceIds.has(workId))) return true;
      if (thinkerSlugsFromSources.has(thinker.slug)) return true;
      if (thinker.relatedBooks?.includes(book.id)) return true;
      return false;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    useLegacyThinkersSection: false,
    thinkers,
    researchSources,
  };
}
