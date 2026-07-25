import { getPodcastEpisodes } from "@/lib/content-data";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { chaptersFromGraph } from "@/lib/graph/chapters";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getPublishedTrails } from "@/lib/trails/loadTrails";
import { enrichTrails } from "@/lib/trails/enrichTrails";
import { findPublishedTrailsForQuestion } from "@/lib/trails/relatedTrails";
import type { QuestionDefinition } from "@/types/questions";
import type { EnrichedTrail } from "@/types/trails";

export async function getEnrichedTrailsForQuestion(input: {
  question: QuestionDefinition;
  limit?: number;
}): Promise<EnrichedTrail[]> {
  const [{ graph }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodes(),
  ]);
  const index = buildGraphIndex(graph);
  const trails = findPublishedTrailsForQuestion({
    question: input.question,
    index,
    books: graph.books,
    chapters: chaptersFromGraph(graph),
    trails: getPublishedTrails(graph),
    limit: input.limit ?? 3,
  });

  return enrichTrails(trails, graph, podcastEpisodes);
}
