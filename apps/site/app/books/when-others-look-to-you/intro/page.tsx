import type { Metadata } from "next";
import { IntroVideoPage } from "@/components/books/when-others-look-to-you/sections/IntroVideoPage";
import { introVideoPageContent, woltyBasePath } from "@/lib/books/when-others-look-to-you/content";
import { buildPageMetadata } from "@/lib/books/when-others-look-to-you/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Intro video",
    description: introVideoPageContent.description,
    path: `${woltyBasePath}/intro`,
  });
}

export default function IntroRoute() {
  return <IntroVideoPage content={introVideoPageContent} />;
}
