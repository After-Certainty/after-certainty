import { TrackedLink } from "@/components/analytics/tracked-link";
import type { EnrichedPathStop } from "@/types/questions";

type QuestionPathStopProps = {
  stop: EnrichedPathStop;
  questionId: string;
  stopIndex: number;
  totalStops: number;
};

export function QuestionPathStop({
  stop,
  questionId,
  stopIndex,
  totalStops,
}: QuestionPathStopProps) {
  const linkLabel = stop.external
    ? `Open ${stop.title} (${stop.entityTypeLabel}, opens external site)`
    : `Open ${stop.title} (${stop.entityTypeLabel})`;

  return (
    <li className="border border-border/50 bg-bg-elevated/25 p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">
        Stop {stopIndex} of {totalStops}
      </p>
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
            event: "question_stop_open",
            params: {
              question_id: questionId,
              stop_position: stopIndex,
              entity_type: stop.entityType,
            },
          }}
        >
          {linkLabel} →
        </TrackedLink>
      </div>
    </li>
  );
}
