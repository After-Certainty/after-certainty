import { describe, expect, it } from "vitest";

import {
  buildChapterRouteKey,
  chapterPublicPath,
  chapterReadingStorageKey,
  chapterRouteKeyMatchesEditionSlug,
  chapterSlugFromRouteKey,
  chaptersForEdition,
  isValidChapterRouteKey,
  parseChapterRouteKey,
  partsForEdition,
  publicChaptersForEdition,
} from "@/lib/graph/chapters";
import { exploreChapterHref } from "@/lib/graph/explorePaths";
import { collectChapterStructureHealthIssues } from "@/lib/graph/validate-chapters";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";
import type { SemanticGraph } from "@/types/semanticGraph";

const enriched = loadManifestFixture("enriched-book");
const localGraph = tryLoadLocalSemanticManifest();

describe("chapter URL contract (READ-001)", () => {
  it("builds and parses the frozen routeKey shape", () => {
    const routeKey = buildChapterRouteKey(
      "after-certainty",
      "front-matter-introduction",
    );
    expect(routeKey).toBe(
      "/explore/books/after-certainty/chapters/front-matter-introduction",
    );
    expect(parseChapterRouteKey(routeKey)).toEqual({
      editionSlug: "after-certainty",
      chapterSlug: "front-matter-introduction",
    });
    expect(chapterSlugFromRouteKey(routeKey)).toBe("front-matter-introduction");
    expect(isValidChapterRouteKey(routeKey)).toBe(true);
    expect(exploreChapterHref("after-certainty", "front-matter-introduction")).toBe(
      routeKey,
    );
  });

  it("rejects malformed routeKeys", () => {
    expect(parseChapterRouteKey("/explore/books/after-certainty")).toBeNull();
    expect(parseChapterRouteKey("/books/after-certainty/chapters/intro")).toBeNull();
    expect(parseChapterRouteKey("/explore/books/After Certainty/chapters/intro")).toBeNull();
    expect(isValidChapterRouteKey("")).toBe(false);
  });

  it("matches edition slug against book catalog slug", () => {
    const routeKey = buildChapterRouteKey("after-certainty", "parts-part-1-bridge");
    expect(chapterRouteKeyMatchesEditionSlug(routeKey, "after-certainty")).toBe(true);
    expect(chapterRouteKeyMatchesEditionSlug(routeKey, "learning-to-see")).toBe(false);
  });

  it("exposes public path and storage key helpers", () => {
    const routeKey = buildChapterRouteKey(
      "after-certainty",
      "front-matter-introduction",
    );
    expect(chapterPublicPath({ routeKey })).toBe(routeKey);
    expect(chapterPublicPath({ routeKey: "/bad" })).toBeNull();
    expect(chapterReadingStorageKey("book-after-certainty", "chapter-after-certainty-intro")).toBe(
      "readingProgress:book-after-certainty:chapter-after-certainty-intro",
    );
  });

  it("fixture routeKeys obey the contract and match book slugs", () => {
    for (const chapter of enriched.chapters ?? []) {
      expect(isValidChapterRouteKey(chapter.routeKey)).toBe(true);
      const book = enriched.books.find((b) => b.id === chapter.editionId);
      expect(book).toBeTruthy();
      expect(chapterRouteKeyMatchesEditionSlug(chapter.routeKey, book!.slug)).toBe(true);
      expect(chapterPublicPath(chapter)).toBe(chapter.routeKey);
    }
  });
});

describe("chapters discovery", () => {
  it("derives chapter slugs from routeKey", () => {
    expect(
      chapterSlugFromRouteKey("/explore/books/after-certainty/chapters/front-matter-introduction"),
    ).toBe("front-matter-introduction");
  });

  it("indexes parts and public chapters for After Certainty", () => {
    const editionId = "book-after-certainty";
    const parts = partsForEdition(enriched, editionId);
    const chapters = publicChaptersForEdition(enriched, editionId);
    expect(parts.length).toBeGreaterThan(0);
    expect(chapters.length).toBeGreaterThan(0);
    expect(chapters.every((chapter) => chapter.public)).toBe(true);
    expect(chapters.map((c) => c.position)).toEqual(
      [...chapters].map((c) => c.position).sort((a, b) => a - b),
    );
    expect(chaptersForEdition(enriched, editionId).length).toBe(chapters.length);
  });
});

describe.skipIf(!localGraph)("chapter structure health (local manifest)", () => {
  it("passes for the generated local manifest", () => {
    const issues = collectChapterStructureHealthIssues({ graph: localGraph! });
    expect(issues.filter((i) => i.severity === "error")).toEqual([]);
  });
});

describe("chapter structure health", () => {
  it("flags unknown chapter editions", () => {
    const broken: SemanticGraph = {
      ...enriched,
      chapters: [
        {
          id: "chapter-orphan",
          workId: "work-after-certainty",
          editionId: "book-does-not-exist",
          title: "Orphan",
          position: 1,
          kind: "chapter",
          sourcePath: "x.md",
          wordCount: 10,
          estimatedReadingMinutes: 1,
          public: true,
          routeKey: "/explore/books/x/chapters/orphan",
        },
      ],
    };
    const issues = collectChapterStructureHealthIssues({ graph: broken });
    expect(issues.some((i) => i.code === "unknown_chapter_edition")).toBe(true);
  });

  it("flags routeKey book-slug mismatch", () => {
    const editionId = "book-after-certainty";
    const sample = (enriched.chapters ?? []).find((c) => c.editionId === editionId);
    expect(sample).toBeTruthy();
    const broken: SemanticGraph = {
      ...enriched,
      chapters: [
        {
          ...sample!,
          routeKey: "/explore/books/wrong-slug/chapters/front-matter-introduction",
        },
      ],
    };
    const issues = collectChapterStructureHealthIssues({ graph: broken });
    expect(issues.some((i) => i.code === "chapter_route_slug_mismatch")).toBe(true);
  });
});
