import { isChapterSearchEligible } from "@/lib/corpus/chapter-eligibility";
import { chapterPublicPath, chaptersFromGraph } from "@/lib/graph/chapters";
import type { ManifestChapter, SemanticGraph } from "@/types/semanticGraph";

export type RelatedChapterLink = {
  id: string;
  title: string;
  href: string;
  bookTitle: string;
  bookSlug: string;
  position: number;
};

function toRelatedChapterLink(
  chapter: ManifestChapter,
  bookTitle: string,
  bookSlug: string,
): RelatedChapterLink | null {
  const href = chapterPublicPath(chapter);
  if (!href) return null;
  return {
    id: chapter.id,
    title: chapter.title,
    href,
    bookTitle,
    bookSlug,
    position: chapter.position,
  };
}

function publicChaptersForAssociation(
  graph: SemanticGraph,
  matches: (chapter: ManifestChapter) => boolean,
): RelatedChapterLink[] {
  const booksById = new Map(graph.books.map((book) => [book.id, book]));
  const out: RelatedChapterLink[] = [];

  for (const chapter of chaptersFromGraph(graph)) {
    if (!matches(chapter)) continue;
    const book = booksById.get(chapter.editionId);
    if (!isChapterSearchEligible(chapter, book) || !book) continue;
    const link = toRelatedChapterLink(chapter, book.title, book.slug);
    if (link) out.push(link);
  }

  return out.sort((a, b) => {
    const bookCmp = a.bookTitle.localeCompare(b.bookTitle);
    if (bookCmp !== 0) return bookCmp;
    return a.position - b.position;
  });
}

/** Public chapters that list this concept in selectedConceptIds. */
export function publicChaptersForConcept(
  graph: SemanticGraph,
  conceptId: string,
): RelatedChapterLink[] {
  return publicChaptersForAssociation(graph, (chapter) =>
    Boolean(chapter.selectedConceptIds?.includes(conceptId)),
  );
}

/** Public chapters that list this pattern in selectedPatternIds. */
export function publicChaptersForPattern(
  graph: SemanticGraph,
  patternId: string,
): RelatedChapterLink[] {
  return publicChaptersForAssociation(graph, (chapter) =>
    Boolean(chapter.selectedPatternIds?.includes(patternId)),
  );
}
