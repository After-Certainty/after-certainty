import { getPodcastEpisodes } from "@/lib/content-data";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { enrichQuestion, enrichQuestions } from "@/lib/questions/enrichQuestions";
import {
  getFeaturedQuestions,
  getPublishedQuestions,
  getQuestionBySlug,
} from "@/lib/questions/loadQuestions";
import type { EnrichedQuestion } from "@/types/questions";

export async function getEnrichedPublishedQuestions(): Promise<EnrichedQuestion[]> {
  const [{ graph }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodes(),
  ]);
  return enrichQuestions(getPublishedQuestions(graph), graph, podcastEpisodes);
}

export async function getEnrichedFeaturedQuestions(limit = 4): Promise<EnrichedQuestion[]> {
  const [{ graph }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodes(),
  ]);
  return enrichQuestions(getFeaturedQuestions(limit, graph), graph, podcastEpisodes);
}

export async function getEnrichedQuestionBySlug(
  slug: string,
): Promise<EnrichedQuestion | undefined> {
  const [{ graph }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodes(),
  ]);
  const question = getQuestionBySlug(slug, graph);
  if (!question || question.status !== "published") {
    return undefined;
  }

  return enrichQuestion(question, graph, podcastEpisodes);
}
