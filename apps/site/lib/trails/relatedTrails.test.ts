import semanticManifest from "@/data/semantic-manifest.json";
import booksManifest from "@/data/books-manifest.json";
import { getQuestionBySlug } from "@/lib/questions/loadQuestions";
import { buildGraphIndex } from "@/lib/graph/graph";
import {
  findPublishedTrailsForEntity,
  findPublishedTrailsForQuestion,
  QUESTION_TRAIL_OVERLAP_MAX,
} from "@/lib/trails/relatedTrails";
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

describe("findPublishedTrailsForQuestion", () => {
  it("finds trails that share path stops without exceeding overlap threshold", () => {
    const graph = semanticManifest as SemanticGraph;
    const index = buildGraphIndex(graph);
    const question = getQuestionBySlug("act-before-certainty-arrives");
    expect(question).toBeDefined();

    const trails = findPublishedTrailsForQuestion({
      question: question!,
      index,
      catalogBooks: booksManifest.books,
      limit: 5,
    });

    expect(trails.map((t) => t.id)).toEqual(expect.arrayContaining(["judgment-before-certainty"]));
    expect(trails.length).toBeLessThanOrEqual(3);
  });

  it("excludes trails whose paths overlap more than the editorial threshold", () => {
    const graph = semanticManifest as SemanticGraph;
    const index = buildGraphIndex(graph);
    const question = getQuestionBySlug("act-before-certainty-arrives");
    expect(question).toBeDefined();

    const trails = findPublishedTrailsForQuestion({
      question: question!,
      index,
      catalogBooks: booksManifest.books,
      overlapMax: QUESTION_TRAIL_OVERLAP_MAX,
    });

    for (const trail of trails) {
      const questionIds = question!.pathStops.map((stop) => stop.entityId ?? stop.bookSlug ?? "");
      const trailIds = trail.pathStops.map((stop) => stop.entityId ?? stop.bookSlug ?? "");
      const shared = questionIds.filter((id) => trailIds.includes(id)).length;
      const overlap = shared / Math.max(questionIds.length, trailIds.length);
      expect(overlap).toBeLessThanOrEqual(QUESTION_TRAIL_OVERLAP_MAX);
    }
  });

  it("returns empty when no trail shares stops with the question", () => {
    const graph = semanticManifest as SemanticGraph;
    const index = buildGraphIndex(graph);
    const question = getQuestionBySlug("trust-survives-disagreement");
    expect(question).toBeDefined();

    const trails = findPublishedTrailsForQuestion({
      question: question!,
      index,
      catalogBooks: booksManifest.books,
    });

    expect(trails).toEqual([]);
  });
});
