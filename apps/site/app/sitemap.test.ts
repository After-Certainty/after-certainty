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

    for (const path of [
      "/",
      "/start",
      "/explore",
      "/explore/concepts",
      "/explore/patterns",
      "/explore/books",
      "/explore/sources",
      "/podcast",
      "/collaborators",
      "/about",
    ] as const) {
      expect(urls).toContain(`https://example.com${path}`);
    }
  });

  it("does not include legacy /books URLs", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    const hasLegacyBooksPath = urls.some((u) => {
      const path = new URL(u).pathname;
      return path === "/books" || path.startsWith("/books/");
    });
    expect(hasLegacyBooksPath).toBe(false);
  });

  it("includes explore book and pattern detail URLs", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/explore/books/how-meaning-moves"))).toBe(true);
    expect(urls).toContain(
      "https://example.com/explore/patterns/attention-finds-a-focus",
    );
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
