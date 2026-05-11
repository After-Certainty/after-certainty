"use client";

import { useMemo, useState } from "react";
import { PatternCard } from "@/components/patterns/pattern-card";
import { PatternPreview } from "@/components/patterns/pattern-preview";
import {
  filterLibraryPatterns,
  filtersActive,
  mergeSectionsWithPatterns,
  type PatternFilters,
} from "@/lib/patterns/filter-utils";
import type { LibraryPattern, PatternBookSection } from "@/types/patterns-library";

type Props = {
  sectionsTemplate: PatternBookSection[];
  patterns: LibraryPattern[];
  themeOptions: string[];
};

export function PatternsExplorerClient({ sectionsTemplate, patterns, themeOptions }: Props) {
  const [filters, setFilters] = useState<PatternFilters>({
    bookSlug: "all",
    theme: "all",
    query: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterLibraryPatterns(patterns, filters),
    [patterns, filters],
  );

  const displaySections = useMemo(() => {
    const merged = mergeSectionsWithPatterns(sectionsTemplate, filtered);
    if (!filtersActive(filters)) return merged;
    return merged.filter((s) => s.patterns.length > 0);
  }, [sectionsTemplate, filtered, filters]);

  const previewPattern = useMemo(() => {
    if (!selectedId) return null;
    if (!filtered.some((p) => p.id === selectedId)) return null;
    return patterns.find((p) => p.id === selectedId) ?? null;
  }, [selectedId, filtered, patterns]);

  const resolveTitle = (slug: string) => patterns.find((p) => p.slug === slug)?.title;

  return (
    <div className="space-y-12">
      <PatternFilterBar
        filters={filters}
        onChange={setFilters}
        themeOptions={themeOptions}
        sectionSlugs={sectionsTemplate.map((s) => ({ slug: s.bookSlug, title: s.bookTitle }))}
        resultCount={filtered.length}
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-14 xl:gap-20">
        <div className="min-w-0 space-y-16">
          {displaySections.length === 0 ? (
            <p className="text-sm text-muted">No patterns match these filters.</p>
          ) : null}
          {displaySections.map((section) => (
            <PatternGroupBlock key={section.bookSlug} section={section} selectedId={selectedId} onSelect={setSelectedId} />
          ))}
        </div>

        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <PatternPreview pattern={previewPattern} resolveTitle={resolveTitle} />
        </div>
      </div>
    </div>
  );
}

function PatternFilterBar({
  filters,
  onChange,
  themeOptions,
  sectionSlugs,
  resultCount,
}: {
  filters: PatternFilters;
  onChange: (f: PatternFilters) => void;
  themeOptions: string[];
  sectionSlugs: { slug: string; title: string }[];
  resultCount: number;
}) {
  return (
    <div className="space-y-6 border-b border-border/35 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <label htmlFor="pattern-search" className="sr-only">
            Search patterns
          </label>
          <input
            id="pattern-search"
            type="search"
            placeholder="Search titles and observations…"
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            className="w-full rounded-sm border border-border/50 bg-bg-elevated/20 px-4 py-3 text-sm text-fg placeholder:text-muted/60 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
        </div>
        <p className="shrink-0 text-xs text-muted" aria-live="polite">
          {resultCount} {resultCount === 1 ? "pattern" : "patterns"}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted">Book</span>
          <select
            value={filters.bookSlug}
            onChange={(e) => onChange({ ...filters, bookSlug: e.target.value })}
            className="rounded-sm border border-border/50 bg-bg-elevated/20 px-3 py-2.5 text-sm text-fg focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/30"
          >
            <option value="all">All shelves</option>
            {sectionSlugs.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted">Theme</span>
          <select
            value={filters.theme}
            onChange={(e) => onChange({ ...filters, theme: e.target.value })}
            className="rounded-sm border border-border/50 bg-bg-elevated/20 px-3 py-2.5 text-sm text-fg focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/30"
          >
            <option value="all">All themes</option>
            {themeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function PatternGroupBlock({
  section,
  selectedId,
  onSelect,
}: {
  section: PatternBookSection;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (section.patterns.length === 0) {
    return (
      <section aria-labelledby={`group-${section.bookSlug}`}>
        <header className="max-w-2xl border-b border-border/30 pb-6">
          <h2 id={`group-${section.bookSlug}`} className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
            {section.bookTitle}
          </h2>
          {section.intro ? <p className="mt-4 text-sm leading-relaxed text-muted md:text-[15px]">{section.intro}</p> : null}
        </header>
        <p className="mt-8 text-sm text-muted">Patterns will surface here as this line of work grows.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby={`group-${section.bookSlug}`}>
      <header className="max-w-2xl border-b border-border/30 pb-6">
        <h2 id={`group-${section.bookSlug}`} className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
          {section.bookTitle}
        </h2>
        {section.intro ? <p className="mt-4 text-sm leading-relaxed text-muted md:text-[15px]">{section.intro}</p> : null}
      </header>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {section.patterns.map((p) => (
          <PatternCard
            key={p.id}
            pattern={p}
            selected={selectedId === p.id}
            onSelect={() => onSelect(p.id)}
          />
        ))}
      </div>
    </section>
  );
}
