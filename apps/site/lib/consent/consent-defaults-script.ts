import { REGULATED_CONSENT_REGIONS } from "@/lib/consent/constants";

/** Inline script: regional + global Consent Mode defaults (must run before gtag.js). */
export function buildConsentDefaultsInlineScript(): string {
  const regionsJson = JSON.stringify([...REGULATED_CONSENT_REGIONS]);
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      region: ${regionsJson}
    });
    gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 2000
    });
  `.trim();
}
