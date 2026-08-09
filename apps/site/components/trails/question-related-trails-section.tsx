import Link from "next/link";

import { RelatedSectionDisclosure } from "@/components/explore/related-section-disclosure";
import { TrailCard } from "@/components/trails/trail-card";
import { getEnrichedTrailsForQuestion } from "@/lib/trails/getEnrichedTrailsForQuestion";
import type { QuestionDefinition } from "@/types/questions";

type QuestionRelatedTrailsSectionProps = {
  question: QuestionDefinition;
};

function trailCountLabel(count: number): string {
  return `${count} ${count === 1 ? "trail" : "trails"}`;
}

function trailSectionTitle(count: number): string {
  return count === 1 ? "Related reading trail" : "Related reading trails";
}

/**
 * Related trails disclosure for the question Keep Exploring block.
 * Parent owns the section chrome / heading hierarchy.
 */
export async function QuestionRelatedTrailsSection({
  question,
}: QuestionRelatedTrailsSectionProps) {
  const trails = await getEnrichedTrailsForQuestion({ question, limit: 3 });

  if (trails.length === 0) return null;

  return (
    <div className="mt-4 border-b border-border/35 pb-4 md:mt-8 md:pb-8" data-path-related-section>
      <RelatedSectionDisclosure
        id="question-related-trails"
        title={trailSectionTitle(trails.length)}
        countLabel={trailCountLabel(trails.length)}
      >
        <p className="mb-3 max-w-2xl text-sm leading-snug text-muted md:mb-6 md:text-base md:leading-relaxed">
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
        <p className="mt-4 text-sm md:mt-6">
          <Link href="/trails" className="text-accent underline-offset-4 hover:underline">
            Browse all reading trails
          </Link>
        </p>
      </RelatedSectionDisclosure>
    </div>
  );
}
