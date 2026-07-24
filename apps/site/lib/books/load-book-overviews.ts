import {
  bookOverviewsFromGraph,
  bookOverviewFromBook,
  bookOverviewPrioritySlugs,
} from "@/lib/graph/discovery";
import { loadInstalledSemanticGraphSync } from "@/lib/graph/installed-manifest";
import type { BookOverview, BookOverviewsManifest } from "@/lib/books/book-overview-schema";
import type { Book, SemanticGraph } from "@/types/semanticGraph";

/** Overviews derived from the live semantic graph (preferred). */
export function getBookOverviewsFromGraph(graph: SemanticGraph): BookOverview[] {
  return bookOverviewsFromGraph(graph);
}

export function getBookOverviewFromBook(book: Book): BookOverview | undefined {
  return bookOverviewFromBook(book);
}

/** Sync accessor — uses the installed local manifest when no graph is passed. */
export function getBookOverviewsManifest(graph?: SemanticGraph): BookOverviewsManifest {
  const resolved = graph ?? loadInstalledSemanticGraphSync();
  return {
    manifestVersion: 1,
    prioritySlugs: bookOverviewPrioritySlugs(),
    overviews: bookOverviewsFromGraph(resolved),
  };
}

export function getAllBookOverviews(graph?: SemanticGraph): BookOverview[] {
  return getBookOverviewsManifest(graph).overviews;
}

export function getBookOverviewBySlug(slug: string, graph?: SemanticGraph): BookOverview | undefined {
  return getAllBookOverviews(graph).find((o) => o.slug === slug);
}

export function getBookOverviewByBookId(
  bookId: string,
  graph?: SemanticGraph,
): BookOverview | undefined {
  return getAllBookOverviews(graph).find((o) => o.bookId === bookId);
}

export function hasBookOverview(slug: string, graph?: SemanticGraph): boolean {
  return Boolean(getBookOverviewBySlug(slug, graph));
}

/** Test helper — no-op cache clear (overviews are derived). */
export function resetBookOverviewsCacheForTests(): void {
  // Derived from installed graph; nothing to clear.
}
