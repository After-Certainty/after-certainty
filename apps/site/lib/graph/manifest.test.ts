import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import fallback from "@/data/semantic-manifest.json";
import { getSemanticBookActionLinkItems } from "@/lib/books/semantic-book-action-links";
import { DEFAULT_SEMANTIC_MANIFEST_URL } from "@/lib/site-config";
import {
  dedupeSemanticGraphBooks,
  fetchSemanticGraphUncached,
  validateSemanticGraph,
  SEMANTIC_GRAPH_CACHE_TAG,
} from "@/lib/graph/manifest";
import type { Book } from "@/types/semanticGraph";

function validatedFallbackGraph() {
  const result = validateSemanticGraph(fallback as unknown);
  if (!result.success) {
    throw new Error("Bundled semantic-manifest.json failed validation in test setup");
  }
  return result.data;
}

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

  it("accepts pattern and book media fields from the semantic manifest", () => {
    const result = validateSemanticGraph(fallback as unknown);
    expect(result.success).toBe(true);
    if (!result.success) return;
    const afterCertainty = result.data.books.find((b) => b.slug === "after-certainty");
    expect(afterCertainty?.openGraphImage).toContain("after-certainty/open-graph.png");
    const wolty = result.data.books.find((b) => b.slug === "when-others-look-to-you-v1");
    expect(wolty?.media?.intro?.youtubeVideoId).toBeTruthy();
    expect(wolty?.purchaseLinks?.[0]?.retailer).toBe("amazon");
    expect(wolty?.epub?.url).toContain("when-others-look-to-you-v1.epub");
    const attention = result.data.patterns.find((p) => p.slug === "attention-finds-a-focus");
    expect(attention?.youtubeVideoId).toBeTruthy();
    expect(attention?.infographic?.url).toContain("raw.githubusercontent.com");
  });

  it("accepts enrichment fields and ontology block", () => {
    const result = validateSemanticGraph({
      books: [],
      glossary: [
        {
          id: "concept-bureaucracy",
          slug: "bureaucracy",
          title: "Bureaucracy",
          shortDefinition: "s",
          recognitionSignals: ["signal one"],
          questions: ["question one"],
          counterbalances: ["balance one"],
          trajectory: { earlySignals: ["early"] },
          manifestations: { family: ["example"] },
        },
      ],
      patterns: [],
      sources: [],
      relationships: [],
      ontology: {
        masterTerms: [{ id: "concept-circulation", slug: "circulation", title: "Circulation", preserves: "continuity" }],
        structuralPressures: [{ id: "concept-scale", slug: "scale", title: "Scale", effect: "weakens proximity" }],
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.glossary[0]?.recognitionSignals?.[0]).toBe("signal one");
      expect(result.data.ontology?.masterTerms).toHaveLength(1);
    }
  });

  it("accepts glossary layer, semanticTone, and relationship weight", () => {
    const result = validateSemanticGraph({
      books: [],
      glossary: [
        {
          id: "c1",
          slug: "c",
          title: "C",
          shortDefinition: "s",
          layer: "Primitives",
          semanticTone: "pressure",
          relatedConcepts: [],
          relatedPatterns: [],
          relatedBooks: [],
        },
      ],
      patterns: [],
      sources: [],
      relationships: [{ source: "c1", target: "c1", relationship: "rel", weight: 2.5 }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.glossary[0]?.layer).toBe("Primitives");
      expect(result.data.glossary[0]?.semanticTone).toBe("pressure");
      expect(result.data.relationships[0]?.weight).toBe(2.5);
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

  it("accepts null book coverImage and openGraphImage from the release manifest", () => {
    const result = validateSemanticGraph({
      books: [
        {
          id: "book-example",
          slug: "example",
          title: "Example",
          coverImage: null,
          openGraphImage: null,
          concepts: [],
          patterns: [],
          sources: [],
        },
      ],
      glossary: [],
      patterns: [],
      sources: [],
      relationships: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.books[0]?.coverImage).toBeUndefined();
      expect(result.data.books[0]?.openGraphImage).toBeUndefined();
    }
  });

  it("accepts null subtitle and PDF-only exports (poetry books)", () => {
    const pdfUrl = "https://github.com/ksteffe/after-certainty/releases/download/latest/observer-patterns.pdf";
    const result = validateSemanticGraph({
      books: [
        {
          id: "book-observer-patterns",
          slug: "observer-patterns",
          title: "Observer Patterns",
          subtitle: null,
          summary: "A book of patterns.",
          concepts: [],
          patterns: [],
          sources: [],
          docx: { enabled: false, file: "observer-patterns.docx", url: null },
          epub: { enabled: false, file: "observer-patterns.epub", url: null },
          pdf: { enabled: true, file: "observer-patterns.pdf", url: pdfUrl },
        },
      ],
      glossary: [],
      patterns: [],
      sources: [],
      relationships: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const book = result.data.books[0];
      expect(book?.subtitle).toBeUndefined();
      expect(book?.pdf?.url).toBe(pdfUrl);
      expect(book?.epub?.enabled).toBe(false);
      expect(book?.docx?.enabled).toBe(false);
      expect(getSemanticBookActionLinkItems(book!)).toEqual([
        { label: "Download PDF", href: pdfUrl, kind: "download" },
      ]);
    }
  });
});

describe("dedupeSemanticGraphBooks", () => {
  it("keeps the row with export URLs when duplicate slugs share an id", () => {
    const published: Book = {
      id: "book-after-certainty",
      slug: "after-certainty",
      title: "After Certainty",
      docx: { enabled: true, file: "a.docx", url: "https://example.com/a.docx" },
    };
    const upcoming: Book = {
      id: "book-after-certainty",
      slug: "after-certainty",
      title: "After Certainty",
      summary: "Upcoming stub",
      docx: { enabled: false, file: "a.docx", url: null },
    };
    const out = dedupeSemanticGraphBooks([upcoming, published]);
    expect(out).toHaveLength(1);
    expect(out[0].docx?.url).toBe(published.docx?.url);
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
    expect(graph.glossary).toEqual(validatedFallbackGraph().glossary);
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

    expect(graph.glossary).toEqual(validatedFallbackGraph().glossary);
  });

  it("falls back when response is not ok", async () => {
    delete process.env.SEMANTIC_MANIFEST_OFFLINE;
    fetchSpy.mockResolvedValue({ ok: false, status: 500 } as Response);

    const graph = await fetchSemanticGraphUncached();

    expect(graph.glossary).toEqual(validatedFallbackGraph().glossary);
  });

  it("falls back when remote JSON fails validation", async () => {
    delete process.env.SEMANTIC_MANIFEST_OFFLINE;
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ books: "nope" }),
    } as Response);

    const graph = await fetchSemanticGraphUncached();

    expect(graph.glossary).toEqual(validatedFallbackGraph().glossary);
  });
});
