import semanticManifest from "@/data/semantic-manifest.json";
import { describe, expect, it } from "vitest";

import { applyCatalogQuery, buildFilterOptions } from "@/lib/books/catalog-query";
import { catalogBrowseQueryString, parseCatalogUrlState } from "@/lib/books/catalog-url-state";
import { buildCatalogViewModel } from "@/lib/books/catalog-view-model";
import { WOLTY_V1_SLUG } from "@/lib/books/book-slugs";
import { assertCatalogHealthy } from "@/lib/books/validate-catalog";
import { validateSemanticGraph } from "@/lib/graph/manifest";

const validated = validateSemanticGraph(semanticManifest as unknown);
if (!validated.success) {
  throw new Error("Bundled semantic-manifest.json failed validation in catalog tests");
}
const graph = validated.data;
const viewModel = buildCatalogViewModel(graph);
const shelfSlugs = buildFilterOptions(viewModel, graph).shelves.map((s) => s.slug);

describe("buildCatalogViewModel", () => {
  it("hides non-canonical WoLTY companion v2 from default catalog", () => {
    const slugs = viewModel.filter((b) => b.isPublic && b.isCanonicalEdition).map((b) => b.slug);
    expect(slugs).toContain(WOLTY_V1_SLUG);
    expect(slugs).not.toContain("when-others-look-to-you-v2");

    const v2 = viewModel.find((b) => b.slug === "when-others-look-to-you-v2");
    expect(v2?.editionRelationship).toBe("companion");
    expect(v2?.editionLabel).toBe("Companion edition");
    expect(v2?.isCanonicalEdition).toBe(false);
  });

  it("assigns fiction content type from the semantic manifest", () => {
    const relay = viewModel.find((b) => b.slug === "the-relay");
    expect(relay?.contentType).toBe("fiction");
    const before = viewModel.find((b) => b.slug === "before-certainty-arrives");
    expect(before?.contentType).toBe("nonfiction");
  });
});

describe("parseCatalogUrlState", () => {
  it("ignores invalid params safely", () => {
    const state = parseCatalogUrlState(
      {
        shelf: "not-a-shelf",
        type: "fiction,invalid",
        sort: "not-a-sort",
        q: "  trust  ",
      },
      shelfSlugs,
    );
    expect(state.shelf).toBeUndefined();
    expect(state.types).toEqual(["fiction"]);
    expect(state.sort).toBe("recommended");
    expect(state.q).toBe("trust");
  });

  it("serializes non-default state", () => {
    const qs = catalogBrowseQueryString({
      shelf: "fiction",
      types: ["fiction"],
      statuses: [],
      availability: [],
      sort: "title-asc",
      q: "",
      editions: "default",
    });
    expect(qs).toBe("?shelf=fiction&type=fiction&sort=title-asc");
  });
});

describe("applyCatalogQuery", () => {
  it("filters by shelf and content type", () => {
    const fiction = applyCatalogQuery(
      viewModel,
      parseCatalogUrlState({ shelf: "fiction" }, shelfSlugs),
      graph,
    );
    expect(fiction.results.every((b) => b.contentType === "fiction")).toBe(true);

    const sorted = applyCatalogQuery(
      viewModel,
      parseCatalogUrlState({ sort: "title-desc", shelf: "fiction" }, shelfSlugs),
      graph,
    );
    const titles = sorted.results.map((b) => b.title);
    expect([...titles].sort((a, b) => b.localeCompare(a))).toEqual(titles);
  });

  it("searches title metadata", () => {
    const result = applyCatalogQuery(
      viewModel,
      parseCatalogUrlState({ q: "coupling" }, shelfSlugs),
      graph,
    );
    expect(result.results.some((b) => b.slug === "coupling")).toBe(true);
  });

  it("shows shelf sections only without active filters", () => {
    const defaultView = applyCatalogQuery(viewModel, parseCatalogUrlState({}, shelfSlugs), graph);
    expect(defaultView.showShelfSections).toBe(true);
    expect(defaultView.shelves.some((s) => s.shelf.slug === "start-here")).toBe(true);

    const filtered = applyCatalogQuery(
      viewModel,
      parseCatalogUrlState({ type: "fiction" }, shelfSlugs),
      graph,
    );
    expect(filtered.showShelfSections).toBe(false);
  });
});

describe("validate-catalog", () => {
  it("passes health check on bundled data", () => {
    expect(() => assertCatalogHealthy({ viewModel, graph })).not.toThrow();
  });
});

describe("buildFilterOptions", () => {
  it("exposes shelves and sort options", () => {
    const options = buildFilterOptions(viewModel, graph);
    expect(options.shelves.some((s) => s.slug === "start-here")).toBe(true);
    expect(options.sorts.map((s) => s.value)).toContain("recommended");
  });
});
