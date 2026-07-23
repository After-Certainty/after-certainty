import fallbackSemantic from "@/data/semantic-manifest.json";
import {
  DEFAULT_FALLBACK_STALE_DAYS,
  fallbackStaleDaysThreshold,
  isCompatibleSchemaVersion,
  isFallbackStale,
} from "@/lib/graph/manifest";
import { validateSemanticGraph } from "@/lib/graph/validate";
import { contentTypeInfoFromBook } from "@/lib/graph/content-type";

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
  stale: boolean;
  ageDays?: number;
  thresholdDays: number;
  issues: FallbackFreshnessIssue[];
};

const REQUIRED_FIXTURE_TYPES: { slug: string; contentType: string }[] = [
  { slug: "boundary-conditions", contentType: "fiction" },
  { slug: "observer-patterns", contentType: "poetry" },
  { slug: "before-certainty-arrives", contentType: "nonfiction" },
];

/**
 * Validate the bundled fallback for schema, provenance, fixture content types,
 * and staleness. Invalid/incompatible → errors. Stale → warning (error when strict).
 */
export function collectFallbackFreshnessIssues(
  data: unknown = fallbackSemantic,
  options?: { nowMs?: number; strictStale?: boolean; thresholdDays?: number },
): FallbackFreshnessReport {
  const thresholdDays = options?.thresholdDays ?? fallbackStaleDaysThreshold();
  const issues: FallbackFreshnessIssue[] = [];

  const validated = validateSemanticGraph(data);
  if (!validated.success) {
    return {
      stale: true,
      thresholdDays,
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

  if (!isCompatibleSchemaVersion(schemaVersion)) {
    issues.push({
      severity: "error",
      code: "incompatible_schema",
      detail: `Unsupported schemaVersion "${schemaVersion}".`,
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
      severity: "warning",
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
    stale,
    ageDays,
    thresholdDays,
    issues,
  };
}

export function assertFallbackFresh(options?: {
  nowMs?: number;
  strictStale?: boolean;
  thresholdDays?: number;
}): FallbackFreshnessReport {
  const report = collectFallbackFreshnessIssues(fallbackSemantic, options);
  const errors = report.issues.filter((i) => i.severity === "error");
  if (errors.length > 0) {
    const message = errors.map((e) => `[${e.code}] ${e.detail}`).join("\n");
    throw new Error(`Fallback freshness validation failed:\n${message}`);
  }
  return report;
}
