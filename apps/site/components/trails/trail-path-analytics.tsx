"use client";

import { useEffect } from "react";

import { trackTrailPathStart } from "@/lib/analytics/track";

type TrailPathAnalyticsProps = {
  trailId: string;
};

export function TrailPathAnalytics({ trailId }: TrailPathAnalyticsProps) {
  useEffect(() => {
    trackTrailPathStart({ trail_id: trailId });
  }, [trailId]);

  return null;
}
