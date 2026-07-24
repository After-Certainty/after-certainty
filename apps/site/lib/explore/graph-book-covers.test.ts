import { describe, expect, it } from "vitest";

import { buildCoverImageBySlugLookup, resolveCoverForGraphBookSlug } from "@/lib/explore/graph-book-covers";
import type { Book } from "@/types/semanticGraph";

function book(over: Partial<Book> & Pick<Book, "slug">): Book {
  const { slug, ...rest } = over;
  return {
    id: rest.id ?? `book-${slug}`,
    slug,
    title: rest.title ?? "Title",
    concepts: [],
    patterns: [],
    sources: [],
    ...rest,
  };
}

describe("buildCoverImageBySlugLookup", () => {
  it("maps canonical slug and slugAliases to the same cover URL", () => {
    const books = [
      book({
        slug: "main-slug",
        slugAliases: ["legacy-slug"],
        coverImage: "/covers/book.jpg",
      }),
    ];
    const map = buildCoverImageBySlugLookup(books);
    expect(map.get("main-slug")).toBe("/covers/book.jpg");
    expect(map.get("legacy-slug")).toBe("/covers/book.jpg");
  });

  it("prefers generated card variant when present", () => {
    const books = [
      book({
        slug: "gen",
        coverImage: "/legacy.jpg",
        coverImages: {
          detail: {
            path: "book-covers/gen/detail.webp",
            url: "/generated/book-covers/gen/detail.webp",
            width: 720,
            height: 1080,
            format: "webp",
            bytes: 1,
            sha256: "a".repeat(64),
          },
          card: {
            path: "book-covers/gen/card.webp",
            url: "/generated/book-covers/gen/card.webp",
            width: 640,
            height: 960,
            format: "webp",
            bytes: 1,
            sha256: "b".repeat(64),
          },
          thumbnail: {
            path: "book-covers/gen/thumbnail.webp",
            url: "/generated/book-covers/gen/thumbnail.webp",
            width: 240,
            height: 360,
            format: "webp",
            bytes: 1,
            sha256: "c".repeat(64),
          },
        },
      }),
    ];
    expect(buildCoverImageBySlugLookup(books, "card").get("gen")).toBe(
      "/generated/book-covers/gen/card.webp",
    );
  });

  it("omits books without coverImage", () => {
    const map = buildCoverImageBySlugLookup([book({ slug: "no-cover" })]);
    expect(map.size).toBe(0);
  });
});

describe("resolveCoverForGraphBookSlug", () => {
  const books = [
    book({
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
