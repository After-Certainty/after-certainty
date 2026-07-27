import { describe, expect, it } from "vitest";

import {
  applyLegacyRedirect,
  LEGACY_EXPLORE_REDIRECTS,
  LEGACY_REDIRECT_SAMPLES,
} from "@/lib/seo/legacy-redirects";

describe("legacy Explore redirects", () => {
  it("maps Search Console sample URLs to exact Explore destinations (not homepage)", () => {
    for (const { from, to } of LEGACY_REDIRECT_SAMPLES) {
      expect(applyLegacyRedirect(from)).toBe(to);
      expect(to).not.toBe("/");
      expect(to.startsWith("/explore")).toBe(true);
    }
  });

  it("prefers specific WoLTY pattern rules over /books/:slug", () => {
    expect(applyLegacyRedirect("/books/when-others-look-to-you/patterns/exceptions-are-forever")).toBe(
      "/explore/patterns/exceptions-are-forever",
    );
  });

  it("lists permanent rules that next.config must keep in sync", () => {
    expect(LEGACY_EXPLORE_REDIRECTS.length).toBeGreaterThan(5);
    expect(LEGACY_EXPLORE_REDIRECTS.every((r) => r.destination.startsWith("/explore"))).toBe(true);
  });
});
