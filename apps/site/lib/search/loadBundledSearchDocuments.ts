import podcastFallback from "@/data/podcast-episodes.json";
import fallbackSemantic from "@/data/semantic-manifest.json";
import { semanticGraphSchema, toSemanticGraph } from "@/lib/graph/schemas";
import { getSearchAliasConfig } from "@/lib/search/aliases";
import { buildSearchDocuments } from "@/lib/search/buildSearchDocuments";
import type { SearchDocument } from "@/lib/search/types";
import type { PodcastEpisode } from "@/types/content";

/** Offline corpus for tests and budgets — uses bundled semantic manifest only. */
export function loadBundledSearchDocuments(): SearchDocument[] {
  const graph = toSemanticGraph(semanticGraphSchema.parse(fallbackSemantic));
  const podcastEpisodes = podcastFallback.episodes as PodcastEpisode[];

  return buildSearchDocuments({
    graph,
    podcastEpisodes,
    aliasConfig: getSearchAliasConfig(),
  });
}
