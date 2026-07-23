import Link from "next/link";

import { TrailCard } from "@/components/trails/trail-card";
import type { EnrichedTrail } from "@/types/trails";

type CuratedTrailsCalloutProps = {
  trails: EnrichedTrail[];
};

export function CuratedTrailsCallout({ trails }: CuratedTrailsCalloutProps) {
  if (trails.length === 0) return null;

  return (
    <section
      aria-label="Curated reading trails"
      className="mb-10 rounded-sm border border-accent/25 bg-bg-elevated/30 p-6 md:p-8"
    >
      <h2 className="font-display text-xl font-medium tracking-tight text-fg md:text-2xl">
        Curated reading trails
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        These editorial sequences may fit your search better than scanning many individual results.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {trails.map((trail) => (
          <TrailCard
            key={trail.id}
            trail={trail}
            location="index"
            analytics={{
              event: "trail_select",
              params: { trail_id: trail.id, location: "search" },
            }}
          />
        ))}
      </div>
      <p className="mt-6 text-sm">
        <Link href="/trails" className="text-accent underline-offset-4 hover:underline">
          Browse all reading trails
        </Link>
      </p>
    </section>
  );
}
