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
}

export interface GlossaryConcept {
  id: string;
  slug: string;
  title: string;
  shortDefinition: string;
  definition?: string;
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
