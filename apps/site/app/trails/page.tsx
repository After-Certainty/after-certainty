import type { Metadata } from "next";

import { TrailsIndexContent } from "@/components/trails/trails-index-content";
import { JsonLd } from "@/components/seo/json-ld";
import { createPageMetadata } from "@/lib/metadata";
import { buildTrailsIndexJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = createPageMetadata({
  title: "Curated Reading Trails",
  description:
    "Editorially composed paths through After Certainty—finite sequences of books, concepts, patterns, and more with context for why each stop belongs.",
});

type PageProps = {
  searchParams: Promise<{ theme?: string }>;
};

export default async function TrailsIndexPage({ searchParams }: PageProps) {
  const { theme } = await searchParams;

  return (
    <>
      <JsonLd data={buildTrailsIndexJsonLd()} />
      <TrailsIndexContent themeFilter={theme} />
    </>
  );
}
