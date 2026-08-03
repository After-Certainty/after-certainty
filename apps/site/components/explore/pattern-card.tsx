import type { Pattern } from "@/types/semanticGraph";
import {
  ExploreCatalogCard,
  type ExploreCatalogCardLayout,
} from "@/components/explore/explore-catalog-card";
import { patternIndexEyebrow } from "@/lib/explore/pattern-preview";
import { explorePaths } from "@/lib/graph/explorePaths";

type PatternCardProps = {
  pattern: Pattern;
  layout?: ExploreCatalogCardLayout;
};

export function PatternCard({ pattern, layout = "responsive" }: PatternCardProps) {
  return (
    <ExploreCatalogCard
      href={`${explorePaths.patterns}/${pattern.slug}`}
      eyebrow={patternIndexEyebrow(pattern)}
      title={pattern.title}
      blurb={pattern.summary}
      ctaLabel="View Pattern →"
      layout={layout}
    />
  );
}
