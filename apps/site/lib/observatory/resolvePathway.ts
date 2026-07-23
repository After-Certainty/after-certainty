import { getEnrichedQuestionBySlug } from "@/lib/questions/getEnrichedQuestions";
import { pathwayFromEnrichedStops } from "@/lib/observatory/pathwayFromContent";
import { getEnrichedTrailBySlug } from "@/lib/trails/getEnrichedTrails";
import type { Pathway } from "@/types/observatory";
import type { ExplorePathwayKind } from "@/lib/graph/explorePaths";

export async function resolveExplorePathway(input: {
  kind: ExplorePathwayKind;
  slug: string;
}): Promise<Pathway | null> {
  if (input.kind === "question") {
    const question = await getEnrichedQuestionBySlug(input.slug);
    if (!question || question.status !== "published") return null;
    return pathwayFromEnrichedStops({
      id: question.id,
      slug: question.slug,
      title: question.question,
      description: question.summary,
      sourceType: "question",
      sourceHref: `/questions/${question.slug}`,
      stops: question.pathStopsEnriched,
    });
  }

  const trail = await getEnrichedTrailBySlug(input.slug);
  if (!trail) return null;
  return pathwayFromEnrichedStops({
    id: trail.id,
    slug: trail.slug,
    title: trail.title,
    description: trail.summary,
    sourceType: "trail",
    sourceHref: `/trails/${trail.slug}`,
    stops: trail.pathStopsEnriched,
  });
}
