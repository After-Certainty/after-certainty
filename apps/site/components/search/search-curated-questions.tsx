"use client";

import { useMemo } from "react";

import { CuratedQuestionsCallout } from "@/components/search/curated-questions-callout";
import { matchQuestionsForSearchQuery } from "@/lib/questions/enrichQuestions";
import type { EnrichedQuestion } from "@/types/questions";
import type { QuestionSearchBridge } from "@/types/questions";

type SearchCuratedQuestionsProps = {
  query: string;
  enrichedQuestions: EnrichedQuestion[];
  searchBridges: QuestionSearchBridge[];
};

export function SearchCuratedQuestions({
  query,
  enrichedQuestions,
  searchBridges,
}: SearchCuratedQuestionsProps) {
  const matched = useMemo(() => {
    const manifest = {
      questions: enrichedQuestions,
      searchBridges,
    };
    const ids = new Set(matchQuestionsForSearchQuery(query, manifest, 2).map((q) => q.id));
    return enrichedQuestions.filter((q) => ids.has(q.id));
  }, [query, enrichedQuestions, searchBridges]);

  return <CuratedQuestionsCallout questions={matched} />;
}
