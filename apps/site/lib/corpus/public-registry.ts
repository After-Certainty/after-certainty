import { bookIsPublic } from "@/lib/books/book-metadata";
import {
  buildCatalogViewModel,
  defaultCatalogBooks,
  type CatalogBookView,
} from "@/lib/books/catalog-view-model";
import { getActiveShelves, resolveShelfBooks } from "@/lib/books/shelves";
import { explorePaths } from "@/lib/graph/explorePaths";
import { contentTypeInfoFromBook } from "@/lib/graph/content-type";
import { resolveThinkers } from "@/lib/graph/thinkers";
import { getPublishedQuestions } from "@/lib/questions/loadQuestions";
import { getPublishedTrails } from "@/lib/trails/loadTrails";
import { buildSearchDocuments } from "@/lib/search/buildSearchDocuments";
import type { ContentType } from "@/lib/books/catalog-taxonomy";
import type { SearchDocument } from "@/lib/search/types";
import type { SemanticGraph } from "@/types/semanticGraph";

export type PublicEntityKind =
  | "book"
  | "edition"
  | "question"
  | "trail"
  | "shelf"
  | "concept"
  | "pattern"
  | "situation"
  | "thinker"
  | "source"
  | "podcast_episode";

export type PublicEntityRecord = {
  id: string;
  entityType: PublicEntityKind;
  slug: string;
  title: string;
  publicStatus: "public" | "hidden";
  visibility: "listed" | "unlisted";
  canonicalUrl: string;
  isCanonicalEdition?: boolean;
  searchEligible: boolean;
  sitemapEligible: boolean;
  contentType?: ContentType;
  contentTypeLabel?: string;
};

export type PublicCorpusRegistry = {
  byId: Map<string, PublicEntityRecord>;
  books: PublicEntityRecord[];
  questions: PublicEntityRecord[];
  trails: PublicEntityRecord[];
  shelves: PublicEntityRecord[];
  concepts: PublicEntityRecord[];
  patterns: PublicEntityRecord[];
  situations: PublicEntityRecord[];
  thinkers: PublicEntityRecord[];
  sources: PublicEntityRecord[];
  /** Catalog view-model used to build this registry (reuse in integrity checks). */
  catalogViewModel: CatalogBookView[];
  /** Search documents built once for this registry. */
  searchDocuments: SearchDocument[];
  /** Search document ids for eligibility checks. */
  searchDocumentIds: Set<string>;
  /** Catalog view-model content types keyed by book id (canonical public only). */
  catalogContentTypeByBookId: Map<string, ContentType>;
  /** Search document content types keyed by book id. */
  searchContentTypeByBookId: Map<string, ContentType>;
  /** Public sitemap paths derived independently from registry membership helpers. */
  sitemapPaths: string[];
  /** Shelf membership: shelfId → book ids resolved for public canonical catalog. */
  shelfMemberBookIds: Map<string, string[]>;
};

/**
 * Build a normalized public corpus registry from the production adapters.
 * Single place for stable IDs, visibility, URLs, and discovery eligibility.
 */
export function buildPublicCorpusRegistry(graph: SemanticGraph): PublicCorpusRegistry {
  const byId = new Map<string, PublicEntityRecord>();
  const catalogVm = buildCatalogViewModel(graph);
  const publicCanonical = defaultCatalogBooks(catalogVm);
  const catalogContentTypeByBookId = new Map<string, ContentType>();
  const searchContentTypeByBookId = new Map<string, ContentType>();

  const books: PublicEntityRecord[] = [];
  for (const book of graph.books) {
    const isPublic = bookIsPublic(book);
    const vm = catalogVm.find((row) => row.id === book.id);
    const typeInfo = contentTypeInfoFromBook(book);
    const isCanonical = vm?.isCanonicalEdition ?? book.isCanonical ?? true;
    const listed = isPublic && isCanonical;
    const record: PublicEntityRecord = {
      id: book.id,
      entityType: "book",
      slug: book.slug,
      title: book.title,
      publicStatus: isPublic ? "public" : "hidden",
      visibility: listed ? "listed" : "unlisted",
      canonicalUrl: `${explorePaths.books}/${book.slug}`,
      isCanonicalEdition: isCanonical,
      searchEligible: listed,
      sitemapEligible: listed,
      contentType: typeInfo.contentType,
      contentTypeLabel: typeInfo.label,
    };
    byId.set(record.id, record);
    books.push(record);
    if (listed) {
      catalogContentTypeByBookId.set(book.id, typeInfo.contentType);
    }
  }

  const searchDocs = buildSearchDocuments({ graph });
  const searchDocumentIds = new Set(searchDocs.map((d) => d.id));
  for (const doc of searchDocs) {
    if (doc.entityType === "book" && doc.contentType) {
      searchContentTypeByBookId.set(doc.id, doc.contentType);
    }
  }

  const questions: PublicEntityRecord[] = getPublishedQuestions(graph).map((q) => {
    const record: PublicEntityRecord = {
      id: q.id,
      entityType: "question",
      slug: q.slug,
      title: q.shortLabel ?? q.question,
      publicStatus: "public",
      visibility: "listed",
      canonicalUrl: `/questions/${q.slug}`,
      searchEligible: true,
      sitemapEligible: true,
    };
    byId.set(record.id, record);
    return record;
  });

  const trails: PublicEntityRecord[] = getPublishedTrails(graph).map((t) => {
    const record: PublicEntityRecord = {
      id: t.id,
      entityType: "trail",
      slug: t.slug,
      title: t.title,
      publicStatus: "public",
      visibility: "listed",
      canonicalUrl: `/trails/${t.slug}`,
      searchEligible: true,
      sitemapEligible: true,
    };
    byId.set(record.id, record);
    return record;
  });

  const shelves: PublicEntityRecord[] = [];
  const shelfMemberBookIds = new Map<string, string[]>();
  for (const shelf of getActiveShelves(graph)) {
    const members = resolveShelfBooks(shelf, publicCanonical);
    shelfMemberBookIds.set(
      shelf.id,
      members.map((b) => b.id),
    );
    const record: PublicEntityRecord = {
      id: shelf.id,
      entityType: "shelf",
      slug: shelf.slug,
      title: shelf.title,
      publicStatus: "public",
      visibility: "listed",
      canonicalUrl: `${explorePaths.books}?shelf=${encodeURIComponent(shelf.slug)}`,
      searchEligible: false,
      sitemapEligible: false,
    };
    byId.set(record.id, record);
    shelves.push(record);
  }

  const concepts: PublicEntityRecord[] = graph.glossary.map((c) => {
    const record: PublicEntityRecord = {
      id: c.id,
      entityType: "concept",
      slug: c.slug,
      title: c.title,
      publicStatus: "public",
      visibility: "listed",
      canonicalUrl: `${explorePaths.concepts}/${c.slug}`,
      searchEligible: true,
      sitemapEligible: true,
    };
    byId.set(record.id, record);
    return record;
  });

  const patterns: PublicEntityRecord[] = graph.patterns.map((p) => {
    const record: PublicEntityRecord = {
      id: p.id,
      entityType: "pattern",
      slug: p.slug,
      title: p.title,
      publicStatus: "public",
      visibility: "listed",
      canonicalUrl: `${explorePaths.patterns}/${p.slug}`,
      searchEligible: true,
      sitemapEligible: true,
    };
    byId.set(record.id, record);
    return record;
  });

  const situations: PublicEntityRecord[] = (graph.situations ?? []).map((s) => {
    const record: PublicEntityRecord = {
      id: s.id,
      entityType: "situation",
      slug: s.slug,
      title: s.title,
      publicStatus: "public",
      visibility: "listed",
      canonicalUrl: `${explorePaths.situations}/${s.slug}`,
      searchEligible: true,
      sitemapEligible: true,
    };
    byId.set(record.id, record);
    return record;
  });

  const sources: PublicEntityRecord[] = graph.sources.map((s) => {
    const record: PublicEntityRecord = {
      id: s.id,
      entityType: "source",
      slug: s.slug,
      title: s.title ?? s.name,
      publicStatus: "public",
      visibility: "listed",
      canonicalUrl: `${explorePaths.sources}/${s.slug}`,
      searchEligible: true,
      sitemapEligible: true,
    };
    byId.set(record.id, record);
    return record;
  });

  const thinkers: PublicEntityRecord[] = resolveThinkers(graph).map((t) => {
    const record: PublicEntityRecord = {
      id: t.id,
      entityType: "thinker",
      slug: t.slug,
      title: t.name,
      publicStatus: "public",
      visibility: "listed",
      canonicalUrl: `${explorePaths.thinkers}/${t.slug}`,
      searchEligible: true,
      sitemapEligible: true,
    };
    byId.set(record.id, record);
    return record;
  });

  const sitemapPaths: string[] = [
    explorePaths.books,
    "/questions",
    "/trails",
    "/search",
    ...books.filter((b) => b.sitemapEligible).map((b) => b.canonicalUrl),
    ...questions.map((q) => q.canonicalUrl),
    ...trails.map((t) => t.canonicalUrl),
    ...concepts.map((c) => c.canonicalUrl),
    ...patterns.map((p) => p.canonicalUrl),
    ...situations.map((s) => s.canonicalUrl),
    ...sources.map((s) => s.canonicalUrl),
    ...thinkers.map((t) => t.canonicalUrl),
  ];

  return {
    byId,
    books,
    questions,
    trails,
    shelves,
    concepts,
    patterns,
    situations,
    thinkers,
    sources,
    catalogViewModel: catalogVm,
    searchDocuments: searchDocs,
    searchDocumentIds,
    catalogContentTypeByBookId,
    searchContentTypeByBookId,
    sitemapPaths,
    shelfMemberBookIds,
  };
}
