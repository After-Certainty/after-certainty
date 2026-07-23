import { describe, expect, it } from "vitest";

import fallback from "@/data/semantic-manifest.json";
import intended from "@/data/intended-manifest-release.json";
import { collectFallbackFreshnessIssues } from "@/lib/graph/fallback-freshness";
import { INTENDED_SCHEMA_VERSION, isIntendedSchemaVersion } from "@/lib/graph/schema-version";

describe("release identity", () => {
  it("keeps bundled fallback aligned with the intended production release", () => {
    expect(isIntendedSchemaVersion(fallback.schemaVersion as string)).toBe(true);
    expect(fallback.schemaVersion).toBe(INTENDED_SCHEMA_VERSION);
    expect(fallback.sourceCommit).toBe(intended.sourceCommit);
    expect(fallback.generatedAt).toBe(intended.generatedAt);
    expect(fallback.schemaVersion).toBe(intended.schemaVersion);

    const report = collectFallbackFreshnessIssues(fallback, {
      intended: {
        schemaVersion: intended.schemaVersion,
        sourceCommit: intended.sourceCommit,
        generatedAt: intended.generatedAt,
        contentVersion: intended.contentVersion,
      },
      requireIntendedSchema: true,
    });
    expect(report.matchesIntendedRelease).toBe(true);
    expect(report.issues.filter((i) => i.severity === "error")).toEqual([]);
  });
});
