import Image from "next/image";

import { BookWhatsNewLinks } from "@/components/books/book-whats-new-links";
import { EditionNotice } from "@/components/books/edition-notice";
import { StatusLabel } from "@/components/books/status-label";
import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { ExploreAdjacentNav } from "@/components/explore/explore-adjacent-nav";
import { ExploreBookMedia } from "@/components/explore/explore-book-media";
import { ExploreEntityDetailActions } from "@/components/explore/explore-entity-detail-actions";
import { RelatedContentGrid } from "@/components/explore/related-content-grid";
import { SemanticRelationshipsSection } from "@/components/explore/semantic-relationships-section";
import { JsonLd } from "@/components/seo/json-ld";
import { RelatedTrailsSection } from "@/components/trails/related-trails-section";
import { LinkifiedText } from "@/components/ui/linkified-text";
import { Section } from "@/components/ui/section";
import type { BookStatus } from "@/types/content";
import type { EditionRelationship } from "@/lib/books/publication-registry-schema";
import type { SemanticBookActionLinkItem } from "@/lib/books/semantic-book-action-links";
import { explorePaths } from "@/lib/graph/explorePaths";
import type { GraphIndex } from "@/lib/graph/graph";
import { buildBookPageJsonLd } from "@/lib/seo/json-ld";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";
import type { Book, GlossaryConcept, Pattern, Source, Thinker } from "@/types/semanticGraph";

export type BookDetailLegacyLayoutProps = {
  book: Book;
  coverSrc?: string;
  status: BookStatus;
  upcomingLabel?: string;
  relationship: EditionRelationship;
  editionLabel?: string;
  relatedEdition?: Book;
  companionEdition?: Book;
  firstPublishedAt?: string;
  revisedAt?: string;
  changeSummary?: string;
  publicationLinks: SemanticBookActionLinkItem[];
  prevBook?: { slug: string; title: string };
  nextBook?: { slug: string; title: string };
  inventory: {
    concepts: GlossaryConcept[];
    patterns: Pattern[];
    thinkers: Thinker[];
    researchSources: Source[];
    useLegacyThinkersSection: boolean;
  };
  hasRelationships: boolean;
  index: GraphIndex;
  breadcrumbs: { label: string; href?: string }[];
  relatedWhatsNew?: WhatsNewEvent[];
};

/** Pre–Phase G book detail layout for books without an overview overlay. */
export function BookDetailLegacyLayout({
  book,
  coverSrc,
  status,
  upcomingLabel,
  relationship,
  editionLabel,
  relatedEdition,
  companionEdition,
  firstPublishedAt,
  revisedAt,
  changeSummary,
  publicationLinks,
  prevBook,
  nextBook,
  inventory,
  hasRelationships,
  index,
  breadcrumbs,
  relatedWhatsNew = [],
}: BookDetailLegacyLayoutProps) {
  const hasRelated =
    inventory.concepts.length +
      inventory.patterns.length +
      inventory.thinkers.length +
      inventory.researchSources.length >
    0;

  return (
    <article>
      <JsonLd data={buildBookPageJsonLd({ book, breadcrumbs })} />
      <Section atmosphere="none" className="pt-10 md:pt-14 !pb-10 md:!pb-12">
        <BreadcrumbTrail items={breadcrumbs} />
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Book</p>
          {upcomingLabel ? <StatusLabel label={upcomingLabel} kind="upcoming" /> : null}
          {relationship === "companion" ? (
            <StatusLabel label={editionLabel ?? "Companion edition"} kind="companion" />
          ) : null}
          {relationship === "superseded" ? (
            <StatusLabel label={editionLabel ?? "Earlier edition"} kind="superseded" />
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
            <EditionNotice
              bookId={book.id}
              status={status}
              relationship={relationship}
              editionLabel={editionLabel}
              relatedHref={
                relatedEdition ? `${explorePaths.books}/${relatedEdition.slug}` : undefined
              }
              relatedTitle={relatedEdition?.title}
              companionHref={
                companionEdition ? `${explorePaths.books}/${companionEdition.slug}` : undefined
              }
              companionTitle={companionEdition?.title}
              firstPublishedAt={firstPublishedAt}
              revisedAt={revisedAt}
              changeSummary={changeSummary}
            />
          </div>
        </div>
        <ExploreEntityDetailActions
          observatory={{ kind: "book", slug: book.slug }}
          publicationLinks={publicationLinks}
        />
        <ExploreBookMedia book={book} />
        <ExploreAdjacentNav
          basePath={explorePaths.books}
          entityLabel="book"
          prev={prevBook}
          next={nextBook}
        />
      </Section>

      <Section
        atmosphere="none"
        className="border-t border-border/25 !pt-8 md:!pt-10 !pb-8 md:!pb-10"
        aria-label="What’s New"
      >
        <h2 className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
          Updates for this book
        </h2>
        <div className="mt-6">
          <BookWhatsNewLinks bookId={book.id} events={relatedWhatsNew} />
        </div>
      </Section>

      <RelatedTrailsSection canonicalId={book.id} entityLabel="book" />

      {hasRelated ? (
        <Section
          atmosphere="transition"
          className="border-t border-border/25 !pt-8 md:!pt-10 !pb-14 md:!pb-20"
        >
          <div className="flex flex-col gap-14">
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
        </Section>
      ) : null}

      {hasRelationships ? (
        <Section
          atmosphere="none"
          className="border-t border-border/25 !pt-10 md:!pt-14 !pb-20 md:!pb-28"
        >
          <SemanticRelationshipsSection
            index={index}
            focalCanonicalId={book.id}
            focalKind="book"
            focalSlug={book.slug}
          />
        </Section>
      ) : null}
    </article>
  );
}
