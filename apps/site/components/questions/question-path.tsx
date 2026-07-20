import { QuestionPathStop } from "@/components/questions/question-path-stop";
import type { EnrichedPathStop } from "@/types/questions";

type QuestionPathProps = {
  stops: EnrichedPathStop[];
  questionId: string;
};

export function QuestionPath({ stops, questionId }: QuestionPathProps) {
  const totalStops = stops.length;

  return (
    <ol className="mt-10 list-none space-y-5 p-0">
      {stops.map((stop, index) => (
        <QuestionPathStop
          key={`${stop.position}-${stop.resolvedEntityId}`}
          stop={stop}
          questionId={questionId}
          stopIndex={index + 1}
          totalStops={totalStops}
        />
      ))}
    </ol>
  );
}
