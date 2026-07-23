import fallbackSemantic from "@/data/semantic-manifest.json";
import {
  DEFAULT_FALLBACK_STALE_DAYS,
  fallbackStaleDaysThreshold,
  isCompatibleSchemaVersion,
  isFallbackStale,
} from "@/lib/graph/manifest";
import { INTENDED_SCHEMA_VERSION, isIntendedSchemaVersion } from "@/lib/graph/schema-version";
import { validateSemanticGraph } from "@/lib/graph/validate";
import { contentTypeInfoFromBook } from "@/lib/graph/content-type";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type FallbackFreshnessSeverity = "error" | "warning";

export type FallbackFreshnessIssue = {
  severity: FallbackFreshnessSeverity;
  code: string;
  detail: string;
};

export type FallbackFreshnessReport = {
  schemaVersion?: string;
  generatedAt?: string;
  sourceCommit?: string;
  contentVersion?: string | null;
  stale: boolean;
  ageDays?: number;
  thresholdDays: number;
  matchesIntendedRelease: boolean;
  issues: FallbackFreshnessIssue[];
};

const REQUIRED_FIXTURE_TYPES: { slug: string; contentType: string }[] = [
  { slug: "boundary-conditions", contentType: "fiction" },
  { slug: "observer-patterns", contentType: "poetry" },
  { slug: "before-certainty-arrives", contentType: "nonfiction" },
];

export type IntendedManifestRelease = {
  schemaVersion: string;
  sourceCommit: string;
  generatedAt: string;
  contentVersion?: string | null;
  manifestUrl?: string;
  syncedAt?: string;
};

export function readIntendedManifestRelease(
  rootDir: string = process.cwd(),
): IntendedManifestRelease | null {
  const path = join(rootDir, "data", "intended-manifest-release.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as IntendedManifestRelease;
  } catch {
    return null;
  }
}

/**
 * Validate the bundled fallback for schema, provenance, fixture content types,
 * intended-release parity, and staleness.
 * Invalid/incompatible / release mismatch → errors.
 * Stale → warning (error when strict).
 */
export function collectFallbackFreshnessIssues(
  data: unknown = fallbackSemantic,
  options?: {
    nowMs?: number;
    strictStale?: boolean;
    thresholdDays?: number;
    intended?: IntendedManifestRelease | null;
    requireIntendedSchema?: boolean;
  },
): FallbackFreshnessReport {
  const thresholdDays = options?.thresholdDays ?? fallbackStaleDaysThreshold();
  const issues: FallbackFreshnessIssue[] = [];
  const requireIntendedSchema = options?.requireIntendedSchema ?? Boolean(options?.strictStale);
  const intended =
    options?.intended === undefined ? readIntendedManifestRelease() : options.intended;

  const validated = validateSemanticGraph(data);
  if (!validated.success) {
    return {
      stale: true,
      thresholdDays,
      matchesIntendedRelease: false,
      issues: [
        {
          severity: "error",
          code: "invalid_fallback",
          detail: "Bundled semantic-manifest.json failed Zod validation.",
        },
      ],
    };
  }

  const graph = validated.data;
  const schemaVersion = graph.schemaVersion;
  const generatedAt = graph.generatedAt;
  const sourceCommit = graph.sourceCommit;
  const contentVersion = graph.contentVersion ?? null;

  if (!isCompatibleSchemaVersion(schemaVersion)) {
    issues.push({
      severity: "error",
      code: "incompatible_schema",
      detail: `Unsupported schemaVersion "${schemaVersion}".`,
    });
  } else if (requireIntendedSchema && !isIntendedSchemaVersion(schemaVersion)) {
    issues.push({
      severity: "error",
      code: "schema_below_intended",
      detail: `Bundled schemaVersion "${schemaVersion ?? "missing"}" is below intended production contract ${INTENDED_SCHEMA_VERSION}.`,
    });
  } else if (schemaVersion && !isIntendedSchemaVersion(schemaVersion)) {
    issues.push({
      severity: "warning",
      code: "schema_compatibility_mode",
      detail: `Bundled schemaVersion "${schemaVersion}" is accepted in compatibility mode; intended production is ${INTENDED_SCHEMA_VERSION}.`,
    });
  }

  if (!generatedAt?.trim()) {
    issues.push({
      severity: "error",
      code: "missing_generated_at",
      detail: "Bundled manifest is missing generatedAt provenance.",
    });
  } else if (Number.isNaN(Date.parse(generatedAt))) {
    issues.push({
      severity: "error",
      code: "invalid_generated_at",
      detail: `generatedAt is not parseable: "${generatedAt}".`,
    });
  }

  if (!sourceCommit?.trim()) {
    issues.push({
      severity: options?.strictStale ? "error" : "warning",
      code: "missing_source_commit",
      detail: "Bundled manifest is missing sourceCommit provenance.",
    });
  }

  if (!graph.books.length) {
    issues.push({
      severity: "error",
      code: "empty_books",
      detail: "Bundled manifest has no books.",
    });
  }

  for (const fixture of REQUIRED_FIXTURE_TYPES) {
    const book = graph.books.find((b) => b.slug === fixture.slug);
    if (!book) {
      issues.push({
        severity: "error",
        code: "missing_fixture_book",
        detail: `Expected fixture book "${fixture.slug}" in bundled manifest.`,
      });
      continue;
    }
    const info = contentTypeInfoFromBook(book);
    if (info.contentType !== fixture.contentType) {
      issues.push({
        severity: "error",
        code: "fixture_content_type_mismatch",
        detail: `Book "${fixture.slug}" expected contentType ${fixture.contentType}, got ${info.contentType}.`,
      });
    }
  }

  const hasPoetry = graph.books.some((b) => contentTypeInfoFromBook(b).contentType === "poetry");
  if (!hasPoetry) {
    issues.push({
      severity: "error",
      code: "missing_poetry_support",
      detail: "Bundled manifest has no poetry contentType among books.",
    });
  }

  let matchesIntendedRelease = true;
  if (intended) {
    const mismatches: string[] = [];
    if (intended.schemaVersion !== schemaVersion) {
      mismatches.push(`schemaVersion fallback=${schemaVersion} intended=${intended.schemaVersion}`);
    }
    if (intended.sourceCommit !== sourceCommit) {
      mismatches.push(`sourceCommit fallback=${sourceCommit} intended=${intended.sourceCommit}`);
    }
    if (intended.generatedAt !== generatedAt) {
      mismatches.push(`generatedAt fallback=${generatedAt} intended=${intended.generatedAt}`);
    }
    if (mismatches.length > 0) {
      matchesIntendedRelease = false;
      issues.push({
        severity: "error",
        code: "fallback_release_mismatch",
        detail: `Bundled fallback does not match intended production release (${mismatches.join("; ")}). Run npm run sync:semantic-manifest.`,
      });
    }
  } else if (options?.strictStale) {
    matchesIntendedRelease = false;
    issues.push({
      severity: "error",
      code: "missing_intended_release",
      detail:
        "data/intended-manifest-release.json is missing. Run npm run sync:semantic-manifest to pin the production release identity.",
    });
  }

  const { stale, ageDays } = isFallbackStale(generatedAt, {
    nowMs: options?.nowMs,
    thresholdDays,
  });

  if (stale) {
    issues.push({
      severity: options?.strictStale ? "error" : "warning",
      code: "stale_fallback",
      detail: `Bundled fallback is stale (ageDays=${ageDays ?? "unknown"}, threshold=${thresholdDays}, default=${DEFAULT_FALLBACK_STALE_DAYS}).`,
    });
  }

  return {
    schemaVersion,
    generatedAt,
    sourceCommit,
    contentVersion,
    stale,
    ageDays,
    thresholdDays,
    matchesIntendedRelease,
    issues,
  };
}

export function assertFallbackFresh(options?: {
  nowMs?: number;
  strictStale?: boolean;
  thresholdDays?: number;
  intended?: IntendedManifestRelease | null;
  requireIntendedSchema?: boolean;
}): FallbackFreshnessReport {
  const report = collectFallbackFreshnessIssues(fallbackSemantic, options);
  const errors = report.issues.filter((i) => i.severity === "error");
  if (errors.length > 0) {
    const message = errors.map((e) => `[${e.code}] ${e.detail}`).join("\n");
    throw new Error(`Fallback freshness validation failed:\n${message}`);
  }
  return report;
}
