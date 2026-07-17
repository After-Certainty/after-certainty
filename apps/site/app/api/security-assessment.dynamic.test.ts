/**
 * Phase-1/2 defensive security dynamic tests.
 * All outbound services (Beehiiv, GitHub, RSS) are mocked — no non-local hosts.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST as subscribePost, resetSubscribeRateLimitsForTests } from "@/app/api/subscribe/route";
import { POST as revalidatePost } from "@/app/api/cache/revalidate/route";
import { GET as feedGet } from "@/app/feed.xml/route";

vi.mock("@/lib/cache/revalidate", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/cache/revalidate")>();
  return {
    ...actual,
    revalidateCacheTargets: vi.fn(),
  };
});

import { revalidateCacheTargets } from "@/lib/cache/revalidate";

function subscribeRequest(body: string | unknown, init?: { contentType?: string | null }): Request {
  const headers = new Headers();
  if (init?.contentType !== null) {
    headers.set("Content-Type", init?.contentType ?? "application/json");
  }
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("http://localhost/api/subscribe", {
    method: "POST",
    headers,
    body: payload,
  });
}

function revalidateRequest(init?: { body?: string; authorization?: string }): Request {
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

describe("security assessment — POST /api/subscribe (mocked Beehiiv)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let prevKey: string | undefined;
  let prevPub: string | undefined;

  beforeEach(() => {
    prevKey = process.env.NEWSLETTER_API_KEY;
    prevPub = process.env.NEWSLETTER_PUBLICATION_ID;
    process.env.NEWSLETTER_API_KEY = "test-api-key";
    process.env.NEWSLETTER_PUBLICATION_ID = "pub_test_id";
    resetSubscribeRateLimitsForTests();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.NEWSLETTER_API_KEY = prevKey;
    process.env.NEWSLETTER_PUBLICATION_ID = prevPub;
    resetSubscribeRateLimitsForTests();
  });

  it("rejects invalid JSON", async () => {
    const res = await subscribePost(subscribeRequest("not-json"));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects empty and whitespace email", async () => {
    expect((await subscribePost(subscribeRequest({ email: "" }))).status).toBe(400);
    expect((await subscribePost(subscribeRequest({ email: "   " }))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects malformed email shapes", async () => {
    for (const email of ["@", "a@", "@b", "a@b", "no-at-sign", "a b@c.com"]) {
      const res = await subscribePost(subscribeRequest({ email }));
      expect(res.status, email).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects long emails (F6)", async () => {
    const email = `${"a".repeat(250)}@example.com`;
    const res = await subscribePost(subscribeRequest({ email }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects oversized JSON body (F6)", async () => {
    const huge = { email: "ok@example.com", pad: "x".repeat(50_000) };
    const res = await subscribePost(subscribeRequest(huge));
    expect(res.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns safe error when Beehiiv is unavailable (network reject)", async () => {
    fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED mock"));
    const res = await subscribePost(subscribeRequest({ email: "reader@example.com" }));
    expect(res.status).toBe(502);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe("Could not complete signup. Please try again later.");
    expect(json.error).not.toMatch(/ECONNREFUSED|test-api-key|beehiiv/i);
  });

  it("returns safe 502 when Beehiiv returns 5xx", async () => {
    fetchMock.mockResolvedValueOnce(new Response("upstream boom", { status: 503 }));
    const res = await subscribePost(subscribeRequest({ email: "reader@example.com" }));
    expect(res.status).toBe(502);
    const json = (await res.json()) as { error: string };
    expect(json.error).not.toContain("upstream boom");
    expect(json.error).not.toContain("test-api-key");
  });

  it("strips oversized Beehiiv error messages", async () => {
    const longMsg = "m".repeat(400);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: longMsg }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const res = await subscribePost(subscribeRequest({ email: "reader@example.com" }));
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: string };
    expect(json.error.length).toBeLessThan(300);
    expect(json.error).not.toBe(longMsg);
  });

  it("rate-limits repeated subscribe attempts (F1)", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    const statuses: number[] = [];
    for (let i = 0; i < 8; i++) {
      const res = await subscribePost(subscribeRequest({ email: `burst${i}@example.com` }));
      statuses.push(res.status);
    }
    // Per-IP limit is 20; use same IP + same email to hit email limit of 5
    resetSubscribeRateLimitsForTests();
    const sameEmailStatuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await subscribePost(subscribeRequest({ email: "repeat@example.com" }));
      sameEmailStatuses.push(res.status);
    }
    expect(sameEmailStatuses.slice(0, 5).every((s) => s === 200)).toBe(true);
    expect(sameEmailStatuses[5]).toBe(429);
    expect(statuses.every((s) => s === 200)).toBe(true);
  });
});

describe("security assessment — POST /api/cache/revalidate", () => {
  let prevSecret: string | undefined;

  beforeEach(() => {
    prevSecret = process.env.CACHE_REVALIDATE_SECRET;
    process.env.CACHE_REVALIDATE_SECRET = "route-test-secret";
    vi.mocked(revalidateCacheTargets).mockClear();
  });

  afterEach(() => {
    process.env.CACHE_REVALIDATE_SECRET = prevSecret;
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
