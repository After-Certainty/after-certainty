import { describe, expect, it } from "vitest";

import { getSearchAliasConfigFromGraph } from "@/lib/search/aliases";
import {
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

    expect(payload.documentCount).toBe(documents.length);
    expect(size.gzipBytes).toBeLessThanOrEqual(SEARCH_INDEX_GZIP_ALERT_BYTES);
    expect(size.exceedsAlert).toBe(false);
    // Soft expectation from the plan — fail loudly if we blow past the intended V1 band.
    expect(size.gzipBytes).toBeLessThanOrEqual(SEARCH_INDEX_GZIP_EXPECTED_MAX_BYTES);
    expect(size.jsonBytes).toBeGreaterThan(50_000);
  });
});
