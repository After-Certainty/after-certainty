import { afterEach, beforeEach, describe, expect, it } from "vitest";

import robots from "./robots";

describe("robots", () => {
  let prevSiteUrl: string | undefined;

  beforeEach(() => {
    prevSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = prevSiteUrl;
  });

  it("allows all user-agents on /", () => {
    const r = robots();
    expect(r.rules).toEqual({
      userAgent: "*",
      allow: "/",
    });
  });

  it("points sitemap at /sitemap.xml on the same origin", () => {
    const r = robots();
    expect(r.sitemap).toBe("https://example.com/sitemap.xml");
  });

  it("uses localhost default when NEXT_PUBLIC_SITE_URL is unset", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const r = robots();
    expect(r.sitemap).toBe("http://localhost:3000/sitemap.xml");
  });
});
