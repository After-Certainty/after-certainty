import { describe, expect, it } from "vitest";

import { buildConsentDefaultsInlineScript } from "@/lib/consent/consent-defaults-script";

describe("buildConsentDefaultsInlineScript", () => {
  it("denies analytics globally until Accept (policy A)", () => {
    const script = buildConsentDefaultsInlineScript();
    expect(script).toContain("analytics_storage: 'denied'");
    expect(script).not.toContain("analytics_storage: 'granted'");
    expect(script).toContain("wait_for_update: 2000");
    expect(script).not.toContain("region:");
  });

  it("keeps ads storage denied", () => {
    const script = buildConsentDefaultsInlineScript();
    expect(script).toContain("ad_storage: 'denied'");
    expect(script).toContain("ad_user_data: 'denied'");
    expect(script).toContain("ad_personalization: 'denied'");
  });
});
