import type { Book, BookPurchaseLink, BookPurchaseRetailer } from "@/types/semanticGraph";

export type SemanticBookActionLinkItem = {
  label: string;
  href: string;
  kind: "purchase" | "download";
};

const PURCHASE_LABEL_BY_RETAILER: Record<BookPurchaseRetailer, string> = {
  amazon: "Buy on Amazon",
  apple_books: "Buy on Apple Books",
  google_play: "Buy on Google Play",
  barnes_noble: "Buy on Barnes & Noble",
  bookshop: "Buy on Bookshop",
  other: "Buy",
};

function purchaseLinkLabel(link: BookPurchaseLink): string {
  return link.label?.trim() || PURCHASE_LABEL_BY_RETAILER[link.retailer];
}

/** Purchase and release-file links for explore book detail pages. */
export function getSemanticBookActionLinkItems(book: Book): SemanticBookActionLinkItem[] {
  const items: SemanticBookActionLinkItem[] = [];

  for (const link of book.purchaseLinks ?? []) {
    items.push({ label: purchaseLinkLabel(link), href: link.url, kind: "purchase" });
  }

  if (book.epub?.enabled && book.epub.url) {
    items.push({ label: "Download EPUB", href: book.epub.url, kind: "download" });
  }
  if (book.docx?.enabled && book.docx.url) {
    items.push({ label: "Download Word (DOCX)", href: book.docx.url, kind: "download" });
  }
  if (book.pdf?.enabled && book.pdf.url) {
    items.push({ label: "Download PDF", href: book.pdf.url, kind: "download" });
  }

  return items;
}
