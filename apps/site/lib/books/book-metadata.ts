import { parseBookEdition } from "@/lib/books/canonical-editions";
import { resolveBookCanonicalSlug } from "@/lib/books/book-slugs";
import type { BookStatus } from "@/types/content";
import type { Book } from "@/types/semanticGraph";

export type BookAvailabilityFlag = "online" | "download" | "print" | "open";

/** Find a graph book by slug (exact, alias, or canonical resolve). */
export function findBookBySlug(slug: string, books: readonly Book[]): Book | undefined {
  const exact = books.find((b) => b.slug === slug);
  if (exact) return exact;

  const viaAlias = books.find((b) => b.slugAliases?.includes(slug));
  if (viaAlias) return viaAlias;

  const canonical = resolveBookCanonicalSlug(slug, books);
  if (canonical) return books.find((b) => b.slug === canonical);

  return undefined;
}

export function bookPublicationStatus(book: Book): BookStatus {
  return book.status ?? "published";
}

export function bookDescription(book: Book): string | undefined {
  return book.summary ?? book.description;
}

export function bookIsPublic(book: Book): boolean {
  const status = bookPublicationStatus(book);
  return status !== "draft";
}

export function bookHasExportUrl(book: Book): boolean {
  return Boolean(
    (book.epub?.enabled && book.epub.url) ||
    (book.pdf?.enabled && book.pdf.url) ||
    (book.docx?.enabled && book.docx.url),
  );
}

export function bookAvailabilityFlags(book: Book): BookAvailabilityFlag[] {
  const flags: BookAvailabilityFlag[] = [];
  if (bookHasExportUrl(book)) {
    flags.push("online", "download", "open");
  }
  if (book.purchaseLinks?.length) {
    flags.push("print");
  }
  return flags;
}

export function editionDisplayLabel(book: Book, books: readonly Book[]): string | undefined {
  const { edition, baseSlug } = parseBookEdition(book.slug);
  if (edition) return edition;
  if (book.companionOf) return "Companion edition";
  const siblings = books.filter((b) => parseBookEdition(b.slug).baseSlug === baseSlug);
  if (siblings.length > 1 && book.companionBooks?.length) return "Current edition";
  return undefined;
}
