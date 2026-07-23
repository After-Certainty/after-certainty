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
    vi.mocked(manifest.getSemanticGraphLoadResult).mockReset();
  });

  it("returns the semantic graph with provenance", async () => {
    vi.mocked(manifest.getSemanticGraphLoadResult).mockResolvedValue({
      graph: {
        ...emptyGraph,
        books: [
          { id: "bid", slug: "in-manifest", title: "M", concepts: [], patterns: [], sources: [] },
        ],
      },
      source: {
        kind: "fallback",
        stale: false,
        reason: "offline",
        schemaVersion: "2.2",
      },
      diagnostics: [],
    });

    const { graph, source } = await getExploreSemanticGraph();

    expect(graph.books.map((b) => b.slug)).toEqual(["in-manifest"]);
    expect(source.kind).toBe("fallback");
  });
});
