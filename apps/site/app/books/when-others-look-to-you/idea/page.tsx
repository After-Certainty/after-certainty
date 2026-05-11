import type { Metadata } from "next";
import { IdeaPage } from "@/components/books/when-others-look-to-you/sections/IdeaPage";
import {
  formatIdeaDefinitionSentence,
  ideaPageContent,
  woltyBasePath,
} from "@/lib/books/when-others-look-to-you/content";
import { buildPageMetadata } from "@/lib/books/when-others-look-to-you/metadata";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "The Idea",
    description:
      "Leadership as influence under observation—harm, effectiveness, and legitimacy as lenses for how others read what you do.",
    path: `${woltyBasePath}/idea`,
  });
}

export default function IdeaRoute() {
  const block = ideaPageContent.hero.definitionBlock;
  const definitionJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: block.term ? block.term.charAt(0).toUpperCase() + block.term.slice(1) : block.term,
    description: formatIdeaDefinitionSentence(block),
    url: `${siteUrl.replace(/\/$/, "")}${woltyBasePath}/idea#idea-definition-leader`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(definitionJsonLd),
        }}
      />
      <IdeaPage content={ideaPageContent} />
    </>
  );
}
