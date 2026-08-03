import { describe, expect, it } from "vitest";

import {
  applySourcesCatalogQuery,
  buildSourcesFilterOptions,
} from "@/lib/explore/sources-catalog-query";
import {
  hasActiveSourcesCatalogFilters,
  parseSourcesCatalogUrlState,
  sourcesCatalogBrowseQueryString,
} from "@/lib/explore/sources-catalog-url-state";
import type { Source } from "@/types/semanticGraph";

const source = (
  partial: Partial<Source> & Pick<Source, "id" | "slug" | "name" | "type">,
): Source => ({
  ...partial,
});

const sample: Source[] = [
  source({
    id: "s:1",
    slug: "zeta-book",
    name: "zeta-book",
    type: "book",
    sourceKind: "book",
    title: "Zeta Book",
  }),
  source({
    id: "s:2",
    slug: "alpha-article",
    name: "alpha-article",
    type: "article",
    sourceKind: "article",
    title: "Alpha Article",
  }),
  source({
    id: "s:3",
    slug: "report-one",
    name: "report-one",
    type: "book",
    sourceKind: "report",
    title: "Mid Report",
  }),
];

describe("parseSourcesCatalogUrlState", () => {
  it("parses kind CSV and sort", () => {
    const state = parseSourcesCatalogUrlState({
      kind: "book,report,not-a-kind",
      sort: "title-asc",
      q: " bias ",
    });
    expect(state.kinds).toEqual(["book", "report"]);
    expect(state.sort).toBe("title-asc");
    expect(state.q).toBe("bias");
  });
});

describe("sourcesCatalogBrowseQueryString", () => {
  it("omits defaults", () => {
    expect(sourcesCatalogBrowseQueryString({ kinds: [], sort: "recommended", q: "" })).toBe("");
    expect(
      sourcesCatalogBrowseQueryString({
        kinds: ["article"],
        sort: "title-desc",
        q: "",
      }),
    ).toBe("?kind=article&sort=title-desc");
  });
});

describe("applySourcesCatalogQuery", () => {
  it("filters by sourceKind and sorts by title", () => {
    const filtered = applySourcesCatalogQuery(sample, {
      kinds: ["book", "article"],
      sort: "title-asc",
    });
    expect(filtered.map((s) => s.slug)).toEqual(["alpha-article", "zeta-book"]);
  });

  it("builds kind facets from present kinds", () => {
    const opts = buildSourcesFilterOptions(sample);
    expect(opts.kinds).toEqual(["book", "article", "report"]);
  });
});

describe("hasActiveSourcesCatalogFilters", () => {
  it("detects kind and sort", () => {
    expect(hasActiveSourcesCatalogFilters({ kinds: [], sort: "recommended", q: "" })).toBe(false);
    expect(
      hasActiveSourcesCatalogFilters({ kinds: ["book"], sort: "recommended", q: "" }),
    ).toBe(true);
  });
});
