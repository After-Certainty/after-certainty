import { describe, expect, it } from "vitest";

import { mergeCatalogBooksIntoSemanticGraph } from "@/lib/explore/mergeCatalogBooksIntoSemanticGraph";
import { WOLTY_PUBLIC_ALIAS, WOLTY_V1_SLUG } from "@/lib/books/generated-manifest";
import { parseSearchAliasConfig } from "@/lib/search/aliases";
import {
  buildSearchDocuments,
  collectSearchDocumentIssues,
  findCatalogBookForSlug,
  parseBookEdition,
  pickCanonicalEditionSlug,
} from "@/lib/search/buildSearchDocuments";
import type { Book as CatalogBook, PodcastEpisode } from "@/types/content";
import type { SemanticGraph } from "@/types/semanticGraph";

const emptyGraph = (): SemanticGraph => ({
  books: [],
  glossary: [],
  patterns: [],
  sources: [],
  relationships: [],
  thinkers: [],
});

describe("parseBookEdition", () => {
  it("extracts vN edition suffixes", () => {
    expect(parseBookEdition("when-others-look-to-you-v1")).toEqual({
      baseSlug: "when-others-look-to-you",
      edition: "v1",
    });
    expect(parseBookEdition("after-certainty")).toEqual({ baseSlug: "after-certainty" });
  });
});

describe("findCatalogBookForSlug", () => {
  const catalog: CatalogBook[] = [
    {
      slug: "how-meaning-moves",
      title: "How Meaning Moves",
      description: "d",
      status: "forthcoming",
      authors: ["Kevin"],
      themes: ["meaning"],
    },
    {
      slug: "canonical-book",
      title: "Canonical",
      description: "d",
      status: "published",
      authors: [],
      slugAliases: ["canonical-book-v1", "canonical-book-v2"],
    },
  ];

  it("matches exact slug and alias members", () => {
    expect(findCatalogBookForSlug("how-meaning-moves", catalog)?.status).toBe("forthcoming");
    expect(findCatalogBookForSlug("canonical-book-v2", catalog)?.slug).toBe("canonical-book");
  });
});

describe("pickCanonicalEditionSlug", () => {
  it("prefers WoLTY v1 as the public-alias target", () => {
    const slug = pickCanonicalEditionSlug(WOLTY_PUBLIC_ALIAS, [
      { id: "v1", slug: WOLTY_V1_SLUG, title: "WoLTY" },
      { id: "v2", slug: "when-others-look-to-you-v2", title: "WoLTY" },
    ]);
    expect(slug).toBe(WOLTY_V1_SLUG);
  });
});

describe("buildSearchDocuments", () => {
  it("emits one document per explore entity with stable urls and no duplicate ids", () => {
    const graph: SemanticGraph = {
      ...emptyGraph(),
      books: [
        {
          id: "book-a",
          slug: "book-a",
          title: "Book A",
          summary: "About A",
          concepts: ["concept-certainty"],
          patterns: [],
          sources: [],
        },
      ],
      glossary: [
        {
          id: "concept-certainty",
          slug: "certainty",
          title: "Certainty",
          shortDefinition: "A posture of knowing.",
          relatedBooks: ["book-a"],
        },
      ],
      patterns: [
        {
          id: "pattern-exceptions-are-forever",
          slug: "exceptions-are-forever",
          title: "Exceptions are Forever",
          summary: "Temporary exceptions harden.",
          setup: "A temporary rule",
          problem: "It becomes permanent",
        },
      ],
      thinkers: [
        {
          id: "thinker-john-dewey",
          slug: "john-dewey",
          name: "John Dewey",
          type: "person",
          summary: "Pragmatist",
          works: [],
        },
      ],
      sources: [
        {
          id: "source-dewey-experience",
          slug: "dewey-experience",
          name: "Dewey — Experience",
          type: "book",
          title: "Experience and Education",
          summary: "Education text",
          creatorNames: ["John Dewey"],
          creatorSlugs: ["john-dewey"],
        },
      ],
      relationships: [
        {
          source: "concept-certainty",
          target: "concept-certainty",
          relationship: "intensifies",
        },
      ],
    };

    const episodes: PodcastEpisode[] = [
      {
        id: "ep-1",
        title: "Episode One",
        description: "<p>Hello &amp; welcome</p>",
        publishedAt: "2026-01-01T00:00:00.000Z",
        audioUrl: "https://example.com/a.mp3",
        episodeUrl: "https://example.com/ep/1",
      },
    ];

    const docs = buildSearchDocuments({
      graph,
      catalogBooks: [
        {
          slug: "book-a",
          title: "Book A",
          description: "Catalog copy",
          status: "published",
          authors: ["Kevin Steffe"],
          themes: ["judgment"],
        },
      ],
      podcastEpisodes: episodes,
    });

    expect(docs.map((d) => d.entityType).sort()).toEqual(
      ["book", "concept", "pattern", "podcast_episode", "source", "thinker"].sort(),
    );

    const book = docs.find((d) => d.id === "book-a");
    expect(book?.canonicalUrl).toBe("/explore/books/book-a");
    expect(book?.status).toBe("published");
    expect(book?.creatorNames).toEqual(["Kevin Steffe"]);
    expect(book?.themes).toEqual(["judgment"]);
    expect(book?.relatedTitles).toEqual(expect.arrayContaining(["Certainty"]));

    const concept = docs.find((d) => d.id === "concept-certainty");
    expect(concept?.canonicalUrl).toBe("/explore/concepts/certainty");
    expect(concept?.relationshipDensity).toBeGreaterThan(0);

    const podcast = docs.find((d) => d.id === "podcast:ep-1");
    expect(podcast?.external).toBe(true);
    expect(podcast?.canonicalUrl).toBe("https://example.com/ep/1");
    expect(podcast?.description).toBe("Hello & welcome");
    expect(podcast?.searchText).not.toContain("<p>");

    expect(collectSearchDocumentIssues(docs)).toEqual([]);
  });

  it("keeps book editions as separate documents and ranks the canonical edition higher", () => {
    const graph: SemanticGraph = {
      ...emptyGraph(),
      books: [
        {
          id: "book-when-others-look-to-you-v1",
          slug: WOLTY_V1_SLUG,
          title: "When Others Look to You",
          summary: "v1 summary",
          concepts: [],
          patterns: [],
          sources: [],
        },
        {
          id: "book-when-others-look-to-you-v2",
          slug: "when-others-look-to-you-v2",
          title: "When Others Look to You",
          summary: "v2 summary",
          concepts: [],
          patterns: [],
          sources: [],
        },
      ],
    };

    const docs = buildSearchDocuments({ graph, catalogBooks: [] });
    const v1 = docs.find((d) => d.slug === WOLTY_V1_SLUG);
    const v2 = docs.find((d) => d.slug === "when-others-look-to-you-v2");

    expect(v1?.edition).toBe("v1");
    expect(v2?.edition).toBe("v2");
    expect(v1?.isCanonicalEdition).toBe(true);
    expect(v2?.isCanonicalEdition).toBe(false);
    expect(v1!.boostWeight).toBeGreaterThan(v2!.boostWeight);
    expect(v1?.aliases).toEqual(expect.arrayContaining([WOLTY_PUBLIC_ALIAS]));
    expect(docs.filter((d) => d.entityType === "book")).toHaveLength(2);
  });

  it("joins catalog status onto merged explore books and defaults semantic-only books to published", () => {
    const raw: SemanticGraph = {
      ...emptyGraph(),
      books: [
        {
          id: "b-semantic",
          slug: "how-meaning-moves",
          title: "How Meaning Moves",
          summary: "From manifest",
          concepts: [],
          patterns: [],
          sources: [],
        },
      ],
    };
    const catalog: CatalogBook[] = [
      {
        slug: "how-meaning-moves",
        title: "How Meaning Moves",
        description: "Catalog description",
        status: "forthcoming",
        authors: [],
      },
      {
        slug: "observer-patterns",
        title: "Observer Patterns",
        description: "Poetry",
        status: "draft",
        authors: [],
      },
    ];
    const graph = mergeCatalogBooksIntoSemanticGraph(raw, catalog);
    const docs = buildSearchDocuments({ graph, catalogBooks: catalog });

    expect(docs.find((d) => d.slug === "how-meaning-moves")?.status).toBe("forthcoming");
    expect(docs.find((d) => d.slug === "how-meaning-moves")?.sourceArtifact).toBe("semantic");
    expect(docs.find((d) => d.slug === "observer-patterns")?.status).toBe("draft");
    expect(docs.find((d) => d.slug === "observer-patterns")?.id).toBe("catalog:observer-patterns");
    expect(docs.find((d) => d.slug === "observer-patterns")?.sourceArtifact).toBe("catalog");
  });

  it("attaches authored alias terms and indexes related bridge terms without calling them aliases", () => {
    const graph: SemanticGraph = {
      ...emptyGraph(),
      patterns: [
        {
          id: "pattern-exceptions-are-forever",
          slug: "exceptions-are-forever",
          title: "Exceptions are Forever",
          summary: "Temporary exceptions harden into infrastructure.",
        },
      ],
      books: [
        {
          id: "book-when-others-look-to-you-v1",
          slug: WOLTY_V1_SLUG,
          title: "When Others Look to You",
          concepts: [],
          patterns: [],
          sources: [],
        },
      ],
    };

    const aliasConfig = parseSearchAliasConfig({
      version: 1,
      entries: [
        {
          terms: ["wolty"],
          kind: "alias",
          targetIds: ["book-when-others-look-to-you-v1"],
        },
        {
          terms: ["temporary rules"],
          kind: "related",
          targetIds: ["pattern-exceptions-are-forever"],
        },
      ],
    });

    const docs = buildSearchDocuments({ graph, catalogBooks: [], aliasConfig });
    const book = docs.find((d) => d.id === "book-when-others-look-to-you-v1");
    const pattern = docs.find((d) => d.id === "pattern-exceptions-are-forever");

    expect(book?.aliases).toEqual(expect.arrayContaining(["wolty", WOLTY_PUBLIC_ALIAS]));
    expect(pattern?.aliases).not.toContain("temporary rules");
    expect(pattern?.searchText.toLowerCase()).toContain("temporary rules");
  });

  it("produces a consistent corpus from the bundled explore merge path shape", async () => {
    const fallbackSemantic = (await import("@/data/semantic-manifest.json")).default;
    const booksManifest = (await import("@/data/books-manifest.json")).default;
    const podcastFallback = (await import("@/data/podcast-episodes.json")).default;
    const { semanticGraphSchema, toSemanticGraph } = await import("@/lib/graph/schemas");
    const { getSearchAliasConfig } = await import("@/lib/search/aliases");

    const parsed = semanticGraphSchema.parse(fallbackSemantic);
    const rawGraph = toSemanticGraph(parsed);
    const catalogBooks = booksManifest.books as CatalogBook[];
    const graph = mergeCatalogBooksIntoSemanticGraph(rawGraph, catalogBooks);
    const podcastEpisodes = podcastFallback.episodes as PodcastEpisode[];

    const docs = buildSearchDocuments({
      graph,
      catalogBooks,
      podcastEpisodes,
      aliasConfig: getSearchAliasConfig(),
    });

    const byType = docs.reduce<Record<string, number>>((acc, doc) => {
      acc[doc.entityType] = (acc[doc.entityType] ?? 0) + 1;
      return acc;
    }, {});

    expect(byType.book).toBe(graph.books.length);
    expect(byType.concept).toBe(graph.glossary.length);
    expect(byType.pattern).toBe(graph.patterns.length);
    expect(byType.source).toBe(graph.sources.length);
    expect(byType.thinker).toBeGreaterThan(0);
    expect(byType.podcast_episode).toBe(podcastEpisodes.length);
    expect(collectSearchDocumentIssues(docs)).toEqual([]);

    const ids = new Set(docs.map((d) => d.id));
    expect(ids.size).toBe(docs.length);

    for (const doc of docs) {
      if (doc.entityType === "podcast_episode") {
        expect(doc.external).toBe(true);
        expect(doc.canonicalUrl.startsWith("http")).toBe(true);
      } else {
        expect(doc.canonicalUrl.startsWith("/explore/")).toBe(true);
      }
    }
  });
});
