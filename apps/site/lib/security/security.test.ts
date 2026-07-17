import { describe, expect, it } from "vitest";

import { SECURITY_HEADERS } from "@/lib/security/headers";
import { httpUrlSchema, youtubeVideoIdSchema } from "@/lib/security/zod-urls";
import { isHttpOrHttpsUrl, onlyHttpOrHttpsUrl } from "@/lib/security/urls";

describe("security URL helpers", () => {
  it("accepts only http and https URLs", () => {
    expect(isHttpOrHttpsUrl("https://example.com/a")).toBe(true);
    expect(isHttpOrHttpsUrl("http://example.com/a")).toBe(true);
    expect(isHttpOrHttpsUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpOrHttpsUrl("data:text/html,hi")).toBe(false);
    expect(onlyHttpOrHttpsUrl("javascript:alert(1)")).toBeUndefined();
  });

  it("rejects hostile schemes in Zod httpUrlSchema", () => {
    expect(httpUrlSchema.safeParse("https://ok.example/x").success).toBe(true);
    expect(httpUrlSchema.safeParse("javascript:alert(1)").success).toBe(false);
  });

  it("validates YouTube video ids", () => {
    expect(youtubeVideoIdSchema.safeParse("ma1UbSajuVI").success).toBe(true);
    expect(youtubeVideoIdSchema.safeParse("short").success).toBe(false);
    expect(youtubeVideoIdSchema.safeParse("abc123/../x").success).toBe(false);
  });
});

describe("SECURITY_HEADERS", () => {
  it("includes baseline browser security headers", () => {
    const map = Object.fromEntries(SECURITY_HEADERS.map((h) => [h.key, h.value]));
    expect(map["X-Content-Type-Options"]).toBe("nosniff");
    expect(map["X-Frame-Options"]).toBe("SAMEORIGIN");
    expect(map["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(map["Content-Security-Policy"]).toContain("frame-ancestors 'self'");
    expect(map["Strict-Transport-Security"]).toContain("max-age=");
  });
});
