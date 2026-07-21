import { gzipSync } from "node:zlib";

/**
 * Soft expected ceiling for the current corpus (plan §13 targeted ~140–200 KB;
 * full documents + aliasConfig land near ~210 KB gzip today).
 */
export const SEARCH_INDEX_GZIP_EXPECTED_MAX_BYTES = 384 * 1024;

/** CI alert threshold — fail tests when the transferable index exceeds this. */
export const SEARCH_INDEX_GZIP_ALERT_BYTES = 500 * 1024;

/** Migration-review threshold from the Global Search plan (not a hard CI fail). */
export const SEARCH_INDEX_GZIP_MIGRATION_BYTES = 1.5 * 1024 * 1024;

export type SearchIndexSizeMeasurement = {
  jsonBytes: number;
  gzipBytes: number;
  exceedsAlert: boolean;
  exceedsExpected: boolean;
  exceedsMigration: boolean;
};

/** Measure JSON + gzip size of a serializable search index payload. */
export function measureSearchIndexPayload(payload: unknown): SearchIndexSizeMeasurement {
  const json = Buffer.from(JSON.stringify(payload), "utf8");
  const gzipBytes = gzipSync(json, { level: 9 }).byteLength;
  return {
    jsonBytes: json.byteLength,
    gzipBytes,
    exceedsAlert: gzipBytes > SEARCH_INDEX_GZIP_ALERT_BYTES,
    exceedsExpected: gzipBytes > SEARCH_INDEX_GZIP_EXPECTED_MAX_BYTES,
    exceedsMigration: gzipBytes > SEARCH_INDEX_GZIP_MIGRATION_BYTES,
  };
}
