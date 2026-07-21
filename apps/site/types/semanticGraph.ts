import type { BookStatus } from "@/types/content";

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
  "amazon" | "apple_books" | "google_play" | "barnes_noble" | "bookshop" | "other";

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
  /** Longer catalog copy when supplied separately from `summary` */
  description?: string;
  /** Path under /public or absolute URL when supplied by the semantic manifest */
  coverImage?: string;
  /** Absolute URL for book-specific Open Graph / Twitter share art when supplied by the manifest */
  openGraphImage?: string;
  status?: BookStatus;
  authors?: string[];
  year?: number;
  publicationDate?: string;
  slugAliases?: string[];
  companionBooks?: string[];
  companionOf?: string;
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

export interface SemanticTrajectory {
  earlySignals?: string[];
  intensificationSignals?: string[];
  failureModes?: string[];
  restorationPaths?: string[];
}

/** Domain-keyed examples (politics, organizations, family, …). */
export type SemanticManifestations = Record<string, string[]>;

export interface SemanticEnrichment {
  recognitionSignals?: string[];
  questions?: string[];
  counterbalances?: string[];
  trajectory?: SemanticTrajectory;
  manifestations?: SemanticManifestations;
}

export interface GlossaryConcept extends SemanticEnrichment {
  id: string;
  slug: string;
  title: string;
  shortDefinition: string;
  /** Extended body copy for concept detail pages (from semantic manifest). */
  longDefinition?: string;
  definition?: string;
  /** Ontological layer label when the manifest publishes it (e.g. Structural Primitives). */
  layer?: string;
  /** Visual / interpretive tone for graph rendering — omit for default concept styling. */
  semanticTone?: ConceptSemanticTone;
  relatedConcepts?: string[];
  relatedPatterns?: string[];
  relatedBooks?: string[];
}

export interface Pattern extends SemanticEnrichment {
  id: string;
  slug: string;
  title: string;
  summary: string;
  setup?: string;
  problem?: string;
  forces?: string[];
  observation?: string;
  example?: string;
  relatedConcepts?: string[];
  relatedBooks?: string[];
  youtubeVideoId?: string;
  mediumArticleUrl?: string;
  infographic?: MediaInfographic;
}

/**
 * Lived / applied scenario linking active patterns to concepts and books.
 * Authored in the content pipeline as `situations[]` (Phase F).
 */
export interface Situation extends SemanticEnrichment {
  id: string;
  slug: string;
  title: string;
  summary: string;
  /** Patterns currently “in play” for this situation (pipeline field name). */
  activePatterns?: string[];
  relatedConcepts?: string[];
  relatedBooks?: string[];
}

export type SourceKind =
  | "book"
  | "article"
  | "report"
  | "standard"
  | "dataset"
  | "speech"
  | "case"
  | "website"
  | "institutional_document";

export interface Source {
  id: string;
  slug: string;
  name: string;
  type: string;
  summary?: string;
  concepts?: string[];
  patterns?: string[];
  relatedBooks?: string[];
  /** v1.5 — fine-grained work classifier (prefer over legacy `type` when set). */
  sourceKind?: SourceKind | string;
  creatorNames?: string[];
  creatorSlugs?: string[];
  title?: string;
  citation?: string;
  year?: number;
  publisher?: string;
  institution?: string;
  url?: string;
  whyThisMatters?: string;
}

export type ThinkerType = "person" | "organization";

export interface Thinker {
  id: string;
  slug: string;
  name: string;
  type: ThinkerType;
  summary?: string;
  works: string[];
  concepts?: string[];
  patterns?: string[];
  relatedBooks?: string[];
  whyThisMatters?: string;
}

export interface Relationship {
  id?: string;
  source: string;
  target: string;
  relationship: string;
  description?: string;
  /** Optional edge strength for ranking / future heatmaps (higher = stronger). */
  weight?: number;
  summary?: string;
  relatedPathwayIds?: string[];
}

export interface OntologyMasterTerm {
  id: string;
  slug: string;
  title: string;
  preserves: string;
}

export interface OntologyStructuralPressure {
  id: string;
  slug: string;
  title: string;
  effect: string;
}

export interface SemanticOntology {
  masterTerms: OntologyMasterTerm[];
  structuralPressures: OntologyStructuralPressure[];
}

export interface SemanticGraph {
  books: Book[];
  glossary: GlossaryConcept[];
  patterns: Pattern[];
  /** Lived scenarios from the content pipeline (`situations[]`). Empty when absent. */
  situations?: Situation[];
  sources: Source[];
  relationships: Relationship[];
  ontology?: SemanticOntology;
  /** Canonical thinker nodes when manifestVersion is 2. */
  thinkers?: Thinker[];
  /** Manifest metadata (optional, from semantic-manifest.json) */
  manifestVersion?: 1 | 2;
  generatedAt?: string;
  repository?: string;
  ref?: string;
  releaseTag?: string;
}

/** Entity collections exposed in the explore UI */
export type GraphEntityKind = "book" | "concept" | "pattern" | "situation" | "source" | "thinker";

/** Focal node for neighborhood / future graph visualization adapters */
export type GraphFocalNode =
  | { kind: "book"; id: string; slug: string }
  | { kind: "concept"; id: string; slug: string }
  | { kind: "pattern"; id: string; slug: string }
  | { kind: "situation"; id: string; slug: string }
  | { kind: "source"; id: string; slug: string }
  | { kind: "thinker"; id: string; slug: string };
