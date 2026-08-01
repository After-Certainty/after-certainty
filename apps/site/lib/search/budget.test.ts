import { describe, expect, it } from "vitest";

import { getSearchAliasConfigFromGraph } from "@/lib/search/aliases";
import {
  measureSearchDocumentsByEntityType,
  measureSearchIndexPayload,
  SEARCH_INDEX_GZIP_ALERT_BYTES,
  SEARCH_INDEX_GZIP_EXPECTED_MAX_BYTES,
} from "@/lib/search/budget";
import { buildSearchIndexPayload } from "@/lib/search/indexPayload";
import { loadInstalledSearchDocuments } from "@/lib/search/loadBundledSearchDocuments";
import { tryLoadLocalSemanticManifest } from "@/test/helpers/load-local-manifest";

const graph = tryLoadLocalSemanticManifest();

describe.skipIf(!graph)("search index budget (local manifest)", () => {
  it("keeps the installed local corpus under the gzip alert threshold", () => {
    const documents = loadInstalledSearchDocuments(graph!);
    const payload = buildSearchIndexPayload(
      documents,
      getSearchAliasConfigFromGraph(graph!),
      "2026-07-19T00:00:00.000Z",
    );
    const size = measureSearchIndexPayload(payload);
    const byType = measureSearchDocumentsByEntityType(payload.documents);

    // Surface composition in CI logs when budgets drift.
    console.info(
      "[search-budget]",
      JSON.stringify({
        documentCount: payload.documentCount,
        jsonBytes: size.jsonBytes,
        gzipBytes: size.gzipBytes,
        byType: byType.map((row) => ({
          entityType: row.entityType,
          documentCount: row.documentCount,
          gzipBytes: row.gzipBytes,
        })),
      }),
    );

    expect(payload.documentCount).toBe(documents.length);
    expect(size.gzipBytes).toBeLessThanOrEqual(SEARCH_INDEX_GZIP_ALERT_BYTES);
    expect(size.exceedsAlert).toBe(false);
    expect(size.gzipBytes).toBeLessThanOrEqual(SEARCH_INDEX_GZIP_EXPECTED_MAX_BYTES);
    expect(size.jsonBytes).toBeGreaterThan(50_000);

    expect(byType.length).toBeGreaterThan(0);
    expect(byType.every((row) => row.documentCount > 0 && row.gzipBytes > 0)).toBe(true);
  });
});
