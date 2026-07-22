import { describe, expect, it } from "vitest";

import bookOverviewsJson from "@/data/book-overviews.json";
import semanticManifest from "@/data/semantic-manifest.json";
import {
  DEFAULT_BOOK_OVERVIEW_PRIORITY_SLUGS,
  parseBookOverviewsManifest,
  type BookOverview,
} from "@/lib/books/book-overview-schema";
import { getAllBookOverviews } from "@/lib/books/load-book-overviews";
import {
  assertBookOverviewsHealthy,
  collectBookOverviewHealthIssues,
} from "@/lib/books/validate-book-overviews";
import type { SemanticGraph } from "@/types/semanticGraph";

const graph = semanticManifest as SemanticGraph;

function withOverview(overrides: Partial<BookOverview>): BookOverview {
  const base = getAllBookOverviews()[0]!;
  return { ...base, ...overrides };
}

describe("book overview health", () => {
  it("accepts the bundled Phase F overviews against the semantic graph", () => {
    assertBookOverviewsHealthy({ graph });
    const issues = collectBookOverviewHealthIssues({ graph });
    expect(issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });

  it("covers every priority slug exactly once", () => {
    const overviews = getAllBookOverviews();
    const slugs = new Set(overviews.map((o) => o.slug));
    for (const slug of DEFAULT_BOOK_OVERVIEW_PRIORITY_SLUGS) {
      expect(slugs.has(slug), `missing overview for ${slug}`).toBe(true);
    }
    const parsed = parseBookOverviewsManifest(bookOverviewsJson);
    expect(parsed.prioritySlugs).toEqual([...DEFAULT_BOOK_OVERVIEW_PRIORITY_SLUGS]);
  });

  it("allows companions in readNext (WoLTY v2)", () => {
    const wolty = getAllBookOverviews().find((o) => o.slug === "when-others-look-to-you-v1");
    expect(wolty?.readNext).toContain("when-others-look-to-you-v2");
    const issues = collectBookOverviewHealthIssues({ graph });
    expect(issues.some((i) => i.code === "related_book_superseded")).toBe(false);
  });

  it("fails when a selected concept is missing from the book", () => {
    const book = graph.books.find((b) => b.slug === "after-certainty")!;
    const foreign = graph.glossary.find((c) => !(book.concepts ?? []).includes(c.id));
    expect(foreign).toBeDefined();
    const errors = collectBookOverviewHealthIssues({
      graph,
      overviews: [
        withOverview({
          bookId: book.id,
          slug: book.slug,
          selectedConceptIds: [(book.concepts ?? [])[0]!, (book.concepts ?? [])[1]!, foreign!.id],
        }),
      ],
      prioritySlugs: [],
    }).filter((i) => i.severity === "error");
    expect(errors.some((e) => e.code === "concept_not_on_book")).toBe(true);
  });

  it("fails when a priority slug is missing", () => {
    const errors = collectBookOverviewHealthIssues({
      graph,
      overviews: getAllBookOverviews().filter((o) => o.slug !== "after-certainty"),
      prioritySlugs: ["after-certainty"],
    }).filter((i) => i.severity === "error");
    expect(errors.some((e) => e.code === "missing_priority_overview")).toBe(true);
  });

  it("fails when readNext points at an unknown slug", () => {
    const book = graph.books.find((b) => b.slug === "curiosity-before-certainty")!;
    const errors = collectBookOverviewHealthIssues({
      graph,
      overviews: [
        withOverview({
          bookId: book.id,
          slug: book.slug,
          selectedConceptIds: [],
          readNext: ["does-not-exist-book"],
        }),
      ],
      prioritySlugs: [],
    }).filter((i) => i.severity === "error");
    expect(errors.some((e) => e.code === "unknown_related_book")).toBe(true);
  });
});
