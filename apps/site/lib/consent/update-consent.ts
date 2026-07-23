import { getConsent } from "@/lib/consent/storage";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GTAG_RETRY_MS = 100;
const GTAG_MAX_ATTEMPTS = 50;

function consentUpdatePayload(granted: boolean) {
  const state = granted ? "granted" : "denied";
  return {
    analytics_storage: state,
    ad_storage: "denied" as const,
    ad_user_data: "denied" as const,
    ad_personalization: "denied" as const,
  };
}

/** Apply consent update once `gtag` exists (GoogleAnalytics loads after hydration). */
export function updateAnalyticsConsent(granted: boolean): void {
  if (typeof window === "undefined") return;

  const payload = consentUpdatePayload(granted);
  let attempt = 0;

  const tryApply = () => {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", payload);
      return;
    }
    attempt += 1;
    if (attempt < GTAG_MAX_ATTEMPTS) {
      window.setTimeout(tryApply, GTAG_RETRY_MS);
    }
  };

  tryApply();
}

/** Re-apply stored cookie choice after gtag.js loads (fixes race on return visits). */
export function syncStoredConsentToGtag(): void {
  const stored = getConsent();
  if (stored === "granted") {
    updateAnalyticsConsent(true);
  } else if (stored === "denied") {
    updateAnalyticsConsent(false);
  }
}
