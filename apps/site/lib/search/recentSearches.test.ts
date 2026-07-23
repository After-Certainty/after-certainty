import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  clearRecentSearches,
  getRecentSearches,
  pushRecentSearch,
  RECENT_SEARCHES_STORAGE_KEY,
} from "@/lib/search/recentSearches";

describe("recentSearches", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("stores newest-first unique queries", () => {
    pushRecentSearch("certainty");
    pushRecentSearch("trust");
    pushRecentSearch("certainty");
    expect(getRecentSearches()).toEqual(["certainty", "trust"]);
    expect(window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)).toContain("certainty");
  });

  it("clears recent searches", () => {
    pushRecentSearch("wolty");
    clearRecentSearches();
    expect(getRecentSearches()).toEqual([]);
  });
});
