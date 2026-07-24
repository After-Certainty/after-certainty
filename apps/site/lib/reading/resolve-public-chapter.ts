import {
  buildChapterRouteKey,
  chapterSlugFromRouteKey,
  publicChaptersForEdition,
} from "@/lib/graph/chapters";
import type { Book, ManifestChapter, SemanticGraph } from "@/types/semanticGraph";

export type ResolvedPublicChapter = {
  book: Book;
  chapter: ManifestChapter;
  editionSlug: string;
  chapterSlug: string;
  /** Canonical pathname (= chapter.routeKey when well-formed). */
  pathname: string;
};

/**
 * Resolve a public chapter for on-site reading (READ-002).
 * Returns null when the book is missing, the chapter is missing, private,
 * or the routeKey does not match the requested edition/chapter slugs.
 */
export function resolvePublicChapter(input: {
  graph: SemanticGraph;
  editionSlug: string;
  chapterSlug: string;
}): ResolvedPublicChapter | null {
  const editionSlug = input.editionSlug.trim();
  const chapterSlug = input.chapterSlug.trim();
  if (!editionSlug || !chapterSlug) return null;

  const book = input.graph.books.find((candidate) => candidate.slug === editionSlug);
  if (!book) return null;

  const editionId = book.editionId ?? book.id;
  const expectedPath = buildChapterRouteKey(editionSlug, chapterSlug);

  const chapter = publicChaptersForEdition(input.graph, editionId).find((candidate) => {
    if (candidate.routeKey === expectedPath) return true;
    return chapterSlugFromRouteKey(candidate.routeKey) === chapterSlug;
  });

  if (!chapter) return null;
  if (!chapter.public) return null;

  // Prefer the contracted path; reject records that disagree with the book slug.
  const pathname =
    chapter.routeKey === expectedPath
      ? chapter.routeKey
      : chapterSlugFromRouteKey(chapter.routeKey) === chapterSlug
        ? expectedPath
        : null;
  if (!pathname) return null;

  return {
    book,
    chapter,
    editionSlug,
    chapterSlug,
    pathname,
  };
}
