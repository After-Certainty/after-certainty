import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
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
import { exploreObservatoryFocusHref } from "@/lib/graph/explorePaths";
import { buildQuestionSearchHandoffUrl } from "@/lib/questions/enrichQuestions";
import {
  getEnrichedQuestionBySlug,
  getEnrichedPublishedQuestions,
} from "@/lib/questions/getEnrichedQuestions";
import { createPageMetadata } from "@/lib/metadata";
import { buildQuestionDetailJsonLd } from "@/lib/seo/json-ld";

type PageProps = { params: Promise<{ slug: string }> };

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

  const primaryBookNodeSlug = question.primaryBookHref.split("/").pop() ?? "";
  const observatoryHref = exploreObservatoryFocusHref("book", primaryBookNodeSlug);
  const searchHref = buildQuestionSearchHandoffUrl(question);

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

      <Section atmosphere="transition" className="border-b border-border/40 py-14 md:py-20">
        <Container>
          <BreadcrumbTrail
            items={[
              { label: "Home", href: "/" },
              { label: "Questions", href: "/questions" },
              { label: question.question },
            ]}
          />
          <p className="text-xs uppercase tracking-[0.35em] text-accent">{question.families[0]}</p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight text-fg md:text-5xl">
            {question.question}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {question.orientation}
          </p>
        </Container>
      </Section>

      <Section atmosphere="none" className="border-b border-border/35 py-12 md:py-16">
        <Container>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg">
            What this question is not asking
          </h2>
          <ul className="mt-6 max-w-2xl list-disc space-y-3 pl-5 text-muted">
            {question.whatThisIsNot.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section atmosphere="transition" className="border-b border-border/35 py-12 md:py-16">
        <Container>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg">The path</h2>
          <p className="mt-4 max-w-2xl text-muted">
            {question.pathStopsEnriched.length} stops · ~{question.totalEstimatedMinutes} min ·
            primary book:{" "}
            <Link href={question.primaryBookHref} className="text-accent hover:underline">
              {question.primaryBookTitle}
            </Link>
          </p>
          <QuestionPath stops={question.pathStopsEnriched} questionId={question.id} />
        </Container>
      </Section>

      <Section atmosphere="none" className="border-b border-border/35 py-12 md:py-16">
        <Container>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg">
            What may feel different—and what remains open
          </h2>
          <p className="mt-6 max-w-2xl leading-relaxed text-muted">{question.closingReflection}</p>
          {question.carryForwardQuestion ? (
            <p className="mt-8 max-w-2xl font-display text-xl text-fg/90">
              Carry forward: {question.carryForwardQuestion}
            </p>
          ) : null}
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section atmosphere="none" className="border-b border-border/35 py-12 md:py-16">
          <Container>
            <h2 className="font-display text-2xl font-medium tracking-tight text-fg">
              Related questions
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          </Container>
        </Section>
      ) : null}

      <QuestionRelatedTrailsSection question={question} />

      <Section atmosphere="none" className="py-14 md:py-20">
        <Container>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg">
            Continue exploring
          </h2>
          <ul className="mt-8 flex flex-col gap-4 text-sm">
            <li>
              <TrackedLink
                href={question.primaryBookHref}
                className="text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                analytics={{
                  event: "question_continue_book",
                  params: {
                    question_id: question.id,
                    book_id: question.primaryBookId,
                  },
                }}
              >
                Read {question.primaryBookTitle} in full
              </TrackedLink>
            </li>
            <li>
              <ExplorePathwayLink
                kind="question"
                slug={question.slug}
                analyticsEvent={AnalyticsEvents.questionObservatoryPathway}
                analyticsId={question.id}
              />
            </li>
            <li>
              <Link
                href={observatoryHref}
                className="text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Open this book in the Observatory
              </Link>
            </li>
            <li>
              <TrackedLink
                href={searchHref}
                className="text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                analytics={{
                  event: "question_search_handoff",
                  params: { question_id: question.id },
                }}
              >
                Search this idea across the commons
              </TrackedLink>
            </li>
            <li>
              <Link
                href="/questions"
                className="text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Browse all questions
              </Link>
            </li>
          </ul>
        </Container>
      </Section>
    </article>
  );
}
