import Link from "next/link";
import type { Source } from "@/types/semanticGraph";
import { ExploreCard } from "@/components/explore/explore-card";
import { explorePaths } from "@/lib/graph/explorePaths";

type SourceCardProps = {
  source: Source;
};

export function SourceCard({ source }: SourceCardProps) {
  return (
    <ExploreCard>
      <Link href={`${explorePaths.sources}/${source.slug}`} className="block space-y-2">
        <p className="text-[10px] uppercase tracking-[0.28em] text-accent">{source.type}</p>
        <h3 className="font-display text-xl font-medium tracking-tight text-fg transition-colors group-hover:text-accent">
          {source.name}
        </h3>
        {source.summary ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted">{source.summary}</p>
        ) : null}
      </Link>
    </ExploreCard>
  );
}
