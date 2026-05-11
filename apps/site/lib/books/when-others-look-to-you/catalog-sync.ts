import { assets, bookGithubDownloads, bookPageContent } from "@/lib/books/when-others-look-to-you/content";
import type { Book } from "@/types/content";

const SLUG = "when-others-look-to-you";

/** Publication year shown in catalog — align with `content.ts` / releases (GitHub). */
const WOLTY_CATALOG_YEAR = 2026;

/**
 * Overlay manifest data with the book microsite single source of truth (`content.ts`).
 * Keeps catalog themes, links, etc. from JSON while syncing title, subtitle, description, cover art, EPUB URL, and year.
 */
export function mergeWhenOthersLookToYouCatalog(book: Book): Book {
  if (book.slug !== SLUG) return book;

  return {
    ...book,
    title: bookPageContent.title,
    subtitle: bookPageContent.subtitle,
    description: bookPageContent.paragraphs.join(" "),
    coverImage: assets.bookCover,
    epubUrl: bookGithubDownloads.epub,
    year: WOLTY_CATALOG_YEAR,
  };
}
