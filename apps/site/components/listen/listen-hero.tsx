import Link from "next/link";

import { ExploreIndexHero } from "@/components/explore/explore-hero";
import { explorePaths } from "@/lib/graph/explorePaths";

type ListenHeroProps = {
  countLabel?: string;
};

const exploreSongsLinkClass =
  "hidden text-sm text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:inline";

/**
 * Listen page intro. Mobile Explore songs CTA lives with the library (above
 * search) so it does not float in an empty band between hero and section.
 * Desktop Explore link sits beside the song count in the hero meta row.
 */
export function ListenHero({ countLabel }: ListenHeroProps) {
  return (
    <ExploreIndexHero
      eyebrow="Listen"
      title="Songs from After Certainty"
      headingId="listen-hero-heading"
      density="editorial"
      mobileTighten
      desktopTighten
      countLabel={countLabel}
      lede="The same questions, carried in another register."
      metaAccessory={
        <Link href={explorePaths.songs} className={exploreSongsLinkClass}>
          Explore songs →
        </Link>
      }
    />
  );
}
