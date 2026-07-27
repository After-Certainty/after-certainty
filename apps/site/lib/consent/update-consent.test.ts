import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  sendConsentedPageViewOnce,
  updateAnalyticsConsent,
} from "@/lib/consent/update-consent";

describe("updateAnalyticsConsent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    delete (window as { gtag?: unknown }).gtag;
    delete (window as { __acConsentedPageViewSent?: boolean }).__acConsentedPageViewSent;
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (window as { gtag?: unknown }).gtag;
    delete (window as { __acConsentedPageViewSent?: boolean }).__acConsentedPageViewSent;
  });

  it("retries until gtag is available", () => {
    const gtag = vi.fn();
    updateAnalyticsConsent(true);

    expect(gtag).not.toHaveBeenCalled();

    window.gtag = gtag;
    vi.advanceTimersByTime(100);

    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });

  it("sends a single consented page_view when requested after Accept", () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    updateAnalyticsConsent(true, { sendPageView: true });
    updateAnalyticsConsent(true, { sendPageView: true });

    const pageViews = gtag.mock.calls.filter((c) => c[0] === "event" && c[1] === "page_view");
    expect(pageViews).toHaveLength(1);
  });

  it("does not send page_view on reject", () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    updateAnalyticsConsent(false, { sendPageView: true });

    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    expect(gtag.mock.calls.some((c) => c[1] === "page_view")).toBe(false);
  });
});

describe("sendConsentedPageViewOnce", () => {
  beforeEach(() => {
    delete (window as { gtag?: unknown }).gtag;
    delete (window as { __acConsentedPageViewSent?: boolean }).__acConsentedPageViewSent;
  });

  afterEach(() => {
    delete (window as { gtag?: unknown }).gtag;
    delete (window as { __acConsentedPageViewSent?: boolean }).__acConsentedPageViewSent;
  });

  it("no-ops without gtag and does not mark sent", () => {
    sendConsentedPageViewOnce();
    expect(window.__acConsentedPageViewSent).toBeUndefined();
  });
});
