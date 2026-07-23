import { z } from "zod";
import type { SemanticGraph } from "@/types/semanticGraph";
import { httpUrlSchema, youtubeVideoIdSchema } from "@/lib/security/zod-urls";

const stringList = z
  .array(z.string())
  .optional()
  .transform((v) => v ?? []);

const mediaInfographicSchema = z.object({
  url: httpUrlSchema,
  path: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().optional(),
});

const bookMediaSchema = z.object({
  intro: z
    .object({
      youtubeVideoId: youtubeVideoIdSchema.optional(),
    })
    .optional(),
  patterns: z
    .object({
      youtubePlaylistUrl: httpUrlSchema.optional(),
    })
    .optional(),
});

const bookFormatAssetSchema = z.object({
  enabled: z.boolean(),
  file: z.string().min(1),
  url: httpUrlSchema.nullable(),
});

const bookPurchaseRetailerSchema = z.enum([
  "amazon",
  "apple_books",
  "google_play",
  "barnes_noble",
  "bookshop",
  "other",
]);

const bookPurchaseLinkSchema = z.object({
  retailer: bookPurchaseRetailerSchema,
  url: httpUrlSchema,
  label: z.string().min(1).optional(),
});

/** Release JSON may use null for absent optional strings; normalize to undefined. */
const optionalManifestString = z
  .string()
  .min(1)
  .nullish()
  .transform((value) => value ?? undefined);

const optionalManifestUrl = httpUrlSchema.nullish().transform((value) => value ?? undefined);

const bookStatusSchema = z.enum([
  "published",
  "forthcoming",
  "draft",
  "in_progress",
  "collaborative",
]);

const bookContentTypeSchema = z.enum([
  "nonfiction",
  "fiction",
  "handbook",
  "essay_collection",
  "poetry",
]);

const bookLiteraryFormSchema = z.enum(["monograph", "novel", "handbook", "poetry_collection"]);

const editionRelationshipSchema = z.enum(["sole", "primary", "companion", "superseded"]);

const bookAvailabilityFlagSchema = z.enum([
  "download_docx",
  "download_epub",
  "download_pdf",
  "purchase",
  "available_in_print",
]);

const bookOverviewSchema = z.object({
  centralQuestion: z.string().min(1),
  whyItExists: z.string().min(1),
  audience: z.string().min(1),
  nonGoals: z.array(z.string().min(1)).default([]),
  selectedConceptIds: z.array(z.string().min(1)).default([]),
  selectedPatternIds: z.array(z.string().min(1)).optional(),
  readBefore: z.array(z.string().min(1)).optional(),
  readNext: z.array(z.string().min(1)).optional(),
  revisedAt: z.string().min(1).optional(),
  changeSummary: z.string().min(1).optional(),
});

const bookSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: optionalManifestString,
  summary: z
    .string()
    .nullish()
    .transform((value) => value ?? undefined),
  description: z
    .string()
    .nullish()
    .transform((value) => value ?? undefined),
  coverImage: optionalManifestString,
  openGraphImage: optionalManifestUrl,
  status: bookStatusSchema.optional(),
  authors: z.array(z.string().min(1)).optional(),
  year: z.number().int().optional(),
  publicationDate: z
    .string()
    .nullish()
    .transform((value) => value ?? undefined),
  slugAliases: z.array(z.string().min(1)).optional(),
  companionBooks: z.array(z.string().min(1)).optional(),
  companionOf: z.string().min(1).optional(),
  concepts: stringList,
  patterns: stringList,
  sources: stringList,
  media: bookMediaSchema.optional(),
  isbns: z.array(z.string().min(1)).optional(),
  purchaseLinks: z.array(bookPurchaseLinkSchema).optional(),
  epub: bookFormatAssetSchema.optional(),
  docx: bookFormatAssetSchema.optional(),
  pdf: bookFormatAssetSchema.optional(),
  workId: optionalManifestString,
  editionId: optionalManifestString,
  isCanonical: z.boolean().optional(),
  editionRelationship: editionRelationshipSchema.optional(),
  editionLabel: optionalManifestString,
  contentType: bookContentTypeSchema.optional(),
  literaryForm: bookLiteraryFormSchema.optional(),
  publicStatus: z.string().min(1).optional(),
  availability: z.array(bookAvailabilityFlagSchema).optional(),
  overview: bookOverviewSchema.optional(),
});

const conceptSemanticToneSchema = z.enum(["pressure", "capability", "neutral"]);

const trajectorySchema = z
  .object({
    earlySignals: stringList,
    intensificationSignals: stringList,
    failureModes: stringList,
    restorationPaths: stringList,
  })
  .optional();

const manifestationsSchema = z.record(z.string(), z.array(z.string())).optional();

const enrichmentFields = {
  recognitionSignals: stringList,
  questions: stringList,
  counterbalances: stringList,
  trajectory: trajectorySchema,
  manifestations: manifestationsSchema,
};

const glossaryConceptSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  shortDefinition: z.string().min(1),
  longDefinition: z.string().optional(),
  definition: z.string().optional(),
  /** When set, explore filters and graph styling can group by layer. */
  layer: z.string().min(1).optional(),
  semanticTone: conceptSemanticToneSchema.optional(),
  relatedConcepts: stringList,
  relatedPatterns: stringList,
  relatedBooks: stringList,
  ...enrichmentFields,
});

const patternSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  setup: z.string().optional(),
  problem: z.string().optional(),
  forces: z.array(z.string().min(1)).optional(),
  observation: z.string().optional(),
  example: z.string().optional(),
  relatedConcepts: stringList,
  relatedBooks: stringList,
  youtubeVideoId: youtubeVideoIdSchema.optional(),
  mediumArticleUrl: httpUrlSchema.optional(),
  infographic: mediaInfographicSchema.optional(),
  ...enrichmentFields,
});

const situationSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  activePatterns: stringList,
  relatedConcepts: stringList,
  relatedBooks: stringList,
  ...enrichmentFields,
});

const sourceKindSchema = z.enum([
  "book",
  "article",
  "report",
  "standard",
  "dataset",
  "speech",
  "case",
  "website",
  "institutional_document",
]);

const sourceSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  summary: z.string().optional(),
  concepts: stringList,
  patterns: stringList,
  relatedBooks: stringList,
  sourceKind: sourceKindSchema.or(z.string().min(1)).optional(),
  creatorNames: z.array(z.string().min(1)).optional(),
  creatorSlugs: z.array(z.string().min(1)).optional(),
  title: z.string().min(1).optional(),
  citation: z.string().min(1).optional(),
  year: z.number().int().optional(),
  publisher: z.string().min(1).optional(),
  institution: z.string().min(1).optional(),
  url: httpUrlSchema.optional(),
  whyThisMatters: z.string().min(1).optional(),
});

const thinkerSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["person", "organization"]),
  summary: z.string().optional(),
  works: stringList,
  concepts: stringList,
  patterns: stringList,
  relatedBooks: stringList,
  whyThisMatters: z.string().min(1).optional(),
});

const relationshipSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  relationship: z.string().min(1),
  description: z.string().optional(),
  weight: z.number().finite().optional(),
});

const ontologyMasterTermSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  preserves: z.string(),
});

const ontologyStructuralPressureSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  effect: z.string(),
});

const ontologySchema = z
  .object({
    masterTerms: z.array(ontologyMasterTermSchema).default([]),
    structuralPressures: z.array(ontologyStructuralPressureSchema).default([]),
  })
  .optional();

const discoveryPathEntityTypeSchema = z.enum([
  "book",
  "concept",
  "pattern",
  "situation",
  "thinker",
  "source",
  "podcast_episode",
  "external",
]);

const discoveryPathStopSchema = z.object({
  position: z.number().int().positive(),
  entityType: discoveryPathEntityTypeSchema,
  entityId: z.string().min(1).optional(),
  bookSlug: z.string().min(1).optional(),
  externalUrl: z.string().optional(),
  titleOverride: z.string().min(1).optional(),
  description: z.string().min(1),
  whyThisFollows: z.string().min(1).optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  optional: z.boolean().optional(),
  excerpt: z.string().min(1).optional(),
  fictionDoorway: z.boolean().optional(),
  title: z.string().min(1).optional(),
  resolvedSlug: z.string().min(1).optional(),
});

const manifestQuestionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  question: z.string().min(1),
  shortLabel: z.string().min(1).optional(),
  summary: z.string().min(1),
  orientation: z.string().min(1),
  whatThisIsNot: z.array(z.string().min(1)).default([]),
  status: z.enum(["draft", "published", "archived"]),
  featured: z.boolean().optional(),
  featuredRank: z.number().int().positive().optional(),
  families: z.array(z.string().min(1)).default([]),
  primaryBookId: z.string().min(1),
  relatedQuestionIds: z.array(z.string().min(1)).optional(),
  pathStops: z.array(discoveryPathStopSchema).default([]),
  closingReflection: z.string().min(1),
  carryForwardQuestion: z.string().min(1).optional(),
  searchHints: z.array(z.string().min(1)).optional(),
  createdDate: z.string().optional(),
  updatedDate: z.string().optional(),
  editorialOwner: z.string().optional(),
  reviewNotes: z.string().optional(),
});

const manifestTrailSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  orientation: z.string().min(1),
  status: z.enum(["draft", "published", "upcoming", "archived"]),
  featured: z.boolean().optional(),
  featuredRank: z.number().int().positive().optional(),
  themes: z.array(z.string().min(1)).default([]),
  audience: z.string().min(1).optional(),
  depth: z.enum(["introductory", "intermediate", "deep"]).optional(),
  primaryBookId: z.string().min(1).optional(),
  pathStops: z.array(discoveryPathStopSchema).default([]),
  closingReflection: z.string().min(1),
  suggestedContinuation: z.string().min(1).optional(),
  relatedTrailIds: z.array(z.string().min(1)).optional(),
  createdDate: z.string().optional(),
  updatedDate: z.string().optional(),
  reviewNotes: z.string().optional(),
});

const shelfRuleSchema = z.union([
  z.object({ type: z.literal("status"), values: z.array(z.string().min(1)) }),
  z.object({ type: z.literal("contentType"), values: z.array(z.string().min(1)) }),
  z.object({ type: z.literal("availability"), values: z.array(z.string().min(1)) }),
  z.object({ type: z.literal("allPublic") }),
]);

const shelfSelectionSchema = z.union([
  z.object({ mode: z.literal("curated"), bookSlugs: z.array(z.string().min(1)) }),
  z.object({ mode: z.literal("rule"), rule: shelfRuleSchema }),
]);

const manifestShelfSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  displayOrder: z.number().int(),
  featured: z.boolean(),
  status: z.enum(["active", "hidden"]),
  selection: shelfSelectionSchema,
  resolvedBookIds: z.array(z.string().min(1)).optional(),
});

const workSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  currentEditionId: z.string().min(1),
  editionIds: z.array(z.string().min(1)).default([]),
  contentType: bookContentTypeSchema.optional(),
  literaryForm: bookLiteraryFormSchema.optional(),
  canonicalRoute: z.string().min(1).optional(),
});

const editionSchema = z.object({
  id: z.string().min(1),
  bookId: z.string().min(1),
  workId: z.string().min(1),
  slug: z.string().min(1),
  isCanonical: z.boolean(),
  relationship: editionRelationshipSchema,
  editionLabel: optionalManifestString,
  title: optionalManifestString,
  companionEditionIds: z.array(z.string().min(1)).optional(),
  companionOfEditionId: z.string().min(1).optional(),
  supersededByEditionId: z.string().min(1).optional(),
  replacesEditionId: z.string().min(1).optional(),
  firstPublishedAt: z.string().min(1).optional(),
  revisedAt: z.string().min(1).optional(),
  changeSummary: z.string().min(1).optional(),
});

const changeEventSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "book_published",
    "book_revised",
    "book_announced",
    "podcast_episode",
    "site_feature",
  ]),
  title: z.string().min(1),
  summary: z.string().min(1),
  date: z.string().min(1),
  entityType: z.enum(["book", "podcast", "site"]),
  entityId: z.string().min(1).optional(),
  visibility: z.enum(["public", "hidden"]).default("public"),
  source: z.enum(["authored", "generated_candidate"]),
  featured: z.boolean().optional(),
  significance: z.enum(["major", "standard"]).optional(),
  relatedEditionId: z.string().min(1).optional(),
  canonicalRoute: z.string().min(1).optional(),
  coverImage: z.string().min(1).optional(),
});

const searchAliasSchema = z.object({
  terms: z.array(z.string().min(1)).min(1),
  kind: z.enum(["alias", "related"]),
  targetIds: z.array(z.string().min(1)).min(1),
  note: z.string().optional(),
});

const chapterKindSchema = z.enum([
  "introduction",
  "bridge",
  "chapter",
  "conclusion",
  "appendix",
  "interlude",
  "afterword",
  "other",
]);

const manifestPartSchema = z.object({
  id: z.string().min(1),
  workId: z.string().min(1),
  editionId: z.string().min(1),
  title: z.string().min(1),
  position: z.number().int().nonnegative(),
  slug: z.string().min(1),
});

const manifestChapterSchema = z.object({
  id: z.string().min(1),
  workId: z.string().min(1),
  editionId: z.string().min(1),
  title: z.string().min(1),
  position: z.number().int().nonnegative(),
  kind: chapterKindSchema,
  sourcePath: z.string().min(1),
  wordCount: z.number().int().nonnegative(),
  estimatedReadingMinutes: z.number().int().nonnegative(),
  public: z.boolean(),
  routeKey: z.string().min(1),
  partId: z.string().min(1).optional(),
  partTitle: optionalManifestString,
  summary: optionalManifestString,
  centralQuestion: optionalManifestString,
  selectedConceptIds: z.array(z.string().min(1)).optional(),
  selectedPatternIds: z.array(z.string().min(1)).optional(),
  searchAliases: z.array(z.string().min(1)).optional(),
  situationIds: z.array(z.string().min(1)).optional(),
  readingTransition: optionalManifestString,
});

/**
 * Root manifest schema. Unknown top-level keys are stripped from the typed result;
 * schemaVersion 2.1+ discovery collections and 2.2 literaryForm / chapters / parts
 * are retained when present.
 */
export const semanticGraphSchema = z.object({
  books: z.array(bookSchema).default([]),
  glossary: z.array(glossaryConceptSchema).default([]),
  patterns: z.array(patternSchema).default([]),
  situations: z.array(situationSchema).default([]),
  sources: z.array(sourceSchema).default([]),
  relationships: z.array(relationshipSchema).default([]),
  ontology: ontologySchema,
  thinkers: z.array(thinkerSchema).optional(),
  works: z.array(workSchema).optional(),
  editions: z.array(editionSchema).optional(),
  questions: z.array(manifestQuestionSchema).optional(),
  trails: z.array(manifestTrailSchema).optional(),
  shelves: z.array(manifestShelfSchema).optional(),
  changeEvents: z.array(changeEventSchema).optional(),
  searchAliases: z.array(searchAliasSchema).optional(),
  parts: z.array(manifestPartSchema).optional(),
  chapters: z.array(manifestChapterSchema).optional(),
  /** Manifest metadata (optional) */
  manifestVersion: z.union([z.literal(1), z.literal(2)]).optional(),
  schemaVersion: z.string().optional(),
  generatedAt: z.string().optional(),
  repository: z.string().optional(),
  ref: z.string().optional(),
  releaseTag: z.string().optional(),
  sourceCommit: z.string().optional(),
});

export type SemanticGraphZod = z.infer<typeof semanticGraphSchema>;

/** Normalize zod output to the exported SemanticGraph interface (identical shape). */
export function toSemanticGraph(data: SemanticGraphZod): SemanticGraph {
  return {
    books: data.books,
    glossary: data.glossary,
    patterns: data.patterns,
    situations: data.situations ?? [],
    sources: data.sources,
    relationships: data.relationships,
    ontology: data.ontology,
    thinkers: data.thinkers,
    works: data.works,
    editions: data.editions,
    questions: data.questions,
    trails: data.trails,
    shelves: data.shelves,
    changeEvents: data.changeEvents,
    searchAliases: data.searchAliases,
    parts: data.parts,
    chapters: data.chapters,
    manifestVersion: data.manifestVersion,
    schemaVersion: data.schemaVersion,
    generatedAt: data.generatedAt,
    repository: data.repository,
    ref: data.ref,
    releaseTag: data.releaseTag,
    sourceCommit: data.sourceCommit,
  };
}
