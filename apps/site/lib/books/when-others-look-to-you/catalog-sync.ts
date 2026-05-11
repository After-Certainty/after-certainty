import { assets, bookGithubDownloads, bookPageContent } from "@/lib/books/when-others-look-to-you/content";
import { WOLTY_V1_SLUG } from "@/lib/books/generated-manifest";
import type { Book } from "@/types/content";

/** Legacy bundled manifest row slug */
const SLUG_LEGACY = "when-others-look-to-you";

/** Publication year shown in catalog — align with `content.ts` / releases (GitHub). */
const WOLTY_CATALOG_YEAR = 2026;

/**
 * Overlay manifest data with the book microsite single source of truth (`content.ts`).
 * Keeps catalog themes, links, etc. from JSON while syncing title, subtitle, description, cover art, EPUB URL, and year.
 */
export function mergeWhenOthersLookToYouCatalog(book: Book): Book {
  if (book.slug !== SLUG_LEGACY && book.slug !== WOLTY_V1_SLUG) return book;

  return {
    ...book,
    title: bookPageContent.title,
    subtitle: bookPageContent.subtitle,
    description: bookPageContent.paragraphs.join(" "),
    coverImage: assets.bookCover,
    epubUrl: book.epubUrl ?? bookGithubDownloads.epub,
    docxUrl: book.docxUrl ?? bookGithubDownloads.docx,
    year: WOLTY_CATALOG_YEAR,
  };
}
