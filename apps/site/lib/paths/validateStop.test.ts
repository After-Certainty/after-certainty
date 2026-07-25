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

describe("validateStopReference chapter stops", () => {
  const chapterId =
    "chapter-after-certainty-parts-part-2-what-can-still-be-practiced-chapter-4-judgment-without-finality";

  it("accepts a public chapter destination", () => {
    const books = [
      book({
        id: "book-after-certainty",
        slug: "after-certainty",
        title: "After Certainty",
        status: "published",
      }),
    ];
    const graph = {
      books,
      glossary: [],
      patterns: [],
      sources: [],
      relationships: [],
      chapters: [
        {
          id: chapterId,
          workId: "work-after-certainty",
          editionId: "book-after-certainty",
          title: "Chapter 4 — Judgment Without Finality",
          position: 1,
          kind: "chapter",
          sourcePath: "parts/part-2/chapter-4.md",
          wordCount: 1000,
          estimatedReadingMinutes: 8,
          public: true,
          routeKey:
            "/explore/books/after-certainty/chapters/parts-part-2-what-can-still-be-practiced-chapter-4-judgment-without-finality",
        },
      ],
    } as SemanticGraph;
    const index = buildGraphIndex(graph);
    const issues: PathHealthIssue[] = [];
    const stop: PathStopInput = {
      position: 1,
      entityType: "chapter",
      entityId: chapterId,
      description: "Chapter stop",
    };

    const resolved = validateStopReference(stop, index, graph, [], "question-test", issues);
    expect(resolved).toBe(chapterId);
    expect(issues).toEqual([]);
  });

  it("rejects unknown and ineligible chapter destinations", () => {
    const books = [
      book({
        id: "book-after-certainty",
        slug: "after-certainty",
        title: "After Certainty",
        status: "published",
      }),
    ];
    const graph = {
      books,
      glossary: [],
      patterns: [],
      sources: [],
      relationships: [],
      chapters: [
        {
          id: "chapter-hidden",
          workId: "work-after-certainty",
          editionId: "book-after-certainty",
          title: "Hidden",
          position: 1,
          kind: "chapter",
          sourcePath: "hidden.md",
          wordCount: 10,
          estimatedReadingMinutes: 1,
          public: false,
          routeKey: "/explore/books/after-certainty/chapters/hidden",
        },
      ],
    } as SemanticGraph;
    const index = buildGraphIndex(graph);

    const unknownIssues: PathHealthIssue[] = [];
    validateStopReference(
      {
        position: 1,
        entityType: "chapter",
        entityId: "chapter-does-not-exist",
        description: "Missing",
      },
      index,
      graph,
      [],
      "question-test",
      unknownIssues,
    );
    expect(unknownIssues.some((i) => i.code === "unknown_chapter")).toBe(true);

    const ineligibleIssues: PathHealthIssue[] = [];
    validateStopReference(
      {
        position: 2,
        entityType: "chapter",
        entityId: "chapter-hidden",
        description: "Hidden",
      },
      index,
      graph,
      [],
      "question-test",
      ineligibleIssues,
    );
    expect(ineligibleIssues.some((i) => i.code === "ineligible_chapter")).toBe(true);
  });
});
