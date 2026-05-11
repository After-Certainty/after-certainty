import { describe, expect, it } from "vitest";

import { assets, bookGithubDownloads, bookPageContent } from "@/lib/books/when-others-look-to-you/content";
import { mergeWhenOthersLookToYouCatalog } from "@/lib/books/when-others-look-to-you/catalog-sync";
import type { Book } from "@/types/content";

describe("mergeWhenOthersLookToYouCatalog", () => {
  it("returns the book unchanged when slug is not WoLTY", () => {
    const book: Book = {
      slug: "how-meaning-moves",
      title: "Catalog title",
      subtitle: "Sub",
      description: "Desc",
      status: "forthcoming",
      year: 2026,
      authors: [],
      themes: [],
      tags: [],
      contributorCount: 0,
    };
    expect(mergeWhenOthersLookToYouCatalog(book)).toBe(book);
  });

  it("overlays WoLTY fields from content.ts when slug matches", () => {
    const book: Book = {
      slug: "when-others-look-to-you",
      title: "Stale catalog title",
      subtitle: "Stale",
      description: "Stale desc",
      status: "forthcoming",
      year: 1999,
      authors: ["Kevin Steffensen"],
      themes: ["Leadership"],
      tags: [],
      contributorCount: 1,
    };

    const merged = mergeWhenOthersLookToYouCatalog(book);
    expect(merged.title).toBe(bookPageContent.title);
    expect(merged.subtitle).toBe(bookPageContent.subtitle);
    expect(merged.description).toBe(bookPageContent.paragraphs.join(" "));
    expect(merged.coverImage).toBe(assets.bookCover);
    expect(merged.epubUrl).toBe(bookGithubDownloads.epub);
    expect(merged.year).toBe(2026);
    expect(merged.authors).toEqual(book.authors);
  });
});
