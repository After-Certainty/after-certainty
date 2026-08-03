import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import type { AnalyticsEventName } from "@/lib/analytics/events";
import type { EnrichedTrail } from "@/types/trails";

type TrailCardProps = {
  trail: EnrichedTrail;
  location?: "home" | "start" | "index" | "related";
  analytics?: {
    event: AnalyticsEventName;
    params?: Record<string, string | number | boolean | undefined>;
  };
};

export function TrailCard({ trail, location = "index", analytics }: TrailCardProps) {
  const theme = trail.themes[0] ?? "Trail";
  const stopCount = trail.pathStopsEnriched.length;
  const minutes = trail.totalEstimatedMinutes;
  const href = `/trails/${trail.slug}`;
  const eyebrow = trail.audience ?? theme;
  const isUpcoming = trail.status === "upcoming";

  const inner = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
        {isUpcoming ? (
          <span className="rounded-sm border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">
            Upcoming
          </span>
        ) : null}
      </div>
      <h3 className="mt-2 font-display text-xl font-medium leading-snug tracking-tight text-fg md:mt-3 md:text-2xl">
        {trail.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted md:mt-3">{trail.summary}</p>
      <p className="mt-3 text-xs text-muted md:mt-4">
        {stopCount} stops · ~{minutes} min
      </p>
      <span className="mt-4 text-xs uppercase tracking-[0.2em] text-accent transition-colors group-hover:text-fg md:mt-6">
        {isUpcoming ? "Preview this trail →" : "Follow this trail →"}
      </span>
    </>
  );

  const className =
    "group flex h-full flex-col border border-border/50 bg-bg-elevated/40 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-accent/40 hover:bg-bg-elevated/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:p-5";

  if (analytics) {
    return (
      <TrackedLink
        href={href}
        className={className}
        data-trail-id={trail.id}
        data-trail-location={location}
        data-trail-status={trail.status}
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
      data-trail-id={trail.id}
      data-trail-location={location}
      data-trail-status={trail.status}
    >
      {inner}
    </Link>
  );
}
