import { getQuestionBySlug } from "@/lib/questions/loadQuestions";
import { buildGraphIndex } from "@/lib/graph/graph";
import {
  findPublishedTrailsForEntity,
  findPublishedTrailsForQuestion,
  QUESTION_TRAIL_OVERLAP_MAX,
} from "@/lib/trails/relatedTrails";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";
import { describe, expect, it } from "vitest";

const graph = loadManifestFixture("questions-and-trails");

describe("findPublishedTrailsForEntity", () => {
  it("finds trails referencing a book by canonical id", () => {
    const index = buildGraphIndex(graph);
    const book = graph.books.find((b) => b.slug === "living-in-sediment");
    expect(book).toBeDefined();

    const trails = findPublishedTrailsForEntity({
      canonicalId: book!.id,
      index,
      books: graph.books,
      limit: 5,
    });

    expect(trails.map((t) => t.id)).toEqual(
      expect.arrayContaining(["inheritance-and-institutional-sediment"]),
    );
  });

  it("finds trails referencing a concept by canonical id", () => {
    const index = buildGraphIndex(graph);

    const trails = findPublishedTrailsForEntity({
      canonicalId: "concept-judgment",
      index,
      books: graph.books,
    });

    expect(trails.some((t) => t.id === "judgment-before-certainty")).toBe(true);
  });

  it("returns empty when no trail references the entity", () => {
    const index = buildGraphIndex(graph);

    const trails = findPublishedTrailsForEntity({
      canonicalId: "concept-nonexistent-trail-entity",
      index,
      books: graph.books,
    });

    expect(trails).toEqual([]);
  });
});

describe("findPublishedTrailsForQuestion", () => {
  it("finds trails that share path stops without exceeding overlap threshold", () => {
    const index = buildGraphIndex(graph);
    const question = getQuestionBySlug("act-before-certainty-arrives", graph);
    expect(question).toBeDefined();

    const trails = findPublishedTrailsForQuestion({
      question: question!,
      index,
      books: graph.books,
      limit: 5,
    });

    expect(trails.map((t) => t.id)).toEqual(expect.arrayContaining(["judgment-before-certainty"]));
    expect(trails.length).toBeGreaterThan(0);
    expect(trails.length).toBeLessThanOrEqual(5);
  });

  it("excludes trails whose paths overlap more than the editorial threshold", () => {
    const index = buildGraphIndex(graph);
    const question = getQuestionBySlug("act-before-certainty-arrives", graph);
    expect(question).toBeDefined();

    const trails = findPublishedTrailsForQuestion({
      question: question!,
      index,
      books: graph.books,
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
    const index = buildGraphIndex(graph);
    const question = getQuestionBySlug("authority-without-understanding", graph);
    expect(question).toBeDefined();

    const trails = findPublishedTrailsForQuestion({
      question: question!,
      index,
      books: graph.books,
      // Force zero overlap acceptance so only exact non-matches remain empty
      overlapMax: 0,
    });

    expect(trails).toEqual([]);
  });
});
