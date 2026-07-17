import { afterEach, describe, expect, it, vi } from "vitest";

import { CONSENT_COOKIE_NAME } from "@/lib/consent/constants";
import { getConsent, hasAnalyticsConsent, setConsent } from "@/lib/consent/storage";

describe("consent storage", () => {
  afterEach(() => {
    document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0`;
    vi.unstubAllGlobals();
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

  it("sets Secure on the consent cookie under https", () => {
    let written = "";
    vi.stubGlobal("location", { protocol: "https:" });
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get: () => written,
      set: (value: string) => {
        written = value;
      },
    });

    setConsent("granted");
    expect(written).toContain(`${CONSENT_COOKIE_NAME}=granted`);
    expect(written).toContain("Secure");
    expect(written).toContain("SameSite=Lax");
  });

  it("omits Secure on the consent cookie under http", () => {
    let written = "";
    vi.stubGlobal("location", { protocol: "http:" });
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get: () => written,
      set: (value: string) => {
        written = value;
      },
    });

    setConsent("denied");
    expect(written).toContain(`${CONSENT_COOKIE_NAME}=denied`);
    expect(written).not.toContain("Secure");
  });
});
