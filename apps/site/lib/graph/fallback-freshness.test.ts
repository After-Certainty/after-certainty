import { describe, expect, it } from "vitest";

import {
  assertFallbackFresh,
  collectFallbackFreshnessIssues,
} from "@/lib/graph/fallback-freshness";

describe("fallback freshness", () => {
  it("accepts the bundled fallback with required fixture content types", () => {
    const report = collectFallbackFreshnessIssues(undefined, { intended: null });
    const errors = report.issues.filter((i) => i.severity === "error");
    expect(errors).toEqual([]);
    expect(report.schemaVersion).toBe("2.3");
    expect(report.generatedAt).toBeTruthy();
    expect(report.sourceCommit).toBeTruthy();
  });

  it("assertFallbackFresh passes for the bundled file", () => {
    expect(() => assertFallbackFresh({ intended: null })).not.toThrow();
  });

  it("fails release validation when fallback identity diverges from intended", () => {
    const report = collectFallbackFreshnessIssues(undefined, {
      intended: {
        schemaVersion: "2.3",
        sourceCommit: "not-the-real-commit",
        generatedAt: "2099-01-01T00:00:00.000Z",
      },
    });
    expect(report.matchesIntendedRelease).toBe(false);
    expect(report.issues.some((i) => i.code === "fallback_release_mismatch")).toBe(true);
  });

  it("reports stale as warning by default and error when strict", () => {
    const stalePayload = {
      books: [
        {
          id: "book-boundary-conditions",
          slug: "boundary-conditions",
          title: "Boundary Conditions",
          contentType: "fiction",
          literaryForm: "novel",
          concepts: [],
          patterns: [],
          sources: [],
        },
        {
          id: "book-observer-patterns",
          slug: "observer-patterns",
          title: "Observer Patterns",
          contentType: "poetry",
          literaryForm: "poetry_collection",
          concepts: [],
          patterns: [],
          sources: [],
        },
        {
          id: "book-before-certainty-arrives",
          slug: "before-certainty-arrives",
          title: "Before Certainty Arrives",
          contentType: "nonfiction",
          concepts: [],
          patterns: [],
          sources: [],
        },
      ],
      glossary: [],
      patterns: [],
      situations: [],
      sources: [],
      relationships: [],
      schemaVersion: "2.3",
      generatedAt: "2020-01-01T00:00:00.000Z",
      sourceCommit: "abc",
    };

    const warn = collectFallbackFreshnessIssues(stalePayload, {
      nowMs: Date.parse("2026-07-23T00:00:00.000Z"),
      intended: null,
    });
    expect(warn.stale).toBe(true);
    expect(warn.issues.some((i) => i.code === "stale_fallback" && i.severity === "warning")).toBe(
      true,
    );

    const strict = collectFallbackFreshnessIssues(stalePayload, {
      nowMs: Date.parse("2026-07-23T00:00:00.000Z"),
      strictStale: true,
      intended: {
        schemaVersion: "2.3",
        sourceCommit: "abc",
        generatedAt: "2020-01-01T00:00:00.000Z",
      },
    });
    expect(strict.issues.some((i) => i.code === "stale_fallback" && i.severity === "error")).toBe(
      true,
    );
  });
});
