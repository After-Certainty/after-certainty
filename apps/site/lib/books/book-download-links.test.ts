import { describe, expect, it } from "vitest";

import { getBookDownloadLinkItems } from "@/lib/books/book-download-links";
import type { Book } from "@/types/content";

const base = (overrides: Partial<Book>): Book => ({
  slug: "test-book",
  title: "Test",
  description: "D",
  status: "published",
  authors: ["A"],
  ...overrides,
});

describe("getBookDownloadLinkItems", () => {
  it("returns empty array when no asset URLs", () => {
    expect(getBookDownloadLinkItems(base({}))).toEqual([]);
  });

  it("includes only formats that have URLs", () => {
    expect(
      getBookDownloadLinkItems(
        base({
          epubUrl: "https://example.com/a.epub",
          pdfUrl: "https://example.com/a.pdf",
        }),
      ),
    ).toEqual([
      { label: "EPUB", href: "https://example.com/a.epub" },
      { label: "PDF", href: "https://example.com/a.pdf" },
    ]);
  });

  it("returns epub, docx, and pdf in that order when all set", () => {
    expect(
      getBookDownloadLinkItems(
        base({
          epubUrl: "https://e",
          docxUrl: "https://d",
          pdfUrl: "https://p",
        }),
      ),
    ).toEqual([
      { label: "EPUB", href: "https://e" },
      { label: "Word (DOCX)", href: "https://d" },
      { label: "PDF", href: "https://p" },
    ]);
  });
});
