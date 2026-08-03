import {
  THINKER_TYPE_FACET_ORDER,
  thinkerTypeLabel,
} from "@/lib/explore/thinker-taxonomy";
import type {
  ThinkersCatalogSort,
  ThinkersCatalogUrlState,
} from "@/lib/explore/thinkers-catalog-url-state";
import type { Thinker, ThinkerType } from "@/types/semanticGraph";

export type ThinkersCatalogFilterOptions = {
  types: ThinkerType[];
  sorts: { value: ThinkersCatalogSort; label: string }[];
};

export function buildThinkersFilterOptions(
  thinkers: readonly Thinker[],
): ThinkersCatalogFilterOptions {
  const present = new Set(thinkers.map((t) => t.type));
  const types = THINKER_TYPE_FACET_ORDER.filter((type) => present.has(type));
  return {
    types,
    sorts: [
      { value: "recommended", label: "Recommended" },
      { value: "name-asc", label: "Name A–Z" },
      { value: "name-desc", label: "Name Z–A" },
    ],
  };
}

export function thinkerTypeChipLabel(type: ThinkerType): string {
  return thinkerTypeLabel(type);
}

function sortThinkers(list: Thinker[], sort: ThinkersCatalogSort): Thinker[] {
  const next = [...list];
  if (sort === "name-desc") {
    next.sort((a, b) => b.name.localeCompare(a.name));
    return next;
  }
  // recommended and name-asc both use name A–Z (index-order helper)
  next.sort((a, b) => a.name.localeCompare(b.name));
  return next;
}

/** Filter by type, then apply sort. Text (`q`) is applied separately via browse helpers. */
export function applyThinkersCatalogQuery(
  thinkers: readonly Thinker[],
  state: Pick<ThinkersCatalogUrlState, "types" | "sort">,
): Thinker[] {
  let list = [...thinkers];
  if (state.types.length > 0) {
    const allowed = new Set(state.types);
    list = list.filter((t) => allowed.has(t.type));
  }
  return sortThinkers(list, state.sort);
}
