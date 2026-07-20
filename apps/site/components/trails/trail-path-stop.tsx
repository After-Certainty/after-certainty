import { TrackedLink } from "@/components/analytics/tracked-link";
import type { EnrichedPathStop } from "@/types/paths";

type TrailPathStopProps = {
  stop: EnrichedPathStop;
  trailId: string;
  stopIndex: number;
  totalStops: number;
};

function bookStatusLabel(status: EnrichedPathStop["bookStatus"]): string | null {
  if (!status || status === "published") return null;
  if (status === "forthcoming") return "Forthcoming";
  if (status === "draft" || status === "in_progress") return "In progress";
  return null;
}

export function TrailPathStop({ stop, trailId, stopIndex, totalStops }: TrailPathStopProps) {
  const linkLabel = stop.external
    ? `Open ${stop.title} (${stop.entityTypeLabel}, opens external site)`
    : `Open ${stop.title} (${stop.entityTypeLabel})`;

  const statusLabel = stop.entityType === "book" ? bookStatusLabel(stop.bookStatus) : null;

  return (
    <li className="border border-border/50 bg-bg-elevated/25 p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          Stop {stopIndex} of {totalStops}
        </p>
        {stop.optional ? (
          <span className="rounded-sm border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">
            Optional
          </span>
        ) : null}
        {statusLabel ? (
          <span className="rounded-sm border border-accent/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-accent">
            {statusLabel}
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
          analytics={{
            event: "trail_stop_open",
            params: {
              trail_id: trailId,
              stop_position: stopIndex,
              entity_type: stop.entityType,
              optional: Boolean(stop.optional),
            },
          }}
        >
          {linkLabel} →
        </TrackedLink>
      </div>
    </li>
  );
}
