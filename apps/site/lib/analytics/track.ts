import { sendGAEvent } from "@next/third-parties/google";

import type {
  AnalyticsEventName,
  SearchNoResultsParams,
  SearchOpenParams,
  SearchQueryParams,
  SearchRefineParams,
  SearchSelectParams,
} from "@/lib/analytics/events";
import { hasAnalyticsConsent } from "@/lib/consent/storage";
import { resolveGaMeasurementId } from "@/lib/site-config";

export function isAnalyticsEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (!resolveGaMeasurementId()) return false;
  if (typeof document !== "undefined" && !hasAnalyticsConsent()) return false;
  return true;
}

export { hasAnalyticsConsent };

export function trackEvent(
  event: AnalyticsEventName,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (!isAnalyticsEnabled()) return;

  const cleaned: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) cleaned[key] = value;
    }
  }

  sendGAEvent("event", event, cleaned);
}

/** Observatory / entity focus — `select_content` for Content explorations. */
export function trackSelectContent(params: {
  content_type: string;
  item_id: string;
  method?: "link" | "canvas";
}): void {
  trackEvent("select_content", params);
}

export function trackOutboundClick(params: {
  link_url: string;
  link_text: string;
  location: string;
  platform?: string;
}): void {
  trackEvent("click", {
    ...params,
    outbound: true,
  });
}

export function trackFileDownload(params: {
  file_extension: string;
  file_name?: string;
  link_url: string;
  content_type?: string;
  item_id?: string;
}): void {
  trackEvent("file_download", params);
}

/** Declarative analytics payload for `TrackedLink` / `CTAButton`. */
export function outboundLinkAnalytics(
  link_url: string,
  link_text: string,
  location: string,
  platform?: string,
): { event: AnalyticsEventName; params: Record<string, string | boolean> } {
  return {
    event: "click",
    params: { link_url, link_text, outbound: true, location, ...(platform ? { platform } : {}) },
  };
}

export function trackSearchOpen(params: SearchOpenParams): void {
  trackEvent("search_open", params);
}

export function trackSearchQuery(params: SearchQueryParams): void {
  trackEvent("search_query", params);
}

export function trackSearchSelect(params: SearchSelectParams): void {
  trackEvent("search_select", params);
}

export function trackSearchRefine(params: SearchRefineParams): void {
  trackEvent("search_refine", params);
}

export function trackSearchNoResults(params: SearchNoResultsParams): void {
  trackEvent("search_no_results", params);
}

export function trackSearchExpand(): void {
  trackEvent("search_expand");
}
