import { describe, expect, it } from "vitest";

import {
  EXPLORE_INDEX_PAGE_SIZE,
  exploreIndexBrowseQueryString,
  filterExploreIndexItems,
  paginateExploreIndexItems,
  parseExploreIndexPage,
  type ExploreIndexItem,
} from "@/lib/explore/explore-index-browse";

const item = (id: string, label: string, searchText: string): ExploreIndexItem => ({
  id,
  slug: id,
  label,
  href: `/explore/x/${id}`,
  searchText,
});

describe("parseExploreIndexPage", () => {
  it("defaults missing or blank values to 1", () => {
    expect(parseExploreIndexPage(undefined)).toBe(1);
    expect(parseExploreIndexPage(null)).toBe(1);
    expect(parseExploreIndexPage("")).toBe(1);
    expect(parseExploreIndexPage("  ")).toBe(1);
  });

  it("parses positive integers and clamps invalid values to 1", () => {
    expect(parseExploreIndexPage("3")).toBe(3);
    expect(parseExploreIndexPage("0")).toBe(1);
    expect(parseExploreIndexPage("-2")).toBe(1);
    expect(parseExploreIndexPage("abc")).toBe(1);
    expect(parseExploreIndexPage("2.9")).toBe(2);
  });
});

describe("filterExploreIndexItems", () => {
  const items = [
    item("dewey", "John Dewey", "John Dewey thinker john-dewey pragmatism"),
    item("certainty", "Certainty", "Certainty concept glossary"),
    item("agamben", "State of Exception", "State of Exception Agamben source"),
  ];

  it("returns all items when query is empty", () => {
    expect(filterExploreIndexItems(items, "")).toHaveLength(3);
    expect(filterExploreIndexItems(items, "   ")).toHaveLength(3);
    expect(filterExploreIndexItems(items, undefined)).toHaveLength(3);
  });

  it("matches case-insensitively on searchText", () => {
    expect(filterExploreIndexItems(items, "DEWEY").map((i) => i.id)).toEqual(["dewey"]);
    expect(filterExploreIndexItems(items, "concept").map((i) => i.id)).toEqual(["certainty"]);
  });
});

describe("paginateExploreIndexItems", () => {
  const items = Array.from({ length: 50 }, (_, i) => i);

  it("uses the default page size of 24", () => {
    const slice = paginateExploreIndexItems(items, 1);
    expect(slice.pageSize).toBe(EXPLORE_INDEX_PAGE_SIZE);
    expect(slice.items).toHaveLength(24);
    expect(slice.totalPages).toBe(3);
    expect(slice.startIndex).toBe(0);
    expect(slice.endIndex).toBe(24);
  });

  it("clamps page above totalPages", () => {
    const slice = paginateExploreIndexItems(items, 99);
    expect(slice.page).toBe(3);
    expect(slice.items).toEqual([48, 49]);
  });

  it("handles an empty list", () => {
    const slice = paginateExploreIndexItems([], 2);
    expect(slice).toMatchObject({
      items: [],
      page: 1,
      totalItems: 0,
      totalPages: 0,
      startIndex: 0,
      endIndex: 0,
    });
  });
});

describe("exploreIndexBrowseQueryString", () => {
  it("omits defaults", () => {
    expect(exploreIndexBrowseQueryString("", 1)).toBe("");
    expect(exploreIndexBrowseQueryString("  ", 1)).toBe("");
  });

  it("includes q and page when needed", () => {
    expect(exploreIndexBrowseQueryString("dewey", 1)).toBe("?q=dewey");
    expect(exploreIndexBrowseQueryString("", 2)).toBe("?page=2");
    expect(exploreIndexBrowseQueryString("dewey", 2)).toBe("?q=dewey&page=2");
  });
});
