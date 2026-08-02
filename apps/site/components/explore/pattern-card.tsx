import type { Pattern } from "@/types/semanticGraph";
import {
  ExploreCatalogCard,
  type ExploreCatalogCardLayout,
} from "@/components/explore/explore-catalog-card";
import { explorePaths } from "@/lib/graph/explorePaths";

type PatternCardProps = {
  pattern: Pattern;
  layout?: ExploreCatalogCardLayout;
};

function patternEyebrow(pattern: Pattern): string {
  if (pattern.patternRole === "master") return "Master pattern";
  if (pattern.patternRole === "supporting") {
    if (pattern.realityDynamic === "obscuring") return "Supporting · obscuring";
    if (pattern.realityDynamic === "corrective") return "Supporting · corrective";
    return "Supporting pattern";
  }
  return "Pattern";
}

export function PatternCard({ pattern, layout = "responsive" }: PatternCardProps) {
  return (
    <ExploreCatalogCard
      href={`${explorePaths.patterns}/${pattern.slug}`}
      eyebrow={patternEyebrow(pattern)}
      title={pattern.title}
      blurb={pattern.summary}
      ctaLabel="View Pattern →"
      layout={layout}
    />
  );
}
