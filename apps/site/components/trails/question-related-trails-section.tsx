import Link from "next/link";

import { TrailCard } from "@/components/trails/trail-card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getEnrichedTrailsForQuestion } from "@/lib/trails/getEnrichedTrailsForQuestion";
import type { QuestionDefinition } from "@/types/questions";

type QuestionRelatedTrailsSectionProps = {
  question: QuestionDefinition;
};

export async function QuestionRelatedTrailsSection({
  question,
}: QuestionRelatedTrailsSectionProps) {
  const trails = await getEnrichedTrailsForQuestion({ question, limit: 3 });

  if (trails.length === 0) return null;

  return (
    <Section atmosphere="none" className="border-b border-border/35 py-12 md:py-16">
      <Container>
        <section aria-label="Related reading trails" className="flex flex-col gap-6">
          <div>
            <h2 className="font-display text-2xl font-medium tracking-tight text-fg">
              Continue with a reading trail
            </h2>
            <p className="mt-4 max-w-2xl text-muted">
              These curated paths share stops with this question but offer a reusable sequence you
              can return to or share—without the question framing.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trails.map((trail) => (
              <TrailCard
                key={trail.id}
                trail={trail}
                location="related"
                analytics={{
                  event: "trail_select",
                  params: {
                    trail_id: trail.id,
                    location: "question_related",
                    question_id: question.id,
                  },
                }}
              />
            ))}
          </div>
          <p className="text-sm">
            <Link href="/trails" className="text-accent underline-offset-4 hover:underline">
              Browse all reading trails
            </Link>
          </p>
        </section>
      </Container>
    </Section>
  );
}
