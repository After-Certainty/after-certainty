import { getActiveShelves, resolveShelfBooks, shelvesFromGraph } from "@/lib/books/shelves";
import type { CatalogBookView } from "@/lib/books/catalog-view-model";
import { defaultCatalogBooks } from "@/lib/books/catalog-view-model";
import { getPublicationRegistryFromGraph } from "@/lib/books/load-publication-registry";
import { buildResolvedEditionIndex } from "@/lib/books/resolve-work-edition";
import {
  getShelfEditionExceptions,
  indexShelfEditionExceptions,
  shelfEditionExceptionKey,
  type ShelfEditionException,
} from "@/lib/books/shelf-edition-exceptions";
import { collectPublicationRegistryHealthIssues } from "@/lib/books/validate-publication-registry";
import type { SemanticGraph } from "@/types/semanticGraph";

export type CatalogHealthSeverity = "error" | "warning";

export type CatalogHealthIssue = {
  severity: CatalogHealthSeverity;
  code: string;
  bookSlug?: string;
  shelfId?: string;
  detail: string;
};

function exceptedDetail(code: string, base: string, exception: ShelfEditionException): string {
  return `${base} [excepted: ${code}; ${exception.reason}]`;
}

/**
 * Catalog + shelf integrity. Curated shelves may list only public canonical editions;
 * companions and superseded editions are excluded at resolve time unless excepted in
 * `data/shelf-edition-exceptions.json` (warnings, not silent).
 */
export function collectCatalogHealthIssues(input: {
  viewModel: readonly CatalogBookView[];
  graph: SemanticGraph;
  shelfEditionExceptions?: readonly ShelfEditionException[];
}): CatalogHealthIssue[] {
  const { viewModel, graph } = input;
  const issues: CatalogHealthIssue[] = [];
  const publicCanonical = defaultCatalogBooks(viewModel);
  const registry = getPublicationRegistryFromGraph(graph);
  const resolved = buildResolvedEditionIndex(graph.books, registry);
  const allShelves = shelvesFromGraph(graph);
  const shelfExceptions = input.shelfEditionExceptions ?? getShelfEditionExceptions();
  const exceptionsByKey = indexShelfEditionExceptions(shelfExceptions);
  const usedExceptionKeys = new Set<string>();
  const shelvesBySlug = new Map(allShelves.map((shelf) => [shelf.slug, shelf]));
  const booksBySlug = new Map(viewModel.map((book) => [book.slug, book]));

  for (const issue of collectPublicationRegistryHealthIssues({
    registry,
    books: graph.books,
  })) {
    issues.push({
      severity: issue.severity,
      code: `registry_${issue.code}`,
      bookSlug: issue.bookId,
      detail: issue.detail,
    });
  }

  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const book of viewModel) {
    if (ids.has(book.id)) {
      issues.push({
        severity: "error",
        code: "duplicate_id",
        bookSlug: book.slug,
        detail: `Duplicate book id "${book.id}"`,
      });
    }
    ids.add(book.id);

    if (book.isPublic && book.isCanonicalEdition) {
      if (slugs.has(book.slug)) {
        issues.push({
          severity: "error",
          code: "duplicate_canonical_slug",
          bookSlug: book.slug,
          detail: `Duplicate canonical slug "${book.slug}"`,
        });
      }
      slugs.add(book.slug);
    }
  }

  const canonicalByWork = new Map<string, string[]>();
  for (const book of graph.books) {
    const meta = resolved.get(book.slug);
    if (!meta?.isCanonical) continue;
    const bucket = canonicalByWork.get(meta.workId) ?? [];
    bucket.push(book.slug);
    canonicalByWork.set(meta.workId, bucket);
  }
  for (const [workId, canonicals] of canonicalByWork) {
    if (canonicals.length > 1) {
      issues.push({
        severity: "error",
        code: "multiple_canonical_editions",
        detail: `Multiple canonical editions for work "${workId}": ${canonicals.join(", ")}`,
      });
    }
  }

  for (const shelf of allShelves) {
    if (!shelf.id.trim() || !shelf.slug.trim()) {
      issues.push({
        severity: "error",
        code: "invalid_shelf",
        shelfId: shelf.id,
        detail: "Shelf must have non-empty id and slug",
      });
    }

    if (shelf.selection.mode === "curated") {
      const seen = new Set<string>();
      for (const slug of shelf.selection.bookSlugs) {
        if (seen.has(slug)) {
          issues.push({
            severity: "error",
            code: "duplicate_shelf_slug",
            shelfId: shelf.id,
            detail: `Duplicate slug "${slug}" in curated shelf "${shelf.id}"`,
          });
        }
        seen.add(slug);

        const book = viewModel.find((b) => b.slug === slug);
        if (!book) {
          issues.push({
            severity: "error",
            code: "unknown_shelf_book",
            shelfId: shelf.id,
            detail: `Shelf "${shelf.id}" references unknown slug "${slug}"`,
          });
          continue;
        }
        if (!book.isPublic) {
          issues.push({
            severity: "error",
            code: "draft_on_public_shelf",
            shelfId: shelf.id,
            bookSlug: slug,
            detail: `Non-public book "${slug}" on shelf "${shelf.id}"`,
          });
        }
        if (!book.isCanonicalEdition) {
          const key = shelfEditionExceptionKey(shelf.slug, slug);
          const exception = exceptionsByKey.get(key);
          const relationship = book.editionRelationship ?? "non-canonical";
          const base = `Non-canonical edition "${slug}" (${relationship}) on curated shelf "${shelf.slug}" — shelves show canonical editions only (resolveShelfBooks drops this member)`;
          if (exception) {
            usedExceptionKeys.add(key);
            issues.push({
              severity: "warning",
              code: "non_canonical_on_shelf_excepted",
              shelfId: shelf.id,
              bookSlug: slug,
              detail: exceptedDetail("non_canonical_on_shelf", base, exception),
            });
          } else {
            issues.push({
              severity: "error",
              code: "non_canonical_on_shelf",
              shelfId: shelf.id,
              bookSlug: slug,
              detail: `${base}. Remove it from the shelf upstream, or add an intentional exception in data/shelf-edition-exceptions.json.`,
            });
          }
        }
      }
    }
  }

  for (const exception of shelfExceptions) {
    const key = shelfEditionExceptionKey(exception.shelfSlug, exception.bookSlug);
    if (!shelvesBySlug.has(exception.shelfSlug)) {
      issues.push({
        severity: "error",
        code: "unknown_shelf_edition_exception_shelf",
        shelfId: exception.shelfSlug,
        bookSlug: exception.bookSlug,
        detail: `Shelf edition exception references unknown shelf slug "${exception.shelfSlug}".`,
      });
      continue;
    }
    if (!booksBySlug.has(exception.bookSlug)) {
      issues.push({
        severity: "error",
        code: "unknown_shelf_edition_exception_book",
        shelfId: exception.shelfSlug,
        bookSlug: exception.bookSlug,
        detail: `Shelf edition exception references unknown book slug "${exception.bookSlug}".`,
      });
      continue;
    }
    if (!usedExceptionKeys.has(key)) {
      issues.push({
        severity: "warning",
        code: "unused_shelf_edition_exception",
        shelfId: exception.shelfSlug,
        bookSlug: exception.bookSlug,
        detail: `Shelf edition exception for "${exception.bookSlug}" on "${exception.shelfSlug}" was not needed; remove it after upstream cleanup.`,
      });
    }
  }

  for (const shelf of getActiveShelves(graph)) {
    if (shelf.featured) continue;
    const books = resolveShelfBooks(shelf, publicCanonical);
    if (books.length === 0 && shelf.slug !== "upcoming") {
      issues.push({
        severity: "warning",
        code: "empty_shelf",
        shelfId: shelf.id,
        detail: `Shelf "${shelf.id}" has no public books`,
      });
    }
  }

  for (const book of publicCanonical) {
    if (!book.coverImage) {
      issues.push({
        severity: "warning",
        code: "missing_cover",
        bookSlug: book.slug,
        detail: `Missing cover for "${book.slug}"`,
      });
    }
    if (!book.description) {
      issues.push({
        severity: "warning",
        code: "missing_description",
        bookSlug: book.slug,
        detail: `Missing description for "${book.slug}"`,
      });
    }
    if (book.shelfIds.length === 0) {
      issues.push({
        severity: "warning",
        code: "book_on_no_shelf",
        bookSlug: book.slug,
        detail: `Book "${book.slug}" is not on any editorial shelf`,
      });
    }
  }

  return issues;
}

export function assertCatalogHealthy(input: {
  viewModel: readonly CatalogBookView[];
  graph: SemanticGraph;
}): void {
  const errors = collectCatalogHealthIssues(input).filter((i) => i.severity === "error");
  if (errors.length > 0) {
    const summary = errors.map((e) => `${e.code}: ${e.detail}`).join("\n");
    throw new Error(`Catalog health check failed:\n${summary}`);
  }
}

export function collectCatalogHealthReport(input: {
  viewModel: readonly CatalogBookView[];
  graph: SemanticGraph;
}) {
  const issues = collectCatalogHealthIssues(input);
  return {
    errors: issues.filter((i) => i.severity === "error"),
    warnings: issues.filter((i) => i.severity === "warning"),
  };
}
