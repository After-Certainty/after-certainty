import { describe, expect, it } from "vitest";

import semanticManifest from "@/data/semantic-manifest.json";
import { buildBookOverviewViewModel } from "@/lib/books/book-overview-view-model";
import type { SemanticGraph } from "@/types/semanticGraph";

const graph = semanticManifest as unknown as SemanticGraph;

describe("book overview view model", () => {
  it("returns null when no overlay exists", () => {
    const book = graph.books.find((b) => b.slug === "after-certainty")!;
    const withoutOverview = { ...book, overview: undefined };
    expect(buildBookOverviewViewModel(withoutOverview, graph)).toBeNull();
  });

  it("joins curated concepts with work-specific roles and chapter structure", () => {
    const book = graph.books.find((b) => b.slug === "after-certainty")!;
    const vm = buildBookOverviewViewModel(book, graph);
    expect(vm).not.toBeNull();
    expect(vm!.overview.centralQuestion.length).toBeGreaterThan(10);
    expect(vm!.selectedConcepts.length).toBeGreaterThanOrEqual(3);
    expect(vm!.selectedConcepts.some((c) => Boolean(c.roleInWork))).toBe(true);
    expect(vm!.selectedPatterns.length).toBeGreaterThanOrEqual(1);
    expect(vm!.selectedPatterns.some((p) => Boolean(p.roleInWork))).toBe(true);
    expect(vm!.readBefore.map((b) => b.slug)).toContain("curiosity-before-certainty");
    expect(vm!.edition.isCanonical).toBe(true);
    expect(vm!.structure).not.toBeNull();
    expect(vm!.structure!.chapters.length).toBeGreaterThan(5);
    expect(vm!.structure!.hasAuthoredSummaries).toBe(true);
  });

  it("builds an overview for Observer Patterns poetry collection with poem kinds", () => {
    const book = graph.books.find((b) => b.slug === "observer-patterns")!;
    expect(book.contentType).toBe("poetry");
    const vm = buildBookOverviewViewModel(book, graph);
    expect(vm).not.toBeNull();
    expect(vm!.overview.centralQuestion.length).toBeGreaterThan(10);
    expect(vm!.structure).not.toBeNull();
    expect(vm!.structure!.chapters.some((c) => c.kind === "poem")).toBe(true);
  });

  it("builds fiction chapter maps without requiring authored summaries", () => {
    const book = graph.books.find((b) => b.slug === "the-relay")!;
    expect(book.contentType).toBe("fiction");
    const vm = buildBookOverviewViewModel(book, graph);
    expect(vm).not.toBeNull();
    expect(vm!.structure).not.toBeNull();
    expect(vm!.structure!.chapters.length).toBeGreaterThan(5);
    expect(vm!.structure!.hasAuthoredSummaries).toBe(false);
  });
});
