import Link from "next/link";

import { HomeTrailCard } from "@/components/trails/home-trail-card";
import { TrailSectionAnalytics } from "@/components/trails/trail-section-analytics";
import { Container } from "@/components/ui/container";
import { getEnrichedFeaturedTrails } from "@/lib/trails/getEnrichedTrails";

export async function FeaturedTrailsSection() {
  const trails = await getEnrichedFeaturedTrails(3);

  if (trails.length === 0) return null;

  return (
    <section className="border-b border-border/35 bg-bg-elevated/[0.06] py-6 md:py-14">
      <TrailSectionAnalytics location="home" />
      <Container>
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-4xl">
            Follow a reading trail
          </h2>
          <p className="mt-2 text-sm text-muted md:mt-4 md:text-base">
            Curated paths through the commons—short, intentional, and shareable.
          </p>
        </div>

        <div
          className="-mx-6 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:mt-10 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0"
          data-home-trails-scroller
        >
          {trails.map((trail) => (
            <div key={trail.id} className="snap-start md:min-w-0">
              <HomeTrailCard trail={trail} />
            </div>
          ))}
        </div>

        <p className="mt-5 md:mt-10">
          <Link
            href="/trails"
            className="text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:text-sm"
          >
            Browse all reading trails →
          </Link>
        </p>
      </Container>
    </section>
  );
}
