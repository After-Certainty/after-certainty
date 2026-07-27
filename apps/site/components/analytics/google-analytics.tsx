"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect } from "react";

import { syncStoredConsentToGtag } from "@/lib/consent/update-consent";
import { resolveGaMeasurementId, shouldLoadGoogleAnalytics } from "@/lib/site-config";

type GoogleAnalyticsLoaderProps = {
  gaId: string;
};

function GoogleAnalyticsWithConsentSync({ gaId }: GoogleAnalyticsLoaderProps) {
  useEffect(() => {
    syncStoredConsentToGtag();
  }, []);

  return <GoogleAnalytics gaId={gaId} />;
}

/**
 * Loads GA4 in production Vercel (or local production builds) when a measurement ID is configured.
 * Consent Mode defaults must load first in `<head>`. Preview deploys are off unless opted in.
 */
export function GoogleAnalyticsLoader() {
  if (!shouldLoadGoogleAnalytics()) return null;

  const gaId = resolveGaMeasurementId();
  if (!gaId) return null;

  return <GoogleAnalyticsWithConsentSync gaId={gaId} />;
}
