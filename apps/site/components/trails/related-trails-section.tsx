import Link from "next/link";

import { TrailCard } from "@/components/trails/trail-card";
import { Section } from "@/components/ui/section";
import { getEnrichedTrailsForEntity } from "@/lib/trails/getEnrichedTrailsForEntity";

type RelatedTrailsSectionProps = {
  canonicalId: string;
  entityLabel: string;
};

export async function RelatedTrailsSection({
  canonicalId,
  entityLabel,
}: RelatedTrailsSectionProps) {
  const trails = await getEnrichedTrailsForEntity({ canonicalId, limit: 3 });

  if (trails.length === 0) return null;

  return (
    <Section
      atmosphere="transition"
      className="border-t border-border/25 !pt-8 md:!pt-10 !pb-8 md:!pb-10"
    >
      <section aria-label="Related reading trails" className="flex flex-col gap-6">
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
            Reading trails featuring this {entityLabel}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Editorial paths that include this {entityLabel} as one stop in a longer sequence.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trails.map((trail) => (
            <TrailCard
              key={trail.id}
              trail={trail}
              location="related"
              analytics={{
                event: "trail_select",
                params: { trail_id: trail.id, location: "entity_related" },
              }}
            />
          ))}
        </div>
        <p className="text-sm">
          <Link href="/trails" className="text-accent underline-offset-4 hover:underline">
            Browse all reading trails
          </Link>
        </p>
      </section>
    </Section>
  );
}
