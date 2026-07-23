import { bookIsPublic } from "@/lib/books/book-metadata";
import { getAllBookOverviews, getBookOverviewsManifest } from "@/lib/books/load-book-overviews";
import type { BookOverview } from "@/lib/books/book-overview-schema";
import { resolveWorkEdition } from "@/lib/books/resolve-work-edition";
import type { SemanticGraph } from "@/types/semanticGraph";

export type BookOverviewHealthSeverity = "error" | "warning";

export type BookOverviewHealthIssue = {
  severity: BookOverviewHealthSeverity;
  code: string;
  bookSlug?: string;
  bookId?: string;
  detail: string;
};

const MIN_SELECTED_CONCEPTS_WHEN_PRESENT = 3;
const MAX_SELECTED_CONCEPTS = 7;

/**
 * Structural + cross-reference health for authored book overview overlays.
 * Does not change book page rendering — Phase G consumes the overlay.
 */
export function collectBookOverviewHealthIssues(input: {
  graph: SemanticGraph;
  overviews?: readonly BookOverview[];
  prioritySlugs?: readonly string[];
}): BookOverviewHealthIssue[] {
  const { graph } = input;
  const overviews = input.overviews ?? getAllBookOverviews();
  const prioritySlugs = input.prioritySlugs ?? getBookOverviewsManifest().prioritySlugs ?? [];

  const issues: BookOverviewHealthIssue[] = [];
  const booksById = new Map(graph.books.map((book) => [book.id, book]));
  const booksBySlug = new Map(graph.books.map((book) => [book.slug, book]));
  const conceptsById = new Map(graph.glossary.map((concept) => [concept.id, concept]));
  const patternsById = new Map(graph.patterns.map((pattern) => [pattern.id, pattern]));

  const seenBookIds = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const overview of overviews) {
    if (seenBookIds.has(overview.bookId)) {
      issues.push({
        severity: "error",
        code: "duplicate_overview_book",
        bookId: overview.bookId,
        bookSlug: overview.slug,
        detail: `Multiple overviews target book id "${overview.bookId}".`,
      });
    }
    seenBookIds.add(overview.bookId);

    if (seenSlugs.has(overview.slug)) {
      issues.push({
        severity: "error",
        code: "duplicate_overview_slug",
        bookId: overview.bookId,
        bookSlug: overview.slug,
        detail: `Multiple overviews target slug "${overview.slug}".`,
      });
    }
    seenSlugs.add(overview.slug);

    const book = booksById.get(overview.bookId);
    if (!book) {
      issues.push({
        severity: "error",
        code: "unknown_book_id",
        bookId: overview.bookId,
        bookSlug: overview.slug,
        detail: `Overview references unknown book id "${overview.bookId}".`,
      });
      continue;
    }

    if (book.slug !== overview.slug) {
      issues.push({
        severity: "error",
        code: "book_slug_mismatch",
        bookId: overview.bookId,
        bookSlug: overview.slug,
        detail: `Overview slug "${overview.slug}" does not match graph slug "${book.slug}".`,
      });
    }

    if (!bookIsPublic(book)) {
      issues.push({
        severity: "error",
        code: "overview_for_non_public_book",
        bookId: overview.bookId,
        bookSlug: overview.slug,
        detail: `Overview targets non-public book "${book.slug}".`,
      });
    }

    const bookConceptIds = new Set(book.concepts ?? []);
    const selectedConcepts = overview.selectedConceptIds;

    if (bookConceptIds.size > 0) {
      if (selectedConcepts.length < MIN_SELECTED_CONCEPTS_WHEN_PRESENT) {
        issues.push({
          severity: "error",
          code: "too_few_selected_concepts",
          bookId: overview.bookId,
          bookSlug: overview.slug,
          detail: `Book "${book.slug}" has concepts but overview selects ${selectedConcepts.length} (need ${MIN_SELECTED_CONCEPTS_WHEN_PRESENT}–${MAX_SELECTED_CONCEPTS}).`,
        });
      }
    } else if (selectedConcepts.length > 0) {
      issues.push({
        severity: "warning",
        code: "concepts_selected_on_empty_book",
        bookId: overview.bookId,
        bookSlug: overview.slug,
        detail: `Book "${book.slug}" has no graph concepts but overview selects some (allowed as orientation overlay).`,
      });
    }

    for (const conceptId of selectedConcepts) {
      if (!conceptsById.has(conceptId)) {
        issues.push({
          severity: "error",
          code: "unknown_concept",
          bookId: overview.bookId,
          bookSlug: overview.slug,
          detail: `Unknown concept "${conceptId}".`,
        });
        continue;
      }
      if (bookConceptIds.size > 0 && !bookConceptIds.has(conceptId)) {
        issues.push({
          severity: "warning",
          code: "concept_not_on_book",
          bookId: overview.bookId,
          bookSlug: overview.slug,
          detail: `Concept "${conceptId}" is not linked to book "${book.slug}" (overview may surface orientation concepts).`,
        });
      }
    }

    const bookPatternIds = new Set(book.patterns ?? []);
    for (const patternId of overview.selectedPatternIds ?? []) {
      if (!patternsById.has(patternId)) {
        issues.push({
          severity: "error",
          code: "unknown_pattern",
          bookId: overview.bookId,
          bookSlug: overview.slug,
          detail: `Unknown pattern "${patternId}".`,
        });
        continue;
      }
      if (bookPatternIds.size > 0 && !bookPatternIds.has(patternId)) {
        issues.push({
          severity: "error",
          code: "pattern_not_on_book",
          bookId: overview.bookId,
          bookSlug: overview.slug,
          detail: `Pattern "${patternId}" is not linked to book "${book.slug}".`,
        });
      }
    }

    const relatedTargets = [
      ...(overview.readBefore ?? []).map((slug) => ({ kind: "readBefore" as const, slug })),
      ...(overview.readNext ?? []).map((slug) => ({ kind: "readNext" as const, slug })),
    ];

    for (const target of relatedTargets) {
      if (target.slug === overview.slug) {
        issues.push({
          severity: "error",
          code: "self_related_book",
          bookId: overview.bookId,
          bookSlug: overview.slug,
          detail: `${target.kind} cannot reference the book itself.`,
        });
        continue;
      }

      const related = booksBySlug.get(target.slug);
      if (!related) {
        issues.push({
          severity: "error",
          code: "unknown_related_book",
          bookId: overview.bookId,
          bookSlug: overview.slug,
          detail: `${target.kind} references unknown slug "${target.slug}".`,
        });
        continue;
      }

      if (!bookIsPublic(related)) {
        issues.push({
          severity: "error",
          code: "related_book_not_public",
          bookId: overview.bookId,
          bookSlug: overview.slug,
          detail: `${target.kind} "${target.slug}" is not public.`,
        });
      }

      const relatedEdition = resolveWorkEdition(related, graph.books);
      if (relatedEdition.relationship === "superseded") {
        issues.push({
          severity: "error",
          code: "related_book_superseded",
          bookId: overview.bookId,
          bookSlug: overview.slug,
          detail: `${target.kind} "${target.slug}" points to a superseded edition.`,
        });
      }
    }
  }

  for (const slug of prioritySlugs) {
    if (!seenSlugs.has(slug)) {
      issues.push({
        severity: "error",
        code: "missing_priority_overview",
        bookSlug: slug,
        detail: `Priority book "${slug}" has no overview overlay.`,
      });
    }
  }

  return issues;
}

export function assertBookOverviewsHealthy(input: {
  graph: SemanticGraph;
  overviews?: readonly BookOverview[];
  prioritySlugs?: readonly string[];
}): void {
  const errors = collectBookOverviewHealthIssues(input).filter((i) => i.severity === "error");
  if (errors.length === 0) return;
  const details = errors.map((e) => `${e.code}: ${e.detail}`).join("\n");
  throw new Error(`Book overview health check failed:\n${details}`);
}
