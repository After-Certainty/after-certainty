import { describe, expect, it } from "vitest";

import { REGULATED_CONSENT_REGIONS } from "@/lib/consent/constants";
import { buildConsentDefaultsInlineScript } from "@/lib/consent/consent-defaults-script";

describe("buildConsentDefaultsInlineScript", () => {
  it("denies analytics in regulated regions before granting elsewhere", () => {
    const script = buildConsentDefaultsInlineScript();
    const deniedIdx = script.indexOf("analytics_storage: 'denied'");
    const grantedIdx = script.indexOf("analytics_storage: 'granted'");
    expect(deniedIdx).toBeGreaterThan(-1);
    expect(grantedIdx).toBeGreaterThan(deniedIdx);
    expect(script).toContain(`region: ${JSON.stringify([...REGULATED_CONSENT_REGIONS])}`);
  });
});
