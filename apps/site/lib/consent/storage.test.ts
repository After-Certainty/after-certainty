import { afterEach, describe, expect, it } from "vitest";

import { CONSENT_COOKIE_NAME } from "@/lib/consent/constants";
import { getConsent, hasAnalyticsConsent, setConsent } from "@/lib/consent/storage";

describe("consent storage", () => {
  afterEach(() => {
    document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
  });

  it("returns unknown when cookie absent", () => {
    expect(getConsent()).toBe("unknown");
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("persists granted and denied values", () => {
    setConsent("granted");
    expect(getConsent()).toBe("granted");
    expect(hasAnalyticsConsent()).toBe(true);

    setConsent("denied");
    expect(getConsent()).toBe("denied");
    expect(hasAnalyticsConsent()).toBe(false);
  });
});
