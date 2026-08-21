import { afterEach, describe, expect, it } from "vitest";

import {
  DEFAULT_GA_MEASUREMENT_ID,
  isSemanticManifestOffline,
  isSemanticManifestUseLocal,
  resolveDeploymentUrl,
  resolveGaMeasurementId,
  resolveSiteSocialLinks,
  shouldLoadGoogleAnalytics,
} from "@/lib/site-config";

describe("resolveDeploymentUrl", () => {
  const keys = ["NEXT_PUBLIC_SITE_URL", "VERCEL_URL"] as const;
  const saved: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const k of keys) {
      const v = saved[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  function stash() {
    for (const k of keys) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
  }

  it("uses a valid NEXT_PUBLIC_SITE_URL", () => {
    stash();
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.after-certainty.com/";
    expect(resolveDeploymentUrl()).toBe("https://www.after-certainty.com");
  });

  it("skips invalid NEXT_PUBLIC_SITE_URL and falls back to localhost", () => {
    stash();
    process.env.NEXT_PUBLIC_SITE_URL = "not-a-url";
    expect(resolveDeploymentUrl()).toBe("http://localhost:3000");
  });

  it("uses VERCEL_URL when explicit site URL is invalid", () => {
    stash();
    process.env.NEXT_PUBLIC_SITE_URL = ":::";
    process.env.VERCEL_URL = "my-app.vercel.app";
    expect(resolveDeploymentUrl()).toBe("https://my-app.vercel.app");
  });
});

describe("semantic manifest env flags", () => {
  const keys = ["SEMANTIC_MANIFEST_OFFLINE", "SEMANTIC_MANIFEST_USE_LOCAL"] as const;
  const saved: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const k of keys) {
      const v = saved[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  it("USE_LOCAL implies offline (no remote fetch)", () => {
    for (const k of keys) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
    process.env.SEMANTIC_MANIFEST_USE_LOCAL = "1";
    expect(isSemanticManifestUseLocal()).toBe(true);
    expect(isSemanticManifestOffline()).toBe(true);
  });

  it("OFFLINE alone does not imply USE_LOCAL", () => {
    for (const k of keys) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
    process.env.SEMANTIC_MANIFEST_OFFLINE = "1";
    expect(isSemanticManifestOffline()).toBe(true);
    expect(isSemanticManifestUseLocal()).toBe(false);
  });
});

describe("resolveGaMeasurementId", () => {
  let prev: string | undefined;
  afterEach(() => {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    else process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = prev;
  });

  it("uses default measurement ID when env unset", () => {
    prev = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    expect(resolveGaMeasurementId()).toBe(DEFAULT_GA_MEASUREMENT_ID);
  });

  it("trims custom NEXT_PUBLIC_GA_MEASUREMENT_ID", () => {
    prev = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "  G-CUSTOM123  ";
    expect(resolveGaMeasurementId()).toBe("G-CUSTOM123");
  });
});

describe("shouldLoadGoogleAnalytics", () => {
  const keys = ["VERCEL_ENV", "NEXT_PUBLIC_GA_ENABLE_PREVIEW", "NODE_ENV"] as const;
  const saved: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const k of keys) {
      const v = saved[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  function stash() {
    for (const k of keys) {
      saved[k] = process.env[k];
    }
  }

  it("loads on Vercel production", () => {
    stash();
    process.env.NODE_ENV = "production";
    process.env.VERCEL_ENV = "production";
    delete process.env.NEXT_PUBLIC_GA_ENABLE_PREVIEW;
    expect(shouldLoadGoogleAnalytics()).toBe(true);
  });

  it("does not load on Vercel preview by default", () => {
    stash();
    process.env.NODE_ENV = "production";
    process.env.VERCEL_ENV = "preview";
    delete process.env.NEXT_PUBLIC_GA_ENABLE_PREVIEW;
    expect(shouldLoadGoogleAnalytics()).toBe(false);
  });

  it("loads on preview when NEXT_PUBLIC_GA_ENABLE_PREVIEW=1", () => {
    stash();
    process.env.NODE_ENV = "production";
    process.env.VERCEL_ENV = "preview";
    process.env.NEXT_PUBLIC_GA_ENABLE_PREVIEW = "1";
    expect(shouldLoadGoogleAnalytics()).toBe(true);
  });

  it("does not load in development", () => {
    stash();
    process.env.NODE_ENV = "development";
    process.env.VERCEL_ENV = "production";
    expect(shouldLoadGoogleAnalytics()).toBe(false);
  });
});

describe("resolveSiteSocialLinks", () => {
  const keys = [
    "NEXT_PUBLIC_SOCIAL_GITHUB_URL",
    "NEXT_PUBLIC_SOCIAL_MEDIUM_URL",
    "NEXT_PUBLIC_SOCIAL_LINKEDIN_URL",
    "NEXT_PUBLIC_SOCIAL_YOUTUBE_URL",
  ] as const;
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
