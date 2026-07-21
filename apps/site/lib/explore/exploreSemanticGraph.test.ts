import { describe, expect, it, vi, beforeEach } from "vitest";

import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import * as manifest from "@/lib/graph/manifest";
import type { SemanticGraph } from "@/types/semanticGraph";

vi.mock("@/lib/graph/manifest");

const emptyGraph: SemanticGraph = {
  books: [],
  glossary: [],
  patterns: [],
  situations: [],
  sources: [],
  relationships: [],
};

describe("getExploreSemanticGraph", () => {
  beforeEach(() => {
    vi.mocked(manifest.getSemanticGraph).mockReset();
  });

  it("returns the semantic graph", async () => {
    vi.mocked(manifest.getSemanticGraph).mockResolvedValue({
      ...emptyGraph,
      books: [
        { id: "bid", slug: "in-manifest", title: "M", concepts: [], patterns: [], sources: [] },
      ],
    });

    const { graph } = await getExploreSemanticGraph();

    expect(graph.books.map((b) => b.slug)).toEqual(["in-manifest"]);
  });
});
