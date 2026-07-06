import type { Metadata } from "next";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { resolveBookCanonicalSlug } from "@/lib/books/generated-manifest";
import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { JsonLd } from "@/components/seo/json-ld";
import { ExploreBookMedia } from "@/components/explore/explore-book-media";
import { ExploreEntityDetailActions } from "@/components/explore/explore-entity-detail-actions";
import { ExploreAdjacentNav } from "@/components/explore/explore-adjacent-nav";
import { RelatedContentGrid } from "@/components/explore/related-content-grid";
import { SemanticRelationshipsSection } from "@/components/explore/semantic-relationships-section";
import { entityHasSemanticRelationships } from "@/lib/graph/relationshipTaxonomy";
import { Section } from "@/components/ui/section";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import {
  buildCoverImageBySlugLookup,
  resolveCoverForGraphBookSlug,
} from "@/lib/explore/graph-book-covers";
import {
  booksSortedForExploreIndex,
  exploreBookAdjacentInIndexOrder,
} from "@/lib/explore/explore-books-order";
import { explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getBookBySlug as getGraphBookBySlug } from "@/lib/graph/graphQueries";
import { relatedContentForBook } from "@/lib/graph/relatedContent";
import { resolveThinkersForBook } from "@/lib/graph/bookThinkers";
import { getSemanticBookActionLinkItems } from "@/lib/books/semantic-book-action-links";
import { createPageMetadata } from "@/lib/metadata";
import { buildBookPageJsonLd, resolveCatalogBookForSemanticBook } from "@/lib/seo/json-ld";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const book = getGraphBookBySlug(index, slug);
  if (!book) return {};
  const description = book.summary ?? book.subtitle ?? book.title;
  if (!book.openGraphImage) {
    return createPageMetadata({ title: book.title, description });
  }
  return createPageMetadata({
    title: book.title,
    description,
    openGraph: {
      images: [{ url: book.openGraphImage, alt: book.title }],
    },
    twitter: {
      images: [book.openGraphImage],
    },
  });
}

export default async function ExploreBookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { graph, catalogBooks } = await getExploreSemanticGraph();
  const canonicalSlug = resolveBookCanonicalSlug(slug, catalogBooks);
  if (canonicalSlug && canonicalSlug !== slug) {
    permanentRedirect(`${explorePaths.books}/${canonicalSlug}`);
  }
  const index = buildGraphIndex(graph);
  const book = getGraphBookBySlug(index, slug);
  if (!book) notFound();

  const coverLookup = buildCoverImageBySlugLookup(catalogBooks);
  const coverSrc =
    resolveCoverForGraphBookSlug(coverLookup, catalogBooks, book.slug) ?? book.coverImage;

  const related = relatedContentForBook(index, book);
  const bookThinkerContent = resolveThinkersForBook(index, book, graph);
  const booksInListOrder = booksSortedForExploreIndex(graph.books);
  const { prev: prevBook, next: nextBook } = exploreBookAdjacentInIndexOrder(
    booksInListOrder,
    book.slug,
  );

  const publicationLinks = getSemanticBookActionLinkItems(book);

  const hasRelated =
    related.concepts.length +
      related.patterns.length +
      (bookThinkerContent.useLegacyThinkersSection
        ? bookThinkerContent.researchSources.length
        : bookThinkerContent.thinkers.length + bookThinkerContent.researchSources.length) >
    0;
  const hasRelationships = entityHasSemanticRelationships(index, book.id);

  const bookBreadcrumbs = [
    { label: "Explore", href: explorePaths.home },
    { label: "Books", href: explorePaths.books },
    { label: book.title },
  ];
  const catalogBook = resolveCatalogBookForSemanticBook(book, catalogBooks);

  return (
    <article>
      <JsonLd
        data={buildBookPageJsonLd({
          book,
          catalogBook,
          breadcrumbs: bookBreadcrumbs,
        })}
      />
      <Section atmosphere="none" className="pt-10 md:pt-14 !pb-10 md:!pb-12">
        <BreadcrumbTrail items={bookBreadcrumbs} />
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Book</p>
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
                {book.summary}
              </p>
            ) : null}
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
          prev={prevBook ? { slug: prevBook.slug, title: prevBook.title } : undefined}
          next={nextBook ? { slug: nextBook.slug, title: nextBook.title } : undefined}
        />
      </Section>

      {hasRelated ? (
        <Section
          atmosphere="transition"
          className="border-t border-border/25 !pt-8 md:!pt-10 !pb-14 md:!pb-20"
        >
          <div className="flex flex-col gap-14">
            <RelatedContentGrid heading="Major concepts" concepts={related.concepts} />
            <RelatedContentGrid heading="Major patterns" patterns={related.patterns} />
            {bookThinkerContent.useLegacyThinkersSection ? (
              <RelatedContentGrid
                heading="Major thinkers"
                sources={bookThinkerContent.researchSources}
              />
            ) : (
              <>
                <RelatedContentGrid
                  heading="Major thinkers"
                  thinkers={bookThinkerContent.thinkers}
                />
                <RelatedContentGrid
                  heading="Research sources"
                  sources={bookThinkerContent.researchSources}
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
