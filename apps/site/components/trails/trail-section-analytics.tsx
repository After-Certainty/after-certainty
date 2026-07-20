"use client";

import { useEffect } from "react";

import { trackTrailIndexView } from "@/lib/analytics/track";

type TrailSectionAnalyticsProps = {
  location: "home" | "start" | "index";
};

export function TrailSectionAnalytics({ location }: TrailSectionAnalyticsProps) {
  useEffect(() => {
    trackTrailIndexView({ location });
  }, [location]);

  return null;
}
