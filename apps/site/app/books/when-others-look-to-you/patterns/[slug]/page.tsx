import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatternDetailPage } from "@/components/books/when-others-look-to-you/sections/PatternDetailPage";
import { getAllPatterns, getPatternBySlug } from "@/lib/books/when-others-look-to-you/content";
import { mergePatternWithManifestMedia } from "@/lib/books/when-others-look-to-you/manifest-media";
import { buildPatternJsonLd, buildPatternMetadata } from "@/lib/books/when-others-look-to-you/metadata";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getPatternBySlug as getManifestPatternBySlug } from "@/lib/graph/graphQueries";
import { getSemanticGraph } from "@/lib/graph/manifest";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPatterns().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pattern = getPatternBySlug(slug);
  if (!pattern) {
    return { title: "Pattern" };
  }

  return buildPatternMetadata(pattern);
}

export default async function PatternDetailRoute({ params }: PageProps) {
  const { slug } = await params;
  const base = getPatternBySlug(slug);
  if (!base) {
    notFound();
  }
  const graph = await getSemanticGraph();
  const index = buildGraphIndex(graph);
  const pattern = mergePatternWithManifestMedia(
    base,
    getManifestPatternBySlug(index, slug),
  );

  const jsonLd = buildPatternJsonLd(pattern, siteUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <PatternDetailPage pattern={pattern} />
    </>
  );
}
