"use client";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { MobileDisclosure } from "@/components/ui/mobile-disclosure";
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
  const whyId = `why-follows-${stop.position}-${stop.resolvedEntityId}`;

  return (
    <li
      id={anchorId}
      className={[
        "border border-border/50 bg-bg-elevated/25 px-3.5 py-3.5 md:p-8",
        current ? "border-accent/40 bg-accent-soft/10 ring-1 ring-accent/20" : "",
        visited && !current ? "border-border/35 bg-bg-elevated/15" : "",
      ].join(" ")}
      data-stop-position={stop.position}
      data-stop-visited={visited ? "true" : "false"}
      data-stop-current={current ? "true" : "false"}
      data-path-stop-density="compact"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted md:text-xs md:tracking-[0.22em]">
          Stop {stopIndex} of {totalStops}
          <span className="text-border" aria-hidden>
            {" "}
            ·{" "}
          </span>
          <span className="text-accent">{stop.entityTypeLabel}</span>
        </p>
        {showOptionalBadge && stop.optional ? (
          <span className="rounded-sm border border-border/60 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">
            Optional
          </span>
        ) : null}
        {statusLabel ? (
          <span className="rounded-sm border border-accent/30 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-accent">
            {statusLabel}
          </span>
        ) : null}
        {visited ? (
          <span className="rounded-sm border border-border/60 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">
            Visited
          </span>
        ) : null}
        {current ? (
          <span className="rounded-sm border border-accent/40 bg-accent-soft/30 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-accent">
            Continue here
          </span>
        ) : null}
      </div>
      {stop.fictionDoorway ? (
        <p className="mt-1.5 text-xs italic text-muted">A fiction doorway — story, not proof</p>
      ) : null}
      <h2 className="mt-1.5 font-display text-lg font-medium leading-snug tracking-tight text-fg md:mt-3 md:text-2xl md:leading-tight">
        {stop.title}
      </h2>
      <p className="mt-1.5 text-sm leading-snug text-muted md:mt-4 md:text-base md:leading-relaxed">
        {stop.description}
      </p>
      {stop.whyThisFollows ? (
        <MobileDisclosure
          id={whyId}
          regionLabel="Why this follows"
          alwaysOpenFromMd
          className="mt-2 md:mt-4"
          summaryClassName="flex min-h-9 w-full items-center gap-2 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
          summary={
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
              Why this follows
            </span>
          }
          panelClassName="pt-1.5 md:pt-0"
        >
          <p className="text-sm leading-snug text-fg/85 md:leading-relaxed">
            <span className="hidden font-medium text-fg md:inline">Why this follows: </span>
            {stop.whyThisFollows}
          </p>
        </MobileDisclosure>
      ) : null}
      {stop.excerpt ? (
        <blockquote className="mt-2 border-l-2 border-accent/40 pl-3 text-sm italic leading-snug text-muted md:mt-4 md:pl-4 md:leading-relaxed">
          {stop.excerpt}
        </blockquote>
      ) : null}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 md:mt-6">
        <p className="text-xs text-muted">~{stop.estimatedMinutes} min</p>
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
