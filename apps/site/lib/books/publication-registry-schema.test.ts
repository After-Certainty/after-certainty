import { describe, expect, it } from "vitest";

import { getPublicationRegistry } from "@/lib/books/load-publication-registry";
import {
  parsePublicationRegistry,
  type PublicationRegistry,
} from "@/lib/books/publication-registry-schema";

function baseEdition(overrides: Record<string, unknown> = {}) {
  return {
    bookId: "book-example",
    slug: "example",
    workId: "work-example",
    isCanonical: true,
    relationship: "sole",
    ...overrides,
  };
}

describe("publication registry schema", () => {
  it("loads editions from the bundled semantic manifest", () => {
    const parsed = getPublicationRegistry();
    expect(parsed.manifestVersion).toBe(1);
    expect(parsed.editions.length).toBeGreaterThanOrEqual(31);
  });

  it("rejects companion editions marked canonical", () => {
    expect(() =>
      parsePublicationRegistry({
        manifestVersion: 1,
        editions: [
          baseEdition({
            bookId: "book-a",
            slug: "a",
            workId: "work-a",
            isCanonical: true,
            relationship: "companion",
            companionOfEditionId: "book-b",
          }),
        ],
      }),
    ).toThrow();
  });

  it("rejects revisedAt before firstPublishedAt", () => {
    expect(() =>
      parsePublicationRegistry({
        manifestVersion: 1,
        editions: [
          baseEdition({
            firstPublishedAt: "2026-06-01",
            revisedAt: "2026-05-01",
          }),
        ],
      } satisfies { manifestVersion: number; editions: unknown[] }),
    ).toThrow();
  });

  it("rejects changeSummary without revisedAt", () => {
    expect(() =>
      parsePublicationRegistry({
        manifestVersion: 1,
        editions: [baseEdition({ changeSummary: "Clarified chapter 2" })],
      }),
    ).toThrow();
  });

  it("accepts a valid companion pair", () => {
    const registry: PublicationRegistry = parsePublicationRegistry({
      manifestVersion: 1,
      editions: [
        {
          bookId: "book-primary",
          slug: "primary",
          workId: "work-pair",
          isCanonical: true,
          relationship: "primary",
          companionEditionIds: ["book-companion"],
        },
        {
          bookId: "book-companion",
          slug: "companion",
          workId: "work-pair",
          isCanonical: false,
          relationship: "companion",
          companionOfEditionId: "book-primary",
          editionLabel: "Companion edition",
        },
      ],
    });
    expect(registry.editions).toHaveLength(2);
  });
});
