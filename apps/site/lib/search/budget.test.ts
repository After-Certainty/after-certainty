import { describe, expect, it } from "vitest";

import { getSearchAliasConfig } from "@/lib/search/aliases";
import {
  measureSearchIndexPayload,
  SEARCH_INDEX_GZIP_ALERT_BYTES,
  SEARCH_INDEX_GZIP_EXPECTED_MAX_BYTES,
} from "@/lib/search/budget";
import { buildSearchIndexPayload } from "@/lib/search/indexPayload";
import { loadBundledSearchDocuments } from "@/lib/search/loadBundledSearchDocuments";

describe("search index budget", () => {
  it("keeps the bundled corpus under the gzip alert threshold", () => {
    const documents = loadBundledSearchDocuments();
    const payload = buildSearchIndexPayload(
      documents,
      getSearchAliasConfig(),
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
