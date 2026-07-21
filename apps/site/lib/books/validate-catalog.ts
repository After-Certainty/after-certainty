import { BOOK_SHELVES, getActiveShelves, resolveShelfBooks } from "@/lib/books/shelves";
import type { CatalogBookView } from "@/lib/books/catalog-view-model";
import { defaultCatalogBooks } from "@/lib/books/catalog-view-model";
import { isCanonicalEdition } from "@/lib/books/canonical-editions";
import type { SemanticGraph } from "@/types/semanticGraph";

export type CatalogHealthSeverity = "error" | "warning";

export type CatalogHealthIssue = {
  severity: CatalogHealthSeverity;
  code: string;
  bookSlug?: string;
  shelfId?: string;
  detail: string;
};

export function collectCatalogHealthIssues(input: {
  viewModel: readonly CatalogBookView[];
  graph: SemanticGraph;
}): CatalogHealthIssue[] {
  const { viewModel, graph } = input;
  const issues: CatalogHealthIssue[] = [];
  const publicCanonical = defaultCatalogBooks(viewModel);

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

  const byBase = new Map<string, string[]>();
  for (const book of graph.books) {
    const canonical = isCanonicalEdition(book, graph.books);
    if (canonical) {
      const base = book.slug.replace(/-v\d+$/i, "");
      const bucket = byBase.get(base) ?? [];
      bucket.push(book.slug);
      byBase.set(base, bucket);
    }
  }
  for (const [base, siblings] of byBase) {
    const canonicals = siblings.filter((slug) =>
      viewModel.find((b) => b.slug === slug && b.isCanonicalEdition),
    );
    if (canonicals.length > 1) {
      issues.push({
        severity: "error",
        code: "multiple_canonical_editions",
        detail: `Multiple canonical editions for base "${base}": ${canonicals.join(", ")}`,
      });
    }
  }

  for (const shelf of BOOK_SHELVES) {
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
        if (!book.isCanonicalEdition && shelf.slug !== "complete-catalog") {
          issues.push({
            severity: "error",
            code: "superseded_on_shelf",
            shelfId: shelf.id,
            bookSlug: slug,
            detail: `Superseded edition "${slug}" on curated shelf "${shelf.id}"`,
          });
        }
      }
    }
  }

  for (const shelf of getActiveShelves()) {
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
