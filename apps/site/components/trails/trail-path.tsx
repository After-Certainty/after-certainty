"use client";

import { PathStopList } from "@/components/paths/path-stop-list";
import type { EnrichedPathStop } from "@/types/paths";

type TrailPathProps = {
  stops: EnrichedPathStop[];
  trailId: string;
};

export function TrailPath({ stops, trailId }: TrailPathProps) {
  return (
    <PathStopList
      stops={stops}
      ownerType="trail"
      ownerId={trailId}
      showOptionalBadge
      showBookStatusBadge
      getStopAnalytics={(stopIndex, stop) => ({
        event: "trail_stop_open",
        params: {
          trail_id: trailId,
          stop_position: stopIndex,
          entity_type: stop.entityType,
          optional: Boolean(stop.optional),
        },
      })}
    />
  );
}
