"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect } from "react";

import { syncStoredConsentToGtag } from "@/lib/consent/update-consent";
import { resolveGaMeasurementId } from "@/lib/site-config";

type GoogleAnalyticsLoaderProps = {
  gaId: string;
};

function GoogleAnalyticsWithConsentSync({ gaId }: GoogleAnalyticsLoaderProps) {
  useEffect(() => {
    syncStoredConsentToGtag();
  }, []);

  return <GoogleAnalytics gaId={gaId} />;
}

/** Loads GA4 in production when a measurement ID is configured (Consent Mode defaults must load first). */
export function GoogleAnalyticsLoader() {
  if (process.env.NODE_ENV !== "production") return null;

  const gaId = resolveGaMeasurementId();
  if (!gaId) return null;

  return <GoogleAnalyticsWithConsentSync gaId={gaId} />;
}
