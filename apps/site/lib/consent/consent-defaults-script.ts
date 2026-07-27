/**
 * Inline script: Consent Mode defaults — analytics denied globally until Accept.
 * Must run before gtag.js. Matches cookie banner + privacy copy ("off until you choose").
 */
export function buildConsentDefaultsInlineScript(): string {
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 2000
    });
  `.trim();
}
