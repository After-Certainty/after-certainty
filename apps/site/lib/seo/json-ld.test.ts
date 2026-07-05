import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Book as CatalogBook } from "@/types/content";
import type { Book, GlossaryConcept, Pattern, Source } from "@/types/semanticGraph";

describe("json-ld builders", () => {
  let prevSiteUrl: string | undefined;

  beforeEach(() => {
    prevSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = prevSiteUrl;
    vi.resetModules();
  });

  async function loadJsonLd() {
    return import("@/lib/seo/json-ld");
  }

  const sampleBook: Book = {
    id: "book-after-certainty",
    slug: "after-certainty",
    title: "After Certainty",
    subtitle: "How to Live and Judge",
    summary: "A practice volume on judgment without false certainty.",
    coverImage: "https://cdn.example/cover.png",
    isbns: ["9781234567890"],
    purchaseLinks: [{ retailer: "amazon", url: "https://amazon.com/dp/example" }],
    epub: { enabled: true, file: "after-certainty.epub", url: "https://cdn.example/book.epub" },
  };

  const sampleCatalogBook: CatalogBook = {
    slug: "after-certainty",
    title: "After Certainty",
    description: "Catalog description",
    status: "published",
    year: 2026,
    authors: ["Kevin Steffensen"],
  };

  const sampleConcept: GlossaryConcept = {
    id: "concept-certainty",
    slug: "certainty",
    title: "Certainty",
    shortDefinition: "The felt need for complete understanding.",
    definition: "Extended definition of certainty.",
    relatedBooks: ["book-after-certainty"],
    relatedPatterns: ["pattern-examples-accumulate"],
  };

  const samplePattern: Pattern = {
    id: "pattern-examples-accumulate",
    slug: "examples-accumulate",
    title: "Examples Accumulate",
    summary: "What leaders model spreads faster than written rules.",
    youtubeVideoId: "abc123",
    mediumArticleUrl: "https://medium.com/@author/examples",
    infographic: {
      url: "https://cdn.example/infographic.png",
      path: "semantic/media/patterns/examples.png",
      width: 1200,
      height: 669,
      alt: "Infographic alt text",
    },
    relatedConcepts: ["concept-correction"],
  };

  const sampleSource: Source = {
    id: "source-arendt-hannah-eichmann",
    slug: "arendt-hannah-eichmann",
    name: "Hannah Arendt — Eichmann in Jerusalem",
    type: "book",
    summary: "Arendt, Hannah. Eichmann in Jerusalem. New York: Viking Press, 1963.",
  };

  const breadcrumbs = [
    { label: "Explore", href: "/explore" },
    { label: "Books", href: "/explore/books" },
    { label: "After Certainty" },
  ];

  const mockIndex = {
    getNodeByCanonicalId: (id: string) => {
      const map: Record<string, { slug: string }> = {
        "book-after-certainty": { slug: "after-certainty" },
        "pattern-examples-accumulate": { slug: "examples-accumulate" },
        "concept-correction": { slug: "correction" },
      };
      return map[id];
    },
  };

  it("builds absolute URLs from paths", async () => {
    const { absoluteUrl } = await loadJsonLd();
    expect(absoluteUrl("/explore/books/after-certainty")).toBe(
      "https://example.com/explore/books/after-certainty",
    );
    expect(absoluteUrl("https://cdn.example/cover.png")).toBe("https://cdn.example/cover.png");
  });

  it("builds Book JSON-LD with catalog authors and offers", async () => {
    const { buildBookJsonLd } = await loadJsonLd();
    const node = buildBookJsonLd({
      book: sampleBook,
      catalogBook: sampleCatalogBook,
      pageUrl: "https://example.com/explore/books/after-certainty",
    });

    expect(node["@type"]).toBe("Book");
    expect(node.name).toBe("After Certainty");
    expect(node.isbn).toBe("9781234567890");
    expect(node.datePublished).toBe("2026");
    expect(node.author).toEqual([{ "@type": "Person", name: "Kevin Steffensen" }]);
    expect(node.offers).toHaveLength(1);
    expect(node.encoding).toHaveLength(1);
  });

  it("builds DefinedTerm JSON-LD inside a concept page graph", async () => {
    const { buildConceptPageJsonLd, relatedBookUrls, relatedPatternUrls } = await loadJsonLd();
    const relatedUrls = [
      ...relatedBookUrls(mockIndex, sampleConcept.relatedBooks),
      ...relatedPatternUrls(mockIndex, sampleConcept.relatedPatterns),
    ];

    const doc = buildConceptPageJsonLd({
      concept: sampleConcept,
      breadcrumbs,
      relatedUrls,
    });

    expect(doc["@context"]).toBe("https://schema.org");
    expect(doc["@graph"]).toHaveLength(3);

    const term = doc["@graph"].find((n) => n["@type"] === "DefinedTerm");
    expect(term?.name).toBe("Certainty");
    expect(term?.termCode).toBe("concept-certainty");
    expect(term?.isRelatedTo).toEqual([
      "https://example.com/explore/books/after-certainty",
      "https://example.com/explore/patterns/examples-accumulate",
    ]);
  });

  it("builds Article JSON-LD for patterns with video and image", async () => {
    const { buildPatternPageJsonLd, relatedConceptUrls } = await loadJsonLd();
    const doc = buildPatternPageJsonLd({
      pattern: samplePattern,
      breadcrumbs: [
        { label: "Explore", href: "/explore" },
        { label: "Patterns", href: "/explore/patterns" },
        { label: samplePattern.title },
      ],
      relatedConceptUrls: relatedConceptUrls(mockIndex, samplePattern.relatedConcepts),
    });

    const article = doc["@graph"].find((n) => n["@type"] === "Article");
    expect(article?.headline).toBe("Examples Accumulate");
    expect(article?.video).toMatchObject({
      "@type": "VideoObject",
      embedUrl: "https://www.youtube.com/embed/abc123",
    });
    expect(article?.image).toMatchObject({
      "@type": "ImageObject",
      url: "https://cdn.example/infographic.png",
    });
    expect(article?.about).toEqual(["https://example.com/explore/concepts/correction"]);
  });

  it("maps source type book to Book schema", async () => {
    const { buildSourcePageJsonLd } = await loadJsonLd();
    const doc = buildSourcePageJsonLd({
      source: sampleSource,
      breadcrumbs: [
        { label: "Explore", href: "/explore" },
        { label: "Thinkers", href: "/explore/sources" },
        { label: sampleSource.name },
      ],
    });

    const entity = doc["@graph"].find((n) => n["@id"]?.toString().endsWith("#source"));
    expect(entity?.["@type"]).toBe("Book");
    expect(entity?.description).toContain("Arendt");
  });

  it("maps source type article to Article schema", async () => {
    const { buildSourceJsonLd } = await loadJsonLd();
    const node = buildSourceJsonLd({
      source: { ...sampleSource, type: "article" },
      pageUrl: "https://example.com/explore/sources/arendt-what-is-authority",
    });
    expect(node["@type"]).toBe("Article");
  });

  it("builds breadcrumb list with positions and URLs", async () => {
    const { buildBreadcrumbListJsonLd } = await loadJsonLd();
    const list = buildBreadcrumbListJsonLd(breadcrumbs);

    expect(list["@type"]).toBe("BreadcrumbList");
    expect(list.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Explore",
        item: "https://example.com/explore",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Books",
        item: "https://example.com/explore/books",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "After Certainty",
      },
    ]);
  });

  it("builds homepage WebSite and Organization graph", async () => {
    const { buildHomePageJsonLd } = await loadJsonLd();
    const doc = buildHomePageJsonLd();
    const types = doc["@graph"].map((n) => n["@type"]);
    expect(types).toContain("WebSite");
    expect(types).toContain("Organization");
  });

  it("builds podcast series with recent episodes", async () => {
    const { buildPodcastSeriesJsonLd } = await loadJsonLd();
    const doc = buildPodcastSeriesJsonLd({
      pageUrl: "https://example.com/podcast",
      episodes: [
        {
          id: "episode-one",
          title: "Episode One",
          description: "First episode",
          publishedAt: "2026-01-15",
          audioUrl: "https://cdn.example/ep1.mp3",
          episodeUrl: "https://anchor.fm/ep1",
        },
      ],
    });

    const types = doc["@graph"].map((n) => n["@type"]);
    expect(types).toContain("PodcastSeries");
    expect(types).toContain("PodcastEpisode");
  });

  it("builds book page graph with breadcrumbs", async () => {
    const { buildBookPageJsonLd } = await loadJsonLd();
    const doc = buildBookPageJsonLd({
      book: sampleBook,
      catalogBook: sampleCatalogBook,
      breadcrumbs,
    });

    expect(doc["@graph"]).toHaveLength(2);
    expect(doc["@graph"].some((n) => n["@type"] === "Book")).toBe(true);
    expect(doc["@graph"].some((n) => n["@type"] === "BreadcrumbList")).toBe(true);
  });
});
