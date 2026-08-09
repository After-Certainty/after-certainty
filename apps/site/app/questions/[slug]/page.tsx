import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { EntityIntroDisclosure } from "@/components/explore/entity-intro-disclosure";
import { RelatedSectionDisclosure } from "@/components/explore/related-section-disclosure";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { QuestionPath } from "@/components/questions/question-path";
import { QuestionPathAnalytics } from "@/components/questions/question-path-analytics";
import { QuestionCard } from "@/components/questions/question-card";
import { QuestionRelatedTrailsSection } from "@/components/trails/question-related-trails-section";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ExplorePathwayLink } from "@/components/paths/explore-pathway-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import {
  entityIntroTeaser,
  shouldUseEntityIntroDisclosure,
} from "@/lib/explore/entity-intro-teaser";
import {
  getEnrichedQuestionBySlug,
  getEnrichedPublishedQuestions,
} from "@/lib/questions/getEnrichedQuestions";
import { createPageMetadata } from "@/lib/metadata";
import { buildQuestionDetailJsonLd } from "@/lib/seo/json-ld";

type PageProps = { params: Promise<{ slug: string }> };

const keepExploringLinkClassName =
  "inline-flex min-h-11 items-center text-sm uppercase tracking-[0.18em] text-accent underline-offset-4 transition-colors hover:text-fg hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

function questionCountLabel(count: number): string {
  return `${count} ${count === 1 ? "question" : "questions"}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const question = await getEnrichedQuestionBySlug(slug);
  if (!question) return {};
  return createPageMetadata({
    title: `${question.question} · Start with a Question`,
    description: question.summary,
    openGraph: question.primaryBookCover
      ? {
          images: [{ url: question.primaryBookCover, alt: question.primaryBookTitle }],
        }
      : undefined,
  });
}

export default async function QuestionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const question = await getEnrichedQuestionBySlug(slug);
  if (!question) notFound();

  const allPublished = await getEnrichedPublishedQuestions();
  const related = (question.relatedQuestionIds ?? [])
    .map((id) => allPublished.find((q) => q.id === id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
    .slice(0, 3);

  const orientation = question.orientation?.trim() ?? "";
  const orientationTeaser = entityIntroTeaser(orientation);
  const useOrientationDisclosure = shouldUseEntityIntroDisclosure(orientation, orientationTeaser);

  return (
    <article>
      <QuestionPathAnalytics questionId={question.id} />
      <JsonLd
        data={buildQuestionDetailJsonLd({
          slug: question.slug,
          question: question.question,
          summary: question.summary,
          stopTitles: question.pathStopsEnriched.map((s) => s.title),
        })}
      />

      <Section atmosphere="transition" className="border-b border-border/40 !py-5 md:!py-20">
        <Container>
          <BreadcrumbTrail
            items={[
              { label: "Home", href: "/" },
              { label: "Questions", href: "/questions" },
              { label: question.question },
            ]}
          />
          <p className="text-[11px] uppercase tracking-[0.3em] text-accent md:text-xs md:tracking-[0.35em]">
            {question.families[0]}
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-[1.85rem] font-medium leading-[1.15] tracking-tight text-fg sm:text-4xl md:mt-6 md:text-5xl md:leading-tight">
            {question.question}
          </h1>
          {orientation ? (
            useOrientationDisclosure ? (
              <EntityIntroDisclosure
                id="question-full-orientation"
                regionLabel="Full question orientation"
                teaser={orientationTeaser}
                expandLabel="Read full orientation"
                className="!mt-3 md:!mt-6"
              >
                <p className="text-base leading-snug text-muted md:text-lg md:leading-relaxed">
                  {orientation}
                </p>
              </EntityIntroDisclosure>
            ) : (
              <p className="mt-3 max-w-2xl text-base leading-snug text-muted md:mt-6 md:text-lg md:leading-relaxed">
                {orientation}
              </p>
            )
          ) : null}
        </Container>
      </Section>

      <Section atmosphere="none" className="border-b border-border/35 !py-5 md:!py-16">
        <Container>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg md:text-2xl">
            What this question is not asking
          </h2>
          <ul className="mt-2.5 max-w-2xl list-disc space-y-1 pl-4 text-sm leading-snug text-muted md:mt-6 md:space-y-3 md:pl-5 md:text-base md:leading-relaxed">
            {question.whatThisIsNot.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section atmosphere="transition" className="border-b border-border/35 !py-5 md:!py-16">
        <Container>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg md:text-2xl">
            The path
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted md:mt-4 md:text-base">
            {question.pathStopsEnriched.length} stops · ~{question.totalEstimatedMinutes} min ·
            primary book:{" "}
            <Link href={question.primaryBookHref} className="text-accent hover:underline">
              {question.primaryBookTitle}
            </Link>
          </p>
          <QuestionPath stops={question.pathStopsEnriched} questionId={question.id} />
        </Container>
      </Section>

      <Section atmosphere="none" className="border-b border-border/35 !py-6 md:!py-16">
        <Container>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg md:text-2xl">
            What may feel different—and what remains open
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted md:mt-6">
            {question.closingReflection}
          </p>
          {question.carryForwardQuestion ? (
            <p className="mt-5 max-w-2xl font-display text-lg text-fg/90 md:mt-8 md:text-xl">
              Carry forward: {question.carryForwardQuestion}
            </p>
          ) : null}
        </Container>
      </Section>

      <Section atmosphere="none" className="!py-6 md:!py-20" data-path-keep-exploring>
        <Container>
          <h2 className="font-display text-xl font-medium tracking-tight text-fg md:text-2xl">
            Keep exploring
          </h2>

          {related.length > 0 ? (
            <div className="mt-4 border-b border-border/35 pb-4 md:mt-8 md:pb-8" data-path-related-section>
              <RelatedSectionDisclosure
                id="related-questions"
                title="Related questions"
                countLabel={questionCountLabel(related.length)}
              >
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                  {related.map((relatedQuestion) => (
                    <QuestionCard
                      key={relatedQuestion.id}
                      question={relatedQuestion}
                      location="related"
                      analytics={{
                        event: "question_related_select",
                        params: { from_id: question.id, to_id: relatedQuestion.id },
                      }}
                    />
                  ))}
                </div>
              </RelatedSectionDisclosure>
            </div>
          ) : null}

          <QuestionRelatedTrailsSection question={question} />

          <ul className="mt-5 flex flex-col gap-1 md:mt-8 md:gap-2">
            <li>
              <TrackedLink
                href={question.primaryBookHref}
                className={keepExploringLinkClassName}
                analytics={{
                  event: "question_continue_book",
                  params: {
                    question_id: question.id,
                    book_id: question.primaryBookId,
                  },
                }}
              >
                Read {question.primaryBookTitle} →
              </TrackedLink>
            </li>
            <li>
              <ExplorePathwayLink
                kind="question"
                slug={question.slug}
                label="Explore in the Observatory →"
                analyticsEvent={AnalyticsEvents.questionObservatoryPathway}
                analyticsId={question.id}
                className={keepExploringLinkClassName}
              />
            </li>
            <li>
              <Link href="/questions" className={keepExploringLinkClassName}>
                Browse all questions →
              </Link>
            </li>
          </ul>
        </Container>
      </Section>
    </article>
  );
}
