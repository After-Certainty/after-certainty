import { describe, expect, it } from "vitest";

import {
  applyThinkersCatalogQuery,
  buildThinkersFilterOptions,
} from "@/lib/explore/thinkers-catalog-query";
import {
  hasActiveThinkersCatalogFilters,
  parseThinkersCatalogUrlState,
  thinkersCatalogBrowseQueryString,
} from "@/lib/explore/thinkers-catalog-url-state";
import type { Thinker } from "@/types/semanticGraph";

const thinker = (partial: Partial<Thinker> & Pick<Thinker, "id" | "slug" | "name" | "type">): Thinker => ({
  works: [],
  ...partial,
});

const sample: Thinker[] = [
  thinker({ id: "t:a", slug: "ada", name: "Ada", type: "person" }),
  thinker({ id: "t:z", slug: "zeta", name: "Zeta Org", type: "organization" }),
  thinker({ id: "t:g", slug: "group", name: "Author Group", type: "author_group" }),
];

describe("parseThinkersCatalogUrlState", () => {
  it("parses multi type CSV and sort", () => {
    const state = parseThinkersCatalogUrlState({
      type: "person,organization,bogus",
      sort: "name-desc",
      q: " dewey ",
    });
    expect(state.types).toEqual(["person", "organization"]);
    expect(state.sort).toBe("name-desc");
    expect(state.q).toBe("dewey");
  });

  it("defaults sort and ignores unknown sort", () => {
    expect(parseThinkersCatalogUrlState({ sort: "nope" }).sort).toBe("recommended");
  });
});

describe("thinkersCatalogBrowseQueryString", () => {
  it("omits defaults and page", () => {
    expect(
      thinkersCatalogBrowseQueryString({ types: [], sort: "recommended", q: "" }),
    ).toBe("");
    expect(
      thinkersCatalogBrowseQueryString({
        types: ["person"],
        sort: "name-asc",
        q: "x",
      }),
    ).toBe("?type=person&sort=name-asc&q=x");
  });
});

describe("applyThinkersCatalogQuery", () => {
  it("filters by type and sorts by name", () => {
    const filtered = applyThinkersCatalogQuery(sample, {
      types: ["person", "author_group"],
      sort: "name-desc",
    });
    expect(filtered.map((t) => t.slug)).toEqual(["group", "ada"]);
  });

  it("builds facet options from present types only", () => {
    const opts = buildThinkersFilterOptions(sample);
    expect(opts.types).toEqual(["person", "organization", "author_group"]);
  });
});

describe("hasActiveThinkersCatalogFilters", () => {
  it("detects type, sort, and q", () => {
    expect(hasActiveThinkersCatalogFilters({ types: [], sort: "recommended", q: "" })).toBe(
      false,
    );
    expect(hasActiveThinkersCatalogFilters({ types: ["person"], sort: "recommended", q: "" })).toBe(
      true,
    );
  });
});
