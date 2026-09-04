import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { BookDetailLegacyLayout } from "@/components/books/book-detail-legacy-layout";
import { BookOverviewLayout } from "@/components/books/book-overview-layout";
import { RelatedTrailsSection } from "@/components/trails/related-trails-section";
import { bookPublicationStatus } from "@/lib/books/book-metadata";
import { buildBookOverviewViewModel } from "@/lib/books/book-overview-view-model";
import { resolveBookCanonicalSlug } from "@/lib/books/book-slugs";
import { buildCatalogViewModel } from "@/lib/books/catalog-view-model";
import { getPublicationRegistryFromGraph } from "@/lib/books/load-publication-registry";
import { publicStatusLabel } from "@/lib/books/public-status";
import { findPublishedQuestionsForBook } from "@/lib/books/related-questions-for-book";
import { resolveWorkEdition } from "@/lib/books/resolve-work-edition";
import {
  getOrderedBookActions,
  getSemanticBookActionLinkItems,
} from "@/lib/books/semantic-book-action-links";
import { getPrimaryShelfContextForBook, getShelvesForBook } from "@/lib/books/shelves";
import { findWhatsNewEventsForBook } from "@/lib/whats-new/findEventsForBook";
import { buildPublicWhatsNewEvents } from "@/lib/whats-new/publicEvents";
import { getPublishedQuestions } from "@/lib/questions/loadQuestions";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { firstPublicChapterHref, publicChaptersForEdition } from "@/lib/graph/chapters";
import { exploreBooksShelfHref, explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getBookBySlug as getGraphBookBySlug } from "@/lib/graph/query/graphQueries";
import { relatedContentForBook } from "@/lib/graph/query/relatedContent";
import { resolveThinkersForBook } from "@/lib/graph/query/bookThinkers";
import { entityHasSemanticRelationships } from "@/lib/graph/presentation/relationshipTaxonomy";
import {
  buildContinueReadingCatalog,
  continueReadingCatalogForEdition,
} from "@/lib/reading/continueReading";
import { createPageMetadata } from "@/lib/metadata";
import { bookOpenGraphImageFields } from "@/lib/books/book-open-graph-metadata";
import { resolveBookCover } from "@/lib/books/resolve-book-cover";
import {
  booksSortedForExploreIndex,
  exploreBookAdjacentInIndexOrder,
} from "@/lib/explore/explore-books-order";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const book = getGraphBookBySlug(index, slug);
  if (!book) return {};
  const overview = buildBookOverviewViewModel(book, graph);
  const description =
    overview?.overview.centralQuestion ?? book.summary ?? book.subtitle ?? book.title;
  const canonical = `${explorePaths.books}/${book.slug}`;
  return createPageMetadata({
    title: book.title,
    description,
    alternates: { canonical },
    ...bookOpenGraphImageFields(book),
  });
}

export default async function ExploreBookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const canonicalSlug = resolveBookCanonicalSlug(slug, graph.books);
  if (canonicalSlug && canonicalSlug !== slug) {
    permanentRedirect(`${explorePaths.books}/${canonicalSlug}`);
  }
  const index = buildGraphIndex(graph);
  const book = getGraphBookBySlug(index, slug);
  if (!book) notFound();

  const coverSrc = resolveBookCover(book, "detail")?.src;

  const related = relatedContentForBook(index, book);
  const bookThinkerContent = resolveThinkersForBook(index, book, graph);
  const inventory = {
    concepts: related.concepts,
    patterns: related.patterns,
    thinkers: bookThinkerContent.thinkers,
    researchSources: bookThinkerContent.researchSources,
    songs: related.songs,
    useLegacyThinkersSection: bookThinkerContent.useLegacyThinkersSection,
  };
  const hasRelationships = entityHasSemanticRelationships(index, book.id);

  const registry = getPublicationRegistryFromGraph(graph);
  const resolved = resolveWorkEdition(book, graph.books, registry);
  const registryEdition = registry.editions.find((e) => e.bookId === book.id);
  const status = bookPublicationStatus(book);
  const upcomingLabel = publicStatusLabel(status);

  const relatedSlug =
    resolved.relationship === "superseded"
      ? resolved.supersededBySlug
      : resolved.relationship === "companion"
        ? resolved.companionOfSlug
        : undefined;
  const relatedEdition = relatedSlug ? graph.books.find((b) => b.slug === relatedSlug) : undefined;

  const companionEdition =
    resolved.relationship === "primary"
      ? graph.books.find(
          (b) =>
            (book.companionBooks?.includes(b.slug) ?? false) ||
            resolveWorkEdition(b, graph.books, registry).companionOfSlug === book.slug,
        )
      : undefined;

  const catalogViewModel = buildCatalogViewModel(graph);
  const catalogBook = catalogViewModel.find((row) => row.id === book.id || row.slug === book.slug);
  const membershipShelves = catalogBook ? getShelvesForBook(catalogBook, graph) : [];
  const primaryShelf = catalogBook
    ? getPrimaryShelfContextForBook(catalogBook, graph, catalogViewModel)
    : null;
  const chapterCount = publicChaptersForEdition(graph, book.id).length;

  const bookBreadcrumbs = [
    { label: "Explore", href: explorePaths.home },
    { label: "Books", href: explorePaths.books },
    ...(primaryShelf
      ? [
          {
            label: primaryShelf.shelf.title,
            href: exploreBooksShelfHref(primaryShelf.shelf.slug),
          },
        ]
      : []),
    { label: book.title },
  ];

  const overviewVm = buildBookOverviewViewModel(book, graph);
  const relatedWhatsNew = findWhatsNewEventsForBook(book.id, {
    limit: 3,
    events: buildPublicWhatsNewEvents({ changeEvents: graph.changeEvents }),
  });
  const relatedQuestions = findPublishedQuestionsForBook(book.id, 2, getPublishedQuestions(graph));
  const readHref = firstPublicChapterHref(graph, book.id) ?? undefined;
  const continueReadingCatalog = continueReadingCatalogForEdition(
    buildContinueReadingCatalog(graph),
    book.id,
  );

  if (overviewVm) {
    const actions = getOrderedBookActions({
      book,
      relationship: resolved.relationship,
      preference: overviewVm.primaryActionPreference,
      currentEditionHref: relatedEdition
        ? `${explorePaths.books}/${relatedEdition.slug}`
        : undefined,
      currentEditionTitle: relatedEdition?.title,
      readHref,
    });

    return (
      <BookOverviewLayout
        vm={overviewVm}
        coverSrc={coverSrc}
        registryEdition={registryEdition}
        relatedEdition={relatedEdition}
        companionEdition={companionEdition}
        actions={actions}
        relatedQuestions={relatedQuestions}
        relatedWhatsNew={relatedWhatsNew}
        inventory={inventory}
        hasRelationships={hasRelationships}
        index={index}
        breadcrumbs={bookBreadcrumbs}
        relatedTrails={<RelatedTrailsSection canonicalId={book.id} entityLabel="book" />}
        continueReadingCatalog={continueReadingCatalog}
        membershipShelves={membershipShelves}
        primaryShelf={primaryShelf}
        chapterCount={chapterCount}
      />
    );
  }

  const booksInListOrder = booksSortedForExploreIndex(graph.books);
  const { prev: prevBook, next: nextBook } = exploreBookAdjacentInIndexOrder(
    booksInListOrder,
    book.slug,
  );

  const publicationLinks = [
    ...(readHref ? [{ label: "Read book", href: readHref, kind: "read" as const }] : []),
    ...getSemanticBookActionLinkItems(book),
  ];

  return (
    <BookDetailLegacyLayout
      book={book}
      coverSrc={coverSrc}
      status={status}
      upcomingLabel={upcomingLabel}
      relationship={resolved.relationship}
      editionLabel={resolved.editionLabel}
      relatedEdition={relatedEdition}
      companionEdition={companionEdition}
      firstPublishedAt={registryEdition?.firstPublishedAt}
      revisedAt={registryEdition?.revisedAt}
      changeSummary={registryEdition?.changeSummary}
      publicationLinks={publicationLinks}
      prevBook={prevBook ? { slug: prevBook.slug, title: prevBook.title } : undefined}
      nextBook={nextBook ? { slug: nextBook.slug, title: nextBook.title } : undefined}
      inventory={inventory}
      hasRelationships={hasRelationships}
      index={index}
      breadcrumbs={bookBreadcrumbs}
      relatedWhatsNew={relatedWhatsNew}
      continueReadingCatalog={continueReadingCatalog}
      membershipShelves={membershipShelves}
      primaryShelf={primaryShelf}
      chapterCount={chapterCount}
    />
  );
}
