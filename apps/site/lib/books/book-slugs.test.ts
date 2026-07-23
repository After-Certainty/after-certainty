import { describe, expect, it } from "vitest";

import {
  deriveFeaturedBookSlug,
  resolveBookCanonicalSlug,
  WOLTY_PUBLIC_ALIAS,
  WOLTY_V1_SLUG,
} from "@/lib/books/book-slugs";
import type { Book } from "@/types/semanticGraph";

function book(over: Partial<Book> & Pick<Book, "slug">): Book {
  return {
    id: over.id ?? over.slug,
    title: over.title ?? "T",
    concepts: [],
    patterns: [],
    sources: [],
    ...over,
  };
}

describe("resolveBookCanonicalSlug", () => {
  const books = [
    book({
      slug: WOLTY_V1_SLUG,
      slugAliases: [WOLTY_PUBLIC_ALIAS],
    }),
  ];

  it("resolves public alias to v1 canonical slug", () => {
    expect(resolveBookCanonicalSlug(WOLTY_PUBLIC_ALIAS, books)).toBe(WOLTY_V1_SLUG);
  });

  it("returns canonical slug for direct match", () => {
    expect(resolveBookCanonicalSlug(WOLTY_V1_SLUG, books)).toBe(WOLTY_V1_SLUG);
  });

  it("returns undefined for unknown slug", () => {
    expect(resolveBookCanonicalSlug("unknown", books)).toBeUndefined();
  });
});

describe("deriveFeaturedBookSlug", () => {
  it("prefers WoLTY alias target", () => {
    const books = [
      book({ slug: "pub-book", status: "published" }),
      book({ slug: WOLTY_V1_SLUG, slugAliases: [WOLTY_PUBLIC_ALIAS], status: "published" }),
    ];
    expect(deriveFeaturedBookSlug(books)).toBe(WOLTY_V1_SLUG);
  });

  it("prefers first published when no WoLTY alias", () => {
    const books = [
      book({ slug: "draft-book", status: "draft" }),
      book({ slug: "pub-book", status: "published" }),
    ];
    expect(deriveFeaturedBookSlug(books)).toBe("pub-book");
  });
});
