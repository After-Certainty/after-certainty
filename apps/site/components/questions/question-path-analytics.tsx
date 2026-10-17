"use client";

import { useEffect } from "react";

import { trackReaderEvent } from "@/lib/analytics/reader";

type QuestionPathAnalyticsProps = {
  questionId: string;
};

export function QuestionPathAnalytics({ questionId }: QuestionPathAnalyticsProps) {
  useEffect(() => {
    trackReaderEvent({
      name: "reading_path_started",
      properties: { path_kind: "question", path_id: questionId },
    });
  }, [questionId]);

  return null;
}
