import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import fallback from "@/data/semantic-manifest.json";
import { DEFAULT_SEMANTIC_MANIFEST_URL } from "@/lib/site-config";
import {
  fetchSemanticGraphUncached,
  validateSemanticGraph,
  SEMANTIC_GRAPH_CACHE_TAG,
} from "@/lib/graph/manifest";

describe("validateSemanticGraph", () => {
  it("accepts minimal valid graph", () => {
    const result = validateSemanticGraph({
      books: [],
      glossary: [],
      patterns: [],
      sources: [],
      relationships: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.books).toEqual([]);
    }
  });

  it("rejects invalid entity field types", () => {
    const result = validateSemanticGraph({
      books: [{ id: "b1", slug: "b", title: 123 }],
      glossary: [],
      patterns: [],
      sources: [],
      relationships: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("fetchSemanticGraphUncached", () => {
  let prevOffline: string | undefined;
  let prevManifestUrl: string | undefined;
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    prevOffline = process.env.SEMANTIC_MANIFEST_OFFLINE;
    prevManifestUrl = process.env.SEMANTIC_MANIFEST_URL;
    delete process.env.SEMANTIC_MANIFEST_URL;
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    process.env.SEMANTIC_MANIFEST_OFFLINE = prevOffline;
    if (prevManifestUrl === undefined) delete process.env.SEMANTIC_MANIFEST_URL;
    else process.env.SEMANTIC_MANIFEST_URL = prevManifestUrl;
    fetchSpy.mockRestore();
  });

  it("returns bundled graph when offline", async () => {
    process.env.SEMANTIC_MANIFEST_OFFLINE = "1";
    const graph = await fetchSemanticGraphUncached();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(graph.glossary).toEqual((fallback as { glossary: unknown[] }).glossary);
  });

  it("fetches and parses remote JSON when online", async () => {
    delete process.env.SEMANTIC_MANIFEST_OFFLINE;
    const payload = {
      books: [{ id: "b1", slug: "book-one", title: "Book One", concepts: [], patterns: [], sources: [] }],
      glossary: [
        {
          id: "c1",
          slug: "concept-one",
          title: "Concept One",
          shortDefinition: "Short",
          relatedConcepts: [],
          relatedPatterns: [],
          relatedBooks: [],
        },
      ],
      patterns: [],
      sources: [],
      relationships: [],
    };
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => payload,
    } as Response);

    const graph = await fetchSemanticGraphUncached();

    expect(fetchSpy).toHaveBeenCalledWith(
      DEFAULT_SEMANTIC_MANIFEST_URL,
      expect.objectContaining({
        headers: { Accept: "application/json, */*" },
        next: expect.objectContaining({
          revalidate: expect.any(Number),
          tags: [SEMANTIC_GRAPH_CACHE_TAG],
        }),
      }),
    );
    expect(graph.glossary).toHaveLength(1);
    expect(graph.glossary[0].slug).toBe("concept-one");
  });

  it("falls back to bundled graph when fetch fails", async () => {
    delete process.env.SEMANTIC_MANIFEST_OFFLINE;
    fetchSpy.mockRejectedValue(new Error("network"));

    const graph = await fetchSemanticGraphUncached();

    expect(graph.glossary).toEqual((fallback as { glossary: unknown[] }).glossary);
  });

  it("falls back when response is not ok", async () => {
    delete process.env.SEMANTIC_MANIFEST_OFFLINE;
    fetchSpy.mockResolvedValue({ ok: false, status: 500 } as Response);

    const graph = await fetchSemanticGraphUncached();

    expect(graph.glossary).toEqual((fallback as { glossary: unknown[] }).glossary);
  });

  it("falls back when remote JSON fails validation", async () => {
    delete process.env.SEMANTIC_MANIFEST_OFFLINE;
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ books: "nope" }),
    } as Response);

    const graph = await fetchSemanticGraphUncached();

    expect(graph.glossary).toEqual((fallback as { glossary: unknown[] }).glossary);
  });
});
