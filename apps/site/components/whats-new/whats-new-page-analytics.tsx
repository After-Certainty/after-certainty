"use client";

import { useEffect } from "react";

import { AnalyticsEvents } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/track";
import type { WhatsNewFilter } from "@/lib/whats-new/url-state";

type WhatsNewPageAnalyticsProps = {
  filter: WhatsNewFilter;
  resultCount: number;
};

export function WhatsNewPageAnalytics({ filter, resultCount }: WhatsNewPageAnalyticsProps) {
  useEffect(() => {
    trackEvent(AnalyticsEvents.whatsNewView, {
      filter,
      result_count: resultCount,
    });
    if (filter !== "all") {
      trackEvent(AnalyticsEvents.whatsNewFilter, { filter });
    }
  }, [filter, resultCount]);

  return null;
}
