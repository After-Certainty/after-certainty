import type { ContentType } from "@/lib/books/catalog-taxonomy";
import type { BookStatus } from "@/types/content";

/**
 * Normalized search corpus contracts for Global Search (Phase A+).
 * See docs/roadmaps/global-search-plan.md §7.
 */

export type SearchEntityType =
  | "book"
  | "concept"
  | "pattern"
  | "situation"
  | "thinker"
  | "source"
  | "podcast_episode"
  | "chapter";

export type SearchVisibility = "listed" | "unlisted";

export type SearchSourceArtifact = "semantic" | "catalog" | "podcast" | "aliases";

/** Whether an authored bridge term is interchangeable (`alias`) or merely adjacent (`related`). */
export type SearchAliasKind = "alias" | "related";

export type SearchAliasEntry = {
  terms: string[];
  kind: SearchAliasKind;
  /** Canonical entity ids (graph ids, or `podcast:{episodeId}`). */
  targetIds: string[];
  note?: string;
};

export type SearchAliasConfig = {
  version: number;
  entries: SearchAliasEntry[];
};

export type SearchDocument = {
  /** Graph or synthetic stable id (e.g. concept-certainty, catalog:slug, podcast:episode-id). */
  id: string;
  entityType: SearchEntityType;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  /** Human type label for UI: "Concept", "Book", … */
  resultLabel: string;
  /** Book content type from the centralized adapter (books only). */
  contentType?: ContentType;
  /** Accessible book content-type label (books only). */
  contentTypeLabel?: string;
  canonicalUrl: string;
  /** True when canonicalUrl is off-site (podcast episodes). */
  external?: boolean;
  image?: string;

  status?: BookStatus;
  edition?: string;
  /** True when this book is the preferred edition among slug siblings. */
  isCanonicalEdition?: boolean;
  visibility: SearchVisibility;

  /** Concatenated match corpus for the search engine. */
  searchText: string;
  aliases: string[];
  themes?: string[];
  /** Optional context line (e.g. “Chapter in After Certainty”). */
  contextLabel?: string;
  creatorNames?: string[];
  /** Resolved titles of related entities for matching + explanations. */
  relatedTitles?: string[];

  conceptIds?: string[];
  patternIds?: string[];
  bookIds?: string[];

  publicationDate?: string;
  updatedDate?: string;

  boostWeight: number;
  relationshipDensity?: number;

  sourceArtifact: SearchSourceArtifact;
};

export const SEARCH_RESULT_LABELS: Record<SearchEntityType, string> = {
  book: "Book",
  concept: "Concept",
  pattern: "Pattern",
  situation: "Situation",
  thinker: "Thinker",
  source: "Source",
  podcast_episode: "Podcast",
  chapter: "Chapter",
};
