import { bookIsPublic } from "@/lib/books/book-metadata";
import { isValidChapterRouteKey } from "@/lib/graph/chapters";
import type { Book, ManifestChapter } from "@/types/semanticGraph";

/**
 * Sitemap eligibility for a chapter: public unit on a non-draft book with a valid routeKey.
 */
export function isChapterSitemapEligible(
  chapter: Pick<ManifestChapter, "public" | "routeKey">,
  book: Book | undefined,
): boolean {
  if (!chapter.public || !book || !bookIsPublic(book)) return false;
  return isValidChapterRouteKey(chapter.routeKey);
}

/**
 * Search eligibility matches sitemap: public chapter on a public book with a live routeKey.
 * Lean chapter documents (title/summary/aliases) — not manuscript body.
 */
export function isChapterSearchEligible(
  chapter: Pick<ManifestChapter, "public" | "routeKey">,
  book: Book | undefined,
): boolean {
  return isChapterSitemapEligible(chapter, book);
}
