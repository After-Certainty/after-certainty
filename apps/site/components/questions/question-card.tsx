import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import type { AnalyticsEventName } from "@/lib/analytics/events";
import type { EnrichedQuestion } from "@/types/questions";

type QuestionCardProps = {
  question: EnrichedQuestion;
  location?: "home" | "start" | "index" | "related";
  /** Compact row for homepage featured list (no summary paragraph). */
  density?: "default" | "compact";
  analytics?: {
    event: AnalyticsEventName;
    params?: Record<string, string | number | boolean | undefined>;
  };
};

export function QuestionCard({
  question,
  location = "index",
  density = "default",
  analytics,
}: QuestionCardProps) {
  const family = question.families[0] ?? "Question";
  const stopCount = question.pathStopsEnriched.length;
  const minutes = question.totalEstimatedMinutes;
  const href = `/questions/${question.slug}`;
  const compact = density === "compact";

  const inner = compact ? (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.22em] text-accent">{family}</p>
        <h3 className="mt-1 font-display text-lg font-medium leading-snug tracking-tight text-fg md:text-xl">
          {question.shortLabel ?? question.question}
        </h3>
        <p className="mt-1.5 text-xs text-muted">
          {stopCount} stops · ~{minutes} min
        </p>
      </div>
      <span
        className="ml-3 shrink-0 self-center text-accent transition-colors group-hover:text-fg"
        aria-hidden
      >
        →
      </span>
    </>
  ) : (
    <>
      <p className="text-xs uppercase tracking-[0.22em] text-accent">{family}</p>
      <h3 className="mt-2 font-display text-xl font-medium leading-snug tracking-tight text-fg md:mt-3 md:text-2xl">
        {question.shortLabel ?? question.question}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted md:mt-3">{question.summary}</p>
      <p className="mt-3 text-xs text-muted md:mt-4">
        {stopCount} stops · ~{minutes} min
      </p>
      <span className="mt-4 text-xs uppercase tracking-[0.2em] text-accent transition-colors group-hover:text-fg md:mt-6">
        Follow this question →
      </span>
    </>
  );

  const className = compact
    ? "group flex min-h-11 items-start gap-2 border border-border/50 bg-bg-elevated/40 px-4 py-3.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-accent/40 hover:bg-bg-elevated/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:px-5 md:py-4"
    : "group flex h-full flex-col border border-border/50 bg-bg-elevated/40 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-accent/40 hover:bg-bg-elevated/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:p-5";

  if (analytics) {
    return (
      <TrackedLink
        href={href}
        className={className}
        data-question-id={question.id}
        data-question-location={location}
        data-question-density={density}
        analytics={analytics}
      >
        {inner}
      </TrackedLink>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      data-question-id={question.id}
      data-question-location={location}
      data-question-density={density}
    >
      {inner}
    </Link>
  );
}
