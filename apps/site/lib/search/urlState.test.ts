import { describe, expect, it } from "vitest";

import {
  parseSearchPage,
  parseSearchTypes,
  parseSearchUrlState,
  queryLengthBucket,
  resultCountBucket,
  searchBrowseQueryString,
} from "@/lib/search/urlState";

describe("parseSearchTypes", () => {
  it("parses comma-separated types and drops unknowns", () => {
    expect(parseSearchTypes("book,concept,nope")).toEqual(["book", "concept"]);
    expect(parseSearchTypes("")).toEqual([]);
  });
});

describe("parseSearchPage", () => {
  it("clamps invalid pages to 1", () => {
    expect(parseSearchPage(undefined)).toBe(1);
    expect(parseSearchPage("0")).toBe(1);
    expect(parseSearchPage("3")).toBe(3);
  });
});

describe("searchBrowseQueryString", () => {
  it("omits defaults and preserves filters", () => {
    expect(searchBrowseQueryString({ q: "", types: [], page: 1 })).toBe("");
    expect(searchBrowseQueryString({ q: "trust", types: ["book"], page: 2 })).toBe(
      "?q=trust&type=book&page=2",
    );
  });
});

describe("parseSearchUrlState", () => {
  it("trims query and parses type/page", () => {
    expect(parseSearchUrlState({ q: "  certainty  ", type: "concept,book", page: "2" })).toEqual({
      q: "certainty",
      types: ["concept", "book"],
      page: 2,
    });
  });
});

describe("buckets", () => {
  it("buckets query length and result counts without exposing raw strings", () => {
    expect(queryLengthBucket("hi")).toBe("1-10");
    expect(resultCountBucket(0)).toBe("0");
    expect(resultCountBucket(12)).toBe("11-24");
  });
});
