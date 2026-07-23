"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import type { AnalyticsEventName } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/track";

export type LinkAnalytics = {
  event: AnalyticsEventName;
  params?: Record<string, string | number | boolean | undefined>;
};

type TrackedLinkProps = ComponentProps<typeof Link> & {
  analytics?: LinkAnalytics;
};

export function TrackedLink({ analytics, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        if (analytics) {
          trackEvent(analytics.event, analytics.params);
        }
        onClick?.(e);
      }}
    />
  );
}
