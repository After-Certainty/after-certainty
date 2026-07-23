import { describe, expect, it } from "vitest";

import {
  buildManifestLockFromLoadResult,
  releaseIdentityKey,
} from "@/lib/graph/build-manifest-lock";
import { buildManifestCacheIdentity, type SemanticGraphLoadResult } from "@/lib/graph/manifest";

describe("build manifest lock", () => {
  it("changes cache identity when release identity changes", () => {
    const a = buildManifestCacheIdentity(
      {
        schemaVersion: "2.3",
        sourceCommit: "aaa",
        generatedAt: "2026-01-01T00:00:00.000Z",
      },
      { kind: "remote", url: "https://example.com/a" },
    );
    const b = buildManifestCacheIdentity(
      {
        schemaVersion: "2.3",
        sourceCommit: "bbb",
        generatedAt: "2026-01-01T00:00:00.000Z",
      },
      { kind: "remote", url: "https://example.com/a" },
    );
    expect(a).not.toBe(b);
  });

  it("records release identity from a load result", () => {
    const result = {
      graph: {
        books: [],
        glossary: [],
        patterns: [],
        sources: [],
        relationships: [],
        schemaVersion: "2.3",
        sourceCommit: "abc",
        generatedAt: "2026-07-23T00:00:00.000Z",
      },
      source: {
        kind: "fallback",
        schemaVersion: "2.3",
        sourceCommit: "abc",
        generatedAt: "2026-07-23T00:00:00.000Z",
        stale: false,
        cacheIdentity: "fallback|test|2.3|abc|no-content-version|2026-07-23T00:00:00.000Z",
        reason: "offline",
      },
      diagnostics: [],
    } satisfies SemanticGraphLoadResult;

    const lock = buildManifestLockFromLoadResult(result, "2026-07-23T12:00:00.000Z");
    expect(lock.manifestSource).toBe("fallback");
    expect(releaseIdentityKey(lock)).toBe("2.3|abc|2026-07-23T00:00:00.000Z");
  });
});
