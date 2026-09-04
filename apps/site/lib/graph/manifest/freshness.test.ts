import { describe, expect, it } from "vitest";

import {
  assertInstalledManifestFresh,
  collectInstalledManifestFreshnessIssues,
} from "@/lib/graph/manifest/freshness";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";

const localGraph = tryLoadLocalSemanticManifest();

describe("installed manifest freshness", () => {
  it.skipIf(!localGraph)(
    "accepts the installed local manifest with required fixture content types",
    () => {
    const report = collectInstalledManifestFreshnessIssues(undefined, { intended: null });
    const errors = report.issues.filter((i) => i.severity === "error");
    expect(errors).toEqual([]);
    expect(["2.3", "2.4", "2.5", "2.6"]).toContain(report.schemaVersion);
    expect(report.generatedAt).toBeTruthy();
    expect(report.sourceCommit).toBeTruthy();
    },
  );

  it.skipIf(!localGraph)("assertInstalledManifestFresh passes for the installed local manifest", () => {
    expect(() => assertInstalledManifestFresh({ intended: null })).not.toThrow();
  });

  it.skipIf(!localGraph)(
    "fails release validation when installed identity diverges from intended",
    () => {
    const report = collectInstalledManifestFreshnessIssues(undefined, {
      intended: {
        schemaVersion: "2.3",
        sourceCommit: "not-the-real-commit",
        generatedAt: "2099-01-01T00:00:00.000Z",
      },
    });
    expect(report.matchesIntendedRelease).toBe(false);
    expect(report.issues.some((i) => i.code === "installed_release_mismatch")).toBe(true);
    },
  );

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

    const warn = collectInstalledManifestFreshnessIssues(stalePayload, {
      nowMs: Date.parse("2026-07-23T00:00:00.000Z"),
      intended: null,
    });
    expect(warn.stale).toBe(true);
    expect(warn.issues.some((i) => i.code === "stale" && i.severity === "warning")).toBe(true);

    const strict = collectInstalledManifestFreshnessIssues(stalePayload, {
      nowMs: Date.parse("2026-07-23T00:00:00.000Z"),
      strictStale: true,
      intended: {
        schemaVersion: "2.3",
        sourceCommit: "abc",
        generatedAt: "2020-01-01T00:00:00.000Z",
      },
    });
    expect(strict.issues.some((i) => i.code === "stale" && i.severity === "error")).toBe(true);
  });
});
