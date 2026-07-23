import type { Metadata } from "next";

import { GlobalSearchPage } from "@/components/search/global-search-page";
import { createPageMetadata } from "@/lib/metadata";
import { getEnrichedPublishedQuestions } from "@/lib/questions/getEnrichedQuestions";
import { getQuestionSearchBridges } from "@/lib/questions/loadQuestions";
import { getEnrichedPublishedTrails } from "@/lib/trails/getEnrichedTrails";
import { getTrailSearchBridges } from "@/lib/trails/loadTrails";

export const metadata: Metadata = createPageMetadata({
  title: "Search",
  description:
    "Search After Certainty — books, concepts, patterns, thinkers, sources, and podcast episodes across the intellectual commons.",
});

type SearchPageProps = {
  searchParams?: Promise<{ q?: string; type?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = searchParams ? await searchParams : {};
  const [curatedQuestions, questionSearchBridges, curatedTrails, trailSearchBridges] =
    await Promise.all([
      getEnrichedPublishedQuestions(),
      Promise.resolve(getQuestionSearchBridges()),
      getEnrichedPublishedTrails(),
      Promise.resolve(getTrailSearchBridges()),
    ]);
  return (
    <GlobalSearchPage
      initialQuery={typeof sp.q === "string" ? sp.q : ""}
      initialType={typeof sp.type === "string" ? sp.type : ""}
      initialPage={typeof sp.page === "string" ? sp.page : ""}
      curatedQuestions={curatedQuestions}
      questionSearchBridges={questionSearchBridges}
      curatedTrails={curatedTrails}
      trailSearchBridges={trailSearchBridges}
    />
  );
}
