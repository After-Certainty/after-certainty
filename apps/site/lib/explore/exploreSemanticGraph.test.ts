import { describe, expect, it, vi, beforeEach } from "vitest";

import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import * as contentData from "@/lib/content-data";
import * as manifest from "@/lib/graph/manifest";
import type { Book as CatalogBook } from "@/types/content";
import type { SemanticGraph } from "@/types/semanticGraph";

vi.mock("@/lib/content-data");
vi.mock("@/lib/graph/manifest");

const emptyGraph: SemanticGraph = {
  books: [],
  glossary: [],
  patterns: [],
  sources: [],
  relationships: [],
};

describe("getExploreSemanticGraph", () => {
  beforeEach(() => {
    vi.mocked(manifest.getSemanticGraph).mockReset();
    vi.mocked(contentData.getBooks).mockReset();
  });

  it("returns merged graph and raw catalog rows", async () => {
    vi.mocked(manifest.getSemanticGraph).mockResolvedValue({
      ...emptyGraph,
      books: [{ id: "bid", slug: "in-manifest", title: "M", concepts: [], patterns: [], sources: [] }],
    });
    const catalogBook: CatalogBook = {
      slug: "catalog-only",
      title: "C",
      description: "d",
      status: "published",
      authors: [],
    };
    vi.mocked(contentData.getBooks).mockResolvedValue([catalogBook]);

    const { graph, catalogBooks } = await getExploreSemanticGraph();

    expect(catalogBooks).toEqual([catalogBook]);
    expect(graph.books.map((b) => b.slug).sort()).toEqual(["catalog-only", "in-manifest"]);
  });
});
