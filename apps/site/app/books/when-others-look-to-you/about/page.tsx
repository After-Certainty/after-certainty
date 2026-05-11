import type { Metadata } from "next";
import { AboutPage } from "@/components/books/when-others-look-to-you/sections/AboutPage";
import { aboutPageContent, woltyBasePath } from "@/lib/books/when-others-look-to-you/content";
import { buildPageMetadata } from "@/lib/books/when-others-look-to-you/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "About",
    description: "Why When Others Look to You was written and what questions sit behind it.",
    path: `${woltyBasePath}/about`,
  });
}

export default function AboutRoute() {
  return <AboutPage content={aboutPageContent} />;
}
