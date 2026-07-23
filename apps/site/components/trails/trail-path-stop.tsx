"use client";

import { PathStopCard } from "@/components/paths/path-stop-card";
import type { EnrichedPathStop } from "@/types/paths";

type TrailPathStopProps = {
  stop: EnrichedPathStop;
  trailId: string;
  stopIndex: number;
  totalStops: number;
};

/** @deprecated Prefer TrailPath, which uses the shared PathStopList. */
export function TrailPathStop({ stop, trailId, stopIndex, totalStops }: TrailPathStopProps) {
  return (
    <PathStopCard
      stop={stop}
      stopIndex={stopIndex}
      totalStops={totalStops}
      showOptionalBadge
      showBookStatusBadge
      analytics={{
        event: "trail_stop_open",
        params: {
          trail_id: trailId,
          stop_position: stopIndex,
          entity_type: stop.entityType,
          optional: Boolean(stop.optional),
        },
      }}
    />
  );
}
