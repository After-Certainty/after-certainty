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
      "/listen",
      "/whats-new",
      "/collaborators",
      "/about",
      "/games",
      "/games/pattern-recognition",
    ] as const) {
      expect(urls).toContain(`https://example.com${path}`);
    }
  });

  it("includes published challenge pages but not ephemeral session routes", async () => {
    const paths = await getSitemapPaths();
    expect(paths).toContain(
      "/games/pattern-recognition/challenge/hallway-workaround-exception",
    );
    expect(paths).not.toContain("/games/pattern-recognition/daily");
    expect(paths).not.toContain("/games/pattern-recognition/practice");
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

  it("includes priority Search Console entities and privacy", async () => {
    const paths = await getSitemapPaths();
    expect(paths).toContain("/privacy");
    expect(paths).toContain("/explore/books/boundary-conditions");
    expect(paths).toContain("/explore/concepts/interpretation");
    expect(paths).toContain("/explore/concepts/shift-left");
    expect(
      paths.some((p) =>
        p.includes("/explore/sources/brehm-jack-w-a-theory-of-psychological-reactance"),
      ),
    ).toBe(true);
  });

  it("excludes query-parameter and legacy book paths", async () => {
    const paths = await getSitemapPaths();
    expect(paths.every((p) => !p.includes("?"))).toBe(true);
    expect(paths.every((p) => p !== "/books" && !p.startsWith("/books/"))).toBe(true);
    expect(paths.every((p) => !p.includes("favicon"))).toBe(true);
  });

  it("uses manifest generatedAt for lastmod when present", async () => {
    const { resolveSitemapLastModified } = await import("./sitemap");
    expect(resolveSitemapLastModified("2026-06-01T12:00:00.000Z").toISOString()).toBe(
      "2026-06-01T12:00:00.000Z",
    );
    const fallback = resolveSitemapLastModified(undefined);
    expect(fallback.getTime()).toBeGreaterThan(Date.parse("2020-01-01"));
  });

  it("includes companion editions and omits draft books from book paths", async () => {
    const paths = await getSitemapPaths();
    expect(paths).toContain("/explore/books/when-others-look-to-you-v2");
    expect(paths).toContain("/explore/books/when-others-look-to-you-v1");
    // Bundled corpus has no drafts today; the filter is bookIsPublic (status !== draft).
    expect(paths.every((p) => !p.includes("draft"))).toBe(true);
  });

  it("includes public chapter reading URLs (READ-009)", async () => {
    const paths = await getSitemapPaths();
    expect(paths).toContain(
      "/explore/books/after-certainty/chapters/front-matter-introduction",
    );
    expect(paths.filter((p) => p.includes("/chapters/")).length).toBeGreaterThan(100);
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
