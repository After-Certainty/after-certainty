import { NextResponse } from "next/server";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getBookBySlug } from "@/lib/graph/graphQueries";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { buildBookPageJsonLd } from "@/lib/seo/json-ld";
import { explorePaths } from "@/lib/graph/explorePaths";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * GET /api/json-ld/books/[slug]
 * Returns JSON-LD structured data for a book as pure JSON
 */
export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const book = getBookBySlug(index, slug);

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const bookBreadcrumbs = [
    { label: "Explore", href: explorePaths.home },
    { label: "Books", href: explorePaths.books },
    { label: book.title },
  ];

  const jsonLd = buildBookPageJsonLd({
    book,
    breadcrumbs: bookBreadcrumbs,
  });

  return NextResponse.json(jsonLd, {
    headers: {
      "Content-Type": "application/ld+json",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
