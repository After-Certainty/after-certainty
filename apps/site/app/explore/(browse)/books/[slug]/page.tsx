import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { ExploreBookPublicationLinks } from "@/components/explore/explore-book-publication-links";
import { ExploreBookMedia } from "@/components/explore/explore-book-media";
import { ExploreObservatoryFocusLink } from "@/components/explore/explore-observatory-focus-link";
import { ExploreAdjacentNav } from "@/components/explore/explore-adjacent-nav";
import { RelatedContentGrid } from "@/components/explore/related-content-grid";
import { RelationshipList } from "@/components/explore/relationship-list";
import { Section } from "@/components/ui/section";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import {
  buildCoverImageBySlugLookup,
  resolveCoverForGraphBookSlug,
} from "@/lib/explore/graph-book-covers";
import { booksSortedForExploreIndex, exploreBookAdjacentInIndexOrder } from "@/lib/explore/explore-books-order";
import { explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getBookBySlug as getGraphBookBySlug } from "@/lib/graph/graphQueries";
import { getIncomingRelationships, getOutgoingRelationships } from "@/lib/graph/graphTraversal";
import { relatedContentForBook } from "@/lib/graph/relatedContent";
import { getSemanticBookActionLinkItems } from "@/lib/books/semantic-book-action-links";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const book = getGraphBookBySlug(index, slug);
  if (!book) return {};
  return createPageMetadata({
    title: book.title,
    description: book.summary ?? book.subtitle ?? book.title,
  });
}

export default async function ExploreBookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { graph, catalogBooks } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const book = getGraphBookBySlug(index, slug);
  if (!book) notFound();

  const coverLookup = buildCoverImageBySlugLookup(catalogBooks);
  const coverSrc = resolveCoverForGraphBookSlug(coverLookup, catalogBooks, book.slug) ?? book.coverImage;

  const related = relatedContentForBook(index, book);
  const incoming = getIncomingRelationships(index, book.id);
  const outgoing = getOutgoingRelationships(index, book.id);

  const booksInListOrder = booksSortedForExploreIndex(graph.books);
  const { prev: prevBook, next: nextBook } = exploreBookAdjacentInIndexOrder(booksInListOrder, book.slug);

  const publicationLinks = getSemanticBookActionLinkItems(book);

  const hasRelated =
    related.concepts.length + related.patterns.length + related.sources.length > 0;
  const hasRelationships = incoming.length > 0 || outgoing.length > 0;

  return (
    <article>
      <Section atmosphere="none" className="pt-10 md:pt-14 !pb-10 md:!pb-12">
        <BreadcrumbTrail
          items={[
            { label: "Explore", href: explorePaths.home },
            { label: "Books", href: explorePaths.books },
            { label: book.title },
          ]}
        />
        <div className="mb-6">
          <ExploreObservatoryFocusLink kind="book" slug={book.slug} />
        </div>
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
              <p className="max-w-2xl font-display text-xl text-muted md:text-2xl">{book.subtitle}</p>
            ) : null}
            {book.summary ? (
              <p className="max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{book.summary}</p>
            ) : null}
          </div>
        </div>
        <ExploreBookPublicationLinks links={publicationLinks} />
        <ExploreBookMedia book={book} />
        <ExploreAdjacentNav
          basePath={explorePaths.books}
          entityLabel="book"
          prev={prevBook ? { slug: prevBook.slug, title: prevBook.title } : undefined}
          next={nextBook ? { slug: nextBook.slug, title: nextBook.title } : undefined}
        />
      </Section>

      {hasRelated ? (
        <Section atmosphere="transition" className="border-t border-border/25 !pt-8 md:!pt-10 !pb-14 md:!pb-20">
          <div className="flex flex-col gap-14">
            <RelatedContentGrid heading="Major concepts" concepts={related.concepts} />
            <RelatedContentGrid heading="Major patterns" patterns={related.patterns} />
            <RelatedContentGrid heading="Major thinkers" sources={related.sources} />
          </div>
        </Section>
      ) : null}

      {hasRelationships ? (
        <Section atmosphere="none" className="border-t border-border/25 !pt-10 md:!pt-14 !pb-20 md:!pb-28">
          {incoming.length > 0 ? (
            <RelationshipList index={index} relationships={incoming} mode="incoming" title="Incoming relationships" />
          ) : null}
          {outgoing.length > 0 ? (
            <div className={incoming.length > 0 ? "mt-12" : undefined}>
              <RelationshipList index={index} relationships={outgoing} mode="outgoing" title="Outgoing relationships" />
            </div>
          ) : null}
        </Section>
      ) : null}
    </article>
  );
}
