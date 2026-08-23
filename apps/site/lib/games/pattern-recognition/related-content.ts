import { bookIsPublic, findBookBySlug } from "@/lib/books/book-metadata";
import { publicChaptersForPattern } from "@/lib/graph/query/chapter-associations";
import { chapterPublicPath, chaptersFromGraph } from "@/lib/graph/chapters";
import { explorePaths } from "@/lib/graph/explorePaths";
import type { GraphIndex } from "@/lib/graph/graph";
import { getPatternBySlug, getSituationBySlug } from "@/lib/graph/query/graphQueries";
import { relatedContentForPattern } from "@/lib/graph/query/relatedContent";
import { isChapterSearchEligible } from "@/lib/corpus/chapter-eligibility";
import type { ChallengeDefinition } from "@/types/challenges";
import type { PodcastEpisode } from "@/types/content";
import type { Book, SemanticGraph } from "@/types/semanticGraph";

export type ChallengeRelatedContent = {
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

function bookHref(book: Book): string {
  return `${explorePaths.books}/${book.slug}`;
}

function resolveBook(
  challenge: ChallengeDefinition,
  graph: SemanticGraph,
  index: GraphIndex,
): Book | undefined {
  for (const slug of challenge.relatedBooks ?? []) {
    const book = findBookBySlug(slug, graph.books);
    if (book && bookIsPublic(book)) return book;
  }

  const pattern = getPatternBySlug(index, challenge.dominantPattern);
  if (!pattern) return undefined;
  const related = relatedContentForPattern(index, pattern).books;
  return related.find((book) => bookIsPublic(book));
}

function resolveChapter(
  challenge: ChallengeDefinition,
  graph: SemanticGraph,
  index: GraphIndex,
): { href: string; title: string } | undefined {
  const booksById = new Map(graph.books.map((book) => [book.id, book]));
  const chapters = chaptersFromGraph(graph);

  for (const chapterId of challenge.relatedChapterIds ?? []) {
    const chapter = chapters.find((entry) => entry.id === chapterId);
    if (!chapter) continue;
    const book = booksById.get(chapter.editionId);
    if (!book || !isChapterSearchEligible(chapter, book)) continue;
    const href = chapterPublicPath(chapter);
    if (!href) continue;
    return { href, title: chapter.title };
  }

  const pattern = getPatternBySlug(index, challenge.dominantPattern);
  if (!pattern) return undefined;
  const fallback = publicChaptersForPattern(graph, pattern.id)[0];
  if (!fallback) return undefined;
  return { href: fallback.href, title: fallback.title };
}

function resolvePodcast(
  challenge: ChallengeDefinition,
  podcastEpisodes: readonly PodcastEpisode[],
): { href: string; title: string; external: boolean } | undefined {
  const authored = challenge.relatedPodcastEpisodeId?.trim();
  if (!authored) return undefined;
  const rawId = authored.startsWith("podcast:") ? authored.slice("podcast:".length) : authored;
  if (!rawId) return undefined;
  const episode = podcastEpisodes.find((entry) => entry.id === rawId);
  if (!episode?.episodeUrl?.trim()) return undefined;
  return {
    href: episode.episodeUrl,
    title: episode.title,
    external: /^https?:\/\//i.test(episode.episodeUrl),
  };
}

function resolveSituation(
  challenge: ChallengeDefinition,
  index: GraphIndex,
): { href: string; title: string } | undefined {
  const slug = challenge.relatedSituation?.trim();
  if (!slug) return undefined;
  const situation = getSituationBySlug(index, slug);
  if (!situation) return undefined;
  return {
    href: `${explorePaths.situations}/${situation.slug}`,
    title: situation.title,
  };
}

/**
 * Resolve corpus doorway links for a challenge reveal.
 * Client islands must not invent slugs — only render hrefs from this resolver.
 */
export function resolveChallengeRelatedContent(
  challenge: ChallengeDefinition,
  input: {
    graph: SemanticGraph;
    index: GraphIndex;
    podcastEpisodes?: readonly PodcastEpisode[];
  },
): ChallengeRelatedContent {
  const book = resolveBook(challenge, input.graph, input.index);
  const chapter = resolveChapter(challenge, input.graph, input.index);
  const podcast = resolvePodcast(challenge, input.podcastEpisodes ?? []);
  const situation = resolveSituation(challenge, input.index);

  return {
    dominantPatternHref: `${explorePaths.patterns}/${challenge.dominantPattern}`,
    relatedBookHref: book ? bookHref(book) : undefined,
    relatedBookTitle: book?.title,
    relatedChapterHref: chapter?.href,
    relatedChapterTitle: chapter?.title,
    relatedPodcastHref: podcast?.href,
    relatedPodcastTitle: podcast?.title,
    relatedPodcastExternal: podcast?.external,
    relatedSituationHref: situation?.href,
    relatedSituationTitle: situation?.title,
  };
}
