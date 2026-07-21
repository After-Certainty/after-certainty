"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useMemo, useState, type FormEvent } from "react";

import { BooksCatalogResults } from "@/components/books/books-catalog-results";
import { CONTENT_TYPE_LABELS, type ContentType } from "@/lib/books/catalog-taxonomy";
import type { CatalogFilterOptions } from "@/lib/books/catalog-query";
import type { CatalogBookView } from "@/lib/books/catalog-view-model";
import {
  catalogBrowseQueryString,
  catalogQueryLengthBucket,
  hasActiveCatalogFilters,
  parseCatalogUrlState,
  type CatalogUrlState,
} from "@/lib/books/catalog-url-state";
import {
  trackBooksFilterApply,
  trackBooksFilterRemove,
  trackBooksFiltersReset,
  trackBooksSearch,
  trackBooksSortChange,
} from "@/lib/analytics/track-books-catalog";
import type { BookAvailabilityFlag } from "@/lib/books/book-metadata";

const QUERY_DEBOUNCE_MS = 250;
const BOOKS_PATH = "/explore/books";

type BooksCatalogControlsProps = {
  initialState: CatalogUrlState;
  results: CatalogBookView[];
  filterOptions: CatalogFilterOptions;
};

function toggleValue<T extends string>(values: readonly T[], value: T): T[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

function BooksCatalogControlsInner({
  initialState,
  results,
  filterOptions,
}: BooksCatalogControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const detailsId = useId();

  const urlState = useMemo(
    () =>
      parseCatalogUrlState({
        shelf: searchParams.get("shelf"),
        type: searchParams.get("type"),
        status: searchParams.get("status"),
        availability: searchParams.get("availability"),
        sort: searchParams.get("sort"),
        q: searchParams.get("q"),
        editions: searchParams.get("editions"),
      }),
    [searchParams],
  );

  const [query, setQuery] = useState(initialState.q);
  const [syncedQ, setSyncedQ] = useState(urlState.q);

  if (urlState.q !== syncedQ) {
    setSyncedQ(urlState.q);
    if (query.trim() === syncedQ || query.trim() === urlState.q) {
      setQuery(urlState.q);
    }
  }

  function replaceState(next: CatalogUrlState) {
    const qs = catalogBrowseQueryString(next);
    router.replace(`${pathname}${qs}`, { scroll: false });
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (query.trim() === urlState.q) return;
      const next = { ...urlState, q: query.trim() };
      replaceState(next);
      if (query.trim()) {
        trackBooksSearch({ query_length_bucket: catalogQueryLengthBucket(query) });
      }
    }, QUERY_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query, urlState]);

  function updateState(patch: Partial<CatalogUrlState>, analyticsKey?: string) {
    const next = { ...urlState, ...patch };
    replaceState(next);
    if (analyticsKey) trackBooksFilterApply({ dimension: analyticsKey });
  }

  function removeFilter(patch: Partial<CatalogUrlState>, label: string) {
    const next = { ...urlState, ...patch };
    replaceState(next);
    trackBooksFilterRemove({ dimension: label });
  }

  function resetFilters() {
    router.replace(BOOKS_PATH, { scroll: false });
    trackBooksFiltersReset();
  }

  function onSortChange(value: CatalogUrlState["sort"]) {
    updateState({ sort: value });
    trackBooksSortChange({ sort: value });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    replaceState({ ...urlState, q: query.trim() });
  }

  const activeFilters = hasActiveCatalogFilters(urlState);

  const chips: { label: string; remove: () => void }[] = [];
  if (urlState.shelf) {
    const shelf = filterOptions.shelves.find((s) => s.slug === urlState.shelf);
    chips.push({
      label: shelf ? `Shelf: ${shelf.title}` : `Shelf: ${urlState.shelf}`,
      remove: () => removeFilter({ shelf: undefined }, "shelf"),
    });
  }
  for (const type of urlState.types) {
    chips.push({
      label: CONTENT_TYPE_LABELS[type],
      remove: () => removeFilter({ types: urlState.types.filter((t) => t !== type) }, "type"),
    });
  }
  for (const status of urlState.statuses) {
    chips.push({
      label: status === "published" ? "Published" : "Upcoming",
      remove: () =>
        removeFilter({ statuses: urlState.statuses.filter((s) => s !== status) }, "status"),
    });
  }
  for (const flag of urlState.availability) {
    chips.push({
      label: flag,
      remove: () =>
        removeFilter(
          { availability: urlState.availability.filter((a) => a !== flag) },
          "availability",
        ),
    });
  }
  if (urlState.sort !== "recommended") {
    const sortLabel =
      filterOptions.sorts.find((s) => s.value === urlState.sort)?.label ?? urlState.sort;
    chips.push({
      label: `Sort: ${sortLabel}`,
      remove: () => removeFilter({ sort: "recommended" }, "sort"),
    });
  }
  if (urlState.editions === "all") {
    chips.push({
      label: "All editions",
      remove: () => removeFilter({ editions: "default" }, "editions"),
    });
  }

  return (
    <div className="space-y-8">
      <details className="md:hidden rounded-sm border border-border/50 bg-bg-elevated/30">
        <summary className="min-h-11 cursor-pointer list-none px-4 py-3 text-sm font-medium text-fg [&::-webkit-details-marker]:hidden">
          Filter books
        </summary>
        <div className="space-y-6 border-t border-border/40 px-4 py-4">
          <FilterFieldsets
            urlState={urlState}
            filterOptions={filterOptions}
            onToggleType={(type) =>
              updateState({ types: toggleValue(urlState.types, type), shelf: undefined }, "type")
            }
            onToggleStatus={(status) =>
              updateState({ statuses: toggleValue(urlState.statuses, status) }, "status")
            }
            onToggleAvailability={(flag) =>
              updateState(
                { availability: toggleValue(urlState.availability, flag) },
                "availability",
              )
            }
            onSortChange={onSortChange}
            onShelfSelect={(slug) => updateState({ shelf: slug }, "shelf")}
          />
        </div>
      </details>

      <div className="hidden md:block space-y-6">
        <FilterFieldsets
          urlState={urlState}
          filterOptions={filterOptions}
          onToggleType={(type) =>
            updateState({ types: toggleValue(urlState.types, type), shelf: undefined }, "type")
          }
          onToggleStatus={(status) =>
            updateState({ statuses: toggleValue(urlState.statuses, status) }, "status")
          }
          onToggleAvailability={(flag) =>
            updateState({ availability: toggleValue(urlState.availability, flag) }, "availability")
          }
          onSortChange={onSortChange}
          onShelfSelect={(slug) => updateState({ shelf: slug }, "shelf")}
        />
      </div>

      <form role="search" onSubmit={onSubmit} className="max-w-xl space-y-2">
        <label
          htmlFor={`${detailsId}-search`}
          className="text-[10px] uppercase tracking-[0.28em] text-muted"
        >
          Search books
        </label>
        <input
          id={`${detailsId}-search`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title…"
          className="w-full rounded-sm border border-border/80 bg-bg-elevated px-4 py-3 text-sm text-fg placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </form>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              aria-label={`Remove ${chip.label}`}
              onClick={chip.remove}
              className="min-h-11 rounded-sm border border-border/60 px-3 py-2 text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {chip.label} ×
            </button>
          ))}
          <button
            type="button"
            onClick={resetFilters}
            className="min-h-11 px-3 py-2 text-xs text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Clear all
          </button>
        </div>
      ) : null}

      <BooksCatalogResults results={results} query={urlState.q} hasActiveFilters={activeFilters} />
    </div>
  );
}

type FilterFieldsetsProps = {
  urlState: CatalogUrlState;
  filterOptions: CatalogFilterOptions;
  onToggleType: (type: ContentType) => void;
  onToggleStatus: (status: "published" | "upcoming") => void;
  onToggleAvailability: (flag: BookAvailabilityFlag) => void;
  onSortChange: (sort: CatalogUrlState["sort"]) => void;
  onShelfSelect: (slug: string | undefined) => void;
};

function FilterFieldsets({
  urlState,
  filterOptions,
  onToggleType,
  onToggleStatus,
  onToggleAvailability,
  onSortChange,
  onShelfSelect,
}: FilterFieldsetsProps) {
  return (
    <>
      {filterOptions.shelves.length > 0 ? (
        <fieldset>
          <legend className="text-[10px] uppercase tracking-[0.28em] text-muted">Shelf</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            <FilterToggle
              pressed={!urlState.shelf}
              label="All shelves"
              onClick={() => onShelfSelect(undefined)}
            />
            {filterOptions.shelves.map((shelf) => (
              <FilterToggle
                key={shelf.slug}
                pressed={urlState.shelf === shelf.slug}
                label={shelf.title}
                onClick={() =>
                  onShelfSelect(urlState.shelf === shelf.slug ? undefined : shelf.slug)
                }
              />
            ))}
          </div>
        </fieldset>
      ) : null}

      {filterOptions.contentTypes.length > 1 ? (
        <fieldset>
          <legend className="text-[10px] uppercase tracking-[0.28em] text-muted">Type</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {filterOptions.contentTypes.map((type) => (
              <FilterToggle
                key={type}
                pressed={urlState.types.includes(type)}
                label={CONTENT_TYPE_LABELS[type]}
                onClick={() => onToggleType(type)}
              />
            ))}
          </div>
        </fieldset>
      ) : null}

      {filterOptions.statuses.length > 1 ? (
        <fieldset>
          <legend className="text-[10px] uppercase tracking-[0.28em] text-muted">Status</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {filterOptions.statuses.map((status) => (
              <FilterToggle
                key={status}
                pressed={urlState.statuses.includes(status)}
                label={status === "published" ? "Published" : "Upcoming"}
                onClick={() => onToggleStatus(status)}
              />
            ))}
          </div>
        </fieldset>
      ) : null}

      {filterOptions.availability.length > 0 ? (
        <fieldset>
          <legend className="text-[10px] uppercase tracking-[0.28em] text-muted">
            Availability
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {filterOptions.availability.map((flag) => (
              <FilterToggle
                key={flag}
                pressed={urlState.availability.includes(flag)}
                label={flag}
                onClick={() => onToggleAvailability(flag)}
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

function FilterToggle({
  pressed,
  label,
  onClick,
}: {
  pressed: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="min-h-11 rounded-sm border border-border/50 px-4 py-2 text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent aria-pressed:border-accent/50 aria-pressed:text-accent"
    >
      {label}
    </button>
  );
}

export function BooksCatalogControls(props: BooksCatalogControlsProps) {
  return (
    <Suspense fallback={<BooksCatalogResults results={props.results} hasActiveFilters={false} />}>
      <BooksCatalogControlsInner {...props} />
    </Suspense>
  );
}
