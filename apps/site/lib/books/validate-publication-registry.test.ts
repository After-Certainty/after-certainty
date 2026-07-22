import { describe, expect, it } from "vitest";

import semanticManifest from "@/data/semantic-manifest.json";
import {
  getPublicationEditionBySlug,
  getPublicationEditionsForWork,
  getPublicationRegistry,
} from "@/lib/books/load-publication-registry";
import { parsePublicationRegistry } from "@/lib/books/publication-registry-schema";
import {
  assertPublicationRegistryHealthy,
  collectPublicationRegistryHealthIssues,
} from "@/lib/books/validate-publication-registry";
import type { SemanticGraph } from "@/types/semanticGraph";

const graph = semanticManifest as SemanticGraph;

describe("publication registry health", () => {
  it("accepts editions from the semantic manifest against the graph", () => {
    const registry = getPublicationRegistry();
    assertPublicationRegistryHealthy({ registry, books: graph.books });

    const warnings = collectPublicationRegistryHealthIssues({
      registry,
      books: graph.books,
    }).filter((i) => i.severity === "warning");
    // Dates are intentionally unset unless authored upstream.
    expect(warnings.every((w) => w.code === "missing_first_published_at")).toBe(true);
    expect(warnings).toHaveLength(graph.books.length);
  });

  it("covers every graph book exactly once", () => {
    const registry = getPublicationRegistry();
    expect(registry.editions).toHaveLength(graph.books.length);
    for (const book of graph.books) {
      const entry = registry.editions.find((e) => e.bookId === book.id);
      expect(entry, `missing registry entry for ${book.slug}`).toBeDefined();
      expect(entry?.slug).toBe(book.slug);
    }
  });

  it("models WoLTY as one work with companion (not superseded) v2", () => {
    const v1 = getPublicationEditionBySlug("when-others-look-to-you-v1");
    const v2 = getPublicationEditionBySlug("when-others-look-to-you-v2");
    expect(v1?.workId).toBe("work-when-others-look-to-you");
    expect(v2?.workId).toBe("work-when-others-look-to-you");
    expect(v1?.isCanonical).toBe(true);
    expect(v1?.relationship).toBe("primary");
    expect(v2?.isCanonical).toBe(false);
    expect(v2?.relationship).toBe("companion");
    expect(v2?.relationship).not.toBe("superseded");
    expect(v2?.companionOfEditionId).toBe("book-when-others-look-to-you-v1");

    const siblings = getPublicationEditionsForWork("work-when-others-look-to-you");
    expect(siblings).toHaveLength(2);
    expect(siblings.filter((e) => e.isCanonical)).toHaveLength(1);
  });

  it("assigns a unique workId per sole edition", () => {
    const registry = getPublicationRegistry();
    const sole = registry.editions.filter((e) => e.relationship === "sole");
    const workIds = new Set(sole.map((e) => e.workId));
    expect(workIds.size).toBe(sole.length);
    expect(sole.every((e) => e.isCanonical)).toBe(true);
  });

  it("fails when two canonicals share a work", () => {
    const registry = parsePublicationRegistry({
      manifestVersion: 1,
      editions: [
        {
          bookId: "book-a",
          slug: "a",
          workId: "work-shared",
          isCanonical: true,
          relationship: "primary",
        },
        {
          bookId: "book-b",
          slug: "b",
          workId: "work-shared",
          isCanonical: true,
          relationship: "primary",
        },
      ],
    });
    const errors = collectPublicationRegistryHealthIssues({ registry }).filter(
      (i) => i.severity === "error",
    );
    expect(errors.some((e) => e.code === "multiple_canonical_editions")).toBe(true);
  });

  it("fails when WoLTY v2 is marked superseded", () => {
    const registry = parsePublicationRegistry({
      manifestVersion: 1,
      editions: [
        {
          bookId: "book-when-others-look-to-you-v1",
          slug: "when-others-look-to-you-v1",
          workId: "work-when-others-look-to-you",
          isCanonical: true,
          relationship: "primary",
        },
        {
          bookId: "book-when-others-look-to-you-v2",
          slug: "when-others-look-to-you-v2",
          workId: "work-when-others-look-to-you",
          isCanonical: false,
          relationship: "superseded",
          supersededByEditionId: "book-when-others-look-to-you-v1",
        },
      ],
    });
    const errors = collectPublicationRegistryHealthIssues({
      registry,
      books: graph.books.filter((b) => b.slug.startsWith("when-others-look-to-you")),
    }).filter((i) => i.severity === "error");
    expect(errors.some((e) => e.code === "wolty_companion_marked_superseded")).toBe(true);
  });
});
