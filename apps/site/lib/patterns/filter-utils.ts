import type { LibraryPattern, PatternBookSection } from "@/types/patterns-library";

export type PatternFilters = {
  bookSlug: string;
  theme: string;
  query: string;
};

export function filterLibraryPatterns(patterns: LibraryPattern[], f: PatternFilters): LibraryPattern[] {
  const q = f.query.trim().toLowerCase();
  return patterns.filter((p) => {
    if (f.bookSlug !== "all" && p.bookSlug !== f.bookSlug) return false;
    if (f.theme !== "all" && !p.themes.includes(f.theme)) return false;
    if (q) {
      const hay = `${p.title} ${p.description} ${p.summary ?? ""} ${p.excerpt ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function mergeSectionsWithPatterns(
  templates: PatternBookSection[],
  filtered: LibraryPattern[],
): PatternBookSection[] {
  const map = new Map<string, LibraryPattern[]>();
  for (const p of filtered) {
    const list = map.get(p.bookSlug) ?? [];
    list.push(p);
    map.set(p.bookSlug, list);
  }
  return templates.map((section) => ({
    ...section,
    patterns: map.get(section.bookSlug) ?? [],
  }));
}

export function filtersActive(f: PatternFilters): boolean {
  return f.bookSlug !== "all" || f.theme !== "all" || f.query.trim().length > 0;
}
