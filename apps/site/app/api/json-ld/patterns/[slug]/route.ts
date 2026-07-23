import { NextResponse } from "next/server";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getPatternBySlug } from "@/lib/graph/graphQueries";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { buildPatternPageJsonLd, relatedConceptUrls } from "@/lib/seo/json-ld";
import { explorePaths } from "@/lib/graph/explorePaths";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * GET /api/json-ld/patterns/[slug]
 * Returns JSON-LD structured data for a pattern as pure JSON
 */
export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const pattern = getPatternBySlug(index, slug);

  if (!pattern) {
    return NextResponse.json({ error: "Pattern not found" }, { status: 404 });
  }

  const patternBreadcrumbs = [
    { label: "Explore", href: explorePaths.home },
    { label: "Patterns", href: explorePaths.patterns },
    { label: pattern.title },
  ];

  const jsonLd = buildPatternPageJsonLd({
    pattern,
    breadcrumbs: patternBreadcrumbs,
    relatedConceptUrls: relatedConceptUrls(index, pattern.relatedConcepts),
  });

  return NextResponse.json(jsonLd, {
    headers: {
      "Content-Type": "application/ld+json",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
