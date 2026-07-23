import { afterEach, beforeEach, describe, expect, it } from "vitest";

import sitemap, { getSitemapPaths } from "./sitemap";

describe("sitemap", () => {
  let prevSiteUrl: string | undefined;
  let prevOffline: string | undefined;

  beforeEach(() => {
    prevSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    prevOffline = process.env.SEMANTIC_MANIFEST_OFFLINE;
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    process.env.SEMANTIC_MANIFEST_OFFLINE = "1";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = prevSiteUrl;
    if (prevOffline === undefined) delete process.env.SEMANTIC_MANIFEST_OFFLINE;
    else process.env.SEMANTIC_MANIFEST_OFFLINE = prevOffline;
  });

  it("includes core static routes with the configured origin", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    for (const path of [
      "/",
      "/start",
      "/questions",
      "/trails",
      "/explore",
      "/explore/concepts",
      "/explore/patterns",
      "/explore/books",
      "/explore/thinkers",
      "/explore/sources",
      "/search",
      "/podcast",
      "/whats-new",
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

  it("includes explore book, concept, pattern, and source detail URLs", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/explore/books/how-meaning-moves"))).toBe(true);
    expect(urls).toContain("https://example.com/explore/patterns/attention-finds-a-focus");
    expect(urls).toContain("https://example.com/explore/concepts/certainty");
    expect(urls.some((u) => u.includes("/explore/sources/"))).toBe(true);
    expect(urls.some((u) => u.includes("/explore/thinkers/"))).toBe(true);
  });

  it("includes companion editions and omits draft books from book paths", async () => {
    const paths = await getSitemapPaths();
    expect(paths).toContain("/explore/books/when-others-look-to-you-v2");
    expect(paths).toContain("/explore/books/when-others-look-to-you-v1");
    // Bundled corpus has no drafts today; the filter is bookIsPublic (status !== draft).
    expect(paths.every((p) => !p.includes("draft"))).toBe(true);
  });

  it("includes published trail detail URLs but not upcoming trails", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toContain("https://example.com/trails/judgment-before-certainty");
    expect(urls).not.toContain("https://example.com/trails/where-institutions-look");
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
