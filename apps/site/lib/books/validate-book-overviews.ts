import { bookIsPublic } from "@/lib/books/book-metadata";
import type { BookOverview } from "@/lib/books/book-overview-schema";
import { DEFAULT_BOOK_OVERVIEW_PRIORITY_SLUGS } from "@/lib/books/book-overview-schema";
import {
  exceptionAllowsAnyConcepts,
  exceptionAllowsAnyPatterns,
  exceptionAllowsConcept,
  exceptionAllowsPattern,
  getOverviewLinkExceptions,
  indexOverviewLinkExceptions,
  type OverviewLinkException,
} from "@/lib/books/overview-link-exceptions";
import { resolveWorkEdition } from "@/lib/books/resolve-work-edition";
import { bookOverviewsFromGraph, publicationRegistryFromGraph } from "@/lib/graph/discovery";
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

function exceptedDetail(code: string, base: string, exception: OverviewLinkException): string {
  return `${base} [excepted: ${code}; ${exception.reason}]`;
}

/**
 * Structural + cross-reference health for authored book overview overlays.
 * Concept/pattern links to the book row are hard errors unless listed in
 * `data/overview-concept-link-exceptions.json`.
 */
export function collectBookOverviewHealthIssues(input: {
  graph: SemanticGraph;
  overviews?: readonly BookOverview[];
  prioritySlugs?: readonly string[];
  linkExceptions?: readonly OverviewLinkException[];
}): BookOverviewHealthIssue[] {
  const { graph } = input;
  // Prefer overviews from the same graph under validation — never re-parse the
  // bundled JSON when a live graph is already in hand (expensive on schema 2.3+).
  const overviews = input.overviews ?? bookOverviewsFromGraph(graph);
  const prioritySlugs = input.prioritySlugs ?? [...DEFAULT_BOOK_OVERVIEW_PRIORITY_SLUGS];
  const linkExceptions = input.linkExceptions ?? getOverviewLinkExceptions();
  const exceptionsBySlug = indexOverviewLinkExceptions(linkExceptions);
  const publicationRegistry = publicationRegistryFromGraph(graph);

  const issues: BookOverviewHealthIssue[] = [];
  const booksById = new Map(graph.books.map((book) => [book.id, book]));
  const booksBySlug = new Map(graph.books.map((book) => [book.slug, book]));
  const conceptsById = new Map(graph.glossary.map((concept) => [concept.id, concept]));
  const patternsById = new Map(graph.patterns.map((pattern) => [pattern.id, pattern]));

  const seenBookIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const usedExceptionSlugs = new Set<string>();

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

    const exception = exceptionsBySlug.get(book.slug);
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
      if (exceptionAllowsAnyConcepts(exception)) {
        usedExceptionSlugs.add(book.slug);
        issues.push({
          severity: "warning",
          code: "concepts_selected_on_empty_book_excepted",
          bookId: overview.bookId,
          bookSlug: overview.slug,
          detail: exceptedDetail(
            "concepts_selected_on_empty_book",
            `Book "${book.slug}" has no graph concepts but overview selects some.`,
            exception!,
          ),
        });
      } else {
        issues.push({
          severity: "error",
          code: "concepts_selected_on_empty_book",
          bookId: overview.bookId,
          bookSlug: overview.slug,
          detail: `Book "${book.slug}" has no graph concepts but overview selects some. Add an intentional exception in data/overview-concept-link-exceptions.json or link concepts on the book upstream.`,
        });
      }
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
        if (exceptionAllowsConcept(exception, conceptId)) {
          usedExceptionSlugs.add(book.slug);
          issues.push({
            severity: "warning",
            code: "concept_not_on_book_excepted",
            bookId: overview.bookId,
            bookSlug: overview.slug,
            detail: exceptedDetail(
              "concept_not_on_book",
              `Concept "${conceptId}" is not linked to book "${book.slug}".`,
              exception!,
            ),
          });
        } else {
          issues.push({
            severity: "error",
            code: "concept_not_on_book",
            bookId: overview.bookId,
            bookSlug: overview.slug,
            detail: `Concept "${conceptId}" is not linked to book "${book.slug}". Add an intentional exception or link the concept on the book upstream.`,
          });
        }
      }
    }

    const bookPatternIds = new Set(book.patterns ?? []);
    const selectedPatterns = overview.selectedPatternIds ?? [];

    if (bookPatternIds.size === 0 && selectedPatterns.length > 0) {
      if (exceptionAllowsAnyPatterns(exception)) {
        usedExceptionSlugs.add(book.slug);
        issues.push({
          severity: "warning",
          code: "patterns_selected_on_empty_book_excepted",
          bookId: overview.bookId,
          bookSlug: overview.slug,
          detail: exceptedDetail(
            "patterns_selected_on_empty_book",
            `Book "${book.slug}" has no graph patterns but overview selects some.`,
            exception!,
          ),
        });
      } else {
        issues.push({
          severity: "error",
          code: "patterns_selected_on_empty_book",
          bookId: overview.bookId,
          bookSlug: overview.slug,
          detail: `Book "${book.slug}" has no graph patterns but overview selects some. Add an intentional exception in data/overview-concept-link-exceptions.json or link patterns on the book upstream.`,
        });
      }
    }

    for (const patternId of selectedPatterns) {
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
        if (exceptionAllowsPattern(exception, patternId)) {
          usedExceptionSlugs.add(book.slug);
          issues.push({
            severity: "warning",
            code: "pattern_not_on_book_excepted",
            bookId: overview.bookId,
            bookSlug: overview.slug,
            detail: exceptedDetail(
              "pattern_not_on_book",
              `Pattern "${patternId}" is not linked to book "${book.slug}".`,
              exception!,
            ),
          });
        } else {
          issues.push({
            severity: "error",
            code: "pattern_not_on_book",
            bookId: overview.bookId,
            bookSlug: overview.slug,
            detail: `Pattern "${patternId}" is not linked to book "${book.slug}". Add an intentional exception or link the pattern on the book upstream.`,
          });
        }
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

      const relatedEdition = resolveWorkEdition(related, graph.books, publicationRegistry);
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

  for (const exception of linkExceptions) {
    if (!booksBySlug.has(exception.bookSlug)) {
      issues.push({
        severity: "error",
        code: "unknown_exception_book",
        bookSlug: exception.bookSlug,
        detail: `Overview link exception references unknown book slug "${exception.bookSlug}".`,
      });
      continue;
    }

    if (exception.conceptIds && exception.conceptIds !== "*") {
      for (const conceptId of exception.conceptIds) {
        if (!conceptsById.has(conceptId)) {
          issues.push({
            severity: "error",
            code: "unknown_exception_concept",
            bookSlug: exception.bookSlug,
            detail: `Overview link exception for "${exception.bookSlug}" references unknown concept "${conceptId}".`,
          });
        }
      }
    }

    if (exception.patternIds && exception.patternIds !== "*") {
      for (const patternId of exception.patternIds) {
        if (!patternsById.has(patternId)) {
          issues.push({
            severity: "error",
            code: "unknown_exception_pattern",
            bookSlug: exception.bookSlug,
            detail: `Overview link exception for "${exception.bookSlug}" references unknown pattern "${patternId}".`,
          });
        }
      }
    }

    if (!usedExceptionSlugs.has(exception.bookSlug)) {
      issues.push({
        severity: "warning",
        code: "unused_link_exception",
        bookSlug: exception.bookSlug,
        detail: `Overview link exception for "${exception.bookSlug}" was not needed; remove it after upstream backfill.`,
      });
    }
  }

  return issues;
}

export function assertBookOverviewsHealthy(input: {
  graph: SemanticGraph;
  overviews?: readonly BookOverview[];
  prioritySlugs?: readonly string[];
  linkExceptions?: readonly OverviewLinkException[];
}): void {
  const errors = collectBookOverviewHealthIssues(input).filter((i) => i.severity === "error");
  if (errors.length === 0) return;
  const details = errors.map((e) => `${e.code}: ${e.detail}`).join("\n");
  throw new Error(`Book overview health check failed:\n${details}`);
}
