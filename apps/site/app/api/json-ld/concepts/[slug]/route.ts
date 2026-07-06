import { NextResponse } from "next/server";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getConceptBySlug } from "@/lib/graph/graphQueries";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import {
  buildConceptPageJsonLd,
  conceptRelationshipUrls,
  relatedBookUrls,
  relatedPatternUrls,
} from "@/lib/seo/json-ld";
import { explorePaths } from "@/lib/graph/explorePaths";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * GET /api/json-ld/concepts/[slug]
 * Returns JSON-LD structured data for a concept as pure JSON
 */
export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const concept = getConceptBySlug(index, slug);

  if (!concept) {
    return NextResponse.json({ error: "Concept not found" }, { status: 404 });
  }

  const conceptBreadcrumbs = [
    { label: "Explore", href: explorePaths.home },
    { label: "Concepts", href: explorePaths.concepts },
    { label: concept.title },
  ];

  const relatedUrls = [
    ...relatedBookUrls(index, concept.relatedBooks),
    ...relatedPatternUrls(index, concept.relatedPatterns),
    ...conceptRelationshipUrls(index, concept.id),
  ];

  const jsonLd = buildConceptPageJsonLd({
    concept,
    breadcrumbs: conceptBreadcrumbs,
    relatedUrls,
  });

  return NextResponse.json(jsonLd, {
    headers: {
      "Content-Type": "application/ld+json",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
