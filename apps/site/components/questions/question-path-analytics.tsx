"use client";

import { useEffect } from "react";

import { trackQuestionPathStart } from "@/lib/analytics/track";

type QuestionPathAnalyticsProps = {
  questionId: string;
};

export function QuestionPathAnalytics({ questionId }: QuestionPathAnalyticsProps) {
  useEffect(() => {
    trackQuestionPathStart({ question_id: questionId });
  }, [questionId]);

  return null;
}
