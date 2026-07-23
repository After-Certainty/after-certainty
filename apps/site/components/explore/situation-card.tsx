import Link from "next/link";
import type { Situation } from "@/types/semanticGraph";
import { ExploreCard } from "@/components/explore/explore-card";
import { explorePaths } from "@/lib/graph/explorePaths";

type SituationCardProps = {
  situation: Situation;
};

export function SituationCard({ situation }: SituationCardProps) {
  return (
    <ExploreCard>
      <Link href={`${explorePaths.situations}/${situation.slug}`} className="block space-y-2">
        <p className="text-[10px] uppercase tracking-[0.28em] text-accent">Situation</p>
        <h3 className="font-display text-xl font-medium tracking-tight text-fg transition-colors group-hover:text-accent">
          {situation.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{situation.summary}</p>
      </Link>
    </ExploreCard>
  );
}
