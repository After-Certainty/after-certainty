import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import fallback from "@/data/semantic-manifest.json";
import { getSemanticBookActionLinkItems } from "@/lib/books/semantic-book-action-links";
import { DEFAULT_SEMANTIC_MANIFEST_URL } from "@/lib/site-config";
import {
  dedupeSemanticGraphBooks,
  fetchSemanticGraphUncached,
  pickSemanticGraph,
  validateSemanticGraph,
  SEMANTIC_GRAPH_CACHE_TAG,
} from "@/lib/graph/manifest";
import type { Book, SemanticGraph } from "@/types/semanticGraph";

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

  it("accepts pattern narrative fields for structured JSON-LD", () => {
    const result = validateSemanticGraph({
      books: [],
      glossary: [],
      patterns: [
        {
          id: "pattern-gaps",
          slug: "gaps-invite-completion",
          title: "Gaps Invite Completion",
          summary: "People fill ambiguity with their own meaning.",
          setup: "An exchange contains ambiguity or missing context.",
          problem: "Open meaning is hard to sustain without active facilitation.",
          forces: ["Cognitive efficiency drives quick closure", "Social norms favor certainty"],
          observation: "Teams tend to rush toward consensus.",
          example: "A manager sends a terse email; team members interpret urgency.",
          relatedConcepts: [],
          relatedBooks: [],
        },
      ],
      sources: [],
      relationships: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const pattern = result.data.patterns[0];
      expect(pattern?.setup).toBe("An exchange contains ambiguity or missing context.");
      expect(pattern?.problem).toBe("Open meaning is hard to sustain without active facilitation.");
      expect(pattern?.forces).toEqual([
        "Cognitive efficiency drives quick closure",
        "Social norms favor certainty",
      ]);
      expect(pattern?.observation).toBe("Teams tend to rush toward consensus.");
      expect(pattern?.example).toBe(
        "A manager sends a terse email; team members interpret urgency.",
      );
    }
  });

  it("accepts patterns without narrative fields for backward compatibility", () => {
    const result = validateSemanticGraph({
      books: [],
      glossary: [],
      patterns: [
        {
          id: "pattern-simple",
          slug: "simple-pattern",
          title: "Simple Pattern",
          summary: "A pattern without narrative fields.",
          relatedConcepts: [],
          relatedBooks: [],
        },
      ],
      sources: [],
      relationships: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const pattern = result.data.patterns[0];
      expect(pattern?.setup).toBeUndefined();
      expect(pattern?.problem).toBeUndefined();
      expect(pattern?.forces).toBeUndefined();
      expect(pattern?.observation).toBeUndefined();
      expect(pattern?.example).toBeUndefined();
    }
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
        masterTerms: [
          {
            id: "concept-circulation",
            slug: "circulation",
            title: "Circulation",
            preserves: "continuity",
          },
        ],
        structuralPressures: [
          { id: "concept-scale", slug: "scale", title: "Scale", effect: "weakens proximity" },
        ],
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.glossary[0]?.recognitionSignals?.[0]).toBe("signal one");
      expect(result.data.ontology?.masterTerms).toHaveLength(1);
    }
  });

  it("accepts glossary longDefinition for concept detail pages", () => {
    const result = validateSemanticGraph({
      books: [],
      glossary: [
        {
          id: "concept-accountability",
          slug: "accountability",
          title: "Accountability",
          shortDefinition: "Short accountability definition.",
          longDefinition: "Long accountability definition with fuller context.",
          definition: "Legacy definition field.",
        },
      ],
      patterns: [],
      sources: [],
      relationships: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.glossary[0]?.longDefinition).toBe(
        "Long accountability definition with fuller context.",
      );
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

  it("accepts legacy sources without v1.5 enrichment fields", () => {
    const result = validateSemanticGraph({
      books: [],
      glossary: [],
      patterns: [],
      sources: [
        {
          id: "source-legacy",
          slug: "legacy-source",
          name: "Author — Title",
          type: "book",
          summary: "Citation line.",
          concepts: [],
          patterns: [],
          relatedBooks: [],
        },
      ],
      relationships: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const source = result.data.sources[0];
      expect(source?.name).toBe("Author — Title");
      expect(source?.sourceKind).toBeUndefined();
      expect(source?.creatorSlugs).toBeUndefined();
    }
  });

  it("accepts sources with full v1.5 enrichment fields", () => {
    const result = validateSemanticGraph({
      books: [],
      glossary: [],
      patterns: [],
      sources: [
        {
          id: "source-arendt-hannah-between-past-and-future",
          slug: "arendt-hannah-between-past-and-future",
          name: "Hannah Arendt — Between Past and Future",
          type: "book",
          sourceKind: "book",
          creatorNames: ["Hannah Arendt"],
          creatorSlugs: ["hannah-arendt"],
          title: "Between Past and Future",
          citation: "Arendt, Hannah. *Between Past and Future*. New York: Penguin Books, 2006.",
          year: 2006,
          publisher: "Penguin Books",
          summary: "Arendt, Hannah. *Between Past and Future*. New York: Penguin Books, 2006.",
          whyThisMatters: "Arendt helps distinguish authority from force.",
          url: "https://example.com/arendt",
          concepts: ["concept-authority"],
          patterns: [],
          relatedBooks: ["book-living-in-sediment"],
        },
      ],
      relationships: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const source = result.data.sources[0];
      expect(source?.sourceKind).toBe("book");
      expect(source?.creatorSlugs).toEqual(["hannah-arendt"]);
      expect(source?.title).toBe("Between Past and Future");
      expect(source?.citation).toContain("Between Past and Future");
      expect(source?.year).toBe(2006);
      expect(source?.whyThisMatters).toContain("authority");
    }
  });

  it("accepts manifest version 1 without thinkers key", () => {
    const result = validateSemanticGraph({
      manifestVersion: 1,
      books: [],
      glossary: [],
      patterns: [],
      sources: [],
      relationships: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.manifestVersion).toBe(1);
      expect(result.data.thinkers).toBeUndefined();
    }
  });

  it("accepts manifest version 2 with top-level thinkers array", () => {
    const result = validateSemanticGraph({
      manifestVersion: 2,
      books: [],
      glossary: [],
      patterns: [],
      sources: [],
      relationships: [],
      thinkers: [
        {
          id: "thinker-hannah-arendt",
          slug: "hannah-arendt",
          name: "Hannah Arendt",
          type: "person",
          summary: "Political theorist.",
          works: ["source-arendt-between-past-and-future"],
          concepts: ["concept-authority"],
          patterns: [],
          relatedBooks: ["book-after-certainty"],
          whyThisMatters: "Arendt on authority and judgment.",
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.manifestVersion).toBe(2);
      expect(result.data.thinkers).toHaveLength(1);
      expect(result.data.thinkers?.[0]?.slug).toBe("hannah-arendt");
      expect(result.data.thinkers?.[0]?.works).toEqual(["source-arendt-between-past-and-future"]);
    }
  });

  it("accepts empty thinkers array for v2 manifests", () => {
    const result = validateSemanticGraph({
      manifestVersion: 2,
      books: [],
      glossary: [],
      patterns: [],
      sources: [],
      relationships: [],
      thinkers: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.thinkers).toEqual([]);
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
    const pdfUrl =
      "https://github.com/ksteffe/after-certainty/releases/download/latest/observer-patterns.pdf";
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

  it("rejects javascript: URLs in purchase and media fields", () => {
    const result = validateSemanticGraph({
      books: [
        {
          id: "book-x",
          slug: "x",
          title: "X",
          concepts: [],
          patterns: [],
          sources: [],
          purchaseLinks: [{ retailer: "other", url: "javascript:alert(1)" }],
        },
      ],
      glossary: [],
      patterns: [
        {
          id: "pattern-x",
          slug: "x",
          title: "X",
          summary: "s",
          relatedConcepts: [],
          relatedBooks: [],
          mediumArticleUrl: "javascript:alert(1)",
          youtubeVideoId: "not-valid",
        },
      ],
      sources: [],
      relationships: [],
    });
    expect(result.success).toBe(false);
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

describe("pickSemanticGraph", () => {
  it("prefers bundled graph when remote lacks enrichment", () => {
    const remote = validatedFallbackGraph();
    const legacyRemote: SemanticGraph = {
      ...remote,
      generatedAt: "2026-07-01T00:00:00.000Z",
      sources: remote.sources.map((source) => ({
        id: source.id,
        slug: source.slug,
        name: source.name,
        type: source.type,
        summary: source.summary,
        concepts: source.concepts,
        patterns: source.patterns,
        relatedBooks: source.relatedBooks,
      })),
    };

    const picked = pickSemanticGraph(legacyRemote, remote);
    expect(picked.sources.some((source) => (source.creatorSlugs?.length ?? 0) > 0)).toBe(true);
  });

  it("prefers bundled graph when remote lacks thinkers but sources are enriched", () => {
    const bundled = validatedFallbackGraph();
    const remote: SemanticGraph = {
      ...bundled,
      generatedAt: "2026-07-07T00:00:00.000Z",
      thinkers: undefined,
      manifestVersion: 1,
    };

    const picked = pickSemanticGraph(remote, bundled);
    expect(picked.thinkers?.length ?? 0).toBeGreaterThan(0);
    expect(picked.thinkers?.[0]?.slug).toBe(bundled.thinkers?.[0]?.slug);
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

  it("fetches remote JSON when online and prefers enriched bundled data when remote is legacy", async () => {
    delete process.env.SEMANTIC_MANIFEST_OFFLINE;
    const payload = {
      books: [
        { id: "b1", slug: "book-one", title: "Book One", concepts: [], patterns: [], sources: [] },
      ],
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
    expect(graph.sources.some((source) => (source.creatorSlugs?.length ?? 0) > 0)).toBe(true);
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

  it("prefers bundled graph when remote lacks source enrichment", async () => {
    delete process.env.SEMANTIC_MANIFEST_OFFLINE;
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        manifestVersion: 1,
        generatedAt: "2026-07-01T00:00:00.000Z",
        books: [],
        glossary: [],
        patterns: [],
        sources: [
          {
            id: "source-legacy",
            slug: "legacy-source",
            name: "Legacy Source",
            type: "book",
            summary: "Legacy",
            concepts: [],
            patterns: [],
            relatedBooks: [],
          },
        ],
        relationships: [],
      }),
    } as Response);

    const graph = await fetchSemanticGraphUncached();
    const bundled = validatedFallbackGraph();

    expect(graph.sources.filter((s) => (s.creatorSlugs?.length ?? 0) > 0).length).toBeGreaterThan(
      0,
    );
    expect(bundled.sources.filter((s) => (s.creatorSlugs?.length ?? 0) > 0).length).toBeGreaterThan(
      0,
    );
    expect(graph.sources.some((source) => (source.creatorSlugs?.length ?? 0) > 0)).toBe(true);
  });
});
