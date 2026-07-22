import bookOverviewsJson from "@/data/book-overviews.json";
import {
  parseBookOverviewsManifest,
  type BookOverview,
  type BookOverviewsManifest,
} from "@/lib/books/book-overview-schema";

let cached: BookOverviewsManifest | null = null;

export function getBookOverviewsManifest(): BookOverviewsManifest {
  if (!cached) {
    cached = parseBookOverviewsManifest(bookOverviewsJson);
  }
  return cached;
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

/** Test helper — clears the parse cache. */
export function resetBookOverviewsCacheForTests(): void {
  cached = null;
}
