import { describe, expect, it } from "vitest";

import { buildChapterReadingNavigation } from "@/lib/reading/chapter-navigation";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";
import type { SemanticGraph } from "@/types/semanticGraph";

const enriched = loadManifestFixture("enriched-book");

describe("buildChapterReadingNavigation (READ-004)", () => {
  it("returns prev/next in reading order for a middle chapter", () => {
    const book = enriched.books.find((candidate) => candidate.slug === "after-certainty")!;
    const chapters = (enriched.chapters ?? []).filter(
      (chapter) => chapter.editionId === "book-after-certainty",
    );
    expect(chapters.length).toBeGreaterThan(2);

    const middle = chapters[2]!;
    const nav = buildChapterReadingNavigation({
      graph: enriched,
      book,
      chapterId: middle.id,
    });

    expect(nav).not.toBeNull();
    expect(nav!.current.id).toBe(middle.id);
    expect(nav!.prev?.id).toBe(chapters[1]!.id);
    expect(nav!.next?.id).toBe(chapters[3]!.id);
    expect(nav!.prev?.href).toBe(chapters[1]!.routeKey);
    expect(nav!.next?.href).toBe(chapters[3]!.routeKey);
  });

  it("omits prev on the first chapter and next on the last", () => {
    const book = enriched.books.find((candidate) => candidate.slug === "after-certainty")!;
    const chapters = (enriched.chapters ?? [])
      .filter((chapter) => chapter.editionId === "book-after-certainty")
      .sort((a, b) => a.position - b.position);

    const first = buildChapterReadingNavigation({
      graph: enriched,
      book,
      chapterId: chapters[0]!.id,
    });
    expect(first?.prev).toBeUndefined();
    expect(first?.next?.id).toBe(chapters[1]!.id);

    const last = buildChapterReadingNavigation({
      graph: enriched,
      book,
      chapterId: chapters[chapters.length - 1]!.id,
    });
    expect(last?.next).toBeUndefined();
    expect(last?.prev?.id).toBe(chapters[chapters.length - 2]!.id);
  });

  it("groups TOC parts and ignores private chapters", () => {
    const book = enriched.books.find((candidate) => candidate.slug === "after-certainty")!;
    const sample = (enriched.chapters ?? []).find(
      (chapter) => chapter.editionId === "book-after-certainty",
    )!;
    const privateGraph: SemanticGraph = {
      ...enriched,
      chapters: [
        ...(enriched.chapters ?? []).map((chapter) =>
          chapter.id === sample.id ? { ...chapter, public: false } : chapter,
        ),
      ],
    };

    const other = (enriched.chapters ?? []).find(
      (chapter) =>
        chapter.editionId === "book-after-certainty" && chapter.id !== sample.id,
    )!;
    const nav = buildChapterReadingNavigation({
      graph: privateGraph,
      book,
      chapterId: other.id,
    });
    expect(nav).not.toBeNull();
    expect(nav!.chapters.some((chapter) => chapter.id === sample.id)).toBe(false);
    expect(nav!.parts.length).toBeGreaterThan(0);
    expect(nav!.chapters.every((chapter) => chapter.href.startsWith("/explore/books/"))).toBe(
      true,
    );
  });

  it("returns null for unknown chapter ids", () => {
    const book = enriched.books.find((candidate) => candidate.slug === "after-certainty")!;
    expect(
      buildChapterReadingNavigation({
        graph: enriched,
        book,
        chapterId: "chapter-does-not-exist",
      }),
    ).toBeNull();
  });
});
