"use client";

import { useEffect, useMemo, useState } from "react";

import { PathStopCard, type PathStopCardAnalytics } from "@/components/paths/path-stop-card";
import {
  clearPathProgress,
  getPathProgress,
  recordPathStopVisit,
  type PathOwnerType,
} from "@/lib/paths/pathProgress";
import type { EnrichedPathStop } from "@/types/paths";

type PathStopListProps = {
  stops: EnrichedPathStop[];
  ownerType: PathOwnerType;
  ownerId: string;
  showOptionalBadge?: boolean;
  showBookStatusBadge?: boolean;
  getStopAnalytics: (stopIndex: number, stop: EnrichedPathStop) => PathStopCardAnalytics;
};

export function PathStopList({
  stops,
  ownerType,
  ownerId,
  showOptionalBadge = false,
  showBookStatusBadge = false,
  getStopAnalytics,
}: PathStopListProps) {
  const sortedStops = useMemo(() => [...stops].sort((a, b) => a.position - b.position), [stops]);
  const totalStops = sortedStops.length;
  const [lastStopPosition, setLastStopPosition] = useState<number | null>(
    () => getPathProgress(ownerType, ownerId)?.lastStopPosition ?? null,
  );
  const [completed, setCompleted] = useState(() =>
    Boolean(getPathProgress(ownerType, ownerId)?.completed),
  );

  const resumePosition =
    lastStopPosition != null
      ? (sortedStops.find((stop) => stop.position > lastStopPosition)?.position ??
        (completed ? null : (sortedStops[0]?.position ?? null)))
      : null;

  return (
    <div className="mt-10">
      {lastStopPosition != null ? (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-sm border border-border/50 bg-bg-elevated/30 px-4 py-3 text-sm text-muted">
          <p>
            {completed
              ? "You previously finished this path."
              : `You left off after stop ${lastStopPosition}.`}
          </p>
          {!completed && resumePosition != null ? (
            <a
              href={`#stop-${resumePosition}`}
              className="text-accent underline-offset-4 hover:underline"
            >
              Continue from stop {sortedStops.findIndex((s) => s.position === resumePosition) + 1}
            </a>
          ) : null}
          <button
            type="button"
            className="text-xs uppercase tracking-[0.18em] text-muted underline-offset-4 hover:text-accent hover:underline"
            onClick={() => {
              clearPathProgress(ownerType, ownerId);
              setLastStopPosition(null);
              setCompleted(false);
            }}
          >
            Clear progress
          </button>
        </div>
      ) : null}
      <ol className="list-none space-y-5 p-0">
        {sortedStops.map((stop, index) => {
          const stopIndex = index + 1;
          const visited = lastStopPosition != null && stop.position <= lastStopPosition;
          const current = resumePosition === stop.position;
          return (
            <PathStopCard
              key={`${stop.position}-${stop.resolvedEntityId}`}
              anchorId={`stop-${stop.position}`}
              stop={stop}
              stopIndex={stopIndex}
              totalStops={totalStops}
              showOptionalBadge={showOptionalBadge}
              showBookStatusBadge={showBookStatusBadge}
              visited={visited}
              current={current}
              analytics={getStopAnalytics(stopIndex, stop)}
              onStopOpen={() => {
                const entry = recordPathStopVisit({
                  ownerType,
                  ownerId,
                  stopPosition: stop.position,
                  totalStops,
                });
                setLastStopPosition(entry.lastStopPosition);
                setCompleted(Boolean(entry.completed));
              }}
            />
          );
        })}
      </ol>
    </div>
  );
}
