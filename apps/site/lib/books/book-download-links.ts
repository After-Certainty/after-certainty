import type { Book } from "@/types/content";

export type BookDownloadLinkItem = {
  label: string;
  href: string;
};

/** Labels match copy on `/books/[slug]` download links. */
export function getBookDownloadLinkItems(book: Book): BookDownloadLinkItem[] {
  const items: BookDownloadLinkItem[] = [];
  if (book.epubUrl) items.push({ label: "EPUB", href: book.epubUrl });
  if (book.docxUrl) items.push({ label: "Word (DOCX)", href: book.docxUrl });
  if (book.pdfUrl) items.push({ label: "PDF", href: book.pdfUrl });
  return items;
}
