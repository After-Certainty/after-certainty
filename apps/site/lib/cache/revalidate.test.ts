import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  isCacheRevalidateAuthorized,
  isCacheRevalidateConfigured,
  parseCacheRevalidateTargets,
  revalidateCacheTargets,
} from "./revalidate";

vi.mock("@/lib/podcast/rss", () => ({
  refreshPodcastRss: vi.fn(),
}));

vi.mock("@/lib/graph/manifest", () => ({
  refreshSemanticGraph: vi.fn(),
}));

import { refreshPodcastRss } from "@/lib/podcast/rss";
import { refreshSemanticGraph } from "@/lib/graph/manifest";

describe("cache revalidate helpers", () => {
  let prevSecret: string | undefined;

  beforeEach(() => {
    prevSecret = process.env.CACHE_REVALIDATE_SECRET;
    vi.mocked(refreshPodcastRss).mockClear();
    vi.mocked(refreshSemanticGraph).mockClear();
  });

  afterEach(() => {
    process.env.CACHE_REVALIDATE_SECRET = prevSecret;
  });

  it("defaults targets to podcast and semantic", () => {
    expect(parseCacheRevalidateTargets(undefined)).toEqual(["podcast", "semantic"]);
  });

  it("rejects invalid target names", () => {
    expect(parseCacheRevalidateTargets(["podcast", "unknown"])).toBeNull();
    expect(parseCacheRevalidateTargets(["books"])).toBeNull();
  });

  it("authorizes matching bearer tokens", () => {
    process.env.CACHE_REVALIDATE_SECRET = "test-secret";
    const req = new Request("http://localhost/api/cache/revalidate", {
      headers: { Authorization: "Bearer test-secret" },
    });
    expect(isCacheRevalidateConfigured()).toBe(true);
    expect(isCacheRevalidateAuthorized(req)).toBe(true);
  });

  it("rejects missing or wrong bearer tokens", () => {
    process.env.CACHE_REVALIDATE_SECRET = "test-secret";
    const req = new Request("http://localhost/api/cache/revalidate");
    expect(isCacheRevalidateAuthorized(req)).toBe(false);
  });

  it("rejects bearer tokens with mismatched length without throwing", () => {
    process.env.CACHE_REVALIDATE_SECRET = "test-secret";
    const short = new Request("http://localhost/api/cache/revalidate", {
      headers: { Authorization: "Bearer x" },
    });
    const long = new Request("http://localhost/api/cache/revalidate", {
      headers: { Authorization: "Bearer test-secret-extra" },
    });
    expect(isCacheRevalidateAuthorized(short)).toBe(false);
    expect(isCacheRevalidateAuthorized(long)).toBe(false);
  });

  it("calls refresh helpers per target", () => {
    revalidateCacheTargets(["podcast"]);
    expect(refreshPodcastRss).toHaveBeenCalledOnce();
    expect(refreshSemanticGraph).not.toHaveBeenCalled();

    revalidateCacheTargets(["semantic"]);
    expect(refreshSemanticGraph).toHaveBeenCalledOnce();
  });
});
