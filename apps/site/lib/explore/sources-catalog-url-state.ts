import type { SourceKind } from "@/types/semanticGraph";
import { isSourceKindFacet, SOURCE_KIND_FACET_ORDER } from "@/lib/explore/source-taxonomy";

export type SourcesCatalogSort = "recommended" | "title-asc" | "title-desc";

export type SourcesCatalogUrlState = {
  kinds: SourceKind[];
  sort: SourcesCatalogSort;
  q: string;
};

const SORT_VALUES = new Set<SourcesCatalogSort>(["recommended", "title-asc", "title-desc"]);
const KIND_VALUES = new Set<SourceKind>(SOURCE_KIND_FACET_ORDER);

function parseCsvKinds(raw: string | undefined | null): SourceKind[] {
  if (!raw?.trim()) return [];
  const out: SourceKind[] = [];
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (isSourceKindFacet(trimmed) && KIND_VALUES.has(trimmed) && !out.includes(trimmed)) {
      out.push(trimmed);
    }
  }
  return out;
}

export function parseSourcesCatalogUrlState(input: {
  kind?: string | null;
  sort?: string | null;
  q?: string | null;
}): SourcesCatalogUrlState {
  const sortRaw = typeof input.sort === "string" ? input.sort.trim() : "";
  const sort: SourcesCatalogSort = SORT_VALUES.has(sortRaw as SourcesCatalogSort)
    ? (sortRaw as SourcesCatalogSort)
    : "recommended";

  return {
    kinds: parseCsvKinds(input.kind),
    sort,
    q: typeof input.q === "string" ? input.q.trim() : "",
  };
}

export function hasActiveSourcesCatalogFilters(state: SourcesCatalogUrlState): boolean {
  return state.kinds.length > 0 || state.sort !== "recommended" || Boolean(state.q);
}

/** Serialize catalog params. Omits `page` so filter/sort changes reset pagination. */
export function sourcesCatalogBrowseQueryString(state: SourcesCatalogUrlState): string {
  const params = new URLSearchParams();
  if (state.kinds.length > 0) params.set("kind", state.kinds.join(","));
  if (state.sort !== "recommended") params.set("sort", state.sort);
  if (state.q) params.set("q", state.q);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export const SOURCES_CATALOG_SORT_OPTIONS: { value: SourcesCatalogSort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "title-asc", label: "Title A–Z" },
  { value: "title-desc", label: "Title Z–A" },
];
