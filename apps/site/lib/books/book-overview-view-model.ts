import { getBookOverviewFromBook } from "@/lib/books/load-book-overviews";
import type { BookOverview, PrimaryActionPreference } from "@/lib/books/book-overview-schema";
import { publicationRegistryFromGraph } from "@/lib/graph/discovery";
import { resolveWorkEdition, type ResolvedEdition } from "@/lib/books/resolve-work-edition";
import type { Book, GlossaryConcept, Pattern, SemanticGraph } from "@/types/semanticGraph";

export type RelatedOverviewBook = {
  slug: string;
  title: string;
  id: string;
};

/**
 * Assembles graph book + authored overview overlay + resolved edition for Phase G.
 * Returns null when no overview exists on the book (legacy layout remains).
 */
export type BookOverviewViewModel = {
  book: Book;
  overview: BookOverview;
  edition: ResolvedEdition;
  selectedConcepts: GlossaryConcept[];
  selectedPatterns: Pattern[];
  readBefore: RelatedOverviewBook[];
  readNext: RelatedOverviewBook[];
  primaryActionPreference?: PrimaryActionPreference;
};

function resolveRelatedBooks(
  slugs: readonly string[] | undefined,
  booksBySlug: Map<string, Book>,
): RelatedOverviewBook[] {
  if (!slugs?.length) return [];
  const out: RelatedOverviewBook[] = [];
  for (const slug of slugs) {
    const book = booksBySlug.get(slug);
    if (!book) continue;
    out.push({ slug: book.slug, title: book.title, id: book.id });
  }
  return out;
}

export function buildBookOverviewViewModel(
  book: Book,
  graph: SemanticGraph,
): BookOverviewViewModel | null {
  const overview = getBookOverviewFromBook(book);
  if (!overview) return null;

  const conceptsById = new Map(graph.glossary.map((c) => [c.id, c]));
  const patternsById = new Map(graph.patterns.map((p) => [p.id, p]));
  const booksBySlug = new Map(graph.books.map((b) => [b.slug, b]));

  return {
    book,
    overview,
    edition: resolveWorkEdition(book, graph.books, publicationRegistryFromGraph(graph)),
    selectedConcepts: overview.selectedConceptIds
      .map((id) => conceptsById.get(id))
      .filter((c): c is GlossaryConcept => Boolean(c)),
    selectedPatterns: (overview.selectedPatternIds ?? [])
      .map((id) => patternsById.get(id))
      .filter((p): p is Pattern => Boolean(p)),
    readBefore: resolveRelatedBooks(overview.readBefore, booksBySlug),
    readNext: resolveRelatedBooks(overview.readNext, booksBySlug),
    primaryActionPreference: overview.primaryActionPreference,
  };
}
