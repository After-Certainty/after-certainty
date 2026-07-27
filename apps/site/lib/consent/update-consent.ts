import { getConsent } from "@/lib/consent/storage";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    /** Guards duplicate consented page_view after Accept on the same document. */
    __acConsentedPageViewSent?: boolean;
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

/**
 * After the user Accepts, send one explicit page_view so the landing hit is counted
 * under granted consent (gtag may have loaded while storage was still denied).
 */
export function sendConsentedPageViewOnce(): void {
  if (typeof window === "undefined") return;
  if (window.__acConsentedPageViewSent) return;
  if (typeof window.gtag !== "function") return;

  window.__acConsentedPageViewSent = true;
  window.gtag("event", "page_view", {
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}`,
    page_title: document.title,
  });
}

/** Apply consent update once `gtag` exists (GoogleAnalytics loads after hydration). */
export function updateAnalyticsConsent(granted: boolean, options?: { sendPageView?: boolean }): void {
  if (typeof window === "undefined") return;

  const payload = consentUpdatePayload(granted);
  const sendPageView = Boolean(options?.sendPageView && granted);
  let attempt = 0;

  const tryApply = () => {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", payload);
      if (sendPageView) {
        sendConsentedPageViewOnce();
      }
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
    // Return visits already had a page_view under granted consent via gtag config — do not resend.
    updateAnalyticsConsent(true);
  } else if (stored === "denied") {
    updateAnalyticsConsent(false);
  }
}
