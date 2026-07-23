import Link from "next/link";
import type { Thinker } from "@/types/semanticGraph";
import { ExploreCard } from "@/components/explore/explore-card";
import { explorePaths } from "@/lib/graph/explorePaths";

type ThinkerCardProps = {
  thinker: Thinker;
};

function thinkerTypeLabel(type: Thinker["type"]): string {
  return type === "organization" ? "Organization" : "Person";
}

export function ThinkerCard({ thinker }: ThinkerCardProps) {
  const description = thinker.summary ?? thinker.whyThisMatters;

  return (
    <ExploreCard>
      <Link href={`${explorePaths.thinkers}/${thinker.slug}`} className="block space-y-2">
        <p className="text-[10px] uppercase tracking-[0.28em] text-accent">
          {thinkerTypeLabel(thinker.type)}
        </p>
        <h3 className="font-display text-xl font-medium tracking-tight text-fg transition-colors group-hover:text-accent">
          {thinker.name}
        </h3>
        {description ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </Link>
    </ExploreCard>
  );
}
