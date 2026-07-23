import { afterEach, describe, expect, it } from "vitest";

import {
  DEFAULT_GA_MEASUREMENT_ID,
  resolveGaMeasurementId,
  resolveSiteSocialLinks,
} from "@/lib/site-config";

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
