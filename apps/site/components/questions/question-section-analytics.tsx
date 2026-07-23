"use client";

import { useEffect } from "react";

import { trackQuestionSectionView } from "@/lib/analytics/track";

type QuestionSectionAnalyticsProps = {
  location: "home" | "start" | "index";
};

export function QuestionSectionAnalytics({ location }: QuestionSectionAnalyticsProps) {
  useEffect(() => {
    trackQuestionSectionView({ location });
  }, [location]);

  return null;
}
