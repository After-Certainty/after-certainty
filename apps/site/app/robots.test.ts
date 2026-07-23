import { afterEach, beforeEach, describe, expect, it } from "vitest";

import robots from "./robots";
import { OPEN_GRAPH_CRAWLER_USER_AGENTS } from "@/lib/seo/open-graph-crawlers";

describe("robots", () => {
  let prevSiteUrl: string | undefined;

  beforeEach(() => {
    prevSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = prevSiteUrl;
  });

  it("allowlists Open Graph crawlers and all other user-agents on /", () => {
    const r = robots();
    expect(Array.isArray(r.rules)).toBe(true);
    const rules = r.rules as Array<{ userAgent: string; allow: string }>;
    expect(rules.at(-1)).toEqual({ userAgent: "*", allow: "/" });
    for (const userAgent of OPEN_GRAPH_CRAWLER_USER_AGENTS) {
      expect(rules).toContainEqual({ userAgent, allow: "/" });
    }
  });

  it("explicitly allowlists facebookexternalhit for Meta link previews", () => {
    const r = robots();
    const rules = r.rules as Array<{ userAgent: string; allow: string }>;
    expect(rules).toContainEqual({ userAgent: "facebookexternalhit", allow: "/" });
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
