import Link from "next/link";
import { QuestionCard } from "@/components/questions/question-card";
import { QuestionSectionAnalytics } from "@/components/questions/question-section-analytics";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getEnrichedPublishedQuestions } from "@/lib/questions/getEnrichedQuestions";
import type { EnrichedQuestion } from "@/types/questions";

function groupEnrichedByFamily(
  questions: EnrichedQuestion[],
): { family: string; questions: EnrichedQuestion[] }[] {
  const familyMap = new Map<string, EnrichedQuestion[]>();
  for (const question of questions) {
    for (const family of question.families) {
      const bucket = familyMap.get(family) ?? [];
      bucket.push(question);
      familyMap.set(family, bucket);
    }
  }
  return [...familyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([family, grouped]) => ({ family, questions: grouped }));
}

export async function QuestionsIndexContent() {
  const questions = await getEnrichedPublishedQuestions();
  const featured = questions.filter((q) => q.featured).slice(0, 4);
  const grouped = groupEnrichedByFamily(questions);
  const families = grouped.map((g) => g.family);

  return (
    <>
      <QuestionSectionAnalytics location="index" />
      <Section atmosphere="transition" className="border-b border-border/40 py-16 md:py-24">
        <Container>
          <p className="text-xs uppercase tracking-[0.42em] text-muted">Start with a Question</p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-medium tracking-tight text-fg md:text-5xl lg:text-6xl">
            Begin with a tension you recognize
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Each question opens a short, editorial path through books, concepts, patterns, and
            more—designed for newcomers who do not yet know the project&apos;s vocabulary.
          </p>
        </Container>
      </Section>

      {featured.length > 0 ? (
        <Section atmosphere="transition" className="border-b border-border/35 py-14 md:py-20">
          <Container>
            <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
              Featured questions
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((question) => (
                <QuestionCard key={question.id} question={question} location="index" />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {families.length > 1 ? (
        <Section atmosphere="none" className="border-b border-border/25 py-8">
          <Container>
            <nav aria-label="Question families" className="flex flex-wrap gap-3">
              {families.map((family) => (
                <a
                  key={family}
                  href={`#family-${slugifyFamily(family)}`}
                  className="min-h-11 rounded-sm border border-border/50 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {family}
                </a>
              ))}
            </nav>
          </Container>
        </Section>
      ) : null}

      {grouped.map(({ family, questions: familyQuestions }) => (
        <Section
          key={family}
          id={`family-${slugifyFamily(family)}`}
          atmosphere="none"
          className="border-b border-border/35 py-14 md:py-20 scroll-mt-24"
        >
          <Container>
            <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
              {family}
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {familyQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} location="index" />
              ))}
            </div>
          </Container>
        </Section>
      ))}

      <Section atmosphere="none" className="py-14 md:py-20">
        <Container>
          <p className="max-w-2xl text-muted">
            Looking for a specific title or phrase?{" "}
            <Link href="/search" className="text-accent underline-offset-4 hover:underline">
              Search the commons
            </Link>{" "}
            instead—these questions are curated entrances, not exhaustive retrieval.
          </p>
        </Container>
      </Section>
    </>
  );
}

function slugifyFamily(family: string): string {
  return family
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
