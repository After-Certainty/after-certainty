import { describe, expect, it } from "vitest";

import { mergeCatalogBooksIntoSemanticGraph } from "@/lib/explore/mergeCatalogBooksIntoSemanticGraph";
import type { SemanticGraph } from "@/types/semanticGraph";
import type { Book as CatalogBook } from "@/types/content";

const graph: SemanticGraph = {
  books: [
    {
      id: "b-semantic",
      slug: "how-meaning-moves",
      title: "How Meaning Moves",
      summary: "From manifest",
      concepts: ["c1"],
      patterns: [],
      sources: [],
    },
  ],
  glossary: [],
  patterns: [],
  sources: [],
  relationships: [],
};

const catalog: CatalogBook[] = [
  {
    slug: "how-meaning-moves",
    title: "How Meaning Moves",
    description: "Catalog description",
    status: "published",
    authors: [],
  },
  {
    slug: "other-book",
    title: "Other Book",
    description: "Other",
    status: "published",
    authors: [],
  },
];

describe("mergeCatalogBooksIntoSemanticGraph", () => {
  it("adds catalog-only books and preserves manifest ids and links", () => {
    const merged = mergeCatalogBooksIntoSemanticGraph(graph, catalog);
    expect(merged.books).toHaveLength(2);
    const hmm = merged.books.find((b) => b.slug === "how-meaning-moves");
    expect(hmm?.id).toBe("b-semantic");
    expect(hmm?.concepts).toEqual(["c1"]);
    expect(hmm?.summary).toBe("From manifest");
  });

  it("enriches every manifest edition that shares a catalog canonical slug", () => {
    const multi: SemanticGraph = {
      ...graph,
      books: [
        {
          id: "v1",
          slug: "when-others-look-to-you-v1",
          title: "WoLTY v1",
          concepts: [],
          patterns: [],
          sources: [],
        },
        {
          id: "v2",
          slug: "when-others-look-to-you-v2",
          title: "WoLTY v2",
          concepts: [],
          patterns: [],
          sources: [],
        },
      ],
    };
    const catalog: CatalogBook[] = [
      {
        slug: "when-others-look-to-you",
        title: "WoLTY",
        description: "Shared catalog copy",
        status: "published",
        authors: [],
        slugAliases: ["when-others-look-to-you-v1", "when-others-look-to-you-v2"],
      },
    ];
    const merged = mergeCatalogBooksIntoSemanticGraph(multi, catalog);
    expect(merged.books).toHaveLength(2);
    expect(merged.books.find((b) => b.slug === "when-others-look-to-you-v1")?.summary).toBe("Shared catalog copy");
    expect(merged.books.find((b) => b.slug === "when-others-look-to-you-v2")?.summary).toBe("Shared catalog copy");
  });
});
