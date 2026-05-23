import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { updateAnalyticsConsent } from "@/lib/consent/update-consent";

describe("updateAnalyticsConsent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    delete (window as { gtag?: unknown }).gtag;
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (window as { gtag?: unknown }).gtag;
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
});
