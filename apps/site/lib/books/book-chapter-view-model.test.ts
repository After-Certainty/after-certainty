import { describe, expect, it } from "vitest";

import { buildBookStructureForBook, chapterKindLabel } from "@/lib/books/book-chapter-view-model";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";

const enriched = loadManifestFixture("enriched-book");
const localGraph = tryLoadLocalSemanticManifest();

describe("book chapter view model", () => {
  it("groups After Certainty chapters into parts with authored summaries", () => {
    const book = enriched.books.find((b) => b.slug === "after-certainty")!;
    const structure = buildBookStructureForBook(enriched, book);
    expect(structure).not.toBeNull();
    expect(structure!.parts.length).toBeGreaterThan(1);
    expect(structure!.parts[0]?.chapters.length).toBeGreaterThan(0);
    expect(structure!.hasAuthoredSummaries).toBe(true);
    expect(structure!.chapters.some((c) => Boolean(c.summary))).toBe(true);
    expect(structure!.chapters.every((c) => c.publicUrl === undefined)).toBe(true);
  });

  it("returns null when edition has no chapters", () => {
    expect(
      buildBookStructureForBook(
        { ...enriched, chapters: [], parts: [] },
        { id: "book-missing", editionId: "book-missing" },
      ),
    ).toBeNull();
  });
});

describe.skipIf(!localGraph)("book chapter view model (local manifest)", () => {
  it("handles fiction without summaries", () => {
    const book = localGraph!.books.find((b) => b.slug === "boundary-conditions")!;
    const structure = buildBookStructureForBook(localGraph!, book);
    expect(structure).not.toBeNull();
    expect(structure!.chapters.length).toBeGreaterThan(5);
    expect(structure!.hasAuthoredSummaries).toBe(false);
    expect(structure!.chapters.every((c) => !c.summary)).toBe(true);
  });

  it("preserves poem kinds for poetry collections", () => {
    const book = localGraph!.books.find((b) => b.slug === "observer-patterns")!;
    const structure = buildBookStructureForBook(localGraph!, book);
    expect(structure).not.toBeNull();
    const poem = structure!.chapters.find((c) => c.kind === "poem");
    expect(poem).toBeTruthy();
    expect(chapterKindLabel("poem")).toBe("Poem");
    expect(poem!.kindLabel).toBe("Poem");
  });
});
