import { getPodcastEpisodesFromRss } from "@/lib/podcast/rss";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { buildGraphIndex } from "@/lib/graph/graph";
import {
  getPublishedChallengeBySlug,
  getPublishedChallenges,
} from "@/lib/games/pattern-recognition/load";
import { resolveChallengeRelatedContent } from "@/lib/games/pattern-recognition/related-content";
import { buildChoices } from "@/lib/games/pattern-recognition/scoring";
import type { ChallengeDefinition, PatternChoice } from "@/types/challenges";
import type { PodcastEpisode } from "@/types/content";
import type { SemanticGraph } from "@/types/semanticGraph";

export type EnrichedChallenge = ChallengeDefinition & {
  choices: PatternChoice[];
  titleByPatternId: Record<string, string>;
  dominantPatternHref: string;
  relatedBookHref?: string;
  relatedBookTitle?: string;
  relatedChapterHref?: string;
  relatedChapterTitle?: string;
  relatedPodcastHref?: string;
  relatedPodcastTitle?: string;
  relatedPodcastExternal?: boolean;
  relatedSituationHref?: string;
  relatedSituationTitle?: string;
};

function patternTitleMap(
  patterns: { slug: string; title: string }[],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const pattern of patterns) {
    map[pattern.slug] = pattern.title;
  }
  return map;
}

function enrichChallenge(
  challenge: ChallengeDefinition,
  graph: SemanticGraph,
  index: ReturnType<typeof buildGraphIndex>,
  titles: Record<string, string>,
  podcastEpisodes: readonly PodcastEpisode[],
): EnrichedChallenge {
  const related = resolveChallengeRelatedContent(challenge, {
    graph,
    index,
    podcastEpisodes,
  });
  return {
    ...challenge,
    choices: buildChoices(challenge, titles),
    titleByPatternId: titles,
    ...related,
  };
}

export async function getEnrichedPublishedChallenges(): Promise<EnrichedChallenge[]> {
  const [{ graph }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodesFromRss(),
  ]);
  const titles = patternTitleMap(graph.patterns);
  const index = buildGraphIndex(graph);
  return getPublishedChallenges(graph).map((challenge) =>
    enrichChallenge(challenge, graph, index, titles, podcastEpisodes),
  );
}

export async function getEnrichedChallengeBySlug(
  slug: string,
): Promise<EnrichedChallenge | undefined> {
  const [{ graph }, podcastEpisodes] = await Promise.all([
    getExploreSemanticGraph(),
    getPodcastEpisodesFromRss(),
  ]);
  const challenge = getPublishedChallengeBySlug(slug, graph);
  if (!challenge) return undefined;
  return enrichChallenge(
    challenge,
    graph,
    buildGraphIndex(graph),
    patternTitleMap(graph.patterns),
    podcastEpisodes,
  );
}
