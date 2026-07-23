import Link from "next/link";

import { QuestionCard } from "@/components/questions/question-card";
import type { EnrichedQuestion } from "@/types/questions";

type CuratedQuestionsCalloutProps = {
  questions: EnrichedQuestion[];
};

export function CuratedQuestionsCallout({ questions }: CuratedQuestionsCalloutProps) {
  if (questions.length === 0) return null;

  return (
    <section
      aria-label="Curated questions"
      className="mb-10 rounded-sm border border-accent/25 bg-bg-elevated/30 p-6 md:p-8"
    >
      <h2 className="font-display text-xl font-medium tracking-tight text-fg md:text-2xl">
        Curated questions
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        These editorial paths may fit your search better than a long result list.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {questions.map((question) => (
          <QuestionCard key={question.id} question={question} location="index" />
        ))}
      </div>
      <p className="mt-6 text-sm">
        <Link href="/questions" className="text-accent underline-offset-4 hover:underline">
          Browse all questions
        </Link>
      </p>
    </section>
  );
}
