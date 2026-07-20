import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import type { AnalyticsEventName } from "@/lib/analytics/events";
import type { EnrichedTrail } from "@/types/trails";

type TrailCardProps = {
  trail: EnrichedTrail;
  location?: "start" | "index" | "related";
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

  const inner = (
    <>
      <p className="text-xs uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
      <h3 className="mt-3 font-display text-xl font-medium leading-snug tracking-tight text-fg md:text-2xl">
        {trail.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{trail.summary}</p>
      <p className="mt-4 text-xs text-muted">
        {stopCount} stops · ~{minutes} min
      </p>
      <span className="mt-6 text-xs uppercase tracking-[0.2em] text-accent transition-colors group-hover:text-fg">
        Follow this trail →
      </span>
    </>
  );

  const className =
    "group flex h-full flex-col border border-border/50 bg-bg-elevated/40 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-accent/40 hover:bg-bg-elevated/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  if (analytics) {
    return (
      <TrackedLink
        href={href}
        className={className}
        data-trail-id={trail.id}
        data-trail-location={location}
        analytics={analytics}
      >
        {inner}
      </TrackedLink>
    );
  }

  return (
    <Link href={href} className={className} data-trail-id={trail.id} data-trail-location={location}>
      {inner}
    </Link>
  );
}
