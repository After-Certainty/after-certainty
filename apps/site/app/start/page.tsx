import type { Metadata } from "next";
import { StartClosing } from "@/components/start/start-closing";
import { StartExplore } from "@/components/start/start-explore";
import { StartFrontShelf } from "@/components/start/start-front-shelf";
import { StartHero } from "@/components/start/start-hero";
import { StartHow } from "@/components/start/start-how";
import { StartQuote } from "@/components/start/start-quote";
import { StartWhat } from "@/components/start/start-what";
import { StartWhatsNewSection } from "@/components/start/start-whats-new-section";
import { StartQuestionsSection } from "@/components/questions/start-questions-section";
import { StartTrailsSection } from "@/components/trails/start-trails-section";
import { JsonLd } from "@/components/seo/json-ld";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { explorePaths } from "@/lib/graph/explorePaths";
import { createPageMetadata } from "@/lib/metadata";
import { absoluteUrl, buildStartPageJsonLd } from "@/lib/seo/json-ld";
import { FRONT_SHELF_ENTRIES } from "@/lib/start/front-shelf";

export const metadata: Metadata = createPageMetadata({
  title: "Start Here",
  description:
    "Orientation for After Certainty — an open publishing commons for books, podcast, patterns, and collaboration.",
});

export default async function StartPage() {
  const { graph } = await getExploreSemanticGraph();
  const booksBySlug = new Map(graph.books.map((book) => [book.slug, book]));
  const shelfItems = FRONT_SHELF_ENTRIES.map((entry) => {
    const book = booksBySlug.get(entry.slug);
    return {
      slug: entry.slug,
      title: book?.title ?? entry.slug,
      description: entry.description,
      url: absoluteUrl(`${explorePaths.books}/${entry.slug}`),
    };
  });

  return (
    <article>
      <JsonLd data={buildStartPageJsonLd({ shelfItems })} />
      <StartHero />
      <StartWhat />
      <StartQuestionsSection />
      <StartTrailsSection />
      <StartWhatsNewSection />
      <StartExplore />
      <StartQuote />
      <StartHow />
      <StartFrontShelf />
      <StartClosing />
    </article>
  );
}
