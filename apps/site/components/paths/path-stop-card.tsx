"use client";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { bookStatusLabel, buildPathStopLinkLabel } from "@/lib/paths/pathStopUi";
import type { AnalyticsEventName } from "@/lib/analytics/events";
import type { EnrichedPathStop } from "@/types/paths";

export type PathStopCardAnalytics = {
  event: AnalyticsEventName;
  params?: Record<string, string | number | boolean | undefined>;
};

type PathStopCardProps = {
  stop: EnrichedPathStop;
  stopIndex: number;
  totalStops: number;
  anchorId?: string;
  showOptionalBadge?: boolean;
  showBookStatusBadge?: boolean;
  visited?: boolean;
  current?: boolean;
  analytics: PathStopCardAnalytics;
  onStopOpen?: () => void;
};

export function PathStopCard({
  stop,
  stopIndex,
  totalStops,
  anchorId,
  showOptionalBadge = false,
  showBookStatusBadge = false,
  visited = false,
  current = false,
  analytics,
  onStopOpen,
}: PathStopCardProps) {
  const linkLabel = buildPathStopLinkLabel(stop);
  const statusLabel = showBookStatusBadge ? bookStatusLabel(stop.bookStatus) : null;

  return (
    <li
      id={anchorId}
      className={[
        "border border-border/50 bg-bg-elevated/25 p-6 md:p-8",
        current ? "border-accent/40 ring-1 ring-accent/20" : "",
        visited && !current ? "border-border/35 bg-bg-elevated/15" : "",
      ].join(" ")}
      data-stop-position={stop.position}
      data-stop-visited={visited ? "true" : "false"}
      data-stop-current={current ? "true" : "false"}
    >
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          Stop {stopIndex} of {totalStops}
        </p>
        {showOptionalBadge && stop.optional ? (
          <span className="rounded-sm border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">
            Optional
          </span>
        ) : null}
        {statusLabel ? (
          <span className="rounded-sm border border-accent/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-accent">
            {statusLabel}
          </span>
        ) : null}
        {visited ? (
          <span className="rounded-sm border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">
            Visited
          </span>
        ) : null}
        {current ? (
          <span className="rounded-sm border border-accent/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-accent">
            Continue here
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-accent">
        {stop.entityTypeLabel}
      </p>
      {stop.fictionDoorway ? (
        <p className="mt-2 text-xs italic text-muted">A fiction doorway — story, not proof</p>
      ) : null}
      <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-fg">
        {stop.title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted">{stop.description}</p>
      {stop.whyThisFollows ? (
        <p className="mt-4 text-sm leading-relaxed text-fg/85">
          <span className="font-medium text-fg">Why this follows: </span>
          {stop.whyThisFollows}
        </p>
      ) : null}
      {stop.excerpt ? (
        <blockquote className="mt-4 border-l-2 border-accent/40 pl-4 text-sm italic text-muted">
          {stop.excerpt}
        </blockquote>
      ) : null}
      <p className="mt-4 text-xs text-muted">~{stop.estimatedMinutes} min</p>
      <div className="mt-6">
        <TrackedLink
          href={stop.href}
          className="inline-flex min-h-11 items-center text-sm uppercase tracking-[0.18em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          {...(stop.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          analytics={analytics}
          onClick={onStopOpen}
        >
          {linkLabel} →
        </TrackedLink>
      </div>
    </li>
  );
}
