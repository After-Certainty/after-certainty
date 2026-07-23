import { resolveBookCanonicalSlug } from "@/lib/books/book-slugs";
import { findBookBySlug } from "@/lib/books/book-metadata";
import { explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex, graphNodeTitle, type GraphIndex } from "@/lib/graph/graph";
import { enrichPathStops, totalEstimatedMinutes } from "@/lib/paths/enrichStop";
import { resolveBookSlugFromEntityId } from "@/lib/paths/validateStop";
import type { PodcastEpisode } from "@/types/content";
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
  graph: SemanticGraph,
): Pick<EnrichedTrail, "primaryBookTitle" | "primaryBookHref" | "primaryBookCover"> {
  if (!trail.primaryBookId) {
    return {};
  }

  const books = graph.books;
  const slug = resolveBookSlugFromEntityId(trail.primaryBookId);
  const canonicalSlug = resolveBookCanonicalSlug(slug, books) ?? slug;
  const graphBook = findBookBySlug(canonicalSlug, books);
  const resolvedId =
    index.resolveCanonicalId(canonicalSlug) ??
    index.resolveCanonicalId(trail.primaryBookId) ??
    trail.primaryBookId;

  return {
    primaryBookTitle: graphBook?.title ?? titleForGraphNode(index, resolvedId),
    primaryBookHref: `${explorePaths.books}/${canonicalSlug}`,
    primaryBookCover: graphBook?.coverImage ?? undefined,
  };
}

export function enrichTrail(
  trail: TrailDefinition,
  graph: SemanticGraph,
  podcastEpisodes: readonly PodcastEpisode[],
): EnrichedTrail {
  const index = buildGraphIndex(graph);
  const pathStopsEnriched = enrichPathStops(trail.pathStops, index, graph.books, podcastEpisodes);

  return {
    ...trail,
    pathStopsEnriched,
    totalEstimatedMinutes: totalEstimatedMinutes(pathStopsEnriched),
    ...enrichPrimaryBook(trail, index, graph),
  };
}

export function enrichTrails(
  trails: TrailDefinition[],
  graph: SemanticGraph,
  podcastEpisodes: readonly PodcastEpisode[],
): EnrichedTrail[] {
  return trails.map((t) => enrichTrail(t, graph, podcastEpisodes));
}

export function buildTrailSearchHandoffUrl(trail: TrailDefinition): string {
  const q = encodeURIComponent(trail.themes.slice(0, 2).join(" "));
  return `/search?q=${q}`;
}

/** Match curated trails for a search query using manifest search bridges. */
export function matchTrailsForSearchQuery(
  query: string,
  manifest: {
    trails: TrailDefinition[];
    searchBridges?: { terms: string[]; trailIds: string[] }[];
  },
  limit = 2,
): TrailDefinition[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const matchedIds = new Set<string>();
  for (const bridge of manifest.searchBridges ?? []) {
    const hit = bridge.terms.some(
      (term) => normalized.includes(term.toLowerCase()) || term.toLowerCase().includes(normalized),
    );
    if (hit) {
      for (const id of bridge.trailIds) matchedIds.add(id);
    }
  }

  return manifest.trails
    .filter((t) => t.status === "published" && matchedIds.has(t.id))
    .slice(0, limit);
}
