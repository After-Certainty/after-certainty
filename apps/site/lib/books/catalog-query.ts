import {
  defaultCatalogBooks,
  type CatalogBookView,
  type CatalogSearchItem,
} from "@/lib/books/catalog-view-model";
import {
  catalogStatusMatchesFilter,
  hasActiveCatalogFilters,
  type CatalogUrlState,
} from "@/lib/books/catalog-url-state";
import type { ContentType } from "@/lib/books/catalog-taxonomy";
import type { BookAvailabilityFlag } from "@/lib/books/book-metadata";
import {
  getActiveShelves,
  getShelfBySlug,
  resolveShelfBooks,
  type ShelfDefinition,
} from "@/lib/books/shelves";
import type { SemanticGraph } from "@/types/semanticGraph";

export type CatalogFilterOptions = {
  shelves: { slug: string; title: string }[];
  contentTypes: ContentType[];
  statuses: ("published" | "upcoming")[];
  availability: BookAvailabilityFlag[];
  sorts: { value: CatalogUrlState["sort"]; label: string }[];
};

export type CatalogQueryResult = {
  shelves: { shelf: ShelfDefinition; books: CatalogBookView[]; totalCount: number }[];
  results: CatalogBookView[];
  activeFilters: CatalogUrlState;
  showShelfSections: boolean;
};

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function bookMatchesQuery(book: CatalogBookView, query: string): boolean {
  const q = normalizeSearchText(query);
  if (!q) return true;
  const haystack = normalizeSearchText(
    [book.title, book.subtitle, book.description].filter(Boolean).join(" "),
  );
  return haystack.includes(q);
}

function sortBooks(books: CatalogBookView[], sort: CatalogUrlState["sort"]): CatalogBookView[] {
  const copy = [...books];
  switch (sort) {
    case "title-asc":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "title-desc":
      return copy.sort((a, b) => b.title.localeCompare(a.title));
    case "recommended":
    default:
      return copy.sort((a, b) => {
        if (a.recommendedRank !== b.recommendedRank) return a.recommendedRank - b.recommendedRank;
        return a.title.localeCompare(b.title);
      });
  }
}

function filterCatalogBooks(
  pool: readonly CatalogBookView[],
  state: CatalogUrlState,
  graph: SemanticGraph,
): CatalogBookView[] {
  let rows = [...pool];

  if (state.shelf) {
    const shelf = getShelfBySlug(graph, state.shelf);
    if (shelf) {
      rows = resolveShelfBooks(shelf, rows);
    }
  }

  if (state.types.length > 0) {
    const typeSet = new Set(state.types);
    rows = rows.filter((b) => typeSet.has(b.contentType));
  }

  if (state.statuses.length > 0) {
    rows = rows.filter((b) => catalogStatusMatchesFilter(b.status, state.statuses));
  }

  if (state.availability.length > 0) {
    const availSet = new Set(state.availability);
    rows = rows.filter((b) => b.availability.some((flag) => availSet.has(flag)));
  }

  if (state.q) {
    rows = rows.filter((b) => bookMatchesQuery(b, state.q));
  }

  return sortBooks(rows, state.sort);
}

export function buildFilterOptions(
  viewModel: readonly CatalogBookView[],
  graph: SemanticGraph,
): CatalogFilterOptions {
  const base = defaultCatalogBooks(viewModel);
  const contentTypes = new Set<ContentType>();
  const availability = new Set<BookAvailabilityFlag>();
  let hasUpcoming = false;

  for (const book of base) {
    if (book.contentType !== "unknown") {
      contentTypes.add(book.contentType);
    }
    for (const flag of book.availability) availability.add(flag);
    if (book.status !== "published") hasUpcoming = true;
  }

  return {
    shelves: getActiveShelves(graph)
      .filter((s) => s.slug !== "upcoming" || hasUpcoming)
      .map((s) => ({ slug: s.slug, title: s.title })),
    contentTypes: [...contentTypes].sort() as ContentType[],
    statuses: hasUpcoming ? (["published", "upcoming"] as const) : (["published"] as const),
    availability: [...availability].sort() as BookAvailabilityFlag[],
    sorts: [
      { value: "recommended", label: "Recommended" },
      { value: "title-asc", label: "Title A–Z" },
      { value: "title-desc", label: "Title Z–A" },
    ],
  };
}

export function applyCatalogQuery(
  viewModel: readonly CatalogBookView[],
  state: CatalogUrlState,
  graph: SemanticGraph,
): CatalogQueryResult {
  const showAllEditions = state.editions === "all";
  const pool = defaultCatalogBooks(viewModel, showAllEditions);
  const results = filterCatalogBooks(pool, state, graph);
  const showShelfSections = !hasActiveCatalogFilters(state);

  const shelves = showShelfSections
    ? getActiveShelves(graph)
        .filter((s) => s.slug !== "upcoming" || pool.some((b) => b.status !== "published"))
        .map((shelf) => {
          const books = resolveShelfBooks(shelf, pool);
          const max = shelf.slug === "start-here" ? books.length : shelf.maxPreview;
          return {
            shelf,
            books: books.slice(0, max),
            totalCount: books.length,
          };
        })
        .filter(({ books, shelf }) => books.length > 0 || shelf.featured)
    : [];

  return {
    shelves,
    results,
    activeFilters: state,
    showShelfSections,
  };
}

export function buildSearchItems(viewModel: readonly CatalogBookView[]): CatalogSearchItem[] {
  return defaultCatalogBooks(viewModel).map((b) => ({
    id: b.id,
    slug: b.slug,
    label: b.title,
    subtitle: b.subtitle,
  }));
}
