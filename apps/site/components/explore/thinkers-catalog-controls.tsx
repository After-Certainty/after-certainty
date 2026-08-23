"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

import { CaretDownIcon, FunnelSimpleIcon, XIcon } from "@/components/icons/approved";
import { FilterToggle } from "@/components/catalog/filter-toggle";
import { SiteIcon } from "@/components/icons/site-icon";
import {
  buildThinkersFilterOptions,
  thinkerTypeChipLabel,
  type ThinkersCatalogFilterOptions,
} from "@/lib/explore/thinkers-catalog-query";
import {
  parseThinkersCatalogUrlState,
  thinkersCatalogBrowseQueryString,
  type ThinkersCatalogUrlState,
} from "@/lib/explore/thinkers-catalog-url-state";
import { explorePaths } from "@/lib/graph/explorePaths";
import type { Thinker, ThinkerType } from "@/types/semanticGraph";

type ThinkersCatalogControlsProps = {
  /** Full catalog (unfiltered) — used to build facet options. */
  allThinkers: readonly Thinker[];
  /** Match count after type/sort/q filters (pre-pagination). */
  matchCount: number;
};

function toggleValue<T extends string>(values: readonly T[], value: T): T[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

function activeFilterCount(state: ThinkersCatalogUrlState): number {
  let count = state.types.length;
  if (state.sort !== "recommended") count += 1;
  if (state.q) count += 1;
  return count;
}

function FilterFieldsets({
  urlState,
  filterOptions,
  onToggleType,
  onSortChange,
}: {
  urlState: ThinkersCatalogUrlState;
  filterOptions: ThinkersCatalogFilterOptions;
  onToggleType: (type: ThinkerType) => void;
  onSortChange: (sort: ThinkersCatalogUrlState["sort"]) => void;
}) {
  return (
    <>
      {filterOptions.types.length > 1 ? (
        <fieldset>
          <legend className="text-[10px] uppercase tracking-[0.28em] text-muted">Type</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {filterOptions.types.map((type) => (
              <FilterToggle
                key={type}
                pressed={urlState.types.includes(type)}
                label={thinkerTypeChipLabel(type)}
                onClick={() => onToggleType(type)}
              />
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset>
        <legend className="text-[10px] uppercase tracking-[0.28em] text-muted">Sort</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {filterOptions.sorts.map((sort) => (
            <FilterToggle
              key={sort.value}
              pressed={urlState.sort === sort.value}
              label={sort.label}
              onClick={() => onSortChange(sort.value)}
            />
          ))}
        </div>
      </fieldset>
    </>
  );
}

function ThinkersCatalogControlsInner({ allThinkers, matchCount }: ThinkersCatalogControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filterOptions = useMemo(() => buildThinkersFilterOptions(allThinkers), [allThinkers]);

  const urlState = useMemo(
    () =>
      parseThinkersCatalogUrlState({
        type: searchParams.get("type"),
        sort: searchParams.get("sort"),
        q: searchParams.get("q"),
      }),
    [searchParams],
  );

  function replaceState(next: ThinkersCatalogUrlState) {
    const qs = thinkersCatalogBrowseQueryString(next);
    router.replace(`${pathname}${qs}`, { scroll: false });
  }

  function updateState(patch: Partial<ThinkersCatalogUrlState>) {
    replaceState({ ...urlState, ...patch });
  }

  const filterCount = activeFilterCount(urlState);
  const chips: { label: string; remove: () => void }[] = [];
  for (const type of urlState.types) {
    chips.push({
      label: thinkerTypeChipLabel(type),
      remove: () => updateState({ types: urlState.types.filter((t) => t !== type) }),
    });
  }
  if (urlState.sort !== "recommended") {
    const sortLabel =
      filterOptions.sorts.find((s) => s.value === urlState.sort)?.label ?? urlState.sort;
    chips.push({
      label: `Sort: ${sortLabel}`,
      remove: () => updateState({ sort: "recommended" }),
    });
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <details className="border-b border-border/40 md:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2.5 text-sm font-medium text-fg [&::-webkit-details-marker]:hidden">
          <span className="flex min-w-0 items-center gap-2">
            <SiteIcon icon={FunnelSimpleIcon} size="sm" className="text-accent" />
            <span>Filter &amp; sort</span>
          </span>
          <span className="flex shrink-0 items-center gap-2 text-xs font-normal text-muted">
            {filterCount > 0 ? <span className="text-accent">{filterCount} active</span> : null}
            <span aria-hidden="true">
              {matchCount} {matchCount === 1 ? "match" : "matches"}
            </span>
            <SiteIcon icon={CaretDownIcon} size="sm" className="text-muted" />
          </span>
        </summary>
        <div className="space-y-4 border-t border-border/35 pb-4 pt-3">
          <FilterFieldsets
            urlState={urlState}
            filterOptions={filterOptions}
            onToggleType={(type) => updateState({ types: toggleValue(urlState.types, type) })}
            onSortChange={(sort) => updateState({ sort })}
          />
        </div>
      </details>

      <div className="hidden space-y-6 md:block">
        <FilterFieldsets
          urlState={urlState}
          filterOptions={filterOptions}
          onToggleType={(type) => updateState({ types: toggleValue(urlState.types, type) })}
          onSortChange={(sort) => updateState({ sort })}
        />
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              aria-label={`Remove ${chip.label}`}
              onClick={chip.remove}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-sm border border-border/60 px-3 py-2 text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {chip.label}
              <SiteIcon icon={XIcon} size={14} weight="regular" className="opacity-80" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => router.replace(explorePaths.thinkers, { scroll: false })}
            className="min-h-11 px-3 py-2 text-xs text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ThinkersCatalogControls(props: ThinkersCatalogControlsProps) {
  return (
    <Suspense fallback={null}>
      <ThinkersCatalogControlsInner {...props} />
    </Suspense>
  );
}
