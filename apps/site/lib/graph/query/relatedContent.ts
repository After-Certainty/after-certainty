import { resolveThinkersForConcept } from "@/lib/graph/query/conceptThinkers";
import type { GraphIndex } from "@/lib/graph/graph";
import type {
  Book,
  GlossaryConcept,
  ManifestSong,
  OrganizingForce,
  Pattern,
  Situation,
  Source,
  Thinker,
} from "@/types/semanticGraph";
import {
  getRelatedBooks,
  getRelatedConcepts,
  getRelatedPatterns,
  getRelatedSongs,
  getRelatedSources,
} from "@/lib/graph/query/graphQueries";

/** Resolved related entities for explore grids (keeps page components thin). */
export type RelatedContentBundle = {
  concepts: GlossaryConcept[];
  patterns: Pattern[];
  books: Book[];
  sources: Source[];
  thinkers: Thinker[];
  songs: ManifestSong[];
};

function songsRelatedToConcept(index: GraphIndex, c: GlossaryConcept): ManifestSong[] {
  const fromReverse = getRelatedSongs(index, c.relatedSongs);
  if (fromReverse.length > 0) return fromReverse;
  const songs = index.graph.songs ?? [];
  return songs.filter(
    (song) =>
      song.relatedConcepts?.some((ref) => ref === c.slug || ref === c.id) ?? false,
  );
}

function songsRelatedToPattern(index: GraphIndex, p: Pattern): ManifestSong[] {
  const fromReverse = getRelatedSongs(index, p.relatedSongs);
  if (fromReverse.length > 0) return fromReverse;
  const songs = index.graph.songs ?? [];
  return songs.filter(
    (song) =>
      song.relatedPatterns?.some((ref) => ref === p.slug || ref === p.id) ?? false,
  );
}

function songsRelatedToBook(index: GraphIndex, b: Book): ManifestSong[] {
  const fromReverse = getRelatedSongs(index, b.songs);
  if (fromReverse.length > 0) return fromReverse;
  const songs = index.graph.songs ?? [];
  return songs.filter(
    (song) =>
      song.relatedBooks?.some((ref) => ref === b.slug || ref === b.id) ?? false,
  );
}

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
    songs: songsRelatedToConcept(index, c),
  };
}

export function relatedContentForPattern(index: GraphIndex, p: Pattern): RelatedContentBundle {
  return {
    concepts: getRelatedConcepts(index, p.relatedConcepts),
    patterns: [],
    books: getRelatedBooks(index, p.relatedBooks),
    sources: [],
    thinkers: [],
    songs: songsRelatedToPattern(index, p),
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
    songs: [],
  };
}

export function relatedContentForSong(
  index: GraphIndex,
  song: ManifestSong,
): RelatedContentBundle {
  return {
    concepts: getRelatedConcepts(index, song.relatedConcepts),
    patterns: getRelatedPatterns(index, song.relatedPatterns),
    books: getRelatedBooks(index, song.relatedBooks),
    sources: getRelatedSources(index, song.relatedSources),
    thinkers: [],
    songs: [],
  };
}

export function relatedContentForBook(index: GraphIndex, b: Book): RelatedContentBundle {
  return {
    concepts: getRelatedConcepts(index, b.concepts),
    patterns: getRelatedPatterns(index, b.patterns),
    books: [],
    sources: getRelatedSources(index, b.sources),
    thinkers: [],
    songs: songsRelatedToBook(index, b),
  };
}

export function relatedContentForSource(index: GraphIndex, s: Source): RelatedContentBundle {
  return {
    concepts: getRelatedConcepts(index, s.concepts),
    patterns: getRelatedPatterns(index, s.patterns),
    books: getRelatedBooks(index, s.relatedBooks),
    sources: [],
    thinkers: [],
    songs: [],
  };
}

export function relatedContentForForce(
  index: GraphIndex,
  force: OrganizingForce,
): RelatedContentBundle {
  return {
    concepts: [],
    patterns: getRelatedPatterns(index, force.relatedPatterns),
    books: [],
    sources: [],
    thinkers: [],
    songs: [],
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
    songs: [],
    works: getRelatedSources(index, thinker.works),
  };
}
