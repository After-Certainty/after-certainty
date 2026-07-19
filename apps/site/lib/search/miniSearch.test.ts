import { describe, expect, it } from "vitest";

import { getSearchAliasConfig } from "@/lib/search/aliases";
import { createSearchEngine, queryMiniSearch } from "@/lib/search/miniSearch";
import { searchDocuments } from "@/lib/search/query";
import type { SearchDocument } from "@/lib/search/types";

function doc(
  partial: Partial<SearchDocument> & Pick<SearchDocument, "id" | "title">,
): SearchDocument {
  return {
    entityType: "concept",
    slug: partial.id,
    description: "",
    resultLabel: "Concept",
    canonicalUrl: `/explore/concepts/${partial.id}`,
    visibility: "listed",
    searchText: partial.title,
    aliases: [],
    boostWeight: 1,
    sourceArtifact: "semantic",
    ...partial,
  };
}

describe("createMiniSearchIndex / queryMiniSearch", () => {
  it("matches titles with prefix and returns stored fields", () => {
    const documents = [
      doc({ id: "concept-certainty", title: "Certainty", searchText: "Certainty\nA posture" }),
      doc({ id: "concept-trust", title: "Trust", searchText: "Trust" }),
    ];
    const engine = createSearchEngine(documents);
    const hits = queryMiniSearch(engine, "cert", { limit: 5 });
    expect(hits[0]?.document.id).toBe("concept-certainty");
    expect(hits[0]?.document.canonicalUrl).toContain("/explore/concepts/");
  });

  it("filters by entity type", () => {
    const documents = [
      doc({
        id: "book-1",
        title: "Trust Beyond Similarity",
        entityType: "book",
        resultLabel: "Book",
        canonicalUrl: "/explore/books/trust",
        searchText: "Trust Beyond Similarity",
        boostWeight: 1.3,
      }),
      doc({
        id: "concept-trust",
        title: "Trust",
        searchText: "Trust",
        boostWeight: 1.2,
      }),
    ];
    const hits = searchDocuments(documents, "trust", { entityTypes: ["book"] });
    expect(hits).toHaveLength(1);
    expect(hits[0]?.document.id).toBe("book-1");
  });

  it("surfaces related bridge terms via searchText and explanations", () => {
    const aliasConfig = getSearchAliasConfig();
    const documents = [
      doc({
        id: "pattern-exceptions-are-forever",
        title: "Exceptions are Forever",
        entityType: "pattern",
        resultLabel: "Pattern",
        canonicalUrl: "/explore/patterns/exceptions-are-forever",
        searchText: "Exceptions are Forever\ntemporary rules",
        boostWeight: 1.1,
      }),
    ];
    const hits = searchDocuments(documents, "temporary rules", { aliasConfig });
    expect(hits[0]?.document.id).toBe("pattern-exceptions-are-forever");
    expect(hits[0]?.explanations.some((e) => e.startsWith("Related to"))).toBe(true);
  });
});
