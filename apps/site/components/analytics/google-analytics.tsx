import { GoogleAnalytics } from "@next/third-parties/google";

import { resolveGaMeasurementId } from "@/lib/site-config";

/** Loads GA4 in production when a measurement ID is configured (Consent Mode defaults must load first). */
export function GoogleAnalyticsLoader() {
  if (process.env.NODE_ENV !== "production") return null;

  const gaId = resolveGaMeasurementId();
  if (!gaId) return null;

  return <GoogleAnalytics gaId={gaId} />;
}
