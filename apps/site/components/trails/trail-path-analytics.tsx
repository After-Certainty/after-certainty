"use client";

import { useEffect } from "react";

import { trackReaderEvent } from "@/lib/analytics/reader";

type TrailPathAnalyticsProps = {
  trailId: string;
};

export function TrailPathAnalytics({ trailId }: TrailPathAnalyticsProps) {
  useEffect(() => {
    trackReaderEvent({
      name: "reading_path_started",
      properties: { path_kind: "trail", path_id: trailId },
    });
  }, [trailId]);

  return null;
}
