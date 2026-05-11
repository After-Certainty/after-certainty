import { afterEach, beforeEach, describe, expect, it } from "vitest";

import sitemap, { getSitemapPaths } from "./sitemap";

describe("sitemap", () => {
  let prevSiteUrl: string | undefined;
  let prevOffline: string | undefined;

  beforeEach(() => {
    prevSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    prevOffline = process.env.BOOKS_MANIFEST_OFFLINE;
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    process.env.BOOKS_MANIFEST_OFFLINE = "1";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = prevSiteUrl;
    process.env.BOOKS_MANIFEST_OFFLINE = prevOffline;
  });

  it("includes core static routes with the configured origin", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    for (const path of ["/", "/start", "/books", "/podcast", "/patterns", "/collaborators", "/about"] as const) {
      expect(urls).toContain(`https://example.com${path}`);
    }
  });

  it("includes catalog book URLs and WoLTY subsite pages", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toContain("https://example.com/books/when-others-look-to-you");
    expect(urls).toContain("https://example.com/books/when-others-look-to-you/idea");
    expect(urls).toContain("https://example.com/books/when-others-look-to-you/resources");
    expect(urls.some((u) => u.startsWith("https://example.com/books/") && u.endsWith("/how-meaning-moves"))).toBe(true);
  });

  it("includes unified pattern library and WoLTY pattern URLs", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toContain("https://example.com/patterns/attention-finds-a-focus");
    expect(urls).toContain("https://example.com/books/when-others-look-to-you/patterns/attention-finds-a-focus");
  });

  it("returns many more entries than top-level routes only", async () => {
    expect((await getSitemapPaths()).length).toBeGreaterThan(15);
  });

  it("uses localhost default when NEXT_PUBLIC_SITE_URL is unset", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const entries = await sitemap();
    expect(entries.some((e) => e.url.startsWith("http://localhost:3000"))).toBe(true);
  });
});
