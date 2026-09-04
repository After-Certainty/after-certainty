import Link from "next/link";
import { QuestionCard } from "@/components/questions/question-card";
import { QuestionSectionAnalytics } from "@/components/questions/question-section-analytics";
import { Container } from "@/components/ui/container";
import { getEnrichedFeaturedQuestions } from "@/lib/questions/getEnrichedQuestions";

export async function FeaturedQuestionsSection() {
  const questions = await getEnrichedFeaturedQuestions(3);

  if (questions.length === 0) return null;

  return (
    <section className="atm-section atm-section--transition border-b border-border/40 bg-bg-elevated/22 py-6 md:py-12 lg:py-14">
      <QuestionSectionAnalytics location="home" />
      <Container>
        <div className="max-w-2xl md:max-w-3xl">
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-4xl">
            What question brought you here?
          </h2>
          <p className="mt-2 text-sm text-muted md:mt-3 md:text-base">
            Most of us already feel the tension—trust under disagreement, meaning that shifts as it
            travels, exceptions that quietly become the rule. Start with a familiar problem, not a
            content category.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2 md:mt-8 md:grid md:grid-cols-3 md:items-stretch md:gap-4">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              location="home"
              density="compact"
            />
          ))}
        </div>
        <p className="mt-6 md:mt-8">
          <Link
            href="/start"
            className="text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:text-sm"
          >
            Find your way in →
          </Link>
        </p>
      </Container>
    </section>
  );
}
