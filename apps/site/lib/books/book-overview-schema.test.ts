import { describe, expect, it } from "vitest";

import bookOverviewsJson from "@/data/book-overviews.json";
import {
  DEFAULT_BOOK_OVERVIEW_PRIORITY_SLUGS,
  parseBookOverviewsManifest,
} from "@/lib/books/book-overview-schema";

function baseOverview(overrides: Record<string, unknown> = {}) {
  return {
    bookId: "book-example",
    slug: "example",
    centralQuestion: "How do we start?",
    whyItExists: "It orients readers before denser volumes.",
    audience: "Newcomers to the project.",
    nonGoals: ["It does not replace later handbooks."],
    selectedConceptIds: ["concept-agency"],
    ...overrides,
  };
}

describe("book overview schema", () => {
  it("parses the bundled Phase F seed", () => {
    const parsed = parseBookOverviewsManifest(bookOverviewsJson);
    expect(parsed.manifestVersion).toBe(1);
    expect(parsed.overviews.length).toBeGreaterThanOrEqual(10);
    expect(parsed.prioritySlugs).toEqual([...DEFAULT_BOOK_OVERVIEW_PRIORITY_SLUGS]);
  });

  it("rejects self-referential readNext", () => {
    expect(() =>
      parseBookOverviewsManifest({
        manifestVersion: 1,
        overviews: [baseOverview({ readNext: ["example"] })],
      }),
    ).toThrow(/readNext must not include the book itself/);
  });

  it("requires changeSummary when revisedAt is set", () => {
    expect(() =>
      parseBookOverviewsManifest({
        manifestVersion: 1,
        overviews: [baseOverview({ revisedAt: "2026-07-01" })],
      }),
    ).toThrow(/changeSummary is required/);
  });

  it("requires revisedAt when changeSummary is set", () => {
    expect(() =>
      parseBookOverviewsManifest({
        manifestVersion: 1,
        overviews: [baseOverview({ changeSummary: "Clarified audience." })],
      }),
    ).toThrow(/revisedAt is required/);
  });

  it("accepts paired revision fields", () => {
    const parsed = parseBookOverviewsManifest({
      manifestVersion: 1,
      overviews: [
        baseOverview({
          revisedAt: "2026-07-01",
          changeSummary: "Clarified the central question and audience.",
        }),
      ],
    });
    expect(parsed.overviews[0]?.revisedAt).toBe("2026-07-01");
  });
});
