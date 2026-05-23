import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CONSENT_COOKIE_NAME } from "@/lib/consent/constants";
import { setConsent } from "@/lib/consent/storage";
import { isAnalyticsEnabled, trackEvent } from "@/lib/analytics/track";

vi.mock("@next/third-parties/google", () => ({
  sendGAEvent: vi.fn(),
}));

import { sendGAEvent } from "@next/third-parties/google";

describe("trackEvent", () => {
  const env = process.env;

  beforeEach(() => {
    vi.mocked(sendGAEvent).mockClear();
    document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
  });

  afterEach(() => {
    process.env = env;
    document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
  });

  it("no-ops outside production", () => {
    process.env = { ...env, NODE_ENV: "test" };
    setConsent("granted");
    trackEvent("click", { outbound: true });
    expect(sendGAEvent).not.toHaveBeenCalled();
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it("no-ops without analytics consent in production", () => {
    process.env = { ...env, NODE_ENV: "production" };
    setConsent("denied");
    trackEvent("click", { outbound: true });
    expect(sendGAEvent).not.toHaveBeenCalled();
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it("sends events when production and consent granted", () => {
    process.env = { ...env, NODE_ENV: "production" };
    setConsent("granted");
    trackEvent("select_content", { content_type: "book", item_id: "example" });
    expect(sendGAEvent).toHaveBeenCalledWith("event", "select_content", {
      content_type: "book",
      item_id: "example",
    });
    expect(isAnalyticsEnabled()).toBe(true);
  });
});
