import { explorePaths } from "@/lib/graph/explorePaths";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { getPublishedChallengeBySlug, getPublishedChallenges } from "@/lib/games/pattern-recognition/load";
import { buildChoices } from "@/lib/games/pattern-recognition/scoring";
import type { ChallengeDefinition, PatternChoice } from "@/types/challenges";

export type EnrichedChallenge = ChallengeDefinition & {
  choices: PatternChoice[];
  titleByPatternId: Record<string, string>;
  dominantPatternHref: string;
  relatedBookHref?: string;
  relatedBookTitle?: string;
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

export async function getEnrichedPublishedChallenges(): Promise<EnrichedChallenge[]> {
  const { graph } = await getExploreSemanticGraph();
  const titles = patternTitleMap(graph.patterns);
  const booksBySlug = new Map(graph.books.map((book) => [book.slug, book]));

  return getPublishedChallenges(graph).map((challenge) => {
    const relatedBookSlug = challenge.relatedBooks?.[0];
    const relatedBook = relatedBookSlug ? booksBySlug.get(relatedBookSlug) : undefined;
    return {
      ...challenge,
      choices: buildChoices(challenge, titles),
      titleByPatternId: titles,
      dominantPatternHref: `${explorePaths.patterns}/${challenge.dominantPattern}`,
      relatedBookHref: relatedBook ? `${explorePaths.books}/${relatedBook.slug}` : undefined,
      relatedBookTitle: relatedBook?.title,
    };
  });
}

export async function getEnrichedChallengeBySlug(
  slug: string,
): Promise<EnrichedChallenge | undefined> {
  const { graph } = await getExploreSemanticGraph();
  const challenge = getPublishedChallengeBySlug(slug, graph);
  if (!challenge) return undefined;
  const titles = patternTitleMap(graph.patterns);
  const relatedBookSlug = challenge.relatedBooks?.[0];
  const relatedBook = relatedBookSlug
    ? graph.books.find((book) => book.slug === relatedBookSlug)
    : undefined;
  return {
    ...challenge,
    choices: buildChoices(challenge, titles),
    titleByPatternId: titles,
    dominantPatternHref: `${explorePaths.patterns}/${challenge.dominantPattern}`,
    relatedBookHref: relatedBook ? `${explorePaths.books}/${relatedBook.slug}` : undefined,
    relatedBookTitle: relatedBook?.title,
  };
}
