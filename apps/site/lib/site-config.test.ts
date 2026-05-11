import { afterEach, describe, expect, it } from "vitest";

import {
  DEFAULT_BOOKS_MANIFEST_URL,
  isBooksManifestOffline,
  resolveBooksManifestUrl,
  resolveSiteSocialLinks,
} from "@/lib/site-config";

describe("resolveBooksManifestUrl", () => {
  let prev: string | undefined;
  afterEach(() => {
    process.env.BOOKS_MANIFEST_URL = prev;
  });
  it("uses default GitHub latest asset when env unset", () => {
    prev = process.env.BOOKS_MANIFEST_URL;
    delete process.env.BOOKS_MANIFEST_URL;
    expect(resolveBooksManifestUrl()).toBe(DEFAULT_BOOKS_MANIFEST_URL);
  });
  it("trims custom BOOKS_MANIFEST_URL", () => {
    prev = process.env.BOOKS_MANIFEST_URL;
    process.env.BOOKS_MANIFEST_URL = "  https://example.com/manifest.json  ";
    expect(resolveBooksManifestUrl()).toBe("https://example.com/manifest.json");
  });
});

describe("resolveSiteSocialLinks", () => {
  const keys = ["NEXT_PUBLIC_SOCIAL_GITHUB_URL", "NEXT_PUBLIC_SOCIAL_MEDIUM_URL", "NEXT_PUBLIC_SOCIAL_LINKEDIN_URL", "NEXT_PUBLIC_SOCIAL_YOUTUBE_URL"] as const;
  const saved: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const k of keys) {
      const v = saved[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  it("returns defaults when env unset", () => {
    for (const k of keys) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
    const s = resolveSiteSocialLinks();
    expect(s.github).toBe("https://github.com/ksteffe/after-certainty");
    expect(s.medium).toContain("medium.com");
    expect(s.linkedIn).toContain("linkedin.com");
    expect(s.youtube).toContain("youtube.com");
  });

  it("honors NEXT_PUBLIC_SOCIAL_GITHUB_URL override", () => {
    for (const k of keys) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
    process.env.NEXT_PUBLIC_SOCIAL_GITHUB_URL = "https://github.com/custom/repo";
    expect(resolveSiteSocialLinks().github).toBe("https://github.com/custom/repo");
  });
});

describe("isBooksManifestOffline", () => {
  let prev: string | undefined;
  afterEach(() => {
    process.env.BOOKS_MANIFEST_OFFLINE = prev;
  });
  it("is true for 1 and trimmed 1", () => {
    prev = process.env.BOOKS_MANIFEST_OFFLINE;
    process.env.BOOKS_MANIFEST_OFFLINE = "1";
    expect(isBooksManifestOffline()).toBe(true);
    process.env.BOOKS_MANIFEST_OFFLINE = " 1 ";
    expect(isBooksManifestOffline()).toBe(true);
  });
  it("is false for 0, empty, or unset", () => {
    prev = process.env.BOOKS_MANIFEST_OFFLINE;
    process.env.BOOKS_MANIFEST_OFFLINE = "0";
    expect(isBooksManifestOffline()).toBe(false);
    process.env.BOOKS_MANIFEST_OFFLINE = "";
    expect(isBooksManifestOffline()).toBe(false);
    delete process.env.BOOKS_MANIFEST_OFFLINE;
    expect(isBooksManifestOffline()).toBe(false);
  });
});
