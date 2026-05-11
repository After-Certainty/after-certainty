import { afterEach, beforeEach, describe, expect, it } from "vitest";

import sitemap, { getSitemapPaths } from "./sitemap";

describe("sitemap", () => {
  let prevSiteUrl: string | undefined;

  beforeEach(() => {
    prevSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = prevSiteUrl;
  });

  it("includes core static routes with the configured origin", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);

    for (const path of ["/", "/start", "/books", "/podcast", "/patterns", "/collaborators", "/about"] as const) {
      expect(urls).toContain(`https://example.com${path}`);
    }
  });

  it("includes catalog book URLs and WoLTY subsite pages", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain("https://example.com/books/when-others-look-to-you");
    expect(urls).toContain("https://example.com/books/when-others-look-to-you/idea");
    expect(urls).toContain("https://example.com/books/when-others-look-to-you/resources");
    expect(urls.some((u) => u.startsWith("https://example.com/books/") && u.endsWith("/how-meaning-moves"))).toBe(true);
  });

  it("includes unified pattern library and WoLTY pattern URLs", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain("https://example.com/patterns/attention-finds-a-focus");
    expect(urls).toContain("https://example.com/books/when-others-look-to-you/patterns/attention-finds-a-focus");
  });

  it("returns many more entries than top-level routes only", () => {
    expect(getSitemapPaths().length).toBeGreaterThan(15);
  });

  it("uses localhost default when NEXT_PUBLIC_SITE_URL is unset", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const entries = sitemap();
    expect(entries.some((e) => e.url.startsWith("http://localhost:3000"))).toBe(true);
  });
});
