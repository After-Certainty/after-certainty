"use client";

import { PathStopList } from "@/components/paths/path-stop-list";
import type { EnrichedPathStop } from "@/types/paths";

type QuestionPathProps = {
  stops: EnrichedPathStop[];
  questionId: string;
};

export function QuestionPath({ stops, questionId }: QuestionPathProps) {
  return (
    <PathStopList
      stops={stops}
      ownerType="question"
      ownerId={questionId}
      getStopAnalytics={(stopIndex, stop) => ({
        event: "question_stop_open",
        params: {
          question_id: questionId,
          stop_position: stopIndex,
          entity_type: stop.entityType,
        },
      })}
    />
  );
}
