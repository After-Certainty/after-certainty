import podcastFallback from "@/data/podcast-episodes.json";
import { loadInstalledSemanticGraphSync } from "@/lib/graph/installed-manifest";
import { getSearchAliasConfigFromGraph } from "@/lib/search/aliases";
import { buildSearchDocuments } from "@/lib/search/buildSearchDocuments";
import type { SearchDocument } from "@/lib/search/types";
import type { PodcastEpisode } from "@/types/content";
import type { SemanticGraph } from "@/types/semanticGraph";

/**
 * Search corpus from the installed local manifest (tests / budgets).
 * Prefer injecting an explicit graph fixture in unit tests.
 */
export function loadInstalledSearchDocuments(graph?: SemanticGraph): SearchDocument[] {
  const resolved = graph ?? loadInstalledSemanticGraphSync();
  const podcastEpisodes = podcastFallback.episodes as PodcastEpisode[];

  return buildSearchDocuments({
    graph: resolved,
    podcastEpisodes,
    aliasConfig: getSearchAliasConfigFromGraph(resolved),
  });
}

/** @deprecated Use {@link loadInstalledSearchDocuments}. */
export function loadBundledSearchDocuments(): SearchDocument[] {
  return loadInstalledSearchDocuments();
}
