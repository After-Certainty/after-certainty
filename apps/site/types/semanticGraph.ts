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

export type BookContentType = "nonfiction" | "fiction" | "handbook" | "essay_collection";

export type BookPublicStatus =
  "published" | "upcoming" | "forthcoming" | "in_progress" | "revised" | "superseded" | "archived";

export type BookAvailabilityFlag =
  "download_docx" | "download_epub" | "download_pdf" | "purchase" | "available_in_print";

export type EditionRelationship = "sole" | "primary" | "companion" | "superseded";

/** Authored orientation overlay nested on books in schemaVersion 2.1+ manifests. */
export interface BookOverview {
  centralQuestion: string;
  whyItExists: string;
  audience: string;
  nonGoals: string[];
  selectedConceptIds: string[];
  selectedPatternIds?: string[];
  readBefore?: string[];
  readNext?: string[];
  revisedAt?: string;
  changeSummary?: string;
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
  /** schemaVersion 2.1 — work/edition identity */
  workId?: string;
  editionId?: string;
  isCanonical?: boolean;
  editionRelationship?: EditionRelationship;
  editionLabel?: string;
  contentType?: BookContentType;
  publicStatus?: BookPublicStatus | string;
  availability?: BookAvailabilityFlag[];
  overview?: BookOverview;
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

/** Stable work identity (schemaVersion 2.1). */
export interface Work {
  id: string;
  slug: string;
  title: string;
  currentEditionId: string;
  editionIds: string[];
  contentType?: BookContentType;
  canonicalRoute?: string;
}

/** Edition row keyed by existing book-* ids (schemaVersion 2.1). */
export interface Edition {
  id: string;
  bookId: string;
  workId: string;
  slug: string;
  isCanonical: boolean;
  relationship: EditionRelationship;
  editionLabel?: string;
  title?: string;
  companionEditionIds?: string[];
  companionOfEditionId?: string;
  supersededByEditionId?: string;
  replacesEditionId?: string;
  firstPublishedAt?: string;
  revisedAt?: string;
  changeSummary?: string;
}

export type DiscoveryPathEntityType =
  | "book"
  | "concept"
  | "pattern"
  | "situation"
  | "thinker"
  | "source"
  | "podcast_episode"
  | "external";

/** Path stop as emitted by the content pipeline (may include enrichment fields). */
export interface DiscoveryPathStop {
  position: number;
  entityType: DiscoveryPathEntityType;
  entityId?: string;
  bookSlug?: string;
  externalUrl?: string;
  titleOverride?: string;
  description: string;
  whyThisFollows?: string;
  estimatedMinutes?: number;
  optional?: boolean;
  excerpt?: string;
  fictionDoorway?: boolean;
  /** Upstream enrichment — ignored by site PathStopInput mapping. */
  title?: string;
  resolvedSlug?: string;
}

export interface ManifestQuestion {
  id: string;
  slug: string;
  question: string;
  shortLabel?: string;
  summary: string;
  orientation: string;
  whatThisIsNot: string[];
  status: "draft" | "published" | "archived";
  featured?: boolean;
  featuredRank?: number;
  families: string[];
  primaryBookId: string;
  relatedQuestionIds?: string[];
  pathStops: DiscoveryPathStop[];
  closingReflection: string;
  carryForwardQuestion?: string;
  searchHints?: string[];
  createdDate?: string;
  updatedDate?: string;
  editorialOwner?: string;
  reviewNotes?: string;
}

export interface ManifestTrail {
  id: string;
  slug: string;
  title: string;
  summary: string;
  orientation: string;
  status: "draft" | "published" | "upcoming" | "archived";
  featured?: boolean;
  featuredRank?: number;
  themes: string[];
  audience?: string;
  depth?: "introductory" | "intermediate" | "deep";
  primaryBookId?: string;
  pathStops: DiscoveryPathStop[];
  closingReflection: string;
  suggestedContinuation?: string;
  relatedTrailIds?: string[];
  createdDate?: string;
  updatedDate?: string;
  reviewNotes?: string;
}

export type ShelfRule =
  | { type: "status"; values: string[] }
  | { type: "contentType"; values: string[] }
  | { type: "availability"; values: string[] }
  | { type: "allPublic" };

export type ShelfSelection =
  { mode: "curated"; bookSlugs: string[] } | { mode: "rule"; rule: ShelfRule };

export interface ManifestShelf {
  id: string;
  slug: string;
  title: string;
  description: string;
  displayOrder: number;
  featured: boolean;
  status: "active" | "hidden";
  selection: ShelfSelection;
  resolvedBookIds?: string[];
}

export type ChangeEventType =
  "book_published" | "book_revised" | "book_announced" | "podcast_episode" | "site_feature";

export interface ChangeEvent {
  id: string;
  type: ChangeEventType;
  title: string;
  summary: string;
  date: string;
  entityType: "book" | "podcast" | "site";
  entityId?: string;
  visibility: "public" | "hidden";
  source: "authored" | "generated_candidate";
  featured?: boolean;
  significance?: "major" | "standard";
  relatedEditionId?: string;
  /** Corpus field — map to What’s New `href` on the site. */
  canonicalRoute?: string;
  /** Corpus field — map to What’s New `image` on the site. */
  coverImage?: string;
}

export interface SearchAlias {
  terms: string[];
  kind: "alias" | "related";
  targetIds: string[];
  note?: string;
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
  /** schemaVersion 2.1 discovery collections (absent on older manifests). */
  works?: Work[];
  editions?: Edition[];
  questions?: ManifestQuestion[];
  trails?: ManifestTrail[];
  shelves?: ManifestShelf[];
  changeEvents?: ChangeEvent[];
  searchAliases?: SearchAlias[];
  /** Manifest metadata (optional, from semantic-manifest.json) */
  manifestVersion?: 1 | 2;
  /** Additive discovery contract version (e.g. "2.1"). */
  schemaVersion?: string;
  generatedAt?: string;
  repository?: string;
  ref?: string;
  releaseTag?: string;
  sourceCommit?: string;
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
