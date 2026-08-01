import { gzipSync } from "node:zlib";

import type { SearchDocument, SearchEntityType } from "@/lib/search/types";

/**
 * Soft expected ceiling after source lean + chapter dedupe + wire slimming
 * (original plan §13 targeted ~140–200 KB; pruned corpus aims ≲300 KB gzip).
 */
export const SEARCH_INDEX_GZIP_EXPECTED_MAX_BYTES = 300 * 1024;

/** CI alert threshold — fail tests when the transferable index exceeds this. */
export const SEARCH_INDEX_GZIP_ALERT_BYTES = 360 * 1024;

/** Migration-review threshold from the Global Search plan (not a hard CI fail). */
export const SEARCH_INDEX_GZIP_MIGRATION_BYTES = 1.5 * 1024 * 1024;

export type SearchIndexSizeMeasurement = {
  jsonBytes: number;
  gzipBytes: number;
  exceedsAlert: boolean;
  exceedsExpected: boolean;
  exceedsMigration: boolean;
};

export type SearchIndexEntityTypeBreakdown = {
  entityType: SearchEntityType;
  documentCount: number;
  jsonBytes: number;
  gzipBytes: number;
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

/**
 * Per-entityType document count and serialized size contribution.
 * Useful for pruning decisions (sources vs chapters vs thinkers).
 */
export function measureSearchDocumentsByEntityType(
  documents: readonly SearchDocument[],
): SearchIndexEntityTypeBreakdown[] {
  const byType = new Map<SearchEntityType, SearchDocument[]>();
  for (const document of documents) {
    const list = byType.get(document.entityType);
    if (list) list.push(document);
    else byType.set(document.entityType, [document]);
  }

  const rows: SearchIndexEntityTypeBreakdown[] = [];
  for (const [entityType, docs] of byType) {
    const size = measureSearchIndexPayload(docs);
    rows.push({
      entityType,
      documentCount: docs.length,
      jsonBytes: size.jsonBytes,
      gzipBytes: size.gzipBytes,
    });
  }

  rows.sort((a, b) => b.gzipBytes - a.gzipBytes || b.documentCount - a.documentCount);
  return rows;
}
