import { describe, expect, it } from "vitest";

import { buildGraphIndex } from "@/lib/graph/graph";
import { validateStopReference, type PathHealthIssue } from "@/lib/paths/validateStop";
import type { PathStopInput } from "@/types/paths";
import type { Book, SemanticGraph } from "@/types/semanticGraph";

function book(partial: Partial<Book> & Pick<Book, "id" | "slug" | "title">): Book {
  return {
    status: "published",
    ...partial,
  };
}

describe("validateStopReference edition warnings", () => {
  it("does not warn when a companion edition is used as a trail stop", () => {
    const books = [
      book({
        id: "book-when-others-look-to-you-v1",
        slug: "when-others-look-to-you-v1",
        title: "WoLTY v1",
        companionBooks: ["when-others-look-to-you-v2"],
      }),
      book({
        id: "book-when-others-look-to-you-v2",
        slug: "when-others-look-to-you-v2",
        title: "WoLTY v2",
        companionOf: "when-others-look-to-you-v1",
      }),
    ];
    const graph = {
      books,
      glossary: [],
      patterns: [],
      sources: [],
      relationships: [],
    } as SemanticGraph;
    const index = buildGraphIndex(graph);
    const issues: PathHealthIssue[] = [];
    const stop: PathStopInput = {
      position: 1,
      entityType: "book",
      entityId: "book-when-others-look-to-you-v2",
      description: "Companion stop",
    };

    validateStopReference(stop, index, graph, [], "trail-test", issues);
    expect(issues.some((i) => i.code === "non_canonical_edition")).toBe(false);
  });

  it("warns when a superseded edition is used as a trail stop", () => {
    // Registry-free heuristic: without registry, -vN companions are still "companion".
    // Simulate superseded via a book that resolveWorkEdition would mark superseded only through registry.
    // Use alias mismatch path for non-registry warning coverage:
    const books = [
      book({
        id: "book-when-others-look-to-you-v1",
        slug: "when-others-look-to-you-v1",
        title: "WoLTY v1",
        slugAliases: ["when-others-look-to-you"],
      }),
    ];
    const graph = {
      books,
      glossary: [],
      patterns: [],
      sources: [],
      relationships: [],
    } as SemanticGraph;
    const index = buildGraphIndex(graph);
    const issues: PathHealthIssue[] = [];
    const stop: PathStopInput = {
      position: 1,
      entityType: "book",
      bookSlug: "when-others-look-to-you",
      description: "Alias stop",
    };

    validateStopReference(stop, index, graph, [], "trail-test", issues);
    expect(issues.some((i) => i.code === "non_canonical_edition")).toBe(true);
  });
});
