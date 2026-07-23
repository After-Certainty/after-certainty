import { shelfMaxPreview } from "@/lib/books/presentation-overlays";
import type { BookAvailabilityFlag } from "@/lib/books/book-metadata";
import type { ContentType } from "@/lib/books/catalog-taxonomy";
import type { CatalogBookView } from "@/lib/books/catalog-view-model";
import type { BookStatus } from "@/types/content";
import type { ManifestShelf, SemanticGraph } from "@/types/semanticGraph";

export type ShelfRule =
  | { type: "status"; values: BookStatus[] }
  | { type: "contentType"; values: ContentType[] }
  | { type: "availability"; values: BookAvailabilityFlag[] }
  | { type: "allPublic" };

export type ShelfSelection =
  { mode: "curated"; bookSlugs: string[] } | { mode: "rule"; rule: ShelfRule };

export type ShelfDefinition = {
  id: string;
  slug: string;
  title: string;
  description: string;
  displayOrder: number;
  featured: boolean;
  selection: ShelfSelection;
  maxPreview: number;
  status: "active" | "hidden";
};

function mapShelfSelection(selection: ManifestShelf["selection"]): ShelfSelection {
  if (selection.mode === "curated") {
    return { mode: "curated", bookSlugs: selection.bookSlugs };
  }

  const rule = selection.rule;
  switch (rule.type) {
    case "allPublic":
      return { mode: "rule", rule: { type: "allPublic" } };
    case "status":
      return {
        mode: "rule",
        rule: { type: "status", values: rule.values as BookStatus[] },
      };
    case "contentType":
      return {
        mode: "rule",
        rule: { type: "contentType", values: rule.values as ContentType[] },
      };
    case "availability":
      return {
        mode: "rule",
        rule: { type: "availability", values: rule.values as BookAvailabilityFlag[] },
      };
  }
}

export function shelfFromManifest(shelf: ManifestShelf): ShelfDefinition {
  return {
    id: shelf.id,
    slug: shelf.slug,
    title: shelf.title,
    description: shelf.description,
    displayOrder: shelf.displayOrder,
    featured: shelf.featured,
    status: shelf.status,
    selection: mapShelfSelection(shelf.selection),
    maxPreview: shelfMaxPreview(shelf.slug),
  };
}

export function shelvesFromGraph(graph: SemanticGraph): ShelfDefinition[] {
  return (graph.shelves ?? []).map(shelfFromManifest);
}

/** @deprecated Prefer shelvesFromGraph(graph) — kept for validate-catalog sync tests. */
export function getBookShelves(graph?: SemanticGraph): readonly ShelfDefinition[] {
  if (graph) return shelvesFromGraph(graph);
  return [];
}

const UPCOMING_STATUSES = new Set<BookStatus>(["forthcoming", "in_progress", "collaborative"]);

export function getActiveShelves(graph: SemanticGraph): ShelfDefinition[] {
  return shelvesFromGraph(graph)
    .filter((s) => s.status === "active")
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getShelfBySlug(graph: SemanticGraph, slug: string): ShelfDefinition | undefined {
  return shelvesFromGraph(graph).find((s) => s.slug === slug && s.status === "active");
}

function bookMatchesRule(book: CatalogBookView, rule: ShelfRule): boolean {
  switch (rule.type) {
    case "allPublic":
      return book.isPublic;
    case "status":
      return rule.values.includes(book.status);
    case "contentType":
      return rule.values.includes(book.contentType);
    case "availability":
      return rule.values.some((flag) => book.availability.includes(flag));
  }
}

/**
 * Resolve shelf membership preserving curated order.
 *
 * Policy: shelves show **public canonical editions only**. Companion and
 * superseded volumes stay off shelves even when curated upstream or when the
 * catalog URL uses `?editions=all` (that flag expands the unfiltered pool /
 * search, not shelf membership). See docs/contributing-books-catalog.md.
 */
export function resolveShelfBooks(
  shelf: ShelfDefinition,
  viewModel: readonly CatalogBookView[],
): CatalogBookView[] {
  const bySlug = new Map(viewModel.map((b) => [b.slug, b]));

  if (shelf.selection.mode === "curated") {
    const out: CatalogBookView[] = [];
    for (const slug of shelf.selection.bookSlugs) {
      const book = bySlug.get(slug);
      if (book?.isPublic && book.isCanonicalEdition) out.push(book);
    }
    return out;
  }

  const rule = shelf.selection.rule;
  return viewModel.filter(
    (book) => book.isPublic && book.isCanonicalEdition && bookMatchesRule(book, rule),
  );
}

export function bookOnShelf(shelf: ShelfDefinition, book: CatalogBookView): boolean {
  if (!book.isPublic || !book.isCanonicalEdition) return false;
  if (shelf.selection.mode === "curated") {
    return shelf.selection.bookSlugs.includes(book.slug);
  }
  return bookMatchesRule(book, shelf.selection.rule);
}

export function assignShelfIds(
  viewModel: CatalogBookView[],
  graph: SemanticGraph,
): CatalogBookView[] {
  const activeShelves = getActiveShelves(graph);
  return viewModel.map((book) => {
    const shelfIds = activeShelves.filter((s) => bookOnShelf(s, book)).map((s) => s.id);
    return { ...book, shelfIds };
  });
}

export function isUpcomingStatus(status: BookStatus): boolean {
  return UPCOMING_STATUSES.has(status);
}
