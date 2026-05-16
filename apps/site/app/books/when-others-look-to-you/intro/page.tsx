import type { Metadata } from "next";
import { IntroVideoPage } from "@/components/books/when-others-look-to-you/sections/IntroVideoPage";
import { introVideoPageContent, woltyBasePath } from "@/lib/books/when-others-look-to-you/content";
import { findWoltyBook, mergeIntroVideoContent } from "@/lib/books/when-others-look-to-you/manifest-media";
import { buildPageMetadata } from "@/lib/books/when-others-look-to-you/metadata";
import { getSemanticGraph } from "@/lib/graph/manifest";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Intro video",
    description: introVideoPageContent.description,
    path: `${woltyBasePath}/intro`,
  });
}

export default async function IntroRoute() {
  const graph = await getSemanticGraph();
  const content = mergeIntroVideoContent(
    introVideoPageContent,
    findWoltyBook(graph.books),
  );
  return <IntroVideoPage content={content} />;
}
