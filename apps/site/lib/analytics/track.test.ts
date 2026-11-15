import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isAnalyticsEnabled, trackEvent, trackSearchQuery } from "@/lib/analytics/track";

const vercelTrack = vi.fn();
vi.mock("@vercel/analytics", () => ({
  track: (...args: unknown[]) => vercelTrack(...args),
}));

describe("trackEvent (GA retired)", () => {
  beforeEach(() => {
    vercelTrack.mockClear();
    delete (window as Window & { va?: unknown }).va;
    delete (window as Window & { vaq?: unknown }).vaq;
  });

  afterEach(() => {
    delete (window as Window & { va?: unknown }).va;
    delete (window as Window & { vaq?: unknown }).vaq;
  });

  it("isAnalyticsEnabled is always false after Gate 4", () => {
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it("trackEvent is a no-op", () => {
    expect(() => trackEvent("click", { outbound: true })).not.toThrow();
    expect(vercelTrack).not.toHaveBeenCalled();
  });

  it("trackSearchQuery sends only Vercel site_search buckets", () => {
    trackSearchQuery({
      surface: "full",
      has_results: true,
      result_count_bucket: "1-10",
      query_length_bucket: "1-10",
    });
    expect(vercelTrack).toHaveBeenCalledWith("site_search", {
      surface: "full",
      has_results: true,
      result_count_bucket: "1-10",
      query_length_bucket: "1-10",
    });
  });
});
