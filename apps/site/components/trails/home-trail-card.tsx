import Image from "next/image";

import { TrackedLink } from "@/components/analytics/tracked-link";
import type { EnrichedTrail } from "@/types/trails";

const trailVisualSrc = "/images/home/reading-trails.webp";

type HomeTrailCardProps = {
  trail: EnrichedTrail;
  /** Index used to vary image focal point slightly across the scroller. */
  index?: number;
};

/**
 * Compact image-led trail card for the homepage (mobile scroller + desktop grid).
 */
export function HomeTrailCard({ trail, index = 0 }: HomeTrailCardProps) {
  const stopCount = trail.pathStopsEnriched.length;
  const minutes = trail.totalEstimatedMinutes;
  const href = `/trails/${trail.slug}`;
  const isUpcoming = trail.status === "upcoming";
  const objectPositions = ["object-[center_40%]", "object-[center_55%]", "object-[center_30%]"];
  const objectPosition = objectPositions[index % objectPositions.length];

  return (
    <TrackedLink
      href={href}
      className="group flex h-full w-[min(72vw,240px)] shrink-0 flex-col overflow-hidden border border-border/50 bg-bg-elevated/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:w-auto md:min-w-0"
      data-trail-id={trail.id}
      data-trail-location="home"
      data-trail-status={trail.status}
      data-home-trail-card
      analytics={{
        event: "trail_select",
        params: { trail_id: trail.id, location: "home" },
      }}
    >
      <div className="relative aspect-[16/10] w-full bg-bg-elevated/60">
        <Image
          src={trailVisualSrc}
          alt=""
          fill
          className={`object-cover ${objectPosition}`}
          sizes="(max-width: 640px) 72vw, 280px"
        />
      </div>
      <div className="flex flex-1 flex-col px-3.5 py-3 md:px-4 md:py-4">
        <div className="flex flex-wrap items-center gap-2">
          {isUpcoming ? (
            <span className="rounded-sm border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">
              Upcoming
            </span>
          ) : null}
        </div>
        <h3 className="font-display text-base font-medium leading-snug tracking-tight text-fg md:text-lg">
          {trail.title}
        </h3>
        <p className="mt-1.5 text-xs text-muted">
          {stopCount} stops · ~{minutes} min
        </p>
        <span className="mt-2 text-[10px] uppercase tracking-[0.2em] text-accent transition-colors group-hover:text-fg md:mt-3 md:text-xs">
          {isUpcoming ? "Preview →" : "Follow →"}
        </span>
      </div>
    </TrackedLink>
  );
}
