import Image from "next/image";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { resolveHomeTrailImage } from "@/lib/trails/home-trail-images";
import type { EnrichedTrail } from "@/types/trails";

type HomeTrailCardProps = {
  trail: EnrichedTrail;
};

/**
 * Compact image-led trail card for the homepage (mobile scroller + desktop grid).
 * Uses dedicated landscape art per trail — never composite mockup screenshots.
 */
export function HomeTrailCard({ trail }: HomeTrailCardProps) {
  const stopCount = trail.pathStopsEnriched.length;
  const minutes = trail.totalEstimatedMinutes;
  const href = `/trails/${trail.slug}`;
  const isUpcoming = trail.status === "upcoming";
  const { src, objectPosition } = resolveHomeTrailImage(trail.slug);

  return (
    <TrackedLink
      href={href}
      className="group flex h-full w-[min(76vw,18.5rem)] shrink-0 flex-col overflow-hidden border border-border/50 bg-bg-elevated/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:w-auto md:min-w-0"
      data-trail-id={trail.id}
      data-trail-location="home"
      data-trail-status={trail.status}
      data-home-trail-card
      data-trail-image={trail.slug}
      analytics={{
        event: "trail_select",
        params: { trail_id: trail.id, location: "home" },
      }}
    >
      <div className="relative aspect-[16/9] w-full bg-bg-elevated/60">
        <Image
          src={src}
          alt=""
          fill
          className={`object-cover ${objectPosition}`}
          sizes="(max-width: 768px) 76vw, 280px"
        />
      </div>
      <div className="flex flex-col px-3.5 py-3 md:px-4 md:py-3.5">
        {isUpcoming ? (
          <span className="mb-1.5 w-fit rounded-sm border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">
            Upcoming
          </span>
        ) : null}
        <h3 className="font-display text-base font-medium leading-snug tracking-tight text-fg md:text-lg">
          {trail.title}
        </h3>
        <p className="mt-1 text-xs text-muted">
          {stopCount} stops · ~{minutes} min
        </p>
        <span className="mt-2 text-[10px] uppercase tracking-[0.2em] text-accent transition-colors group-hover:text-fg md:text-xs">
          {isUpcoming ? "Preview →" : "Follow →"}
        </span>
      </div>
    </TrackedLink>
  );
}
