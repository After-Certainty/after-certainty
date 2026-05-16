import { describe, expect, it } from "vitest";

import { buildExploreCoverBySlug } from "@/lib/explore/buildExploreCoverBySlug";
import type { Book as CatalogBook } from "@/types/content";
import type { SemanticGraph } from "@/types/semanticGraph";

function catalogBook(over: Partial<CatalogBook> & Pick<CatalogBook, "slug">): CatalogBook {
  return {
    slug: over.slug,
    title: over.title ?? "T",
    description: over.description ?? "D",
    status: "published",
    authors: [],
    ...over,
  };
}

describe("buildExploreCoverBySlug", () => {
  it("fills from catalog when manifest book has no cover", () => {
    const graph: SemanticGraph = {
      books: [{ id: "b", slug: "my-book", title: "Book", concepts: [], patterns: [], sources: [] }],
      glossary: [],
      patterns: [],
      sources: [],
      relationships: [],
    };
    const books = [catalogBook({ slug: "my-book", coverImage: "/from-catalog.jpg" })];
    expect(buildExploreCoverBySlug(graph, books)).toEqual({ "my-book": "/from-catalog.jpg" });
  });

  it("prefers manifest coverImage when catalog does not define one", () => {
    const graph: SemanticGraph = {
      books: [
        {
          id: "b",
          slug: "only-manifest",
          title: "Book",
          coverImage: "/manifest.jpg",
          concepts: [],
          patterns: [],
          sources: [],
        },
      ],
      glossary: [],
      patterns: [],
      sources: [],
      relationships: [],
    };
    expect(buildExploreCoverBySlug(graph, [catalogBook({ slug: "only-manifest" })])).toEqual({
      "only-manifest": "/manifest.jpg",
    });
  });
});
