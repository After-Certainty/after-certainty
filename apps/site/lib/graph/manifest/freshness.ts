import {
  DEFAULT_INSTALLED_MANIFEST_STALE_DAYS,
  installedManifestStaleDaysThreshold,
  isCompatibleSchemaVersion,
  isInstalledManifestStale,
} from "@/lib/graph/manifest";
import { INTENDED_SCHEMA_VERSION, isIntendedSchemaVersion } from "@/lib/graph/manifest/schema-version";
import { validateSemanticGraph } from "@/lib/graph/manifest/validate";
import { contentTypeInfoFromBook } from "@/lib/graph/content-type";
import {
  LOCAL_INTENDED_RELEASE_RELATIVE,
  isSemanticManifestUseLocal,
  loadInstalledManifestJson,
  readJsonFileIfPresent,
} from "@/lib/graph/manifest/installed-io";
import { join } from "node:path";

export type InstalledManifestFreshnessSeverity = "error" | "warning";

export type InstalledManifestFreshnessIssue = {
  severity: InstalledManifestFreshnessSeverity;
  code: string;
  detail: string;
};

export type InstalledManifestFreshnessReport = {
  schemaVersion?: string;
  generatedAt?: string;
  sourceCommit?: string;
  contentVersion?: string | null;
  stale: boolean;
  ageDays?: number;
  thresholdDays: number;
  matchesIntendedRelease: boolean;
  issues: InstalledManifestFreshnessIssue[];
};

/** @deprecated Use InstalledManifestFreshnessSeverity */
export type FallbackFreshnessSeverity = InstalledManifestFreshnessSeverity;

/** @deprecated Use InstalledManifestFreshnessIssue */
export type FallbackFreshnessIssue = InstalledManifestFreshnessIssue;

/** @deprecated Use InstalledManifestFreshnessReport */
export type FallbackFreshnessReport = InstalledManifestFreshnessReport;

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
  if (isSemanticManifestUseLocal()) {
    const localPath = join(rootDir, LOCAL_INTENDED_RELEASE_RELATIVE);
    const local = readJsonFileIfPresent(localPath);
    if (local && typeof local === "object") {
      return local as IntendedManifestRelease;
    }
    return null;
  }
  return null;
}

/**
 * Validate the installed local semantic manifest for schema, provenance,
 * required content-type fixtures, intended-release parity, and staleness.
 */
export function collectInstalledManifestFreshnessIssues(
  data: unknown = loadInstalledManifestJson(),
  options?: {
    nowMs?: number;
    strictStale?: boolean;
    thresholdDays?: number;
    intended?: IntendedManifestRelease | null;
    requireIntendedSchema?: boolean;
  },
): InstalledManifestFreshnessReport {
  const thresholdDays = options?.thresholdDays ?? installedManifestStaleDaysThreshold();
  const issues: InstalledManifestFreshnessIssue[] = [];
  const requireIntendedSchema = options?.requireIntendedSchema ?? Boolean(options?.strictStale);
  const intended =
    options?.intended === undefined ? readIntendedManifestRelease() : options.intended;
  const requireIntendedRelease =
    options?.intended === undefined && options?.strictStale && isSemanticManifestUseLocal();

  const validated = validateSemanticGraph(data);
  if (!validated.success) {
    return {
      stale: true,
      thresholdDays,
      matchesIntendedRelease: false,
      issues: [
        {
          severity: "error",
          code: "invalid",
          detail: "Installed local-semantic-manifest.json failed Zod validation.",
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
      code: "incompatible",
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
      mismatches.push(`schemaVersion installed=${schemaVersion} intended=${intended.schemaVersion}`);
    }
    if (intended.sourceCommit !== sourceCommit) {
      mismatches.push(`sourceCommit installed=${sourceCommit} intended=${intended.sourceCommit}`);
    }
    if (intended.generatedAt !== generatedAt) {
      mismatches.push(`generatedAt installed=${generatedAt} intended=${intended.generatedAt}`);
    }
    if (mismatches.length > 0) {
      matchesIntendedRelease = false;
      issues.push({
        severity: "error",
        code: "installed_release_mismatch",
        detail: `Installed semantic manifest does not match intended local release (${mismatches.join("; ")}). Run npm run site:install-local-manifest after rebuilding the manifest.`,
      });
    }
  } else if (requireIntendedRelease) {
    matchesIntendedRelease = false;
    issues.push({
      severity: "error",
      code: "missing_intended_release",
      detail: `${LOCAL_INTENDED_RELEASE_RELATIVE} is missing. Run npm run site:install-local-manifest after rebuilding the manifest.`,
    });
  }

  const { stale, ageDays } = isInstalledManifestStale(generatedAt, {
    nowMs: options?.nowMs,
    thresholdDays,
  });

  if (stale) {
    issues.push({
      severity: options?.strictStale ? "error" : "warning",
      code: "stale",
      detail: `Installed manifest is stale (ageDays=${ageDays ?? "unknown"}, threshold=${thresholdDays}, default=${DEFAULT_INSTALLED_MANIFEST_STALE_DAYS}).`,
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

export function assertInstalledManifestFresh(options?: {
  nowMs?: number;
  strictStale?: boolean;
  thresholdDays?: number;
  intended?: IntendedManifestRelease | null;
  requireIntendedSchema?: boolean;
}): InstalledManifestFreshnessReport {
  const data = loadInstalledManifestJson();
  const report = collectInstalledManifestFreshnessIssues(data, options);
  const errors = report.issues.filter((i) => i.severity === "error");
  if (errors.length > 0) {
    const message = errors.map((e) => `[${e.code}] ${e.detail}`).join("\n");
    throw new Error(`Installed manifest freshness validation failed:\n${message}`);
  }
  return report;
}

/** @deprecated Use collectInstalledManifestFreshnessIssues */
export const collectFallbackFreshnessIssues = collectInstalledManifestFreshnessIssues;

/** @deprecated Use assertInstalledManifestFresh */
export const assertFallbackFresh = assertInstalledManifestFresh;
