import Link from "next/link";
import { QuestionCard } from "@/components/questions/question-card";
import { QuestionSectionAnalytics } from "@/components/questions/question-section-analytics";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getEnrichedFeaturedQuestions } from "@/lib/questions/getEnrichedQuestions";

export async function FeaturedQuestionsSection() {
  const questions = await getEnrichedFeaturedQuestions(3);

  if (questions.length === 0) return null;

  return (
    <Section
      atmosphere="transition"
      className="border-b border-border/40 bg-bg-elevated/22 py-12 md:py-14"
    >
      <QuestionSectionAnalytics location="home" />
      <Container>
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-medium tracking-tight text-fg md:text-4xl">
            What question brought you here?
          </h2>
          <p className="mt-4 text-muted">
            Start with a recognizable tension—not a book title or content type. Each path is short,
            editorial, and finite.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} location="home" />
          ))}
        </div>
        <p className="mt-10">
          <Link
            href="/questions"
            className="text-sm uppercase tracking-[0.2em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Browse all questions →
          </Link>
        </p>
      </Container>
    </Section>
  );
}
