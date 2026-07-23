import {
  bookAvailabilityFlags,
  bookDescription,
  bookIsPublic,
  bookPublicationStatus,
  type BookAvailabilityFlag,
} from "@/lib/books/book-metadata";
import { recommendedRankForSlug, type ContentType } from "@/lib/books/catalog-taxonomy";
import { assignShelfIds } from "@/lib/books/shelves";
import { buildResolvedEditionIndex } from "@/lib/books/resolve-work-edition";
import { publicationRegistryFromGraph } from "@/lib/graph/discovery";
import { contentTypeInfoFromBook } from "@/lib/graph/content-type";
import type { EditionRelationship } from "@/lib/books/publication-registry-schema";
import { explorePaths } from "@/lib/graph/explorePaths";
import {
  buildCoverImageBySlugLookup,
  resolveCoverForGraphBookSlug,
} from "@/lib/explore/graph-book-covers";
import type { BookStatus } from "@/types/content";
import type { BookLiteraryForm, SemanticGraph } from "@/types/semanticGraph";

export type CatalogBookView = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  coverImage?: string;
  status: BookStatus;
  isPublic: boolean;
  isCanonicalEdition: boolean;
  editionRelationship: EditionRelationship;
  editionLabel?: string;
  contentType: ContentType;
  /** Accessible content-type label from the centralized adapter. */
  contentTypeLabel: string;
  literaryForm?: BookLiteraryForm;
  themes: string[];
  shelfIds: string[];
  availability: BookAvailabilityFlag[];
  publicationYear?: number;
  recommendedRank: number;
  href: string;
};

export function buildCatalogViewModel(graph: SemanticGraph): CatalogBookView[] {
  const books = graph.books;
  const coverLookup = buildCoverImageBySlugLookup(books);
  const editions = buildResolvedEditionIndex(books, publicationRegistryFromGraph(graph));

  const rows: CatalogBookView[] = books.map((book) => {
    const status = bookPublicationStatus(book);
    const resolved = editions.get(book.slug);
    const coverImage =
      resolveCoverForGraphBookSlug(coverLookup, books, book.slug) ?? book.coverImage;
    const typeInfo = contentTypeInfoFromBook(book);

    return {
      id: book.id,
      slug: book.slug,
      title: book.title,
      subtitle: book.subtitle,
      description: bookDescription(book),
      coverImage,
      status,
      isPublic: bookIsPublic(book),
      isCanonicalEdition: resolved?.isCanonical ?? true,
      editionRelationship: resolved?.relationship ?? "sole",
      editionLabel: resolved?.editionLabel,
      contentType: typeInfo.contentType,
      contentTypeLabel: typeInfo.label,
      literaryForm: typeInfo.literaryForm,
      themes: [],
      shelfIds: [],
      availability: bookAvailabilityFlags(book),
      publicationYear: book.year,
      recommendedRank: recommendedRankForSlug(book.slug),
      href: `${explorePaths.books}/${book.slug}`,
    };
  });

  return assignShelfIds(rows, graph);
}

/** Default catalog rows: public canonical editions only. */
export function defaultCatalogBooks(
  viewModel: readonly CatalogBookView[],
  showAllEditions = false,
): CatalogBookView[] {
  return viewModel.filter((b) => {
    if (!b.isPublic) return false;
    if (showAllEditions) return true;
    return b.isCanonicalEdition;
  });
}

export type CatalogSearchItem = {
  id: string;
  slug: string;
  label: string;
  subtitle?: string;
};

export function buildCatalogSearchItems(
  viewModel: readonly CatalogBookView[],
): CatalogSearchItem[] {
  return viewModel.map((b) => ({
    id: b.id,
    slug: b.slug,
    label: b.title,
    subtitle: b.subtitle,
  }));
}
