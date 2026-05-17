/**
 * Semantic graph contracts for manifests produced by the After Certainty content pipeline.
 *
 * Stable identifiers:
 * - id — canonical graph node id (preferred for relationships and deduplication).
 * - slug — URL-safe segment for concept, pattern, book, and source routes under /explore.
 *
 * Relationship endpoints (Relationship.source / target) are treated as canonical id
 * values first; the graph index also resolves matching slug when ids do not match
 * (forward-compatible with mixed manifests).
 */

export interface MediaInfographic {
  url: string;
  path: string;
  width: number;
  height: number;
  alt?: string;
}

export interface BookMedia {
  intro?: {
    youtubeVideoId?: string;
  };
  patterns?: {
    youtubePlaylistUrl?: string;
  };
}

export type BookPurchaseRetailer =
  | "amazon"
  | "apple_books"
  | "google_play"
  | "barnes_noble"
  | "bookshop"
  | "other";

export interface BookPurchaseLink {
  retailer: BookPurchaseRetailer;
  url: string;
  label?: string;
}

export interface BookFormatAsset {
  enabled: boolean;
  file: string;
  url: string | null;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string;
  /** Path under /public or absolute URL when supplied by the semantic manifest */
  coverImage?: string;
  concepts?: string[];
  patterns?: string[];
  sources?: string[];
  media?: BookMedia;
  isbns?: string[];
  purchaseLinks?: BookPurchaseLink[];
  epub?: BookFormatAsset;
  docx?: BookFormatAsset;
  pdf?: BookFormatAsset;
}

/** Optional styling bucket from the content pipeline (e.g. pressure vs capability concepts). */
export type ConceptSemanticTone = "pressure" | "capability" | "neutral";

export interface GlossaryConcept {
  id: string;
  slug: string;
  title: string;
  shortDefinition: string;
  definition?: string;
  /** Ontological layer label when the manifest publishes it (e.g. Structural Primitives). */
  layer?: string;
  /** Visual / interpretive tone for graph rendering — omit for default concept styling. */
  semanticTone?: ConceptSemanticTone;
  relatedConcepts?: string[];
  relatedPatterns?: string[];
  relatedBooks?: string[];
}

export interface Pattern {
  id: string;
  slug: string;
  title: string;
  summary: string;
  relatedConcepts?: string[];
  relatedBooks?: string[];
  youtubeVideoId?: string;
  mediumArticleUrl?: string;
  infographic?: MediaInfographic;
}

export interface Source {
  id: string;
  slug: string;
  name: string;
  type: string;
  summary?: string;
  concepts?: string[];
  patterns?: string[];
  relatedBooks?: string[];
}

export interface Relationship {
  source: string;
  target: string;
  relationship: string;
  description?: string;
  /** Optional edge strength for ranking / future heatmaps (higher = stronger). */
  weight?: number;
}

export interface SemanticGraph {
  books: Book[];
  glossary: GlossaryConcept[];
  patterns: Pattern[];
  sources: Source[];
  relationships: Relationship[];
}

/** Entity collections exposed in the explore UI */
export type GraphEntityKind = "book" | "concept" | "pattern" | "source";

/** Focal node for neighborhood / future graph visualization adapters */
export type GraphFocalNode =
  | { kind: "book"; id: string; slug: string }
  | { kind: "concept"; id: string; slug: string }
  | { kind: "pattern"; id: string; slug: string }
  | { kind: "source"; id: string; slug: string };
