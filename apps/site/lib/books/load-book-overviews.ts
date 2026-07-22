import fallbackSemantic from "@/data/semantic-manifest.json";
import {
  bookOverviewsFromGraph,
  bookOverviewFromBook,
  bookOverviewPrioritySlugs,
} from "@/lib/graph/discovery";
import { validateSemanticGraph } from "@/lib/graph/validate";
import type { BookOverview, BookOverviewsManifest } from "@/lib/books/book-overview-schema";
import type { Book, SemanticGraph } from "@/types/semanticGraph";

function bundledGraph(): SemanticGraph {
  const result = validateSemanticGraph(fallbackSemantic as unknown);
  if (!result.success) {
    throw new Error("Bundled semantic-manifest.json failed validation for book overviews");
  }
  return result.data;
}

/** Overviews derived from the live semantic graph (preferred). */
export function getBookOverviewsFromGraph(graph: SemanticGraph): BookOverview[] {
  return bookOverviewsFromGraph(graph);
}

export function getBookOverviewFromBook(book: Book): BookOverview | undefined {
  return bookOverviewFromBook(book);
}

/** Sync accessor for tests/validation — uses the bundled manifest. */
export function getBookOverviewsManifest(): BookOverviewsManifest {
  return {
    manifestVersion: 1,
    prioritySlugs: bookOverviewPrioritySlugs(),
    overviews: bookOverviewsFromGraph(bundledGraph()),
  };
}

export function getAllBookOverviews(): BookOverview[] {
  return getBookOverviewsManifest().overviews;
}

export function getBookOverviewBySlug(slug: string): BookOverview | undefined {
  return getAllBookOverviews().find((o) => o.slug === slug);
}

export function getBookOverviewByBookId(bookId: string): BookOverview | undefined {
  return getAllBookOverviews().find((o) => o.bookId === bookId);
}

export function hasBookOverview(slug: string): boolean {
  return Boolean(getBookOverviewBySlug(slug));
}

/** Test helper — no-op cache clear (overviews are derived). */
export function resetBookOverviewsCacheForTests(): void {
  // Derived from bundled graph; nothing to clear.
}
