import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { BookOverviewActions } from "@/components/books/book-overview-actions";
import { BookOverviewEditionHistory } from "@/components/books/book-overview-edition-history";
import { BookWhatsNewLinks } from "@/components/books/book-whats-new-links";
import { EditionNotice } from "@/components/books/edition-notice";
import { StatusLabel } from "@/components/books/status-label";
import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { ExploreBookMedia } from "@/components/explore/explore-book-media";
import { RelatedContentGrid } from "@/components/explore/related-content-grid";
import { SemanticRelationshipsSection } from "@/components/explore/semantic-relationships-section";
import { JsonLd } from "@/components/seo/json-ld";
import { LinkifiedText } from "@/components/ui/linkified-text";
import { Section } from "@/components/ui/section";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { bookPublicationStatus } from "@/lib/books/book-metadata";
import type { BookOverviewViewModel } from "@/lib/books/book-overview-view-model";
import type { PublicationEdition } from "@/lib/books/publication-registry-schema";
import { formatPublicationMonthYear, publicStatusLabel } from "@/lib/books/public-status";
import type { OrderedBookActions } from "@/lib/books/semantic-book-action-links";
import { getConceptDisplayDefinition } from "@/lib/graph/conceptFormatting";
import { explorePaths } from "@/lib/graph/explorePaths";
import type { GraphIndex } from "@/lib/graph/graph";
import { buildBookPageJsonLd } from "@/lib/seo/json-ld";
import type { QuestionDefinition } from "@/types/questions";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";
import type { Book, GlossaryConcept, Pattern, Source, Thinker } from "@/types/semanticGraph";

export type BookOverviewRelatedInventory = {
  concepts: GlossaryConcept[];
  patterns: Pattern[];
  thinkers: Thinker[];
  researchSources: Source[];
  useLegacyThinkersSection: boolean;
};

export type BookOverviewLayoutProps = {
  vm: BookOverviewViewModel;
  coverSrc?: string;
  registryEdition?: PublicationEdition;
  relatedEdition?: Book;
  companionEdition?: Book;
  actions: OrderedBookActions;
  relatedQuestions: QuestionDefinition[];
  relatedWhatsNew: WhatsNewEvent[];
  inventory: BookOverviewRelatedInventory;
  hasRelationships: boolean;
  index: GraphIndex;
  breadcrumbs: { label: string; href?: string }[];
  relatedTrails?: ReactNode;
};

function OverviewSection({
  id,
  title,
  children,
  lead,
}: {
  id?: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <Section id={id} atmosphere="none" className="border-t border-border/25 !py-12 md:!py-16">
      <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
        {title}
      </h2>
      {lead ? <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{lead}</p> : null}
      <div className="mt-8">{children}</div>
    </Section>
  );
}

/** Orientation-first book overview for books with authored overlays (Phase G). */
export function BookOverviewLayout({
  vm,
  coverSrc,
  registryEdition,
  relatedEdition,
  companionEdition,
  actions,
  relatedQuestions,
  relatedWhatsNew,
  inventory,
  hasRelationships,
  index,
  breadcrumbs,
  relatedTrails,
}: BookOverviewLayoutProps) {
  const { book, overview, edition, selectedConcepts, selectedPatterns, readBefore, readNext } = vm;
  const status = bookPublicationStatus(book);
  const upcomingLabel = publicStatusLabel(status);
  const firstPublished = registryEdition?.firstPublishedAt
    ? formatPublicationMonthYear(registryEdition.firstPublishedAt)
    : undefined;
  const revisedAt = overview.revisedAt ?? registryEdition?.revisedAt;
  const changeSummary = overview.changeSummary ?? registryEdition?.changeSummary;
  const revised = revisedAt ? formatPublicationMonthYear(revisedAt) : undefined;
  const multiVolume = edition.siblingCount > 1;
  const inventoryCount =
    inventory.concepts.length +
    inventory.patterns.length +
    inventory.thinkers.length +
    inventory.researchSources.length;

  const continueBook = readNext[0];
  const continueQuestion = relatedQuestions[0];

  return (
    <article>
      <JsonLd data={buildBookPageJsonLd({ book, breadcrumbs })} />

      <Section atmosphere="none" className="pt-10 md:pt-14 !pb-10 md:!pb-12">
        <BreadcrumbTrail items={breadcrumbs} />
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Book</p>
          {upcomingLabel ? <StatusLabel label={upcomingLabel} kind="upcoming" /> : null}
          {edition.relationship === "companion" ? (
            <StatusLabel label={edition.editionLabel ?? "Companion edition"} kind="companion" />
          ) : null}
          {edition.relationship === "superseded" ? (
            <StatusLabel label={edition.editionLabel ?? "Earlier edition"} kind="superseded" />
          ) : null}
        </div>

        <div
          className={
            coverSrc
              ? "mt-6 grid gap-10 md:grid-cols-[minmax(0,220px)_1fr] md:items-start"
              : "mt-6 space-y-4"
          }
        >
          {coverSrc ? (
            <div className="relative mx-auto aspect-[2/3] w-full max-w-[220px] shrink-0 overflow-hidden rounded-md border border-border/40 bg-bg-elevated/40 md:mx-0">
              <Image
                src={coverSrc}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:768px) 280px, 220px"
                priority
              />
            </div>
          ) : null}
          <div className="min-w-0 space-y-4">
            <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-tight text-fg md:text-5xl">
              {book.title}
            </h1>
            {book.subtitle ? (
              <p className="max-w-2xl font-display text-xl text-muted md:text-2xl">
                {book.subtitle}
              </p>
            ) : null}
            {book.summary ? (
              <p className="max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
                <LinkifiedText text={book.summary} />
              </p>
            ) : null}
            {(firstPublished || revised) && !multiVolume ? (
              <p className="text-sm text-muted">
                {firstPublished ? <>First published {firstPublished}</> : null}
                {firstPublished && revised ? <span aria-hidden> · </span> : null}
                {revised ? <>Substantially revised {revised}</> : null}
              </p>
            ) : null}
            <EditionNotice
              bookId={book.id}
              status={status}
              relationship={edition.relationship}
              editionLabel={edition.editionLabel}
              relatedHref={
                relatedEdition ? `${explorePaths.books}/${relatedEdition.slug}` : undefined
              }
              relatedTitle={relatedEdition?.title}
              companionHref={
                companionEdition ? `${explorePaths.books}/${companionEdition.slug}` : undefined
              }
              companionTitle={companionEdition?.title}
              firstPublishedAt={multiVolume ? registryEdition?.firstPublishedAt : undefined}
              revisedAt={multiVolume ? revisedAt : undefined}
              changeSummary={multiVolume ? changeSummary : undefined}
            />
          </div>
        </div>

        <BookOverviewActions bookId={book.id} bookSlug={book.slug} actions={actions} />
        <ExploreBookMedia book={book} />
      </Section>

      <OverviewSection id="question" title="The question this book explores">
        <p className="max-w-3xl font-display text-2xl font-medium leading-snug tracking-tight text-fg md:text-3xl">
          {overview.centralQuestion}
        </p>
      </OverviewSection>

      <OverviewSection id="why" title="Why this book exists" lead={overview.whyItExists}>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.24em] text-muted">Who it is for</h3>
            <p className="mt-3 text-base leading-relaxed text-fg/90">{overview.audience}</p>
          </div>
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.24em] text-muted">What it is not</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-fg/90">
              {overview.nonGoals.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </OverviewSection>

      {selectedConcepts.length + selectedPatterns.length > 0 ? (
        <OverviewSection
          id="ideas"
          title="Central ideas"
          lead="A curated handful of concepts and patterns this book develops — not the full inventory."
        >
          <ul className="grid gap-6 sm:grid-cols-2">
            {selectedConcepts.map((concept) => (
              <li key={concept.id} className="space-y-2 border-t border-border/30 pt-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-accent">Concept</p>
                <TrackedLink
                  href={`${explorePaths.concepts}/${concept.slug}`}
                  className="font-display text-xl font-medium tracking-tight text-fg transition-colors hover:text-accent"
                  analytics={{
                    event: AnalyticsEvents.bookOverviewConceptSelect,
                    params: { book_id: book.id, concept_id: concept.id },
                  }}
                >
                  {concept.title}
                </TrackedLink>
                <p className="text-sm leading-relaxed text-muted">
                  {getConceptDisplayDefinition(concept)}
                </p>
              </li>
            ))}
            {selectedPatterns.map((pattern) => (
              <li key={pattern.id} className="space-y-2 border-t border-border/30 pt-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-accent">Pattern</p>
                <TrackedLink
                  href={`${explorePaths.patterns}/${pattern.slug}`}
                  className="font-display text-xl font-medium tracking-tight text-fg transition-colors hover:text-accent"
                  analytics={{
                    event: AnalyticsEvents.bookOverviewRelatedSelect,
                    params: {
                      book_id: book.id,
                      destination_id: pattern.id,
                      destination_kind: "pattern",
                    },
                  }}
                >
                  {pattern.title}
                </TrackedLink>
                <p className="text-sm leading-relaxed text-muted">{pattern.summary}</p>
              </li>
            ))}
          </ul>
          {inventory.concepts.length + inventory.patterns.length >
          selectedConcepts.length + selectedPatterns.length ? (
            <p className="mt-8 text-sm">
              <a
                href="#full-inventory"
                className="text-accent underline-offset-4 transition-colors hover:text-fg hover:underline"
              >
                Explore all concepts and patterns for this book
              </a>
            </p>
          ) : null}
        </OverviewSection>
      ) : null}

      <OverviewSection
        id="where"
        title="Where it fits"
        lead="Suggested reading order and nearby volumes — not a mandatory sequence."
      >
        <div className="grid gap-10 md:grid-cols-2">
          {readBefore.length > 0 ? (
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.24em] text-muted">Read before</h3>
              <ul className="mt-3 space-y-2">
                {readBefore.map((related) => (
                  <li key={related.id}>
                    <TrackedLink
                      href={`${explorePaths.books}/${related.slug}`}
                      className="text-accent underline-offset-4 hover:underline"
                      analytics={{
                        event: AnalyticsEvents.bookOverviewRelatedSelect,
                        params: {
                          book_id: book.id,
                          destination_id: related.id,
                          destination_kind: "book",
                        },
                      }}
                    >
                      {related.title}
                    </TrackedLink>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {readNext.length > 0 ? (
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.24em] text-muted">Read next</h3>
              <ul className="mt-3 space-y-2">
                {readNext.map((related) => (
                  <li key={related.id}>
                    <TrackedLink
                      href={`${explorePaths.books}/${related.slug}`}
                      className="text-accent underline-offset-4 hover:underline"
                      analytics={{
                        event: AnalyticsEvents.bookOverviewRelatedSelect,
                        params: {
                          book_id: book.id,
                          destination_id: related.id,
                          destination_kind: "book",
                        },
                      }}
                    >
                      {related.title}
                    </TrackedLink>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        {companionEdition ? (
          <p className="mt-8 text-sm text-muted">
            Companion volume:{" "}
            <TrackedLink
              href={`${explorePaths.books}/${companionEdition.slug}`}
              className="text-accent underline-offset-4 hover:underline"
              analytics={{
                event: AnalyticsEvents.editionCompanionSelect,
                params: {
                  book_id: book.id,
                  destination: `${explorePaths.books}/${companionEdition.slug}`,
                  notice: "overview_where_it_fits",
                },
              }}
            >
              {companionEdition.title}
            </TrackedLink>
          </p>
        ) : null}
        {readBefore.length === 0 && readNext.length === 0 && !companionEdition ? (
          <p className="text-sm text-muted">
            This volume stands on its own. Explore related trails below for longer paths through the
            project.
          </p>
        ) : null}
      </OverviewSection>

      {(multiVolume || Boolean(changeSummary)) && (
        <Section atmosphere="none" className="border-t border-border/25 !py-12 md:!py-16">
          {multiVolume ? (
            <BookOverviewEditionHistory bookId={book.id}>
              {firstPublished ? <p>First published {firstPublished}.</p> : null}
              {revised ? <p>Substantially revised {revised}.</p> : null}
              {changeSummary ? <p>{changeSummary}</p> : null}
              {edition.relationship === "primary" && companionEdition ? (
                <p>
                  Primary volume for this work. Companion:{" "}
                  <Link
                    href={`${explorePaths.books}/${companionEdition.slug}`}
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    {companionEdition.title}
                  </Link>
                  .
                </p>
              ) : null}
              {edition.relationship === "companion" && relatedEdition ? (
                <p>
                  Companion to{" "}
                  <Link
                    href={`${explorePaths.books}/${relatedEdition.slug}`}
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    {relatedEdition.title}
                  </Link>
                  — not a replacement.
                </p>
              ) : null}
              {!firstPublished &&
              !revised &&
              !changeSummary &&
              !companionEdition &&
              !relatedEdition ? (
                <p>This work has more than one public volume.</p>
              ) : null}
            </BookOverviewEditionHistory>
          ) : (
            <div>
              <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
                Edition and updates
              </h2>
              <div className="mt-6 space-y-2 text-sm leading-relaxed text-muted">
                {firstPublished ? <p>First published {firstPublished}.</p> : null}
                {revised ? <p>Substantially revised {revised}.</p> : null}
                {changeSummary ? <p>{changeSummary}</p> : null}
              </div>
            </div>
          )}
        </Section>
      )}

      <OverviewSection id="continue" title="Continue exploring">
        <ul className="space-y-4 text-base leading-relaxed">
          {continueBook ? (
            <li>
              <span className="text-muted">Next book — </span>
              <TrackedLink
                href={`${explorePaths.books}/${continueBook.slug}`}
                className="text-accent underline-offset-4 hover:underline"
                analytics={{
                  event: AnalyticsEvents.bookOverviewRelatedSelect,
                  params: {
                    book_id: book.id,
                    destination_id: continueBook.id,
                    destination_kind: "book",
                  },
                }}
              >
                {continueBook.title}
              </TrackedLink>
            </li>
          ) : null}
          {continueQuestion ? (
            <li>
              <span className="text-muted">Start with a question — </span>
              <TrackedLink
                href={`/questions/${continueQuestion.slug}`}
                className="text-accent underline-offset-4 hover:underline"
                analytics={{
                  event: AnalyticsEvents.bookOverviewRelatedSelect,
                  params: {
                    book_id: book.id,
                    destination_id: continueQuestion.id,
                    destination_kind: "question",
                  },
                }}
              >
                {continueQuestion.question}
              </TrackedLink>
            </li>
          ) : null}
        </ul>
        <div className="mt-8 border-t border-border/25 pt-6">
          <h3 className="text-[11px] uppercase tracking-[0.24em] text-muted">Updates</h3>
          <div className="mt-3">
            <BookWhatsNewLinks bookId={book.id} events={relatedWhatsNew} />
          </div>
        </div>
      </OverviewSection>

      {relatedTrails}

      {inventoryCount > 0 ? (
        <Section
          id="full-inventory"
          atmosphere="transition"
          className="border-t border-border/25 !pt-8 md:!pt-10 !pb-14 md:!pb-20"
        >
          <details className="group">
            <summary className="cursor-pointer list-none font-display text-2xl font-medium tracking-tight text-fg marker:content-none md:text-3xl [&::-webkit-details-marker]:hidden">
              <span className="inline-flex flex-wrap items-baseline gap-3">
                Full related inventory
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted group-open:hidden">
                  Show
                </span>
                <span className="hidden text-[11px] uppercase tracking-[0.18em] text-muted group-open:inline">
                  Hide
                </span>
              </span>
            </summary>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              Complete concept, pattern, and thinker lists for readers who want the full semantic
              map.
            </p>
            <div className="mt-10 flex flex-col gap-14">
              <RelatedContentGrid heading="Major concepts" concepts={inventory.concepts} />
              <RelatedContentGrid heading="Major patterns" patterns={inventory.patterns} />
              {inventory.useLegacyThinkersSection ? (
                <RelatedContentGrid heading="Major thinkers" sources={inventory.researchSources} />
              ) : (
                <>
                  <RelatedContentGrid heading="Major thinkers" thinkers={inventory.thinkers} />
                  <RelatedContentGrid
                    heading="Research sources"
                    sources={inventory.researchSources}
                  />
                </>
              )}
            </div>
          </details>
        </Section>
      ) : null}

      {hasRelationships ? (
        <Section
          atmosphere="none"
          className="border-t border-border/25 !pt-10 md:!pt-14 !pb-20 md:!pb-28"
        >
          <details className="group">
            <summary className="cursor-pointer list-none font-display text-2xl font-medium tracking-tight text-fg marker:content-none md:text-3xl [&::-webkit-details-marker]:hidden">
              <span className="inline-flex flex-wrap items-baseline gap-3">
                Semantic relationships
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted group-open:hidden">
                  Show
                </span>
                <span className="hidden text-[11px] uppercase tracking-[0.18em] text-muted group-open:inline">
                  Hide
                </span>
              </span>
            </summary>
            <div className="mt-10">
              <SemanticRelationshipsSection
                index={index}
                focalCanonicalId={book.id}
                focalKind="book"
                focalSlug={book.slug}
              />
            </div>
          </details>
        </Section>
      ) : null}
    </article>
  );
}
