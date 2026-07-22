import type { BookStatus } from "@/types/content";
import type { BookAvailabilityFlag } from "@/lib/books/book-metadata";
import type { ContentType } from "@/lib/books/catalog-taxonomy";
import { queryLengthBucket } from "@/lib/search/urlState";

export type CatalogSort = "recommended" | "title-asc" | "title-desc";

export type CatalogEditionsMode = "default" | "all";

export type CatalogUrlState = {
  shelf?: string;
  types: ContentType[];
  statuses: CatalogStatusFilter[];
  availability: BookAvailabilityFlag[];
  sort: CatalogSort;
  q: string;
  editions: CatalogEditionsMode;
};

/** Published vs upcoming groupings for the status filter. */
export type CatalogStatusFilter = "published" | "upcoming";

const SORT_VALUES = new Set<CatalogSort>(["recommended", "title-asc", "title-desc"]);
const TYPE_VALUES = new Set<ContentType>(["nonfiction", "fiction", "handbook", "essay_collection"]);
const STATUS_VALUES = new Set<CatalogStatusFilter>(["published", "upcoming"]);
const AVAILABILITY_VALUES = new Set<BookAvailabilityFlag>(["online", "download", "print", "open"]);

function parseCsv<T extends string>(raw: string | undefined | null, allowed: Set<T>): T[] {
  if (!raw?.trim()) return [];
  const out: T[] = [];
  for (const part of raw.split(",")) {
    const trimmed = part.trim() as T;
    if (allowed.has(trimmed) && !out.includes(trimmed)) out.push(trimmed);
  }
  return out;
}

export function parseCatalogUrlState(
  input: {
    shelf?: string | null;
    type?: string | null;
    status?: string | null;
    availability?: string | null;
    sort?: string | null;
    q?: string | null;
    editions?: string | null;
  },
  knownShelfSlugs: readonly string[] = [],
): CatalogUrlState {
  const shelfRaw = typeof input.shelf === "string" ? input.shelf.trim() : "";
  const shelf = shelfRaw && knownShelfSlugs.includes(shelfRaw) ? shelfRaw : undefined;

  const sortRaw = typeof input.sort === "string" ? input.sort.trim() : "";
  const sort: CatalogSort = SORT_VALUES.has(sortRaw as CatalogSort)
    ? (sortRaw as CatalogSort)
    : "recommended";

  const editionsRaw = typeof input.editions === "string" ? input.editions.trim() : "";
  const editions: CatalogEditionsMode = editionsRaw === "all" ? "all" : "default";

  return {
    shelf,
    types: parseCsv(input.type, TYPE_VALUES),
    statuses: parseCsv(input.status, STATUS_VALUES),
    availability: parseCsv(input.availability, AVAILABILITY_VALUES),
    sort,
    q: typeof input.q === "string" ? input.q.trim() : "",
    editions,
  };
}

export function hasActiveCatalogFilters(state: CatalogUrlState): boolean {
  return Boolean(
    state.shelf ||
    state.types.length > 0 ||
    state.statuses.length > 0 ||
    state.availability.length > 0 ||
    state.q ||
    state.sort !== "recommended" ||
    state.editions === "all",
  );
}

export function catalogBrowseQueryString(state: CatalogUrlState): string {
  const params = new URLSearchParams();
  if (state.shelf) params.set("shelf", state.shelf);
  if (state.types.length > 0) params.set("type", state.types.join(","));
  if (state.statuses.length > 0) params.set("status", state.statuses.join(","));
  if (state.availability.length > 0) params.set("availability", state.availability.join(","));
  if (state.sort !== "recommended") params.set("sort", state.sort);
  if (state.q) params.set("q", state.q);
  if (state.editions === "all") params.set("editions", "all");
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function catalogQueryLengthBucket(query: string): string {
  return queryLengthBucket(query);
}

export function catalogStatusMatchesFilter(
  bookStatus: BookStatus,
  filters: readonly CatalogStatusFilter[],
): boolean {
  if (filters.length === 0) return true;
  const isUpcoming =
    bookStatus === "forthcoming" || bookStatus === "in_progress" || bookStatus === "collaborative";
  for (const filter of filters) {
    if (filter === "published" && bookStatus === "published") return true;
    if (filter === "upcoming" && isUpcoming) return true;
  }
  return false;
}
