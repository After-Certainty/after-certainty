import Link from "next/link";
import type { Pattern } from "@/types/semanticGraph";
import { ExploreCard } from "@/components/explore/explore-card";
import { explorePaths } from "@/lib/graph/explorePaths";

type PatternCardProps = {
  pattern: Pattern;
};

export function PatternCard({ pattern }: PatternCardProps) {
  return (
    <ExploreCard>
      <Link href={`${explorePaths.patterns}/${pattern.slug}`} className="block space-y-2">
        <p className="text-[10px] uppercase tracking-[0.28em] text-accent">Pattern</p>
        <h3 className="font-display text-xl font-medium tracking-tight text-fg transition-colors group-hover:text-accent">
          {pattern.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{pattern.summary}</p>
      </Link>
    </ExploreCard>
  );
}
