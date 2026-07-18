import Link from "next/link";
import type { Source } from "@/types/semanticGraph";
import { ExploreCard } from "@/components/explore/explore-card";
import { explorePaths } from "@/lib/graph/explorePaths";
import {
  sourceDisplayBody,
  sourceDisplayLabel,
  sourceDisplayTitle,
} from "@/lib/graph/sourceDisplay";

type SourceCardProps = {
  source: Source;
};

export function SourceCard({ source }: SourceCardProps) {
  const title = sourceDisplayTitle(source);
  const label = sourceDisplayLabel(source);
  const body = sourceDisplayBody(source);

  return (
    <ExploreCard>
      <Link href={`${explorePaths.sources}/${source.slug}`} className="block space-y-2">
        <p className="text-[10px] uppercase tracking-[0.28em] text-accent">{label}</p>
        <h3 className="break-words font-display text-xl font-medium tracking-tight text-fg transition-colors group-hover:text-accent">
          {title}
        </h3>
        {body ? (
          <p className="line-clamp-3 break-all text-sm leading-relaxed text-muted">{body}</p>
        ) : null}
      </Link>
    </ExploreCard>
  );
}
