import { describe, expect, it } from "vitest";

import semanticManifest from "@/data/semantic-manifest.json";
import { buildBookOverviewViewModel } from "@/lib/books/book-overview-view-model";
import type { SemanticGraph } from "@/types/semanticGraph";

const graph = semanticManifest as SemanticGraph;

describe("book overview view model", () => {
  it("returns null when no overlay exists", () => {
    const book = graph.books.find((b) => b.slug === "observer-patterns");
    expect(book).toBeDefined();
    expect(buildBookOverviewViewModel(book!, graph)).toBeNull();
  });

  it("joins curated concepts and related books for a priority overlay", () => {
    const book = graph.books.find((b) => b.slug === "after-certainty")!;
    const vm = buildBookOverviewViewModel(book, graph);
    expect(vm).not.toBeNull();
    expect(vm!.overview.centralQuestion.length).toBeGreaterThan(10);
    expect(vm!.selectedConcepts.length).toBe(5);
    expect(vm!.selectedPatterns.length).toBe(3);
    expect(vm!.readBefore.map((b) => b.slug)).toContain("curiosity-before-certainty");
    expect(vm!.edition.isCanonical).toBe(true);
  });
});
