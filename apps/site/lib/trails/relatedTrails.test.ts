import semanticManifest from "@/data/semantic-manifest.json";
import booksManifest from "@/data/books-manifest.json";
import { buildGraphIndex } from "@/lib/graph/graph";
import { findPublishedTrailsForEntity } from "@/lib/trails/relatedTrails";
import type { SemanticGraph } from "@/types/semanticGraph";
import { describe, expect, it } from "vitest";

describe("findPublishedTrailsForEntity", () => {
  it("finds trails referencing a book by canonical id", () => {
    const graph = semanticManifest as SemanticGraph;
    const index = buildGraphIndex(graph);
    const book = graph.books.find((b) => b.slug === "coupling");
    expect(book).toBeDefined();

    const trails = findPublishedTrailsForEntity({
      canonicalId: book!.id,
      index,
      catalogBooks: booksManifest.books,
      limit: 5,
    });

    expect(trails.map((t) => t.id)).toEqual(
      expect.arrayContaining(["systems-without-correction", "software-judgment-trail"]),
    );
  });

  it("finds trails referencing a concept by canonical id", () => {
    const graph = semanticManifest as SemanticGraph;
    const index = buildGraphIndex(graph);
    const concept = graph.glossary.find((c) => c.slug === "judgment");
    expect(concept).toBeDefined();

    const trails = findPublishedTrailsForEntity({
      canonicalId: concept!.id,
      index,
      catalogBooks: booksManifest.books,
    });

    expect(trails.some((t) => t.id === "judgment-before-certainty")).toBe(true);
  });

  it("returns empty when no trail references the entity", () => {
    const graph = semanticManifest as SemanticGraph;
    const index = buildGraphIndex(graph);

    const trails = findPublishedTrailsForEntity({
      canonicalId: "concept-nonexistent-trail-entity",
      index,
      catalogBooks: booksManifest.books,
    });

    expect(trails).toEqual([]);
  });
});
