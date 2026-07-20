import {
  WOLTY_PUBLIC_ALIAS,
  WOLTY_V1_SLUG,
  resolveBookCanonicalSlug,
} from "@/lib/books/generated-manifest";
import { getConceptDisplayDefinition } from "@/lib/graph/conceptFormatting";
import { explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex, graphNodeTitle, type GraphIndex } from "@/lib/graph/graph";
import { sourceDisplayTitle } from "@/lib/graph/sourceDisplay";
import { resolveThinkers } from "@/lib/graph/thinkers";
import { aliasTermsByTargetId, relatedTermsByTargetId } from "@/lib/search/aliases";
import { computeSearchBoostWeight } from "@/lib/search/boost";
import { cappedEnrichmentText } from "@/lib/search/enrichment";
import { joinSearchText, uniqueStrings } from "@/lib/search/text";
import {
  SEARCH_RESULT_LABELS,
  type SearchAliasConfig,
  type SearchDocument,
  type SearchSourceArtifact,
} from "@/lib/search/types";
import { stripHtml } from "@/lib/podcast/sanitize";
import type { Book as CatalogBook, BookStatus, PodcastEpisode } from "@/types/content";
import type {
  Book as SemanticBook,
  GlossaryConcept,
  Pattern,
  SemanticGraph,
  Situation,
  Source,
  Thinker,
} from "@/types/semanticGraph";

export type BuildSearchDocumentsInput = {
  graph: SemanticGraph;
  catalogBooks: readonly CatalogBook[];
  podcastEpisodes?: readonly PodcastEpisode[];
  aliasConfig?: SearchAliasConfig;
};

export type SearchDocumentConsistencyIssue = {
  code: "duplicate_id" | "missing_url" | "empty_title" | "empty_search_text";
  id: string;
  detail: string;
};

const EDITION_SLUG_RE = /^(.*)-v(\d+)$/i;

export function parseBookEdition(slug: string): { baseSlug: string; edition?: string } {
  const match = slug.match(EDITION_SLUG_RE);
  if (!match) return { baseSlug: slug };
  return { baseSlug: match[1]!, edition: `v${match[2]}` };
}

/** Find catalog metadata for a graph book slug (exact, alias, or canonical resolve). */
export function findCatalogBookForSlug(
  slug: string,
  catalogBooks: readonly CatalogBook[],
): CatalogBook | undefined {
  const exact = catalogBooks.find((b) => b.slug === slug);
  if (exact) return exact;

  const viaAlias = catalogBooks.find((b) => b.slugAliases?.includes(slug));
  if (viaAlias) return viaAlias;

  const canonical = resolveBookCanonicalSlug(slug, [...catalogBooks]);
  if (canonical) return catalogBooks.find((b) => b.slug === canonical);

  return undefined;
}

function resolveRelatedTitles(index: GraphIndex, refs: readonly string[] | undefined): string[] {
  if (!refs?.length) return [];
  const titles: string[] = [];
  for (const ref of refs) {
    const node = index.resolveNode(ref);
    if (node) titles.push(graphNodeTitle(node));
  }
  return uniqueStrings(titles);
}

function relationshipDensityForId(graph: SemanticGraph, id: string, relatedCounts: number): number {
  let edges = 0;
  for (const rel of graph.relationships) {
    if (rel.source === id || rel.target === id) edges += 1;
  }
  return edges + relatedCounts;
}

type EditionGroupMeta = {
  siblingCount: number;
  canonicalSlug: string;
};

function buildEditionGroups(books: readonly SemanticBook[]): Map<string, EditionGroupMeta> {
  const byBase = new Map<string, SemanticBook[]>();
  for (const book of books) {
    const { baseSlug } = parseBookEdition(book.slug);
    const bucket = byBase.get(baseSlug) ?? [];
    bucket.push(book);
    byBase.set(baseSlug, bucket);
  }

  const metaBySlug = new Map<string, EditionGroupMeta>();
  for (const [baseSlug, siblings] of byBase) {
    if (siblings.length <= 1) {
      const only = siblings[0]!;
      metaBySlug.set(only.slug, { siblingCount: 1, canonicalSlug: only.slug });
      continue;
    }

    const canonicalSlug = pickCanonicalEditionSlug(baseSlug, siblings);
    for (const sibling of siblings) {
      metaBySlug.set(sibling.slug, { siblingCount: siblings.length, canonicalSlug });
    }
  }
  return metaBySlug;
}

/**
 * Prefer the public-alias target (WoLTY v1), else a single export-bearing row,
 * else the highest explicit -vN edition.
 */
export function pickCanonicalEditionSlug(
  baseSlug: string,
  siblings: readonly SemanticBook[],
): string {
  if (baseSlug === WOLTY_PUBLIC_ALIAS || siblings.some((b) => b.slug === WOLTY_V1_SLUG)) {
    const v1 = siblings.find((b) => b.slug === WOLTY_V1_SLUG);
    if (v1) return v1.slug;
  }

  const withExport = siblings.filter(
    (b) => Boolean(b.epub?.url) || Boolean(b.pdf?.url) || Boolean(b.docx?.url),
  );
  if (withExport.length === 1) return withExport[0]!.slug;

  let best: SemanticBook | undefined;
  let bestVersion = -1;
  for (const book of siblings) {
    const { edition } = parseBookEdition(book.slug);
    const version = edition ? Number(edition.slice(1)) : 0;
    if (!best || version > bestVersion) {
      best = book;
      bestVersion = version;
    }
  }
  return best?.slug ?? siblings[0]!.slug;
}

function bookStatus(book: SemanticBook, catalog: CatalogBook | undefined): BookStatus {
  if (catalog?.status) return catalog.status;
  // Semantic-manifest books are explore-listed content; Zod strips status, so default published.
  if (book.id.startsWith("catalog:")) return "draft";
  return "published";
}

function bookSourceArtifact(book: SemanticBook): SearchSourceArtifact {
  return book.id.startsWith("catalog:") ? "catalog" : "semantic";
}

function buildBookDocument(
  book: SemanticBook,
  catalog: CatalogBook | undefined,
  index: GraphIndex,
  graph: SemanticGraph,
  aliasTerms: string[],
  relatedBridgeTerms: string[],
  editionMeta: EditionGroupMeta,
): SearchDocument {
  const { edition } = parseBookEdition(book.slug);
  const status = bookStatus(book, catalog);
  const isCanonicalEdition = editionMeta.canonicalSlug === book.slug;
  const hasEditionSiblings = editionMeta.siblingCount > 1;

  const conceptIds = book.concepts?.length ? [...book.concepts] : undefined;
  const patternIds = book.patterns?.length ? [...book.patterns] : undefined;

  const relatedTitles = uniqueStrings([
    ...resolveRelatedTitles(index, book.concepts),
    ...resolveRelatedTitles(index, book.patterns),
    ...resolveRelatedTitles(index, book.sources),
  ]);

  const slugAliases = uniqueStrings([...(catalog?.slugAliases ?? []), ...(aliasTerms ?? [])]);
  // Public WoLTY alias should match the v1 edition document.
  if (book.slug === WOLTY_V1_SLUG) {
    slugAliases.push(WOLTY_PUBLIC_ALIAS);
  }

  const themes = catalog?.themes?.length
    ? [...catalog.themes]
    : catalog?.tags?.length
      ? [...catalog.tags]
      : undefined;
  const creatorNames = catalog?.authors?.length ? uniqueStrings(catalog.authors) : undefined;
  const description = book.summary ?? catalog?.description;

  const searchText = joinSearchText([
    book.title,
    book.subtitle,
    description,
    book.slug,
    edition,
    status,
    ...(slugAliases ?? []),
    ...(themes ?? []),
    ...(creatorNames ?? []),
    ...relatedTitles,
    ...relatedBridgeTerms,
  ]);

  return {
    id: book.id,
    entityType: "book",
    slug: book.slug,
    title: book.title,
    subtitle: book.subtitle ?? catalog?.subtitle ?? undefined,
    description,
    resultLabel: SEARCH_RESULT_LABELS.book,
    canonicalUrl: `${explorePaths.books}/${book.slug}`,
    image: book.coverImage ?? catalog?.coverImage ?? undefined,
    status,
    edition,
    isCanonicalEdition: hasEditionSiblings ? isCanonicalEdition : true,
    visibility: "listed",
    searchText,
    aliases: slugAliases,
    themes,
    creatorNames,
    relatedTitles: relatedTitles.length ? relatedTitles : undefined,
    conceptIds,
    patternIds,
    boostWeight: computeSearchBoostWeight({
      entityType: "book",
      status,
      isCanonicalEdition: hasEditionSiblings ? isCanonicalEdition : true,
      hasEditionSiblings,
    }),
    relationshipDensity: relationshipDensityForId(
      graph,
      book.id,
      (book.concepts?.length ?? 0) + (book.patterns?.length ?? 0) + (book.sources?.length ?? 0),
    ),
    sourceArtifact: bookSourceArtifact(book),
  };
}

function buildConceptDocument(
  concept: GlossaryConcept,
  index: GraphIndex,
  graph: SemanticGraph,
  aliasTerms: string[],
  relatedBridgeTerms: string[],
): SearchDocument {
  const definition = getConceptDisplayDefinition(concept);
  const relatedTitles = uniqueStrings([
    ...resolveRelatedTitles(index, concept.relatedConcepts),
    ...resolveRelatedTitles(index, concept.relatedPatterns),
    ...resolveRelatedTitles(index, concept.relatedBooks),
  ]);
  const enrichment = cappedEnrichmentText(concept.recognitionSignals);

  const searchText = joinSearchText([
    concept.title,
    concept.slug,
    concept.shortDefinition,
    definition,
    concept.layer,
    enrichment,
    ...aliasTerms,
    ...relatedTitles,
    ...relatedBridgeTerms,
  ]);

  return {
    id: concept.id,
    entityType: "concept",
    slug: concept.slug,
    title: concept.title,
    description: concept.shortDefinition,
    resultLabel: SEARCH_RESULT_LABELS.concept,
    canonicalUrl: `${explorePaths.concepts}/${concept.slug}`,
    visibility: "listed",
    searchText,
    aliases: aliasTerms,
    relatedTitles: relatedTitles.length ? relatedTitles : undefined,
    conceptIds: concept.relatedConcepts?.length ? [...concept.relatedConcepts] : undefined,
    patternIds: concept.relatedPatterns?.length ? [...concept.relatedPatterns] : undefined,
    bookIds: concept.relatedBooks?.length ? [...concept.relatedBooks] : undefined,
    boostWeight: computeSearchBoostWeight({ entityType: "concept" }),
    relationshipDensity: relationshipDensityForId(
      graph,
      concept.id,
      (concept.relatedConcepts?.length ?? 0) +
        (concept.relatedPatterns?.length ?? 0) +
        (concept.relatedBooks?.length ?? 0),
    ),
    sourceArtifact: "semantic",
  };
}

function buildPatternDocument(
  pattern: Pattern,
  index: GraphIndex,
  graph: SemanticGraph,
  aliasTerms: string[],
  relatedBridgeTerms: string[],
): SearchDocument {
  const relatedTitles = uniqueStrings([
    ...resolveRelatedTitles(index, pattern.relatedConcepts),
    ...resolveRelatedTitles(index, pattern.relatedBooks),
  ]);
  const enrichment = cappedEnrichmentText(pattern.recognitionSignals);

  const searchText = joinSearchText([
    pattern.title,
    pattern.slug,
    pattern.summary,
    pattern.setup,
    pattern.problem,
    pattern.observation,
    ...(pattern.forces ?? []),
    enrichment,
    ...aliasTerms,
    ...relatedTitles,
    ...relatedBridgeTerms,
  ]);

  return {
    id: pattern.id,
    entityType: "pattern",
    slug: pattern.slug,
    title: pattern.title,
    description: pattern.summary,
    resultLabel: SEARCH_RESULT_LABELS.pattern,
    canonicalUrl: `${explorePaths.patterns}/${pattern.slug}`,
    image: pattern.infographic?.url,
    visibility: "listed",
    searchText,
    aliases: aliasTerms,
    relatedTitles: relatedTitles.length ? relatedTitles : undefined,
    conceptIds: pattern.relatedConcepts?.length ? [...pattern.relatedConcepts] : undefined,
    bookIds: pattern.relatedBooks?.length ? [...pattern.relatedBooks] : undefined,
    boostWeight: computeSearchBoostWeight({ entityType: "pattern" }),
    relationshipDensity: relationshipDensityForId(
      graph,
      pattern.id,
      (pattern.relatedConcepts?.length ?? 0) + (pattern.relatedBooks?.length ?? 0),
    ),
    sourceArtifact: "semantic",
  };
}

function buildSituationDocument(
  situation: Situation,
  index: GraphIndex,
  graph: SemanticGraph,
  aliasTerms: string[],
  relatedBridgeTerms: string[],
): SearchDocument {
  const relatedTitles = uniqueStrings([
    ...resolveRelatedTitles(index, situation.activePatterns),
    ...resolveRelatedTitles(index, situation.relatedConcepts),
    ...resolveRelatedTitles(index, situation.relatedBooks),
  ]);
  const enrichment = cappedEnrichmentText(situation.recognitionSignals);
  const manifestationText = situation.manifestations
    ? Object.values(situation.manifestations).flat()
    : [];

  const searchText = joinSearchText([
    situation.title,
    situation.slug,
    situation.summary,
    enrichment,
    ...(situation.questions ?? []),
    ...(situation.counterbalances ?? []),
    ...manifestationText,
    ...aliasTerms,
    ...relatedTitles,
    ...relatedBridgeTerms,
  ]);

  return {
    id: situation.id,
    entityType: "situation",
    slug: situation.slug,
    title: situation.title,
    description: situation.summary,
    resultLabel: SEARCH_RESULT_LABELS.situation,
    canonicalUrl: `${explorePaths.situations}/${situation.slug}`,
    visibility: "listed",
    searchText,
    aliases: aliasTerms,
    relatedTitles: relatedTitles.length ? relatedTitles : undefined,
    conceptIds: situation.relatedConcepts?.length ? [...situation.relatedConcepts] : undefined,
    patternIds: situation.activePatterns?.length ? [...situation.activePatterns] : undefined,
    bookIds: situation.relatedBooks?.length ? [...situation.relatedBooks] : undefined,
    boostWeight: computeSearchBoostWeight({ entityType: "situation" }),
    relationshipDensity: relationshipDensityForId(
      graph,
      situation.id,
      (situation.activePatterns?.length ?? 0) +
        (situation.relatedConcepts?.length ?? 0) +
        (situation.relatedBooks?.length ?? 0),
    ),
    sourceArtifact: "semantic",
  };
}

function buildThinkerDocument(
  thinker: Thinker,
  index: GraphIndex,
  graph: SemanticGraph,
  aliasTerms: string[],
  relatedBridgeTerms: string[],
): SearchDocument {
  const relatedTitles = uniqueStrings([
    ...resolveRelatedTitles(index, thinker.works),
    ...resolveRelatedTitles(index, thinker.concepts),
    ...resolveRelatedTitles(index, thinker.patterns),
    ...resolveRelatedTitles(index, thinker.relatedBooks),
  ]);

  const searchText = joinSearchText([
    thinker.name,
    thinker.slug,
    thinker.type,
    thinker.summary,
    thinker.whyThisMatters,
    ...aliasTerms,
    ...relatedTitles,
    ...relatedBridgeTerms,
  ]);

  return {
    id: thinker.id,
    entityType: "thinker",
    slug: thinker.slug,
    title: thinker.name,
    description: thinker.summary ?? thinker.whyThisMatters,
    resultLabel: SEARCH_RESULT_LABELS.thinker,
    canonicalUrl: `${explorePaths.thinkers}/${thinker.slug}`,
    visibility: "listed",
    searchText,
    aliases: aliasTerms,
    relatedTitles: relatedTitles.length ? relatedTitles : undefined,
    conceptIds: thinker.concepts?.length ? [...thinker.concepts] : undefined,
    patternIds: thinker.patterns?.length ? [...thinker.patterns] : undefined,
    bookIds: thinker.relatedBooks?.length ? [...thinker.relatedBooks] : undefined,
    boostWeight: computeSearchBoostWeight({ entityType: "thinker" }),
    relationshipDensity: relationshipDensityForId(
      graph,
      thinker.id,
      thinker.works.length +
        (thinker.concepts?.length ?? 0) +
        (thinker.patterns?.length ?? 0) +
        (thinker.relatedBooks?.length ?? 0),
    ),
    sourceArtifact: "semantic",
  };
}

function buildSourceDocument(
  source: Source,
  index: GraphIndex,
  graph: SemanticGraph,
  aliasTerms: string[],
  relatedBridgeTerms: string[],
): SearchDocument {
  const title = sourceDisplayTitle(source);
  const creatorNames = uniqueStrings(source.creatorNames ?? []);
  const relatedTitles = uniqueStrings([
    ...resolveRelatedTitles(index, source.concepts),
    ...resolveRelatedTitles(index, source.patterns),
    ...resolveRelatedTitles(index, source.relatedBooks),
  ]);

  const searchText = joinSearchText([
    source.name,
    source.title,
    source.slug,
    source.summary,
    source.citation,
    source.sourceKind,
    source.type,
    ...creatorNames,
    ...aliasTerms,
    ...relatedTitles,
    ...relatedBridgeTerms,
  ]);

  return {
    id: source.id,
    entityType: "source",
    slug: source.slug,
    title,
    description: source.summary ?? source.citation,
    resultLabel: SEARCH_RESULT_LABELS.source,
    canonicalUrl: `${explorePaths.sources}/${source.slug}`,
    visibility: "listed",
    searchText,
    aliases: aliasTerms,
    creatorNames: creatorNames.length ? creatorNames : undefined,
    relatedTitles: relatedTitles.length ? relatedTitles : undefined,
    conceptIds: source.concepts?.length ? [...source.concepts] : undefined,
    patternIds: source.patterns?.length ? [...source.patterns] : undefined,
    bookIds: source.relatedBooks?.length ? [...source.relatedBooks] : undefined,
    publicationDate: typeof source.year === "number" ? String(source.year) : undefined,
    boostWeight: computeSearchBoostWeight({ entityType: "source" }),
    relationshipDensity: relationshipDensityForId(
      graph,
      source.id,
      (source.concepts?.length ?? 0) +
        (source.patterns?.length ?? 0) +
        (source.relatedBooks?.length ?? 0),
    ),
    sourceArtifact: "semantic",
  };
}

function buildPodcastDocument(
  episode: PodcastEpisode,
  aliasTerms: string[],
  relatedBridgeTerms: string[],
): SearchDocument {
  const id = `podcast:${episode.id}`;
  const description = stripHtml(episode.description);
  const searchText = joinSearchText([
    episode.title,
    description,
    episode.id,
    ...aliasTerms,
    ...relatedBridgeTerms,
  ]);

  return {
    id,
    entityType: "podcast_episode",
    slug: episode.id,
    title: episode.title,
    description,
    resultLabel: SEARCH_RESULT_LABELS.podcast_episode,
    canonicalUrl: episode.episodeUrl,
    external: true,
    image: episode.image,
    visibility: "listed",
    searchText,
    aliases: aliasTerms,
    publicationDate: episode.publishedAt,
    boostWeight: computeSearchBoostWeight({ entityType: "podcast_episode" }),
    sourceArtifact: "podcast",
  };
}

/**
 * Build the normalized Global Search corpus from the explore graph, catalog metadata,
 * podcast episodes, and authored aliases. Pure function — no I/O.
 *
 * Precedence: semantic ids/titles/links win; catalog supplies status, slugAliases, themes,
 * authors, and fills missing summary/cover; podcast episodes are appended as external docs.
 */
export function buildSearchDocuments(input: BuildSearchDocumentsInput): SearchDocument[] {
  const { graph, catalogBooks, podcastEpisodes = [], aliasConfig } = input;
  const index = buildGraphIndex(graph);
  const aliasMap = aliasConfig ? aliasTermsByTargetId(aliasConfig) : new Map<string, string[]>();
  const relatedMap = aliasConfig
    ? relatedTermsByTargetId(aliasConfig)
    : new Map<string, string[]>();
  const editionGroups = buildEditionGroups(graph.books);

  const docs: SearchDocument[] = [];
  const seenIds = new Set<string>();

  const push = (doc: SearchDocument) => {
    if (seenIds.has(doc.id)) return;
    seenIds.add(doc.id);
    docs.push(doc);
  };

  for (const book of graph.books) {
    const catalog = findCatalogBookForSlug(book.slug, catalogBooks);
    const editionMeta = editionGroups.get(book.slug) ?? {
      siblingCount: 1,
      canonicalSlug: book.slug,
    };
    push(
      buildBookDocument(
        book,
        catalog,
        index,
        graph,
        aliasMap.get(book.id) ?? [],
        relatedMap.get(book.id) ?? [],
        editionMeta,
      ),
    );
  }

  for (const concept of graph.glossary) {
    push(
      buildConceptDocument(
        concept,
        index,
        graph,
        aliasMap.get(concept.id) ?? [],
        relatedMap.get(concept.id) ?? [],
      ),
    );
  }

  for (const pattern of graph.patterns) {
    push(
      buildPatternDocument(
        pattern,
        index,
        graph,
        aliasMap.get(pattern.id) ?? [],
        relatedMap.get(pattern.id) ?? [],
      ),
    );
  }

  for (const situation of graph.situations ?? []) {
    push(
      buildSituationDocument(
        situation,
        index,
        graph,
        aliasMap.get(situation.id) ?? [],
        relatedMap.get(situation.id) ?? [],
      ),
    );
  }

  for (const thinker of resolveThinkers(graph)) {
    push(
      buildThinkerDocument(
        thinker,
        index,
        graph,
        aliasMap.get(thinker.id) ?? [],
        relatedMap.get(thinker.id) ?? [],
      ),
    );
  }

  for (const source of graph.sources) {
    push(
      buildSourceDocument(
        source,
        index,
        graph,
        aliasMap.get(source.id) ?? [],
        relatedMap.get(source.id) ?? [],
      ),
    );
  }

  for (const episode of podcastEpisodes) {
    const id = `podcast:${episode.id}`;
    push(buildPodcastDocument(episode, aliasMap.get(id) ?? [], relatedMap.get(id) ?? []));
  }

  return docs;
}

/** Collect consistency issues without throwing — used by tests and Phase B budgets. */
export function collectSearchDocumentIssues(
  docs: readonly SearchDocument[],
): SearchDocumentConsistencyIssue[] {
  const issues: SearchDocumentConsistencyIssue[] = [];
  const seen = new Set<string>();

  for (const doc of docs) {
    if (seen.has(doc.id)) {
      issues.push({ code: "duplicate_id", id: doc.id, detail: "Duplicate search document id" });
    }
    seen.add(doc.id);

    if (!doc.title.trim()) {
      issues.push({ code: "empty_title", id: doc.id, detail: "Empty title" });
    }
    if (!doc.canonicalUrl.trim()) {
      issues.push({ code: "missing_url", id: doc.id, detail: "Missing canonicalUrl" });
    }
    if (!doc.searchText.trim()) {
      issues.push({ code: "empty_search_text", id: doc.id, detail: "Empty searchText" });
    }
  }

  return issues;
}
