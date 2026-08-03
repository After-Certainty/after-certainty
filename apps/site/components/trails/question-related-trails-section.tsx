import Link from "next/link";

import { RelatedSectionDisclosure } from "@/components/explore/related-section-disclosure";
import { TrailCard } from "@/components/trails/trail-card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getEnrichedTrailsForQuestion } from "@/lib/trails/getEnrichedTrailsForQuestion";
import type { QuestionDefinition } from "@/types/questions";

type QuestionRelatedTrailsSectionProps = {
  question: QuestionDefinition;
};

function trailCountLabel(count: number): string {
  return `${count} ${count === 1 ? "trail" : "trails"}`;
}

export async function QuestionRelatedTrailsSection({
  question,
}: QuestionRelatedTrailsSectionProps) {
  const trails = await getEnrichedTrailsForQuestion({ question, limit: 3 });

  if (trails.length === 0) return null;

  return (
    <Section
      atmosphere="none"
      className="border-b border-border/35 !py-8 md:!py-16"
      data-path-related-section
    >
      <Container>
        <RelatedSectionDisclosure
          id="question-related-trails"
          title="Continue with a reading trail"
          countLabel={trailCountLabel(trails.length)}
        >
          <p className="mb-4 max-w-2xl text-sm text-muted md:mb-6 md:text-base">
            These curated paths share stops with this question but offer a reusable sequence you can
            return to or share—without the question framing.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
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
        </RelatedSectionDisclosure>
        <p className="mt-6 text-sm">
          <Link href="/trails" className="text-accent underline-offset-4 hover:underline">
            Browse all reading trails
          </Link>
        </p>
      </Container>
    </Section>
  );
}
