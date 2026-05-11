import type { Metadata } from "next";
import { PatternsPage } from "@/components/books/when-others-look-to-you/sections/PatternsPage";
import { patternsPageContent, woltyBasePath } from "@/lib/books/when-others-look-to-you/content";
import { buildPageMetadata } from "@/lib/books/when-others-look-to-you/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Patterns",
    description:
      "Leadership patterns—recurring behaviors others mirror. Explore each pattern in depth.",
    path: `${woltyBasePath}/patterns`,
  });
}

export default function PatternsIndexRoute() {
  return <PatternsPage content={patternsPageContent} />;
}
