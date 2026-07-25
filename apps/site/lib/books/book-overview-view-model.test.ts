import { describe, expect, it } from "vitest";

import { buildBookOverviewViewModel } from "@/lib/books/book-overview-view-model";
import { loadManifestFixture } from "@/test/helpers/load-manifest-fixture";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";

const enriched = loadManifestFixture("enriched-book");
const localGraph = tryLoadLocalSemanticManifest();

describe("book overview view model", () => {
  it("returns null when no overlay exists", () => {
    const book = enriched.books.find((b) => b.slug === "after-certainty")!;
    const withoutOverview = { ...book, overview: undefined };
    expect(buildBookOverviewViewModel(withoutOverview, enriched)).toBeNull();
  });

  it("joins curated concepts with work-specific roles and chapter structure", () => {
    const book = enriched.books.find((b) => b.slug === "after-certainty")!;
    const vm = buildBookOverviewViewModel(book, enriched);
    expect(vm).not.toBeNull();
    expect(vm!.overview.centralQuestion.length).toBeGreaterThan(10);
    expect(vm!.selectedConcepts.length).toBeGreaterThanOrEqual(1);
    expect(vm!.selectedPatterns.length).toBeGreaterThanOrEqual(1);
    expect(vm!.edition.isCanonical).toBe(true);
    expect(vm!.structure).not.toBeNull();
    expect(vm!.structure!.chapters.length).toBeGreaterThan(0);
    expect(vm!.structure!.hasAuthoredSummaries).toBe(true);
  });
});

describe.skipIf(!localGraph)("book overview view model (local manifest)", () => {
  it("joins curated concepts with work-specific roles for After Certainty", () => {
    const book = localGraph!.books.find((b) => b.slug === "after-certainty")!;
    const vm = buildBookOverviewViewModel(book, localGraph!);
    expect(vm).not.toBeNull();
    expect(vm!.selectedConcepts.length).toBeGreaterThanOrEqual(3);
    expect(vm!.selectedConcepts.some((c) => Boolean(c.roleInWork))).toBe(true);
    expect(vm!.selectedPatterns.some((p) => Boolean(p.roleInWork))).toBe(true);
    expect(vm!.readBefore.map((b) => b.slug)).toContain("curiosity-before-certainty");
    expect(vm!.structure!.chapters.length).toBeGreaterThan(5);
  });

  it("builds an overview for Observer Patterns poetry collection with poem kinds", () => {
    const book = localGraph!.books.find((b) => b.slug === "observer-patterns")!;
    expect(book.contentType).toBe("poetry");
    const vm = buildBookOverviewViewModel(book, localGraph!);
    expect(vm).not.toBeNull();
    expect(vm!.overview.centralQuestion.length).toBeGreaterThan(10);
    expect(vm!.structure).not.toBeNull();
    expect(vm!.structure!.chapters.some((c) => c.kind === "poem")).toBe(true);
  });

  it("builds fiction chapter maps with authored summaries for The Relay", () => {
    const book = localGraph!.books.find((b) => b.slug === "the-relay")!;
    expect(book.contentType).toBe("fiction");
    const vm = buildBookOverviewViewModel(book, localGraph!);
    expect(vm).not.toBeNull();
    expect(vm!.structure).not.toBeNull();
    expect(vm!.structure!.chapters.length).toBeGreaterThan(5);
    expect(vm!.structure!.hasAuthoredSummaries).toBe(true);
    expect(vm!.structure!.chapters.some((c) => Boolean(c.summary))).toBe(true);
  });

  it("builds fiction chapter maps without requiring authored summaries", () => {
    const book = localGraph!.books.find((b) => b.slug === "velorum")!;
    expect(book.contentType).toBe("fiction");
    const vm = buildBookOverviewViewModel(book, localGraph!);
    expect(vm).not.toBeNull();
    expect(vm!.structure).not.toBeNull();
    expect(vm!.structure!.chapters.length).toBeGreaterThan(5);
    expect(vm!.structure!.hasAuthoredSummaries).toBe(false);
  });
});
