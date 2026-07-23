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

  it("prefers manifest coverImage when lookup does not define one", () => {
    const graph: SemanticGraph = {
      books: [
        graphBook({
          id: "b",
          slug: "only-manifest",
          title: "Book",
          coverImage: "/manifest.jpg",
        }),
      ],
      glossary: [],
      patterns: [],
      situations: [],
      sources: [],
      relationships: [],
    };
    expect(buildExploreCoverBySlug(graph, [graphBook({ slug: "only-manifest" })])).toEqual({
      "only-manifest": "/manifest.jpg",
    });
  });
});
