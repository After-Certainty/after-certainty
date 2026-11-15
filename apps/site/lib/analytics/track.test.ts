import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CONSENT_COOKIE_NAME } from "@/lib/consent/constants";
import { setConsent } from "@/lib/consent/storage";
import { isAnalyticsEnabled, trackEvent, trackSearchQuery } from "@/lib/analytics/track";

const vercelTrack = vi.fn();
vi.mock("@vercel/analytics", () => ({
  track: (...args: unknown[]) => vercelTrack(...args),
}));

vi.mock("@next/third-parties/google", () => ({
  sendGAEvent: vi.fn(),
}));

import { sendGAEvent } from "@next/third-parties/google";

describe("trackEvent", () => {
  const env = process.env;

  beforeEach(() => {
    vi.mocked(sendGAEvent).mockClear();
    vercelTrack.mockClear();
    document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
    delete (window as Window & { va?: unknown }).va;
    delete (window as Window & { vaq?: unknown }).vaq;
  });

  afterEach(() => {
    process.env = env;
    document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
    delete (window as Window & { va?: unknown }).va;
    delete (window as Window & { vaq?: unknown }).vaq;
  });

  it("no-ops outside production", () => {
    process.env = { ...env, NODE_ENV: "test" };
    setConsent("granted");
    trackEvent("click", { outbound: true });
    expect(sendGAEvent).not.toHaveBeenCalled();
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it("no-ops without analytics consent in production", () => {
    process.env = { ...env, NODE_ENV: "production", VERCEL_ENV: "production" };
    setConsent("denied");
    trackEvent("click", { outbound: true });
    expect(sendGAEvent).not.toHaveBeenCalled();
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it("sends events when production and consent granted", () => {
    process.env = { ...env, NODE_ENV: "production", VERCEL_ENV: "production" };
    setConsent("granted");
    trackEvent("select_content", { content_type: "book", item_id: "example" });
    expect(sendGAEvent).toHaveBeenCalledWith("event", "select_content", {
      content_type: "book",
      item_id: "example",
    });
    expect(isAnalyticsEnabled()).toBe(true);
  });

  it("no-ops on Vercel preview without opt-in", () => {
    process.env = { ...env, NODE_ENV: "production", VERCEL_ENV: "preview" };
    delete process.env.NEXT_PUBLIC_GA_ENABLE_PREVIEW;
    setConsent("granted");
    trackEvent("click", { outbound: true });
    expect(sendGAEvent).not.toHaveBeenCalled();
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it("dual-writes site_search to Vercel even when GA consent is denied", () => {
    process.env = { ...env, NODE_ENV: "production", VERCEL_ENV: "production" };
    setConsent("denied");
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
    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it("dual-writes site_search and GA search_query when consent granted", () => {
    process.env = { ...env, NODE_ENV: "production", VERCEL_ENV: "production" };
    setConsent("granted");
    trackSearchQuery({
      surface: "quick",
      has_results: false,
      result_count_bucket: "0",
      query_length_bucket: "11-24",
    });
    expect(vercelTrack).toHaveBeenCalledWith("site_search", {
      surface: "quick",
      has_results: false,
      result_count_bucket: "0",
      query_length_bucket: "11-24",
    });
    expect(sendGAEvent).toHaveBeenCalledWith("event", "search_query", {
      surface: "quick",
      has_results: false,
      result_count_bucket: "0",
      query_length_bucket: "11-24",
    });
  });
});
