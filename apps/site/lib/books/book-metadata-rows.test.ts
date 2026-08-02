import { describe, expect, it } from "vitest";

import { buildBookMetadataRows } from "@/lib/books/book-metadata-rows";
import type { Book } from "@/types/semanticGraph";

const baseBook: Book = {
  id: "book-1",
  slug: "sample",
  title: "Sample",
};

describe("buildBookMetadataRows", () => {
  it("returns no rows when nothing real is present", () => {
    expect(buildBookMetadataRows({ book: baseBook })).toEqual([]);
  });

  it("includes only real content type, authors, dates, chapters, formats, and ISBNs", () => {
    const book: Book = {
      ...baseBook,
      contentType: "nonfiction",
      literaryForm: "monograph",
      authors: ["Kevin Steffensen"],
      publicationDate: "2024-11-15",
      isbns: ["979-8-2562-0892-9"],
      epub: { enabled: true, url: "https://example.com/a.epub" },
      pdf: { enabled: true, url: "https://example.com/a.pdf" },
      purchaseLinks: [{ retailer: "Amazon", url: "https://example.com/buy" }],
    };
    expect(buildBookMetadataRows({ book, chapterCount: 10 })).toEqual([
      { label: "Type", value: "Nonfiction · monograph" },
      { label: "Author", value: "Kevin Steffensen" },
      { label: "Published", value: "November 2024" },
      { label: "Chapters", value: "10 chapters" },
      { label: "Formats", value: "EPUB, PDF, Print" },
      { label: "ISBN", value: "979-8-2562-0892-9" },
    ]);
  });

  it("never invents page counts or ISBNs", () => {
    const rows = buildBookMetadataRows({
      book: {
        ...baseBook,
        contentType: "fiction",
        year: 2026,
      },
    });
    expect(rows.map((r) => r.label)).toEqual(["Type", "Published"]);
    expect(rows.some((r) => /page/i.test(r.label) || /page/i.test(r.value))).toBe(false);
    expect(rows.some((r) => r.label === "ISBN")).toBe(false);
  });

  it("falls back to year when ISO publication dates are absent", () => {
    expect(
      buildBookMetadataRows({
        book: { ...baseBook, year: 2025 },
      }),
    ).toEqual([{ label: "Published", value: "2025" }]);
  });
});
