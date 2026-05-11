import { describe, expect, it } from "vitest";

import {
  deriveFeaturedSlug,
  isGeneratedBooksManifest,
  normalizeGeneratedBooksManifest,
  resolveBookCanonicalSlug,
  shouldRedirectSlugToWoltyMicrosite,
  slugExcludedFromBookDetailStaticParams,
  WOLTY_PUBLIC_ALIAS,
  WOLTY_V1_SLUG,
} from "@/lib/books/generated-manifest";

describe("isGeneratedBooksManifest", () => {
  it("is true for release-shaped root", () => {
    expect(
      isGeneratedBooksManifest({
        manifestVersion: 1,
        generatedAt: "2026-01-01",
        books: [],
      }),
    ).toBe(true);
  });

  it("is false for bundled legacy manifest shape", () => {
    expect(
      isGeneratedBooksManifest({
        featuredSlug: "when-others-look-to-you",
        books: [],
      }),
    ).toBe(false);
  });
});

describe("normalizeGeneratedBooksManifest", () => {
  it("maps release fields into BooksCatalogManifest and derives featured slug from WoLTY alias", () => {
    const manifest = normalizeGeneratedBooksManifest({
      manifestVersion: 1,
      repository: "ksteffe/after-certainty",
      books: [
        {
          slug: "how-meaning-moves",
          status: "published",
          title: "How Meaning Moves",
          description: "Desc",
          authors: ["A"],
          epub: { enabled: true, file: "x.epub", url: "https://example.com/x.epub" },
          docx: { enabled: false, file: "x.docx", url: null },
          pdf: { enabled: true, file: "x.pdf", url: "https://example.com/x.pdf" },
        },
        {
          slug: WOLTY_V1_SLUG,
          status: "published",
          title: "When Others Look to You",
          description: "WoLTY desc",
          authors: ["Kevin Steffensen"],
          slugAliases: [WOLTY_PUBLIC_ALIAS],
          companionBooks: ["when-others-look-to-you-v2"],
          epub: { enabled: true, file: "w.epub", url: "https://example.com/w.epub" },
          docx: { enabled: true, file: "w.docx", url: "https://example.com/w.docx" },
        },
        {
          slug: "when-others-look-to-you-v2",
          status: "published",
          title: "When Others Look to You",
          description: "Companion",
          authors: ["Kevin Steffensen"],
          companionOf: WOLTY_V1_SLUG,
          epub: { enabled: false, file: "c.epub", url: null },
        },
      ],
    });

    expect(manifest.featuredSlug).toBe(WOLTY_V1_SLUG);
    expect(manifest.books).toHaveLength(3);
    const hmm = manifest.books.find((b) => b.slug === "how-meaning-moves");
    expect(hmm?.epubUrl).toBe("https://example.com/x.epub");
    expect(hmm?.docxUrl).toBeUndefined();
    expect(hmm?.pdfUrl).toBe("https://example.com/x.pdf");
    const v1 = manifest.books.find((b) => b.slug === WOLTY_V1_SLUG);
    expect(v1?.slugAliases).toEqual([WOLTY_PUBLIC_ALIAS]);
    expect(v1?.epubUrl).toBe("https://example.com/w.epub");
    expect(v1?.docxUrl).toBe("https://example.com/w.docx");
    expect(v1?.repositoryUrl).toBe("https://github.com/ksteffe/after-certainty");
    const v2 = manifest.books.find((b) => b.slug === "when-others-look-to-you-v2");
    expect(v2?.companionOf).toBe(WOLTY_V1_SLUG);
  });

  it("uses explicit featuredSlug when present on generated root", () => {
    const manifest = normalizeGeneratedBooksManifest({
      manifestVersion: 1,
      featuredSlug: "how-meaning-moves",
      books: [
        {
          slug: "how-meaning-moves",
          status: "published",
          title: "HMM",
          description: "D",
          authors: ["A"],
        },
        {
          slug: WOLTY_V1_SLUG,
          status: "published",
          title: "W",
          description: "D",
          authors: ["B"],
          slugAliases: [WOLTY_PUBLIC_ALIAS],
        },
      ],
    });
    expect(manifest.featuredSlug).toBe("how-meaning-moves");
  });
});

describe("resolveBookCanonicalSlug", () => {
  const books = normalizeGeneratedBooksManifest({
    manifestVersion: 1,
    books: [
      {
        slug: WOLTY_V1_SLUG,
        status: "published",
        title: "W",
        description: "D",
        authors: ["A"],
        slugAliases: [WOLTY_PUBLIC_ALIAS],
      },
    ],
  }).books;

  it("resolves public alias to v1 canonical slug", () => {
    expect(resolveBookCanonicalSlug(WOLTY_PUBLIC_ALIAS, books)).toBe(WOLTY_V1_SLUG);
  });

  it("returns canonical slug for direct match", () => {
    expect(resolveBookCanonicalSlug(WOLTY_V1_SLUG, books)).toBe(WOLTY_V1_SLUG);
  });

  it("returns undefined for unknown slug", () => {
    expect(resolveBookCanonicalSlug("unknown", books)).toBeUndefined();
  });
});

describe("WoLTY static params and redirects", () => {
  it("slugExcludedFromBookDetailStaticParams matches WoLTY v1 and public alias", () => {
    expect(slugExcludedFromBookDetailStaticParams(WOLTY_V1_SLUG)).toBe(true);
    expect(slugExcludedFromBookDetailStaticParams(WOLTY_PUBLIC_ALIAS)).toBe(true);
    expect(slugExcludedFromBookDetailStaticParams("how-meaning-moves")).toBe(false);
  });

  it("shouldRedirectSlugToWoltyMicrosite matches slugExcludedFromBookDetailStaticParams", () => {
    expect(shouldRedirectSlugToWoltyMicrosite(WOLTY_V1_SLUG)).toBe(
      slugExcludedFromBookDetailStaticParams(WOLTY_V1_SLUG),
    );
  });
});

describe("deriveFeaturedSlug", () => {
  it("prefers first published when no WoLTY alias", () => {
    const books = normalizeGeneratedBooksManifest({
      manifestVersion: 1,
      books: [
        {
          slug: "draft-book",
          status: "draft",
          title: "D",
          description: "x",
          authors: ["A"],
        },
        {
          slug: "pub-book",
          status: "published",
          title: "P",
          description: "x",
          authors: ["A"],
        },
      ],
    }).books;
    expect(deriveFeaturedSlug(books)).toBe("pub-book");
  });
});
