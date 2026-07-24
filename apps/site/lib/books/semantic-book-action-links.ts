import type { PrimaryActionPreference } from "@/lib/books/book-overview-schema";
import type { EditionRelationship } from "@/lib/books/publication-registry-schema";
import type { Book, BookPurchaseLink, BookPurchaseRetailer } from "@/types/semanticGraph";

export type SemanticBookActionLinkItem = {
  label: string;
  href: string;
  kind: "purchase" | "download" | "navigate" | "read";
};

/** Same-tab internal actions (native reader, edition navigation). */
export function isInternalBookAction(kind: SemanticBookActionLinkItem["kind"]): boolean {
  return kind === "navigate" || kind === "read";
}

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

function preferenceMatchesItem(
  preference: PrimaryActionPreference,
  item: SemanticBookActionLinkItem,
): boolean {
  if (preference === "purchase") return item.kind === "purchase";
  if (preference === "download_pdf") {
    return item.kind === "download" && /pdf/i.test(item.label);
  }
  if (preference === "download_epub") {
    return item.kind === "download" && /epub/i.test(item.label);
  }
  if (preference === "download_docx") {
    return item.kind === "download" && /docx|word/i.test(item.label);
  }
  return false;
}

export type OrderedBookActions = {
  primary?: SemanticBookActionLinkItem;
  secondary: SemanticBookActionLinkItem[];
};

/**
 * Pick a clear primary CTA for redesigned overviews.
 * Superseded editions prefer navigating to the current volume over downloading the older file.
 * When `readHref` is set (public chapters exist), "Read" is primary unless a download/purchase
 * preference is set, or the edition is superseded.
 */
export function getOrderedBookActions(input: {
  book: Book;
  relationship: EditionRelationship;
  preference?: PrimaryActionPreference;
  currentEditionHref?: string;
  currentEditionTitle?: string;
  /** First public chapter path when the native reader is available for this edition. */
  readHref?: string;
}): OrderedBookActions {
  const {
    book,
    relationship,
    preference,
    currentEditionHref,
    currentEditionTitle,
    readHref,
  } = input;

  const readAction: SemanticBookActionLinkItem | undefined = readHref
    ? { label: "Read", href: readHref, kind: "read" }
    : undefined;

  if (relationship === "superseded" && currentEditionHref) {
    const navigate: SemanticBookActionLinkItem = {
      label: currentEditionTitle
        ? `Continue to ${currentEditionTitle}`
        : "Continue to current edition",
      href: currentEditionHref,
      kind: "navigate",
    };
    return {
      primary: navigate,
      secondary: [...(readAction ? [readAction] : []), ...getSemanticBookActionLinkItems(book)],
    };
  }

  const items = getSemanticBookActionLinkItems(book);

  if (preference) {
    const preferred = items.findIndex((item) => preferenceMatchesItem(preference, item));
    if (preferred >= 0) {
      const primary = items[preferred]!;
      const secondary = [
        ...(readAction ? [readAction] : []),
        ...items.filter((_, index) => index !== preferred),
      ];
      return { primary, secondary };
    }
  }

  if (readAction) {
    return { primary: readAction, secondary: items };
  }

  if (items.length === 0) {
    return { secondary: [] };
  }

  const primary = items[0]!;
  const secondary = items.slice(1);
  return { primary, secondary };
}
