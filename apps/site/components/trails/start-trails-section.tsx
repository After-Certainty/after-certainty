import Link from "next/link";
import { TrailCard } from "@/components/trails/trail-card";
import { TrailSectionAnalytics } from "@/components/trails/trail-section-analytics";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getEnrichedFeaturedTrails } from "@/lib/trails/getEnrichedTrails";

export async function StartTrailsSection() {
  const trails = await getEnrichedFeaturedTrails(3);

  if (trails.length === 0) return null;

  return (
    <Section
      atmosphere="none"
      className="border-b border-border/35 bg-bg-elevated/[0.06] py-24 md:py-32"
    >
      <TrailSectionAnalytics location="start" />
      <Container>
        <h2 className="max-w-xl font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">
          Follow a reading trail
        </h2>
        <p className="mt-5 max-w-2xl text-muted">
          Curated trails offer a reusable sequence through the commons—without the question framing
          of Start with a Question, and without the open-ended retrieval of search. Each trail
          explains why its stops belong and how the path progresses.
        </p>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trails.map((trail) => (
            <TrailCard
              key={trail.id}
              trail={trail}
              location="start"
              analytics={{
                event: "trail_select",
                params: { trail_id: trail.id, location: "start" },
              }}
            />
          ))}
        </div>
        <p className="mt-12">
          <Link
            href="/trails"
            className="text-[11px] uppercase tracking-[0.22em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Browse all reading trails →
          </Link>
        </p>
      </Container>
    </Section>
  );
}
