import { describe, expect, it } from "vitest";

import {
  filterLibraryPatterns,
  filtersActive,
  mergeSectionsWithPatterns,
  type PatternFilters,
} from "@/lib/patterns/filter-utils";
import type { LibraryPattern, PatternBookSection } from "@/types/patterns-library";

const sample: LibraryPattern[] = [
  {
    id: "b::a",
    slug: "alpha",
    title: "Alpha Pattern",
    description: "Long description about alpha dynamics.",
    summary: "Alpha summary",
    bookSlug: "book-a",
    bookTitle: "Book A",
    themes: ["Theme One"],
  },
  {
    id: "b::b",
    slug: "beta",
    title: "Beta Pattern",
    description: "Beta talks about something else.",
    bookSlug: "book-b",
    bookTitle: "Book B",
    themes: ["Theme Two"],
  },
];

describe("filterLibraryPatterns", () => {
  const base: PatternFilters = { bookSlug: "all", theme: "all", query: "" };

  it("filters by bookSlug", () => {
    expect(filterLibraryPatterns(sample, { ...base, bookSlug: "book-a" })).toHaveLength(1);
    expect(filterLibraryPatterns(sample, { ...base, bookSlug: "book-a" })[0]!.slug).toBe("alpha");
  });

  it("filters by theme", () => {
    expect(filterLibraryPatterns(sample, { ...base, theme: "Theme Two" })).toHaveLength(1);
  });

  it("filters by query substring across title and description", () => {
    expect(filterLibraryPatterns(sample, { ...base, query: "alpha" })).toHaveLength(1);
  });
});

describe("mergeSectionsWithPatterns", () => {
  it("assigns filtered patterns into matching sections", () => {
    const templates: PatternBookSection[] = [
      { bookSlug: "book-a", bookTitle: "Book A", patterns: [] },
      { bookSlug: "book-b", bookTitle: "Book B", patterns: [] },
    ];
    const filtered = filterLibraryPatterns(sample, {
      bookSlug: "all",
      theme: "all",
      query: "",
    });
    const merged = mergeSectionsWithPatterns(templates, filtered);
    expect(merged[0]!.patterns.map((p) => p.slug)).toEqual(["alpha"]);
    expect(merged[1]!.patterns.map((p) => p.slug)).toEqual(["beta"]);
  });
});

describe("filtersActive", () => {
  it("is false when all facets are default", () => {
    expect(filtersActive({ bookSlug: "all", theme: "all", query: "" })).toBe(false);
  });

  it("is true when query is non-empty", () => {
    expect(filtersActive({ bookSlug: "all", theme: "all", query: "x" })).toBe(true);
  });
});
