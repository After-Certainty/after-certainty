import Link from "next/link";

import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { Container } from "@/components/ui/container";
import { explorePaths } from "@/lib/graph/explorePaths";

type ListenHeroProps = {
  countLabel?: string;
};

/**
 * Listen page intro. Mobile Explore songs CTA lives with the library (above
 * search) so it does not float in an empty band between hero and section.
 */
export function ListenHero({ countLabel }: ListenHeroProps) {
  return (
    <div className="relative">
      <ExploreIndexHero
        eyebrow="Listen"
        title="Songs from After Certainty"
        headingId="listen-hero-heading"
        density="editorial"
        mobileTighten
        countLabel={countLabel}
        lede="The same questions, carried in another register. Listen to songs that move through uncertainty, trust, meaning, love, systems, perception, and the spaces between them."
      />
      <Container className="relative z-10 hidden max-w-4xl -mt-4 pb-8 md:block">
        <p className="text-sm text-muted">
          Prefer the semantic map?{" "}
          <Link
            href={explorePaths.songs}
            className="text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Explore songs
          </Link>
          {" — "}
          how each composition connects to concepts, patterns, and books.
        </p>
      </Container>
    </div>
  );
}
