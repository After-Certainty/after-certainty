"use client";

import { PathStopCard } from "@/components/paths/path-stop-card";
import type { EnrichedPathStop } from "@/types/paths";

type QuestionPathStopProps = {
  stop: EnrichedPathStop;
  questionId: string;
  stopIndex: number;
  totalStops: number;
};

/** @deprecated Prefer QuestionPath, which uses the shared PathStopList. */
export function QuestionPathStop({
  stop,
  questionId,
  stopIndex,
  totalStops,
}: QuestionPathStopProps) {
  return (
    <PathStopCard
      stop={stop}
      stopIndex={stopIndex}
      totalStops={totalStops}
      analytics={{
        event: "question_stop_open",
        params: {
          question_id: questionId,
          stop_position: stopIndex,
          entity_type: stop.entityType,
        },
      }}
    />
  );
}
