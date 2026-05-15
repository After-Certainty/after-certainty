import { describe, expect, it } from "vitest";

import { buildCoverImageBySlugLookup, resolveCoverForGraphBookSlug } from "@/lib/explore/graph-book-covers";
import type { Book as CatalogBook } from "@/types/content";

function catalog(over: Partial<CatalogBook> & Pick<CatalogBook, "slug">): CatalogBook {
  return {
    slug: over.slug,
    title: over.title ?? "Title",
    description: over.description ?? "Description",
    status: "published",
    authors: [],
    ...over,
  };
}

describe("buildCoverImageBySlugLookup", () => {
  it("maps canonical slug and slugAliases to the same cover URL", () => {
    const books = [
      catalog({
        slug: "main-slug",
        slugAliases: ["legacy-slug"],
        coverImage: "/covers/book.jpg",
      }),
    ];
    const map = buildCoverImageBySlugLookup(books);
    expect(map.get("main-slug")).toBe("/covers/book.jpg");
    expect(map.get("legacy-slug")).toBe("/covers/book.jpg");
  });

  it("omits books without coverImage", () => {
    const map = buildCoverImageBySlugLookup([catalog({ slug: "no-cover" })]);
    expect(map.size).toBe(0);
  });
});

describe("resolveCoverForGraphBookSlug", () => {
  const books = [
    catalog({
      slug: "canon",
      slugAliases: ["graph-alias"],
      coverImage: "/c.jpg",
    }),
  ];

  it("returns cover when graph slug matches a catalog slug key", () => {
    const lookup = buildCoverImageBySlugLookup(books);
    expect(resolveCoverForGraphBookSlug(lookup, books, "canon")).toBe("/c.jpg");
  });

  it("returns cover when graph slug matches a slug alias key", () => {
    const lookup = buildCoverImageBySlugLookup(books);
    expect(resolveCoverForGraphBookSlug(lookup, books, "graph-alias")).toBe("/c.jpg");
  });

  it("resolves via canonical slug when lookup only has the canonical key", () => {
    const lookup = new Map<string, string>([["canon", "/c.jpg"]]);
    expect(resolveCoverForGraphBookSlug(lookup, books, "graph-alias")).toBe("/c.jpg");
  });

  it("returns undefined when slug cannot be resolved", () => {
    const lookup = new Map<string, string>([["canon", "/c.jpg"]]);
    expect(resolveCoverForGraphBookSlug(lookup, books, "unknown")).toBeUndefined();
  });
});
