import { describe, expect, it } from "vitest";

import { getSemanticBookActionLinkItems } from "@/lib/books/semantic-book-action-links";
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
