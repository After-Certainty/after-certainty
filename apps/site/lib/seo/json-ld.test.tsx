import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import type { Book as CatalogBook } from "@/types/content";
import type { Book, GlossaryConcept, Pattern, Source, Thinker } from "@/types/semanticGraph";

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

  const sampleThinker: Thinker = {
    id: "thinker-hannah-arendt",
    slug: "hannah-arendt",
    name: "Hannah Arendt",
    type: "person",
    summary: "Political theorist.",
    works: ["source-arendt-hannah-eichmann"],
    concepts: ["concept-authority"],
    patterns: [],
    relatedBooks: ["book-after-certainty"],
    whyThisMatters: "Arendt on authority and judgment.",
  };

  const sampleOrganization: Thinker = {
    id: "thinker-world-bank",
    slug: "world-bank",
    name: "World Bank",
    type: "organization",
    summary: "International financial institution.",
    works: [],
    concepts: [],
    patterns: [],
    relatedBooks: [],
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
    expect(node.mainEntityOfPage).toEqual({
      "@id": "https://example.com/explore/books/after-certainty#webpage",
    });
  });

  it("builds concept page nodes with WebPage and breadcrumbs", async () => {
    const { buildConceptPageJsonLd, relatedBookUrls, relatedPatternUrls } = await loadJsonLd();
    const relatedUrls = [
      ...relatedBookUrls(mockIndex, sampleConcept.relatedBooks),
      ...relatedPatternUrls(mockIndex, sampleConcept.relatedPatterns),
    ];

    const nodes = buildConceptPageJsonLd({
      concept: sampleConcept,
      breadcrumbs,
      relatedUrls,
    });

    expect(nodes).toHaveLength(4);
    const types = nodes.map((n) => n["@type"]);
    expect(types).toContain("DefinedTermSet");
    expect(types).toContain("WebPage");
    expect(types).toContain("DefinedTerm");
    expect(types).toContain("BreadcrumbList");

    const term = nodes.find((n) => n["@type"] === "DefinedTerm");
    expect(term?.isRelatedTo).toEqual([
      "https://example.com/explore/books/after-certainty",
      "https://example.com/explore/patterns/examples-accumulate",
    ]);

    const webPage = nodes.find((n) => n["@type"] === "WebPage");
    expect(webPage?.breadcrumb).toEqual({
      "@id": "https://example.com/explore/concepts/certainty#breadcrumb",
    });
  });

  it("builds Article JSON-LD for patterns with author, dates, and image URLs", async () => {
    const { buildPatternPageJsonLd, relatedConceptUrls } = await loadJsonLd();
    const nodes = buildPatternPageJsonLd({
      pattern: samplePattern,
      breadcrumbs: [
        { label: "Explore", href: "/explore" },
        { label: "Patterns", href: "/explore/patterns" },
        { label: samplePattern.title },
      ],
      relatedConceptUrls: relatedConceptUrls(mockIndex, samplePattern.relatedConcepts),
      datePublished: "2026-07-01T23:21:07.463921+00:00",
    });

    expect(nodes).toHaveLength(3);

    const article = nodes.find((n) => n["@type"] === "Article");
    expect(article?.headline).toBe("Examples Accumulate");
    expect(article?.author).toEqual([
      expect.objectContaining({
        "@type": "Person",
        name: "Kevin Steffensen",
      }),
    ]);
    expect(article?.datePublished).toBe("2026-07-01T23:21:07.463921+00:00");
    expect(article?.image).toEqual(["https://cdn.example/infographic.png"]);
    expect(article?.video).toMatchObject({
      "@type": "VideoObject",
      embedUrl: "https://www.youtube.com/embed/abc123",
    });
    expect(article?.about).toEqual(["https://example.com/explore/concepts/correction"]);
  });

  it("builds Article JSON-LD with hasPart when narrative fields are present", async () => {
    const { buildPatternPageJsonLd } = await loadJsonLd();

    const patternWithNarratives: Pattern = {
      id: "pattern-gaps-invite",
      slug: "gaps-invite-completion",
      title: "Gaps Invite Completion",
      summary: "People fill ambiguity with their own meaning.",
      setup: "An exchange contains ambiguity or missing context.",
      problem: "Open meaning is hard to sustain without active facilitation.",
      forces: [
        "Cognitive efficiency drives quick closure",
        "Social norms favor certainty over inquiry",
        "Institutional structures reward decisive action",
      ],
      observation:
        "Teams tend to rush toward consensus rather than explore divergent interpretations.",
      example:
        "A manager sends a terse email; team members interpret urgency or disapproval based on past patterns.",
      relatedConcepts: ["concept-certainty"],
    };

    const nodes = buildPatternPageJsonLd({
      pattern: patternWithNarratives,
      breadcrumbs: [
        { label: "Explore", href: "/explore" },
        { label: "Patterns", href: "/explore/patterns" },
        { label: patternWithNarratives.title },
      ],
    });

    const article = nodes.find((n) => n["@type"] === "Article");
    expect(article?.headline).toBe("Gaps Invite Completion");
    expect(article?.description).toBe("People fill ambiguity with their own meaning.");
    expect(article?.hasPart).toHaveLength(5);

    const hasPart = article?.hasPart as Array<{ "@type": string; name: string; text: string }>;

    expect(hasPart[0]).toEqual({
      "@type": "WebPageElement",
      name: "Setup",
      text: "An exchange contains ambiguity or missing context.",
    });

    expect(hasPart[1]).toEqual({
      "@type": "WebPageElement",
      name: "Problem",
      text: "Open meaning is hard to sustain without active facilitation.",
    });

    expect(hasPart[2]).toEqual({
      "@type": "WebPageElement",
      name: "Forces",
      text: "Cognitive efficiency drives quick closure, Social norms favor certainty over inquiry, Institutional structures reward decisive action",
    });

    expect(hasPart[3]).toEqual({
      "@type": "WebPageElement",
      name: "Observation",
      text: "Teams tend to rush toward consensus rather than explore divergent interpretations.",
    });

    expect(hasPart[4]).toEqual({
      "@type": "WebPageElement",
      name: "Example",
      text: "A manager sends a terse email; team members interpret urgency or disapproval based on past patterns.",
    });
  });

  it("maintains backward compatibility for patterns without narrative fields", async () => {
    const { buildPatternPageJsonLd } = await loadJsonLd();

    const nodes = buildPatternPageJsonLd({
      pattern: samplePattern,
      breadcrumbs: [
        { label: "Explore", href: "/explore" },
        { label: "Patterns", href: "/explore/patterns" },
        { label: samplePattern.title },
      ],
    });

    const article = nodes.find((n) => n["@type"] === "Article");
    expect(article?.headline).toBe("Examples Accumulate");
    expect(article?.description).toBe("What leaders model spreads faster than written rules.");
    expect(article?.hasPart).toBeUndefined();
  });

  it("maps source type book to Book schema", async () => {
    const { buildSourcePageJsonLd } = await loadJsonLd();
    const nodes = buildSourcePageJsonLd({
      source: sampleSource,
      breadcrumbs: [
        { label: "Explore", href: "/explore" },
        { label: "Thinkers", href: "/explore/sources" },
        { label: sampleSource.name },
      ],
    });

    const entity = nodes.find((n) => n["@id"]?.toString().endsWith("#source"));
    expect(entity?.["@type"]).toBe("Book");
    expect(entity?.description).toContain("Arendt");
    expect(nodes.some((n) => n["@type"] === "WebPage")).toBe(true);
  });

  it("maps source type article to Article schema", async () => {
    const { buildSourceJsonLd } = await loadJsonLd();
    const node = buildSourceJsonLd({
      source: { ...sampleSource, type: "article" },
      pageUrl: "https://example.com/explore/sources/arendt-what-is-authority",
    });
    expect(node["@type"]).toBe("Article");
  });

  it("maps enriched sourceKind values to schema.org types", async () => {
    const { buildSourceJsonLd, resolveSourceJsonLdType } = await loadJsonLd();

    expect(resolveSourceJsonLdType({ ...sampleSource, sourceKind: "report" }).schemaType).toBe(
      "Report",
    );
    expect(resolveSourceJsonLdType({ ...sampleSource, sourceKind: "dataset" }).schemaType).toBe(
      "Dataset",
    );
    expect(resolveSourceJsonLdType({ ...sampleSource, sourceKind: "standard" })).toEqual({
      schemaType: "CreativeWork",
      additionalType: "Standard",
    });

    const reportNode = buildSourceJsonLd({
      source: {
        ...sampleSource,
        sourceKind: "report",
        title: "Governance Indicators",
        citation: "World Bank. Governance Indicators.",
        creatorNames: ["World Bank"],
        year: 2024,
        publisher: "World Bank",
      },
      pageUrl: "https://example.com/explore/sources/world-bank-governance",
    });
    expect(reportNode["@type"]).toBe("Report");
    expect(reportNode.name).toBe("Governance Indicators");
    expect(reportNode.description).toContain("Governance Indicators");
    expect(reportNode.datePublished).toBe("2024");
  });

  it("maps institutional documents to WebPage schema", async () => {
    const { buildSourceJsonLd } = await loadJsonLd();
    const node = buildSourceJsonLd({
      source: {
        ...sampleSource,
        sourceKind: "institutional_document",
        type: "article",
      },
      pageUrl: "https://example.com/explore/sources/example-institutional-document",
    });
    expect(node["@type"]).toBe("WebPage");
  });

  it("maps thinker pages to Person schema", async () => {
    const { buildThinkerPageJsonLd } = await loadJsonLd();
    const nodes = buildThinkerPageJsonLd({
      thinker: sampleThinker,
      breadcrumbs: [
        { label: "Explore", href: "/explore" },
        { label: "Thinkers", href: "/explore/thinkers" },
        { label: sampleThinker.name },
      ],
    });

    const entity = nodes.find((n) => n["@id"]?.toString().endsWith("#thinker"));
    expect(entity?.["@type"]).toBe("Person");
    expect(entity?.name).toBe("Hannah Arendt");
    expect(entity?.description).toContain("Political theorist");
    expect(nodes.some((n) => n["@type"] === "WebPage")).toBe(true);
  });

  it("maps organization thinkers to Organization schema", async () => {
    const { buildThinkerJsonLd } = await loadJsonLd();
    const node = buildThinkerJsonLd({
      thinker: sampleOrganization,
      pageUrl: "https://example.com/explore/thinkers/world-bank",
    });
    expect(node["@type"]).toBe("Organization");
    expect(node.name).toBe("World Bank");
  });

  it("builds breadcrumb list with positions, URLs, and @id", async () => {
    const { buildBreadcrumbListJsonLd } = await loadJsonLd();
    const list = buildBreadcrumbListJsonLd(
      breadcrumbs,
      "https://example.com/explore/books/after-certainty#breadcrumb",
    );

    expect(list["@type"]).toBe("BreadcrumbList");
    expect(list["@id"]).toBe("https://example.com/explore/books/after-certainty#breadcrumb");
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

  it("builds homepage nodes with WebSite, Organization, and WebPage", async () => {
    const { buildHomePageJsonLd } = await loadJsonLd();
    const nodes = buildHomePageJsonLd();
    const types = nodes.map((n) => n["@type"]);
    expect(types).toEqual(["WebSite", "Organization", "WebPage"]);
  });

  it("builds start page nodes with WebPage, Front Shelf ItemList, and breadcrumbs", async () => {
    const { buildStartPageJsonLd } = await loadJsonLd();
    const nodes = buildStartPageJsonLd({
      shelfItems: [
        {
          slug: "curiosity-before-certainty",
          title: "Curiosity Before Certainty",
          description: "A friendly entry point into the whole project.",
          url: "https://example.com/explore/books/curiosity-before-certainty",
        },
        {
          slug: "after-certainty",
          title: "After Certainty",
          description: "The capstone book.",
          url: "https://example.com/explore/books/after-certainty",
        },
      ],
    });

    expect(nodes).toHaveLength(3);
    expect(nodes.map((n) => n["@type"])).toEqual(["WebPage", "ItemList", "BreadcrumbList"]);

    const itemList = nodes[1];
    expect(itemList?.name).toBe("Front Shelf");
    expect(itemList?.numberOfItems).toBe(2);
    expect(itemList?.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "Book",
          name: "Curiosity Before Certainty",
          description: "A friendly entry point into the whole project.",
          url: "https://example.com/explore/books/curiosity-before-certainty",
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "Book",
          name: "After Certainty",
          description: "The capstone book.",
          url: "https://example.com/explore/books/after-certainty",
        },
      },
    ]);

    expect(nodes[0]?.mainEntity).toEqual({
      "@id": "https://example.com/start#front-shelf",
    });
  });

  it("builds podcast page nodes with series and episodes", async () => {
    const { buildPodcastSeriesJsonLd } = await loadJsonLd();
    const nodes = buildPodcastSeriesJsonLd({
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

    const types = nodes.map((n) => n["@type"]);
    expect(types).toContain("WebPage");
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("PodcastSeries");
    expect(types).toContain("PodcastEpisode");
  });

  it("builds book page nodes with WebPage, Book, and breadcrumbs", async () => {
    const { buildBookPageJsonLd } = await loadJsonLd();
    const nodes = buildBookPageJsonLd({
      book: sampleBook,
      catalogBook: sampleCatalogBook,
      breadcrumbs,
    });

    expect(nodes).toHaveLength(3);
    expect(nodes.map((n) => n["@type"])).toEqual(["WebPage", "Book", "BreadcrumbList"]);
    expect(nodes[0]?.breadcrumb).toEqual({
      "@id": "https://example.com/explore/books/after-certainty#breadcrumb",
    });
    expect(nodes[0]?.mainEntity).toEqual({
      "@id": "https://example.com/explore/books/after-certainty#book",
    });
  });
});

describe("JsonLd component", () => {
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

  it("renders one script tag per standalone entity", async () => {
    const { JsonLd } = await import("@/components/seo/json-ld");
    const { buildBookPageJsonLd } = await import("@/lib/seo/json-ld");

    const { container } = render(
      <JsonLd
        data={buildBookPageJsonLd({
          book: {
            id: "book-after-certainty",
            slug: "after-certainty",
            title: "After Certainty",
          },
          breadcrumbs: [
            { label: "Explore", href: "/explore" },
            { label: "Books", href: "/explore/books" },
            { label: "After Certainty" },
          ],
        })}
      />,
    );

    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(3);
    expect(scripts[0]?.innerHTML).toContain('"@type":"WebPage"');
    expect(scripts[1]?.innerHTML).toContain('"@type":"Book"');
    expect(scripts[2]?.innerHTML).toContain('"@type":"BreadcrumbList"');
    expect(scripts[0]?.innerHTML).toContain('"@context":"https://schema.org"');
    expect(scripts[0]?.innerHTML).not.toContain('"@graph"');
  });
});
