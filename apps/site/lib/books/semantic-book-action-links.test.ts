import { describe, expect, it } from "vitest";

import {
  getOrderedBookActions,
  getSemanticBookActionLinkItems,
} from "@/lib/books/semantic-book-action-links";
import type { Book } from "@/types/semanticGraph";

const baseBook: Book = {
  id: "book-example",
  slug: "example",
  title: "Example",
};

describe("getSemanticBookActionLinkItems", () => {
  it("returns purchase links before download links", () => {
    const items = getSemanticBookActionLinkItems({
      ...baseBook,
      purchaseLinks: [{ retailer: "amazon", url: "https://www.amazon.com/example" }],
      epub: { enabled: true, file: "example.epub", url: "https://github.com/example.epub" },
    });
    expect(items).toEqual([
      { label: "Buy on Amazon", href: "https://www.amazon.com/example", kind: "purchase" },
      { label: "Download EPUB", href: "https://github.com/example.epub", kind: "download" },
    ]);
  });

  it("uses custom purchase label when provided", () => {
    const items = getSemanticBookActionLinkItems({
      ...baseBook,
      purchaseLinks: [
        {
          retailer: "amazon",
          url: "https://www.amazon.com/example",
          label: "Order paperback",
        },
      ],
    });
    expect(items[0]?.label).toBe("Order paperback");
  });

  it("skips disabled or missing format URLs", () => {
    const items = getSemanticBookActionLinkItems({
      ...baseBook,
      epub: { enabled: false, file: "example.epub", url: "https://github.com/example.epub" },
      pdf: { enabled: true, file: "example.pdf", url: null },
    });
    expect(items).toEqual([]);
  });
});

describe("getOrderedBookActions", () => {
  it("honors primaryActionPreference for PDF", () => {
    const ordered = getOrderedBookActions({
      book: {
        ...baseBook,
        purchaseLinks: [{ retailer: "amazon", url: "https://www.amazon.com/example" }],
        pdf: { enabled: true, file: "example.pdf", url: "https://cdn.example/example.pdf" },
        epub: { enabled: true, file: "example.epub", url: "https://cdn.example/example.epub" },
      },
      relationship: "sole",
      preference: "download_pdf",
    });
    expect(ordered.primary?.label).toBe("Download PDF");
    expect(ordered.secondary.map((s) => s.label)).toContain("Buy on Amazon");
  });

  it("navigates to current edition when superseded", () => {
    const ordered = getOrderedBookActions({
      book: {
        ...baseBook,
        pdf: { enabled: true, file: "old.pdf", url: "https://cdn.example/old.pdf" },
      },
      relationship: "superseded",
      currentEditionHref: "/explore/books/current",
      currentEditionTitle: "Current Title",
    });
    expect(ordered.primary).toEqual({
      label: "Continue to Current Title",
      href: "/explore/books/current",
      kind: "navigate",
    });
    expect(ordered.secondary).toHaveLength(1);
  });
});
