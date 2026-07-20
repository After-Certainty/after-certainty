import { resolveBookCanonicalSlug } from "@/lib/books/generated-manifest";
import { explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex, graphNodeTitle, type GraphIndex } from "@/lib/graph/graph";
import { enrichPathStops, totalEstimatedMinutes } from "@/lib/paths/enrichStop";
import { resolveBookSlugFromEntityId } from "@/lib/paths/validateStop";
import { findCatalogBookForSlug } from "@/lib/search/buildSearchDocuments";
import type { Book as CatalogBook, PodcastEpisode } from "@/types/content";
import type { EnrichedTrail, TrailDefinition } from "@/types/trails";
import type { SemanticGraph } from "@/types/semanticGraph";

function titleForGraphNode(index: GraphIndex, canonicalId: string): string {
  const node = index.getNodeByCanonicalId(canonicalId);
  if (!node) return canonicalId;
  return graphNodeTitle(node);
}

function enrichPrimaryBook(
  trail: TrailDefinition,
  index: GraphIndex,
  catalogBooks: readonly CatalogBook[],
): Pick<EnrichedTrail, "primaryBookTitle" | "primaryBookHref" | "primaryBookCover"> {
  if (!trail.primaryBookId) {
    return {};
  }

  const slug = resolveBookSlugFromEntityId(trail.primaryBookId);
  const canonicalSlug = resolveBookCanonicalSlug(slug, [...catalogBooks]) ?? slug;
  const catalogBook = findCatalogBookForSlug(canonicalSlug, catalogBooks);
  const resolvedId =
    index.resolveCanonicalId(canonicalSlug) ??
    index.resolveCanonicalId(trail.primaryBookId) ??
    trail.primaryBookId;

  return {
    primaryBookTitle: catalogBook?.title ?? titleForGraphNode(index, resolvedId),
    primaryBookHref: `${explorePaths.books}/${canonicalSlug}`,
    primaryBookCover: catalogBook?.coverImage ?? undefined,
  };
}

export function enrichTrail(
  trail: TrailDefinition,
  graph: SemanticGraph,
  catalogBooks: readonly CatalogBook[],
  podcastEpisodes: readonly PodcastEpisode[],
): EnrichedTrail {
  const index = buildGraphIndex(graph);
  const pathStopsEnriched = enrichPathStops(trail.pathStops, index, catalogBooks, podcastEpisodes);

  return {
    ...trail,
    pathStopsEnriched,
    totalEstimatedMinutes: totalEstimatedMinutes(pathStopsEnriched),
    ...enrichPrimaryBook(trail, index, catalogBooks),
  };
}

export function enrichTrails(
  trails: TrailDefinition[],
  graph: SemanticGraph,
  catalogBooks: readonly CatalogBook[],
  podcastEpisodes: readonly PodcastEpisode[],
): EnrichedTrail[] {
  return trails.map((t) => enrichTrail(t, graph, catalogBooks, podcastEpisodes));
}

export function buildTrailSearchHandoffUrl(trail: TrailDefinition): string {
  const q = encodeURIComponent(trail.themes.slice(0, 2).join(" "));
  return `/search?q=${q}`;
}
