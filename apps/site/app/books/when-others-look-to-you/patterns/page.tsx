import type { Metadata } from "next";
import { PatternsPage } from "@/components/books/when-others-look-to-you/sections/PatternsPage";
import { patternsPageContent, woltyBasePath } from "@/lib/books/when-others-look-to-you/content";
import {
  findWoltyBook,
  mergePatternsPageContent,
} from "@/lib/books/when-others-look-to-you/manifest-media";
import { buildPageMetadata } from "@/lib/books/when-others-look-to-you/metadata";
import { getSemanticGraph } from "@/lib/graph/manifest";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Patterns",
    description:
      "Leadership patterns—recurring behaviors others mirror. Explore each pattern in depth.",
    path: `${woltyBasePath}/patterns`,
  });
}

export default async function PatternsIndexRoute() {
  const graph = await getSemanticGraph();
  const content = mergePatternsPageContent(
    patternsPageContent,
    findWoltyBook(graph.books),
  );
  return <PatternsPage content={content} />;
}
