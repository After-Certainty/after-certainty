import type { ContentType } from "@/lib/books/catalog-taxonomy";
import { CONTENT_TYPE_LABELS } from "@/lib/books/catalog-taxonomy";
import { formatPublicationMonthYear } from "@/lib/books/public-status";
import { contentTypeInfoFromBook } from "@/lib/graph/content-type";
import type { Book } from "@/types/semanticGraph";

export type BookMetadataRow = {
  label: string;
  value: string;
  /** Optional href when the value is a single navigable target. */
  href?: string;
};

export type BookMetadataInput = {
  book: Book;
  /** Registry or overview first-published ISO date when confirmed. */
  firstPublishedAt?: string;
  /** Public chapter count when chapters exist for this edition. */
  chapterCount?: number;
};

function formatList(values: string[]): string | undefined {
  const cleaned = values.map((v) => v.trim()).filter(Boolean);
  if (cleaned.length === 0) return undefined;
  return cleaned.join(", ");
}

function formatIsbns(isbns: string[] | undefined): string | undefined {
  if (!isbns?.length) return undefined;
  return formatList(isbns.map((isbn) => isbn.replace(/\s+/g, " ")));
}

function formatAuthors(book: Book): string | undefined {
  if (book.authors?.length) return formatList(book.authors);
  return undefined;
}

function formatContentType(book: Book): string | undefined {
  const info = contentTypeInfoFromBook(book);
  if (!info.isKnown) return undefined;
  const label = CONTENT_TYPE_LABELS[info.contentType as ContentType] ?? info.label;
  if (info.literaryForm && info.literaryForm !== info.contentType) {
    return `${label} · ${info.literaryForm.replace(/_/g, " ")}`;
  }
  return label;
}

function formatPublished(book: Book, firstPublishedAt?: string): string | undefined {
  if (firstPublishedAt?.trim()) {
    const formatted = formatPublicationMonthYear(firstPublishedAt);
    if (formatted) return formatted;
  }
  if (book.publicationDate?.trim()) {
    const formatted = formatPublicationMonthYear(book.publicationDate);
    if (formatted) return formatted;
  }
  if (typeof book.year === "number" && Number.isFinite(book.year) && book.year > 0) {
    return String(book.year);
  }
  return undefined;
}

function formatFormats(book: Book): string | undefined {
  const formats: string[] = [];
  if (book.epub?.enabled && book.epub.url) formats.push("EPUB");
  if (book.pdf?.enabled && book.pdf.url) formats.push("PDF");
  if (book.docx?.enabled && book.docx.url) formats.push("DOCX");
  if (book.purchaseLinks?.some((link) => Boolean(link.url?.trim()))) formats.push("Print");
  return formatList(formats);
}

/**
 * Build metadata rows from real corpus fields only.
 * Never invents page counts, ISBNs, or publication dates.
 */
export function buildBookMetadataRows(input: BookMetadataInput): BookMetadataRow[] {
  const { book, firstPublishedAt, chapterCount } = input;
  const rows: BookMetadataRow[] = [];

  const contentType = formatContentType(book);
  if (contentType) rows.push({ label: "Type", value: contentType });

  const authors = formatAuthors(book);
  if (authors) rows.push({ label: "Author", value: authors });

  const published = formatPublished(book, firstPublishedAt);
  if (published) rows.push({ label: "Published", value: published });

  if (typeof chapterCount === "number" && chapterCount > 0) {
    rows.push({
      label: "Chapters",
      value: `${chapterCount} ${chapterCount === 1 ? "chapter" : "chapters"}`,
    });
  }

  const formats = formatFormats(book);
  if (formats) rows.push({ label: "Formats", value: formats });

  const isbns = formatIsbns(book.isbns);
  if (isbns) rows.push({ label: "ISBN", value: isbns });

  return rows;
}
