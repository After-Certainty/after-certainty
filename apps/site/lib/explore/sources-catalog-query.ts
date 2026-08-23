import {
  SOURCE_KIND_FACET_ORDER,
  isSourceKindFacet,
  sourceKindFacetLabel,
  sourceKindForFacet,
} from "@/lib/explore/source-taxonomy";
import type {
  SourcesCatalogSort,
  SourcesCatalogUrlState,
} from "@/lib/explore/sources-catalog-url-state";
import { sourceDisplayTitle } from "@/lib/graph/presentation/sourceDisplay";
import type { Source, SourceKind } from "@/types/semanticGraph";

export type SourcesCatalogFilterOptions = {
  kinds: SourceKind[];
  sorts: { value: SourcesCatalogSort; label: string }[];
};

export function buildSourcesFilterOptions(
  sources: readonly Source[],
): SourcesCatalogFilterOptions {
  const present = new Set<SourceKind>();
  for (const source of sources) {
    const kind = sourceKindForFacet(source);
    if (isSourceKindFacet(kind)) present.add(kind);
  }
  const kinds = SOURCE_KIND_FACET_ORDER.filter((kind) => present.has(kind));
  return {
    kinds,
    sorts: [
      { value: "recommended", label: "Recommended" },
      { value: "title-asc", label: "Title A–Z" },
      { value: "title-desc", label: "Title Z–A" },
    ],
  };
}

export function sourceKindChipLabel(kind: SourceKind): string {
  return sourceKindFacetLabel(kind);
}

function sortSources(list: Source[], sort: SourcesCatalogSort): Source[] {
  const next = [...list];
  if (sort === "title-asc") {
    next.sort((a, b) =>
      sourceDisplayTitle(a).localeCompare(sourceDisplayTitle(b), undefined, {
        sensitivity: "base",
      }),
    );
    return next;
  }
  if (sort === "title-desc") {
    next.sort((a, b) =>
      sourceDisplayTitle(b).localeCompare(sourceDisplayTitle(a), undefined, {
        sensitivity: "base",
      }),
    );
    return next;
  }
  // recommended — index-order helper (name A–Z)
  next.sort((a, b) => a.name.localeCompare(b.name));
  return next;
}

/** Filter by sourceKind, then apply sort. Search (`q`) is applied separately via browse helpers. */
export function applySourcesCatalogQuery(
  sources: readonly Source[],
  state: Pick<SourcesCatalogUrlState, "kinds" | "sort">,
): Source[] {
  let list = [...sources];
  if (state.kinds.length > 0) {
    const allowed = new Set(state.kinds);
    list = list.filter((s) => allowed.has(sourceKindForFacet(s) as SourceKind));
  }
  return sortSources(list, state.sort);
}
