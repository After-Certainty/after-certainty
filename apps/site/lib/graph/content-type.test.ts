import { describe, expect, it, beforeEach } from "vitest";

import {
  contentTypeFromBook,
  contentTypeInfoFromBook,
  isFilterableContentType,
  normalizePublicContentType,
  resetContentTypeDiagnosticLog,
} from "@/lib/graph/content-type";
import { CONTENT_TYPE_LABELS } from "@/lib/books/catalog-taxonomy";
import { applyCatalogQuery, buildFilterOptions } from "@/lib/books/catalog-query";
import { parseCatalogUrlState, catalogBrowseQueryString } from "@/lib/books/catalog-url-state";
import { buildCatalogViewModel } from "@/lib/books/catalog-view-model";
import { buildSearchDocuments } from "@/lib/search/buildSearchDocuments";
import type { SemanticGraph } from "@/types/semanticGraph";

function fixtureGraph(): SemanticGraph {
  return {
    books: [
      {
        id: "book-boundary-conditions",
        slug: "boundary-conditions",
        title: "Boundary Conditions",
        contentType: "fiction",
        literaryForm: "novel",
        status: "published",
        isCanonical: true,
        concepts: [],
        patterns: [],
        sources: [],
      },
      {
        id: "book-observer-patterns",
        slug: "observer-patterns",
        title: "Observer Patterns",
        contentType: "poetry",
        literaryForm: "poetry_collection",
        status: "published",
        isCanonical: true,
        concepts: [],
        patterns: [],
        sources: [],
      },
      {
        id: "book-handbook",
        slug: "how-serious-systems-learn",
        title: "How Serious Systems Learn",
        contentType: "handbook",
        literaryForm: "handbook",
        status: "published",
        isCanonical: true,
        concepts: [],
        patterns: [],
        sources: [],
      },
      {
        id: "book-before-certainty-arrives",
        slug: "before-certainty-arrives",
        title: "Before Certainty Arrives",
        contentType: "nonfiction",
        literaryForm: "monograph",
        status: "published",
        isCanonical: true,
        concepts: [],
        patterns: [],
        sources: [],
      },
      {
        id: "book-unsupported",
        slug: "unsupported-type",
        title: "Unsupported Type",
        // Unsupported value — simulates a future manifest type after schema looseness
        contentType: "screenplay" as never,
        status: "published",
        isCanonical: true,
        concepts: [],
        patterns: [],
        sources: [],
      },
      {
        id: "book-hidden",
        slug: "hidden-draft",
        title: "Hidden Draft",
        contentType: "poetry",
        status: "draft",
        isCanonical: true,
        concepts: [],
        patterns: [],
        sources: [],
      },
    ],
    glossary: [],
    patterns: [],
    situations: [],
    sources: [],
    relationships: [],
    schemaVersion: "2.2",
  };
}

describe("normalizePublicContentType", () => {
  beforeEach(() => {
    resetContentTypeDiagnosticLog();
  });

  it("preserves known types and literary form", () => {
    const info = normalizePublicContentType({
      contentType: "fiction",
      literaryForm: "novel",
    });
    expect(info.contentType).toBe("fiction");
    expect(info.literaryForm).toBe("novel");
    expect(info.label).toBe("Fiction");
    expect(info.filterValue).toBe("fiction");
    expect(info.isKnown).toBe(true);
  });

  it("does not coerce unknown types to nonfiction", () => {
    const info = normalizePublicContentType({ contentType: "screenplay" });
    expect(info.contentType).toBe("unknown");
    expect(info.label).toBe(CONTENT_TYPE_LABELS.unknown);
    expect(info.filterValue).toBeUndefined();
    expect(info.isKnown).toBe(false);
  });

  it("treats missing contentType as unknown", () => {
    const info = normalizePublicContentType({});
    expect(info.contentType).toBe("unknown");
    expect(info.isKnown).toBe(false);
  });
});

describe("content-type catalog integration fixture", () => {
  it("maps Boundary Conditions and Observer Patterns through the full pipeline", () => {
    const graph = fixtureGraph();
    const viewModel = buildCatalogViewModel(graph);
    const boundary = viewModel.find((b) => b.slug === "boundary-conditions");
    const observer = viewModel.find((b) => b.slug === "observer-patterns");
    const unsupported = viewModel.find((b) => b.slug === "unsupported-type");
    const hidden = viewModel.find((b) => b.slug === "hidden-draft");

    expect(boundary?.contentType).toBe("fiction");
    expect(boundary?.contentTypeLabel).toBe("Fiction");
    expect(boundary?.literaryForm).toBe("novel");
    expect(observer?.contentType).toBe("poetry");
    expect(observer?.contentTypeLabel).toBe("Poetry");
    expect(unsupported?.contentType).toBe("unknown");
    expect(unsupported?.contentTypeLabel).toBe("Unknown");
    expect(unsupported?.contentType).not.toBe("nonfiction");

    const options = buildFilterOptions(viewModel, graph);
    expect(options.contentTypes).toContain("poetry");
    expect(options.contentTypes).toContain("fiction");
    expect(options.contentTypes).not.toContain("unknown");

    const withoutVisiblePoetry = buildFilterOptions(
      viewModel.filter((b) => b.slug !== "observer-patterns"),
      graph,
    );
    expect(withoutVisiblePoetry.contentTypes.includes("poetry")).toBe(false);
    expect(hidden?.contentType).toBe("poetry");

    const poetryFiltered = applyCatalogQuery(
      viewModel,
      parseCatalogUrlState({ type: "poetry" }),
      graph,
    );
    expect(poetryFiltered.results.map((b) => b.slug)).toEqual(["observer-patterns"]);

    const fictionFiltered = applyCatalogQuery(
      viewModel,
      parseCatalogUrlState({ type: "fiction" }),
      graph,
    );
    expect(fictionFiltered.results.some((b) => b.slug === "boundary-conditions")).toBe(true);

    expect(catalogBrowseQueryString(parseCatalogUrlState({ type: "poetry" }))).toBe("?type=poetry");
    expect(isFilterableContentType("poetry")).toBe(true);
    expect(isFilterableContentType("unknown")).toBe(false);

    const searchDocs = buildSearchDocuments({ graph });
    const searchObserver = searchDocs.find((d) => d.slug === "observer-patterns");
    const searchBoundary = searchDocs.find((d) => d.slug === "boundary-conditions");
    expect(searchObserver?.contentType).toBe("poetry");
    expect(searchObserver?.contentTypeLabel).toBe("Poetry");
    expect(searchBoundary?.contentType).toBe(boundary?.contentType);
  });

  it("omits poetry filter when no visible poetry exists", () => {
    const graph: SemanticGraph = {
      books: [
        {
          id: "book-a",
          slug: "a",
          title: "A",
          contentType: "nonfiction",
          status: "published",
          isCanonical: true,
        },
      ],
      glossary: [],
      patterns: [],
      situations: [],
      sources: [],
      relationships: [],
    };
    const viewModel = buildCatalogViewModel(graph);
    expect(buildFilterOptions(viewModel, graph).contentTypes).not.toContain("poetry");
  });
});

describe("contentTypeFromBook diagnostics", () => {
  beforeEach(() => {
    resetContentTypeDiagnosticLog();
  });

  it("collects missing and unsupported diagnostics", () => {
    const diagnostics: { category: string }[] = [];
    expect(
      contentTypeFromBook(
        { id: "b1", slug: "s1", contentType: undefined },
        { collectDiagnostics: diagnostics as never },
      ),
    ).toBe("unknown");
    expect(diagnostics[0]?.category).toBe("missing");
    expect(
      contentTypeInfoFromBook({
        id: "b2",
        slug: "s2",
        contentType: "screenplay" as never,
      }).rawValue,
    ).toBe("screenplay");
  });
});
