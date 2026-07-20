import { getPodcastEpisodes } from "@/lib/content-data";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { buildGraphIndex } from "@/lib/graph/graph";
import { enrichTrails } from "@/lib/trails/enrichTrails";
import { findPublishedTrailsForEntity } from "@/lib/trails/relatedTrails";
import type { EnrichedTrail } from "@/types/trails";

export async function getEnrichedTrailsForEntity(input: {
  canonicalId: string;
  limit?: number;
}): Promise<EnrichedTrail[]> {
  const [{ graph, catalogBooks }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodes(),
  ]);
  const index = buildGraphIndex(graph);
  const trails = findPublishedTrailsForEntity({
    canonicalId: input.canonicalId,
    index,
    catalogBooks,
    limit: input.limit ?? 3,
  });

  return enrichTrails(trails, graph, catalogBooks, podcastEpisodes);
}
