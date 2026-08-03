import type { ThinkerType } from "@/types/semanticGraph";
import { THINKER_TYPE_FACET_ORDER } from "@/lib/explore/thinker-taxonomy";

export type ThinkersCatalogSort = "recommended" | "name-asc" | "name-desc";

export type ThinkersCatalogUrlState = {
  types: ThinkerType[];
  sort: ThinkersCatalogSort;
  q: string;
};

const SORT_VALUES = new Set<ThinkersCatalogSort>(["recommended", "name-asc", "name-desc"]);
const TYPE_VALUES = new Set<ThinkerType>(THINKER_TYPE_FACET_ORDER);

function parseCsv<T extends string>(raw: string | undefined | null, allowed: Set<T>): T[] {
  if (!raw?.trim()) return [];
  const out: T[] = [];
  for (const part of raw.split(",")) {
    const trimmed = part.trim() as T;
    if (allowed.has(trimmed) && !out.includes(trimmed)) out.push(trimmed);
  }
  return out;
}

export function parseThinkersCatalogUrlState(input: {
  type?: string | null;
  sort?: string | null;
  q?: string | null;
}): ThinkersCatalogUrlState {
  const sortRaw = typeof input.sort === "string" ? input.sort.trim() : "";
  const sort: ThinkersCatalogSort = SORT_VALUES.has(sortRaw as ThinkersCatalogSort)
    ? (sortRaw as ThinkersCatalogSort)
    : "recommended";

  return {
    types: parseCsv(input.type, TYPE_VALUES),
    sort,
    q: typeof input.q === "string" ? input.q.trim() : "",
  };
}

export function hasActiveThinkersCatalogFilters(state: ThinkersCatalogUrlState): boolean {
  return state.types.length > 0 || state.sort !== "recommended" || Boolean(state.q);
}

/** Serialize catalog params. Omits `page` so filter/sort changes reset pagination. */
export function thinkersCatalogBrowseQueryString(state: ThinkersCatalogUrlState): string {
  const params = new URLSearchParams();
  if (state.types.length > 0) params.set("type", state.types.join(","));
  if (state.sort !== "recommended") params.set("sort", state.sort);
  if (state.q) params.set("q", state.q);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export const THINKERS_CATALOG_SORT_OPTIONS: { value: ThinkersCatalogSort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
];
