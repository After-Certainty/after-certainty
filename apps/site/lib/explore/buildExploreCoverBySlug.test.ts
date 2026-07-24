import { describe, expect, it } from "vitest";

import { buildExploreCoverBySlug } from "@/lib/explore/buildExploreCoverBySlug";
import type { Book, SemanticGraph } from "@/types/semanticGraph";

function graphBook(over: Partial<Book> & Pick<Book, "slug">): Book {
  return {
    id: over.id ?? over.slug,
    title: over.title ?? "T",
    concepts: [],
    patterns: [],
    sources: [],
    ...over,
  };
}

describe("buildExploreCoverBySlug", () => {
  it("fills from books list when manifest book has no cover", () => {
    const graph: SemanticGraph = {
      books: [graphBook({ id: "b", slug: "my-book", title: "Book" })],
      glossary: [],
      patterns: [],
      situations: [],
      sources: [],
      relationships: [],
    };
    const books = [graphBook({ slug: "my-book", coverImage: "/cover.jpg" })];
    expect(buildExploreCoverBySlug(graph, books)).toEqual({ "my-book": "/cover.jpg" });
  });

  it("uses thumbnail generated url when present", () => {
    const books = [
      graphBook({
        slug: "only-manifest",
        coverImage: "/manifest.jpg",
        coverImages: {
          detail: {
            path: "book-covers/only-manifest/detail.webp",
            url: "/generated/book-covers/only-manifest/detail.webp",
            width: 720,
            height: 1080,
            format: "webp",
            bytes: 1,
            sha256: "a".repeat(64),
          },
          card: {
            path: "book-covers/only-manifest/card.webp",
            url: "/generated/book-covers/only-manifest/card.webp",
            width: 640,
            height: 960,
            format: "webp",
            bytes: 1,
            sha256: "b".repeat(64),
          },
          thumbnail: {
            path: "book-covers/only-manifest/thumbnail.webp",
            url: "/generated/book-covers/only-manifest/thumbnail.webp",
            width: 240,
            height: 360,
            format: "webp",
            bytes: 1,
            sha256: "c".repeat(64),
          },
        },
      }),
    ];
    const graph: SemanticGraph = {
      books,
      glossary: [],
      patterns: [],
      situations: [],
      sources: [],
      relationships: [],
    };
    expect(buildExploreCoverBySlug(graph, books)).toEqual({
      "only-manifest": "/generated/book-covers/only-manifest/thumbnail.webp",
    });
  });
});
