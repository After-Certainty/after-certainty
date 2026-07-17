import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST, resetSubscribeRateLimitsForTests } from "./route";

function requestJson(body: unknown, init?: { headers?: Record<string, string> }): Request {
  return new Request("http://localhost/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...init?.headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/subscribe", () => {
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

  it("returns 400 when body is not valid JSON", async () => {
    const req = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid JSON body" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 400 when email field is missing", async () => {
    const res = await POST(requestJson({}));
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toContain("Expected JSON body");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 400 when email is not a string", async () => {
    const res = await POST(requestJson({ email: 123 }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 400 for empty or invalid email", async () => {
    const empty = await POST(requestJson({ email: "   " }));
    expect(empty.status).toBe(400);
    expect(await empty.json()).toEqual({ error: "Invalid email" });

    const bad = await POST(requestJson({ email: "not-an-email" }));
    expect(bad.status).toBe(400);
    expect(await bad.json()).toEqual({ error: "Invalid email" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 400 for emails longer than 254 characters", async () => {
    const email = `${"a".repeat(250)}@example.com`;
    const res = await POST(requestJson({ email }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 413 for oversized bodies", async () => {
    const res = await POST(requestJson({ email: "ok@example.com", pad: "x".repeat(5000) }));
    expect(res.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 500 when newsletter env vars are missing", async () => {
    delete process.env.NEWSLETTER_API_KEY;
    delete process.env.NEWSLETTER_PUBLICATION_ID;

    const res = await POST(requestJson({ email: "reader@example.com" }));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: "Newsletter signup is temporarily unavailable.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls Beehiiv and returns 200 when upstream succeeds", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(requestJson({ email: "reader@example.com" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0]!;
    expect(call[0]).toContain("pub_test_id");
    expect(call[1]).toMatchObject({
      method: "POST",
      headers: expect.objectContaining({
        Authorization: "Bearer test-api-key",
      }),
    });
    expect((call[1] as RequestInit).signal).toBeInstanceOf(AbortSignal);
    const reqBody = JSON.parse((call[1] as RequestInit).body as string);
    expect(reqBody).toMatchObject({
      email: "reader@example.com",
      tier: "free",
      send_welcome_email: true,
    });
  });

  it("returns 429 when Beehiiv rate-limits", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 429 }));

    const res = await POST(requestJson({ email: "reader@example.com" }));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({
      error: "Too many requests. Please try again shortly.",
    });
  });

  it("returns 429 after repeated local submissions (app rate limit)", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ data: {} }), { status: 200 }));

    for (let i = 0; i < 5; i++) {
      const res = await POST(requestJson({ email: "same@example.com" }));
      expect(res.status).toBe(200);
    }

    const limited = await POST(requestJson({ email: "same@example.com" }));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it("returns 400 with Beehiiv message when upstream returns 4xx with JSON", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Already subscribed" }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(requestJson({ email: "reader@example.com" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Already subscribed" });
  });

  it("returns 502 when Beehiiv returns server error", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }));

    const res = await POST(requestJson({ email: "reader@example.com" }));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({
      error: "Could not complete signup. Please try again later.",
    });
  });

  it("returns 502 when Beehiiv fetch rejects or times out", async () => {
    fetchMock.mockRejectedValueOnce(new DOMException("Aborted", "AbortError"));

    const res = await POST(requestJson({ email: "reader@example.com" }));
    expect(res.status).toBe(502);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe("Could not complete signup. Please try again later.");
    expect(json.error).not.toMatch(/Abort|test-api-key/i);
  });
});
