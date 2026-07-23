import { resolveThinkersForConcept } from "@/lib/graph/conceptThinkers";
import type { GraphIndex } from "@/lib/graph/graph";
import type {
  Book,
  GlossaryConcept,
  Pattern,
  Situation,
  Source,
  Thinker,
} from "@/types/semanticGraph";
import {
  getRelatedBooks,
  getRelatedConcepts,
  getRelatedPatterns,
  getRelatedSources,
} from "@/lib/graph/graphQueries";

/** Resolved related entities for explore grids (keeps page components thin). */
export type RelatedContentBundle = {
  concepts: GlossaryConcept[];
  patterns: Pattern[];
  books: Book[];
  sources: Source[];
  thinkers: Thinker[];
};

export function relatedContentForConcept(
  index: GraphIndex,
  c: GlossaryConcept,
): RelatedContentBundle {
  return {
    concepts: getRelatedConcepts(index, c.relatedConcepts),
    patterns: getRelatedPatterns(index, c.relatedPatterns),
    books: getRelatedBooks(index, c.relatedBooks),
    sources: [],
    thinkers: resolveThinkersForConcept(index, c),
  };
}

export function relatedContentForPattern(index: GraphIndex, p: Pattern): RelatedContentBundle {
  return {
    concepts: getRelatedConcepts(index, p.relatedConcepts),
    patterns: [],
    books: getRelatedBooks(index, p.relatedBooks),
    sources: [],
    thinkers: [],
  };
}

export function relatedContentForSituation(
  index: GraphIndex,
  situation: Situation,
): RelatedContentBundle {
  return {
    concepts: getRelatedConcepts(index, situation.relatedConcepts),
    patterns: getRelatedPatterns(index, situation.activePatterns),
    books: getRelatedBooks(index, situation.relatedBooks),
    sources: [],
    thinkers: [],
  };
}

export function relatedContentForBook(index: GraphIndex, b: Book): RelatedContentBundle {
  return {
    concepts: getRelatedConcepts(index, b.concepts),
    patterns: getRelatedPatterns(index, b.patterns),
    books: [],
    sources: getRelatedSources(index, b.sources),
    thinkers: [],
  };
}

export function relatedContentForSource(index: GraphIndex, s: Source): RelatedContentBundle {
  return {
    concepts: getRelatedConcepts(index, s.concepts),
    patterns: getRelatedPatterns(index, s.patterns),
    books: getRelatedBooks(index, s.relatedBooks),
    sources: [],
    thinkers: [],
  };
}

export type ThinkerRelatedContent = RelatedContentBundle & {
  works: Source[];
};

export function relatedContentForThinker(
  index: GraphIndex,
  thinker: Thinker,
): ThinkerRelatedContent {
  return {
    concepts: getRelatedConcepts(index, thinker.concepts),
    patterns: getRelatedPatterns(index, thinker.patterns),
    books: getRelatedBooks(index, thinker.relatedBooks),
    sources: [],
    thinkers: [],
    works: getRelatedSources(index, thinker.works),
  };
}
