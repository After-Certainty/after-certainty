declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Sync Google Consent Mode v2 with the user's analytics choice. */
export function updateAnalyticsConsent(granted: boolean): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const state = granted ? "granted" : "denied";

  window.gtag("consent", "update", {
    analytics_storage: state,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}
