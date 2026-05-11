import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatternDetailPage } from "@/components/books/when-others-look-to-you/sections/PatternDetailPage";
import { getAllPatterns, getPatternBySlug } from "@/lib/books/when-others-look-to-you/content";
import { buildPatternJsonLd, buildPatternMetadata } from "@/lib/books/when-others-look-to-you/metadata";

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
  const pattern = getPatternBySlug(slug);
  if (!pattern) {
    notFound();
  }

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
