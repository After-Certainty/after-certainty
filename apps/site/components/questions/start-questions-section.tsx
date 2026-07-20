import Link from "next/link";
import { QuestionCard } from "@/components/questions/question-card";
import { QuestionSectionAnalytics } from "@/components/questions/question-section-analytics";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getEnrichedFeaturedQuestions } from "@/lib/questions/getEnrichedQuestions";

export async function StartQuestionsSection() {
  const questions = await getEnrichedFeaturedQuestions(3);

  if (questions.length === 0) return null;

  return (
    <Section
      atmosphere="none"
      className="border-b border-border/35 bg-bg-elevated/[0.08] py-24 md:py-32"
    >
      <QuestionSectionAnalytics location="start" />
      <Container>
        <h2 className="max-w-xl font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">
          What question brought you here?
        </h2>
        <p className="mt-5 max-w-2xl text-muted">
          If you arrive with a tension rather than a book in mind, these curated paths offer a
          different doorway into the same commons—without pretending any question has one final
          answer.
        </p>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} location="start" />
          ))}
        </div>
        <p className="mt-12">
          <Link
            href="/questions"
            className="text-[11px] uppercase tracking-[0.22em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Browse all questions →
          </Link>
        </p>
      </Container>
    </Section>
  );
}
