/**
 * Defensive security dynamic tests (post–Beehiiv removal).
 * Outbound services (GitHub, RSS) are mocked or offline — no non-local hosts required.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST as revalidatePost } from "@/app/api/cache/revalidate/route";
import { GET as feedGet } from "@/app/feed.xml/route";
import { resetRateLimitBuckets } from "@/lib/security/rate-limit";

vi.mock("@/lib/cache/revalidate", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/cache/revalidate")>();
  return {
    ...actual,
    revalidateCacheTargets: vi.fn(),
  };
});

import { revalidateCacheTargets } from "@/lib/cache/revalidate";

function revalidateRequest(init?: {
  body?: string;
  authorization?: string;
  forwardedFor?: string;
}): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (init?.authorization) {
    headers.Authorization = init.authorization;
  }
  if (init?.forwardedFor) {
    headers["x-forwarded-for"] = init.forwardedFor;
  }
  return new Request("http://localhost/api/cache/revalidate", {
    method: "POST",
    headers,
    body: init?.body ?? "",
  });
}

describe("security assessment — POST /api/cache/revalidate", () => {
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

  it("returns 503 when secret unset", async () => {
    delete process.env.CACHE_REVALIDATE_SECRET;
    const res = await revalidatePost(revalidateRequest({ authorization: "Bearer anything" }));
    expect(res.status).toBe(503);
    expect(revalidateCacheTargets).not.toHaveBeenCalled();
  });

  it("returns 401 for missing Authorization", async () => {
    const res = await revalidatePost(revalidateRequest());
    expect(res.status).toBe(401);
  });

  it("returns 401 for malformed Authorization schemes", async () => {
    for (const authorization of [
      "route-test-secret",
      "Basic route-test-secret",
      "Bearer",
      "Bearer ",
      "Bearer wrong-secret",
      "bearer route-test-secret",
    ]) {
      const res = await revalidatePost(revalidateRequest({ authorization }));
      expect(res.status, authorization).toBe(401);
    }
    expect(revalidateCacheTargets).not.toHaveBeenCalled();
  });

  it("rate-limits repeated unauthorized attempts", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 25; i++) {
      const res = await revalidatePost(
        revalidateRequest({
          authorization: "Bearer wrong-secret",
          forwardedFor: "203.0.113.50",
        }),
      );
      statuses.push(res.status);
    }
    expect(statuses.slice(0, 20).every((s) => s === 401)).toBe(true);
    expect(statuses[20]).toBe(429);
    expect(revalidateCacheTargets).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON body", async () => {
    const res = await revalidatePost(
      revalidateRequest({
        authorization: "Bearer route-test-secret",
        body: "{not-json",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects unknown targets and empty targets array", async () => {
    const unknown = await revalidatePost(
      revalidateRequest({
        authorization: "Bearer route-test-secret",
        body: JSON.stringify({ targets: ["podcast", "evil"] }),
      }),
    );
    expect(unknown.status).toBe(400);

    const empty = await revalidatePost(
      revalidateRequest({
        authorization: "Bearer route-test-secret",
        body: JSON.stringify({ targets: [] }),
      }),
    );
    expect(empty.status).toBe(400);
  });

  it("rejects oversized targets array", async () => {
    const targets = Array.from({ length: 500 }, (_, i) => (i === 0 ? "podcast" : `t${i}`));
    const res = await revalidatePost(
      revalidateRequest({
        authorization: "Bearer route-test-secret",
        body: JSON.stringify({ targets }),
      }),
    );
    expect(res.status).toBe(400);
    expect(revalidateCacheTargets).not.toHaveBeenCalled();
  });

  it("authorizes correct bearer and revalidates", async () => {
    const res = await revalidatePost(
      revalidateRequest({ authorization: "Bearer route-test-secret" }),
    );
    expect(res.status).toBe(200);
    expect(revalidateCacheTargets).toHaveBeenCalledWith(["podcast", "semantic", "books"]);
  });
});

describe("security assessment — GET /feed.xml", () => {
  it("redirects to configured/default RSS without using request input", () => {
    const res = feedGet();
    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toBeTruthy();
    expect(location!.startsWith("http")).toBe(true);
  });
});
