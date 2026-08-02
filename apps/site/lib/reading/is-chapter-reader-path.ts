import { explorePaths } from "@/lib/graph/explorePaths";

/**
 * True for native chapter reader routes: `/explore/books/{slug}/chapters/{chapterSlug}`.
 * Used to omit standard site header/footer (and Explore sidebar when present) on reading surfaces.
 */
export function isChapterReaderPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const books = explorePaths.books.replace(/\/$/, "");
  // /explore/books/:slug/chapters/:chapterSlug — no trailing extra segments
  const pattern = new RegExp(`^${escapeRegExp(books)}/[^/]+/chapters/[^/]+/?$`);
  return pattern.test(pathname);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
