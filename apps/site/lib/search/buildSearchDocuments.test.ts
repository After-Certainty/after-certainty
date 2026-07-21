import { describe, expect, it } from "vitest";

import { WOLTY_PUBLIC_ALIAS, WOLTY_V1_SLUG } from "@/lib/books/book-slugs";
import { parseSearchAliasConfig } from "@/lib/search/aliases";
import {
  buildSearchDocuments,
  collectSearchDocumentIssues,
  findCatalogBookForSlug,
  parseBookEdition,
  pickCanonicalEditionSlug,
} from "@/lib/search/buildSearchDocuments";
import type { PodcastEpisode } from "@/types/content";
import type { Book, SemanticGraph } from "@/types/semanticGraph";

const emptyGraph = (): SemanticGraph => ({
  books: [],
  glossary: [],
  patterns: [],
  situations: [],
  sources: [],
  relationships: [],
  thinkers: [],
});

function semanticBook(over: Partial<Book> & Pick<Book, "slug">): Book {
  return {
    id: over.id ?? over.slug,
    title: over.title ?? "Title",
    concepts: [],
    patterns: [],
    sources: [],
    ...over,
  };
}

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
  const books: Book[] = [
    semanticBook({
      slug: "how-meaning-moves",
      status: "forthcoming",
      authors: ["Kevin"],
    }),
    semanticBook({
      slug: "canonical-book",
      slugAliases: ["canonical-book-v1", "canonical-book-v2"],
      status: "published",
    }),
  ];

  it("matches exact slug and alias members", () => {
    expect(findCatalogBookForSlug("how-meaning-moves", books)?.status).toBe("forthcoming");
    expect(findCatalogBookForSlug("canonical-book-v2", books)?.slug).toBe("canonical-book");
  });
});

describe("pickCanonicalEditionSlug", () => {
  it("prefers WoLTY v1 as the public-alias target", () => {
    const slug = pickCanonicalEditionSlug(WOLTY_PUBLIC_ALIAS, [
      semanticBook({ slug: WOLTY_V1_SLUG, title: "WoLTY" }),
      semanticBook({ slug: "when-others-look-to-you-v2", title: "WoLTY" }),
    ]);
    expect(slug).toBe(WOLTY_V1_SLUG);
  });
});

describe("buildSearchDocuments", () => {
  it("emits one document per explore entity with stable urls and no duplicate ids", () => {
    const graph: SemanticGraph = {
      ...emptyGraph(),
      books: [
        semanticBook({
          id: "book-a",
          slug: "book-a",
          title: "Book A",
          summary: "About A",
          authors: ["Kevin Steffe"],
          concepts: ["concept-certainty"],
        }),
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

    const docs = buildSearchDocuments({ graph, podcastEpisodes: episodes });

    expect(docs.map((d) => d.entityType).sort()).toEqual(
      ["book", "concept", "pattern", "podcast_episode", "source", "thinker"].sort(),
    );

    const book = docs.find((d) => d.id === "book-a");
    expect(book?.canonicalUrl).toBe("/explore/books/book-a");
    expect(book?.status).toBe("published");
    expect(book?.creatorNames).toEqual(["Kevin Steffe"]);
    expect(book?.relatedTitles).toEqual(expect.arrayContaining(["Certainty"]));

    expect(collectSearchDocumentIssues(docs)).toEqual([]);
  });

  it("keeps book editions as separate documents and ranks the canonical edition higher", () => {
    const graph: SemanticGraph = {
      ...emptyGraph(),
      books: [
        semanticBook({
          id: "book-when-others-look-to-you-v1",
          slug: WOLTY_V1_SLUG,
          title: "When Others Look to You",
          summary: "v1 summary",
        }),
        semanticBook({
          id: "book-when-others-look-to-you-v2",
          slug: "when-others-look-to-you-v2",
          title: "When Others Look to You",
          summary: "v2 summary",
        }),
      ],
    };

    const docs = buildSearchDocuments({ graph });
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

  it("uses semantic book status when present", () => {
    const graph: SemanticGraph = {
      ...emptyGraph(),
      books: [
        semanticBook({
          id: "b-semantic",
          slug: "how-meaning-moves",
          title: "How Meaning Moves",
          summary: "From manifest",
          status: "forthcoming",
        }),
      ],
    };
    const docs = buildSearchDocuments({ graph });
    expect(docs.find((d) => d.slug === "how-meaning-moves")?.status).toBe("forthcoming");
    expect(docs.find((d) => d.slug === "how-meaning-moves")?.sourceArtifact).toBe("semantic");
  });

  it("produces a consistent corpus from the bundled semantic manifest", async () => {
    const fallbackSemantic = (await import("@/data/semantic-manifest.json")).default;
    const podcastFallback = (await import("@/data/podcast-episodes.json")).default;
    const { semanticGraphSchema, toSemanticGraph } = await import("@/lib/graph/schemas");
    const { getSearchAliasConfig } = await import("@/lib/search/aliases");

    const graph = toSemanticGraph(semanticGraphSchema.parse(fallbackSemantic));
    const podcastEpisodes = podcastFallback.episodes as PodcastEpisode[];

    const docs = buildSearchDocuments({
      graph,
      podcastEpisodes,
      aliasConfig: getSearchAliasConfig(),
    });

    expect(collectSearchDocumentIssues(docs)).toEqual([]);
    expect(new Set(docs.map((d) => d.id)).size).toBe(docs.length);
  });
});
