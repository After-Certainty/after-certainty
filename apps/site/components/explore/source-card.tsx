import type { Source } from "@/types/semanticGraph";
import {
  ExploreCatalogCard,
  type ExploreCatalogCardLayout,
} from "@/components/explore/explore-catalog-card";
import { explorePaths } from "@/lib/graph/explorePaths";
import {
  sourceDisplayBody,
  sourceDisplayLabel,
  sourceDisplayTitle,
} from "@/lib/graph/sourceDisplay";

type SourceCardProps = {
  source: Source;
  layout?: ExploreCatalogCardLayout;
};

export function SourceCard({ source, layout = "responsive" }: SourceCardProps) {
  return (
    <ExploreCatalogCard
      href={`${explorePaths.sources}/${source.slug}`}
      eyebrow={sourceDisplayLabel(source)}
      title={sourceDisplayTitle(source)}
      blurb={sourceDisplayBody(source)}
      ctaLabel="View Source →"
      layout={layout}
      titleClassName="break-words"
      blurbClassName="break-all"
    />
  );
}
