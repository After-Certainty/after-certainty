import Link from "next/link";

import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { exploreSecondaryButtonClass } from "@/components/explore/explore-action-buttons";
import { Container } from "@/components/ui/container";
import { explorePaths } from "@/lib/graph/explorePaths";

type ListenHeroProps = {
  countLabel?: string;
};

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
      <Container className="relative z-10 -mt-1 max-w-4xl pb-3 md:-mt-4 md:pb-8">
        {/* Desktop: keep the fuller semantic-map context. Mobile: one clear path. */}
        <p className="hidden text-sm text-muted md:block">
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
        <div className="md:hidden">
          <Link href={explorePaths.songs} className={exploreSecondaryButtonClass}>
            Explore songs →
          </Link>
        </div>
      </Container>
    </div>
  );
}
