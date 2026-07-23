import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";
import { resetRateLimitBuckets } from "@/lib/security/rate-limit";

vi.mock("@/lib/cache/revalidate", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/cache/revalidate")>();
  return {
    ...actual,
    revalidateCacheTargets: vi.fn(),
  };
});

import { revalidateCacheTargets } from "@/lib/cache/revalidate";

function postRequest(init?: { body?: string; authorization?: string }): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (init?.authorization) {
    headers.Authorization = init.authorization;
  }
  return new Request("http://localhost/api/cache/revalidate", {
    method: "POST",
    headers,
    body: init?.body ?? "",
  });
}

describe("POST /api/cache/revalidate", () => {
  let prevSecret: string | undefined;

  beforeEach(() => {
    prevSecret = process.env.CACHE_REVALIDATE_SECRET;
    process.env.CACHE_REVALIDATE_SECRET = "route-test-secret";
    vi.mocked(revalidateCacheTargets).mockClear();
    resetRateLimitBuckets();
  });

  afterEach(() => {
    process.env.CACHE_REVALIDATE_SECRET = prevSecret;
    resetRateLimitBuckets();
  });

  it("returns 503 when secret is not configured", async () => {
    delete process.env.CACHE_REVALIDATE_SECRET;
    const res = await POST(postRequest({ authorization: "Bearer x" }));
    expect(res.status).toBe(503);
  });

  it("returns 401 without a valid bearer token", async () => {
    const res = await POST(postRequest());
    expect(res.status).toBe(401);
  });

  it("revalidates all default targets with a valid bearer token", async () => {
    const res = await POST(postRequest({ authorization: "Bearer route-test-secret" }));
    expect(res.status).toBe(200);
    expect(revalidateCacheTargets).toHaveBeenCalledWith(["podcast", "semantic"]);
    await expect(res.json()).resolves.toEqual({
      ok: true,
      revalidated: ["podcast", "semantic"],
    });
  });

  it("revalidates only requested targets from the body", async () => {
    const res = await POST(
      postRequest({
        authorization: "Bearer route-test-secret",
        body: JSON.stringify({ targets: ["podcast"] }),
      }),
    );
    expect(res.status).toBe(200);
    expect(revalidateCacheTargets).toHaveBeenCalledWith(["podcast"]);
  });

  it("returns 400 for invalid JSON", async () => {
    const res = await POST(
      postRequest({
        authorization: "Bearer route-test-secret",
        body: "not-json",
      }),
    );
    expect(res.status).toBe(400);
  });
});
