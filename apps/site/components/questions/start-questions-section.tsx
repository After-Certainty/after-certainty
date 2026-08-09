import Link from "next/link";
import { QuestionCard } from "@/components/questions/question-card";
import { QuestionSectionAnalytics } from "@/components/questions/question-section-analytics";
import { Container } from "@/components/ui/container";
import { getEnrichedFeaturedQuestions } from "@/lib/questions/getEnrichedQuestions";

export async function StartQuestionsSection() {
  const questions = await getEnrichedFeaturedQuestions(3);

  if (questions.length === 0) return null;

  return (
    <section className="border-b border-border/35 bg-bg-elevated/[0.08] py-6 md:py-14">
      <QuestionSectionAnalytics location="start" />
      <Container>
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-4xl">
            Start with a question
          </h2>
          <p className="mt-2 text-sm text-muted md:mt-4 md:text-base">
            If you arrive with a tension rather than a book in mind, begin here—without pretending
            any question has one final answer.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2 md:mt-10 md:grid md:grid-cols-3 md:gap-4">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              location="start"
              density="compact"
            />
          ))}
        </div>
        <p className="mt-6 md:mt-10">
          <Link
            href="/questions"
            className="text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:text-sm"
          >
            Browse all questions →
          </Link>
        </p>
      </Container>
    </section>
  );
}
