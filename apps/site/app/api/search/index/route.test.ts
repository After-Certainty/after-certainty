import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";
import type { SearchIndexPayload } from "@/lib/search/indexPayload";

vi.mock("@/lib/search/indexPayload", () => ({
  getSearchIndexPayload: vi.fn(),
}));

import { getSearchIndexPayload } from "@/lib/search/indexPayload";

describe("GET /api/search/index", () => {
  beforeEach(() => {
    vi.mocked(getSearchIndexPayload).mockReset();
  });

  it("returns the search index payload with cache headers", async () => {
    const payload: SearchIndexPayload = {
      version: 1,
      generatedAt: "2026-07-19T00:00:00.000Z",
      documentCount: 1,
      documents: [
        {
          id: "concept-certainty",
          entityType: "concept",
          slug: "certainty",
          title: "Certainty",
          resultLabel: "Concept",
          canonicalUrl: "/explore/concepts/certainty",
          visibility: "listed",
          searchText: "Certainty",
          aliases: [],
          boostWeight: 1.2,
          sourceArtifact: "semantic",
        },
      ],
      aliasConfig: { version: 1, entries: [] },
    };
    vi.mocked(getSearchIndexPayload).mockResolvedValue(payload);

    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=3600");
    await expect(res.json()).resolves.toEqual(payload);
  });

  it("returns 503 when the payload cannot be built", async () => {
    vi.mocked(getSearchIndexPayload).mockRejectedValue(new Error("boom"));
    const res = await GET();
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({ error: "Search index unavailable" });
  });
});
