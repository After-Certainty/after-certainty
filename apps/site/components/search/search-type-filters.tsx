"use client";

import { SEARCH_RESULT_LABELS, type SearchEntityType } from "@/lib/search/types";
import { SEARCH_ENTITY_TYPES } from "@/lib/search/urlState";

type SearchTypeFiltersProps = {
  selected: readonly SearchEntityType[];
  onChange: (next: SearchEntityType[]) => void;
};

export function SearchTypeFilters({ selected, onChange }: SearchTypeFiltersProps) {
  function toggle(type: SearchEntityType) {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  }

  return (
    <fieldset className="min-w-0">
      <legend className="text-[10px] uppercase tracking-[0.28em] text-muted">Filter by type</legend>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Result types">
        {SEARCH_ENTITY_TYPES.map((type) => {
          const active = selected.includes(type);
          return (
            <button
              key={type}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(type)}
              className={`min-h-11 rounded-sm border px-3 py-2 text-xs uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                active
                  ? "border-accent/60 bg-accent-soft text-accent"
                  : "border-border/80 text-muted hover:border-accent/40 hover:text-fg"
              }`}
            >
              {SEARCH_RESULT_LABELS[type]}
            </button>
          );
        })}
        {selected.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="min-h-11 rounded-sm border border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted underline-offset-4 hover:text-fg hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Clear
          </button>
        ) : null}
      </div>
    </fieldset>
  );
}
