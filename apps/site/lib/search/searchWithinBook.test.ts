import { describe, expect, it } from "vitest";

import { createSearchEngine } from "@/lib/search/miniSearch";
import { searchWithinBook } from "@/lib/search/query";
import type { SearchDocument } from "@/lib/search/types";

function chapterDoc(
  partial: Partial<SearchDocument> & Pick<SearchDocument, "id" | "title" | "bookIds">,
): SearchDocument {
  return {
    entityType: "chapter",
    slug: partial.id,
    description: "",
    resultLabel: "Chapter",
    canonicalUrl: `/explore/books/x/chapters/${partial.id}`,
    visibility: "listed",
    searchText: partial.title,
    aliases: [],
    boostWeight: 1,
    sourceArtifact: "semantic",
    ...partial,
  };
}

describe("searchWithinBook", () => {
  it("scopes to chapter docs for one edition", () => {
    const engine = createSearchEngine([
      chapterDoc({
        id: "ch-a",
        title: "Letting Go",
        searchText: "Letting Go\nRelease the need for heroes",
        bookIds: ["edition-a"],
      }),
      chapterDoc({
        id: "ch-b",
        title: "Letting Go elsewhere",
        searchText: "Letting Go elsewhere",
        bookIds: ["edition-b"],
      }),
      {
        id: "concept-letting-go",
        entityType: "concept",
        slug: "letting-go",
        title: "Letting Go",
        resultLabel: "Concept",
        canonicalUrl: "/explore/concepts/letting-go",
        visibility: "listed",
        searchText: "Letting Go",
        aliases: [],
        boostWeight: 1.2,
        sourceArtifact: "semantic",
      },
    ]);

    const hits = searchWithinBook(engine, "letting", "edition-a");
    expect(hits.map((hit) => hit.document.id)).toEqual(["ch-a"]);
  });

  it("returns no hits for an empty edition id", () => {
    const engine = createSearchEngine([
      chapterDoc({ id: "ch-a", title: "Alpha", bookIds: ["edition-a"] }),
    ]);
    expect(searchWithinBook(engine, "alpha", "")).toEqual([]);
  });
});
