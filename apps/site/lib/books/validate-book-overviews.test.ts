import { describe, expect, it } from "vitest";

import semanticManifest from "@/data/semantic-manifest.json";
import {
  DEFAULT_BOOK_OVERVIEW_PRIORITY_SLUGS,
  type BookOverview,
} from "@/lib/books/book-overview-schema";
import { getBookOverviewsManifest } from "@/lib/books/load-book-overviews";
import { getOverviewLinkExceptions } from "@/lib/books/overview-link-exceptions";
import { collectBookOverviewHealthIssues } from "@/lib/books/validate-book-overviews";
import { bookOverviewsFromGraph } from "@/lib/graph/discovery";
import type { SemanticGraph } from "@/types/semanticGraph";

const graph = semanticManifest as unknown as SemanticGraph;
const overviewsFromGraph = bookOverviewsFromGraph(graph);

function withOverview(overrides: Partial<BookOverview>): BookOverview {
  const base = overviewsFromGraph[0]!;
  return { ...base, ...overrides };
}

describe("overview link exceptions config", () => {
  it("parses the bundled exception file", () => {
    const exceptions = getOverviewLinkExceptions();
    expect(exceptions.length).toBeGreaterThan(0);
    expect(exceptions.every((e) => e.reason.length > 0)).toBe(true);
  });
});

describe("book overview health", () => {
  it("accepts overviews from the semantic manifest against the graph", () => {
    const issues = collectBookOverviewHealthIssues({ graph, overviews: overviewsFromGraph });
    expect(issues.filter((i) => i.severity === "error")).toHaveLength(0);
    expect(
      issues.some(
        (i) =>
          i.code === "concept_not_on_book_excepted" ||
          i.code === "concepts_selected_on_empty_book_excepted" ||
          i.code === "patterns_selected_on_empty_book_excepted",
      ),
    ).toBe(true);
  });

  it("covers every priority slug exactly once", () => {
    const slugs = new Set(overviewsFromGraph.map((o) => o.slug));
    for (const slug of DEFAULT_BOOK_OVERVIEW_PRIORITY_SLUGS) {
      expect(slugs.has(slug), `missing overview for ${slug}`).toBe(true);
    }
    const parsed = getBookOverviewsManifest();
    expect(parsed.prioritySlugs).toEqual([...DEFAULT_BOOK_OVERVIEW_PRIORITY_SLUGS]);
  });

  it("allows companions in readNext (WoLTY v2)", () => {
    const wolty = overviewsFromGraph.find((o) => o.slug === "when-others-look-to-you-v1");
    expect(wolty?.readNext).toContain("when-others-look-to-you-v2");
    const issues = collectBookOverviewHealthIssues({ graph, overviews: overviewsFromGraph });
    expect(issues.some((i) => i.code === "related_book_superseded")).toBe(false);
  });

  it("errors when a selected concept is missing from the book without an exception", () => {
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
      linkExceptions: [],
    }).filter((i) => i.severity === "error");
    expect(errors.some((e) => e.code === "concept_not_on_book")).toBe(true);
  });

  it("downgrades concept_not_on_book to a warning when excepted", () => {
    const book = graph.books.find((b) => b.slug === "after-certainty")!;
    const foreign = graph.glossary.find((c) => !(book.concepts ?? []).includes(c.id));
    expect(foreign).toBeDefined();
    const issues = collectBookOverviewHealthIssues({
      graph,
      overviews: [
        withOverview({
          bookId: book.id,
          slug: book.slug,
          selectedConceptIds: [(book.concepts ?? [])[0]!, (book.concepts ?? [])[1]!, foreign!.id],
        }),
      ],
      prioritySlugs: [],
      linkExceptions: [
        {
          bookSlug: book.slug,
          conceptIds: [foreign!.id],
          reason: "Test intentional orientation exception.",
        },
      ],
    });
    expect(issues.some((i) => i.code === "concept_not_on_book" && i.severity === "error")).toBe(
      false,
    );
    expect(
      issues.some((i) => i.code === "concept_not_on_book_excepted" && i.severity === "warning"),
    ).toBe(true);
  });

  it("errors when patterns are selected on a book with no pattern links without an exception", () => {
    const book = graph.books.find((b) => (b.patterns?.length ?? 0) === 0)!;
    const patternId = graph.patterns[0]!.id;
    const errors = collectBookOverviewHealthIssues({
      graph,
      overviews: [
        withOverview({
          bookId: book.id,
          slug: book.slug,
          selectedConceptIds: [],
          selectedPatternIds: [patternId],
        }),
      ],
      prioritySlugs: [],
      linkExceptions: [],
    }).filter((i) => i.severity === "error");
    expect(errors.some((e) => e.code === "patterns_selected_on_empty_book")).toBe(true);
  });

  it("fails when a priority slug is missing", () => {
    const errors = collectBookOverviewHealthIssues({
      graph,
      overviews: overviewsFromGraph.filter((o) => o.slug !== "after-certainty"),
      prioritySlugs: ["after-certainty"],
      linkExceptions: [],
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
          selectedPatternIds: [],
          readNext: ["does-not-exist-book"],
        }),
      ],
      prioritySlugs: [],
      linkExceptions: [],
    }).filter((i) => i.severity === "error");
    expect(errors.some((e) => e.code === "unknown_related_book")).toBe(true);
  });
});
