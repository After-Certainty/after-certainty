export type ExploreIndexItem = {
  id: string;
  slug: string;
  label: string;
  href: string;
  searchText: string;
};

export const EXPLORE_INDEX_PAGE_SIZE = 24;

export type ExploreIndexPageSlice<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
};

/** Clamp a raw `page` search param to a positive integer (default 1). */
export function parseExploreIndexPage(raw: string | undefined | null): number {
  if (raw == null || raw.trim() === "") return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

/** Case-insensitive substring match on `searchText`. Empty/whitespace `q` returns all items. */
export function filterExploreIndexItems(
  items: readonly ExploreIndexItem[],
  q: string | undefined | null,
): ExploreIndexItem[] {
  const needle = q?.trim().toLowerCase() ?? "";
  if (!needle) return [...items];
  return items.filter((item) => item.searchText.toLowerCase().includes(needle));
}

/**
 * Paginate a list. Out-of-range `page` is clamped to `[1, totalPages]`
 * (or `1` when the list is empty).
 */
export function paginateExploreIndexItems<T>(
  items: readonly T[],
  page: number,
  pageSize: number = EXPLORE_INDEX_PAGE_SIZE,
): ExploreIndexPageSlice<T> {
  const size = pageSize > 0 ? pageSize : EXPLORE_INDEX_PAGE_SIZE;
  const totalItems = items.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / size);
  const safePage = totalPages === 0 ? 1 : Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * size;
  const endIndex = totalItems === 0 ? 0 : Math.min(startIndex + size, totalItems);
  return {
    items: items.slice(startIndex, endIndex),
    page: safePage,
    pageSize: size,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
  };
}

/** Build a `?q=&page=` query string, omitting defaults (`page=1`, empty `q`). */
export function exploreIndexBrowseQueryString(q: string, page: number): string {
  const params = new URLSearchParams();
  const trimmed = q.trim();
  if (trimmed) params.set("q", trimmed);
  if (page > 1) params.set("page", String(page));
  const s = params.toString();
  return s ? `?${s}` : "";
}
