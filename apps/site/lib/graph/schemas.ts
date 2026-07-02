import { z } from "zod";
import type { SemanticGraph } from "@/types/semanticGraph";

const stringList = z
  .array(z.string())
  .optional()
  .transform((v) => v ?? []);

const mediaInfographicSchema = z.object({
  url: z.string().url(),
  path: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().optional(),
});

const bookMediaSchema = z.object({
  intro: z
    .object({
      youtubeVideoId: z.string().min(1).optional(),
    })
    .optional(),
  patterns: z
    .object({
      youtubePlaylistUrl: z.string().url().optional(),
    })
    .optional(),
});

const bookFormatAssetSchema = z.object({
  enabled: z.boolean(),
  file: z.string().min(1),
  url: z.string().url().nullable(),
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
  url: z.string().url(),
  label: z.string().min(1).optional(),
});

/** Release JSON may use null for absent optional strings; normalize to undefined. */
const optionalManifestString = z
  .string()
  .min(1)
  .nullish()
  .transform((value) => value ?? undefined);

const optionalManifestUrl = z
  .string()
  .url()
  .nullish()
  .transform((value) => value ?? undefined);

const bookSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: optionalManifestString,
  summary: z
    .string()
    .nullish()
    .transform((value) => value ?? undefined),
  coverImage: optionalManifestString,
  openGraphImage: optionalManifestUrl,
  concepts: stringList,
  patterns: stringList,
  sources: stringList,
  media: bookMediaSchema.optional(),
  isbns: z.array(z.string().min(1)).optional(),
  purchaseLinks: z.array(bookPurchaseLinkSchema).optional(),
  epub: bookFormatAssetSchema.optional(),
  docx: bookFormatAssetSchema.optional(),
  pdf: bookFormatAssetSchema.optional(),
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
  relatedConcepts: stringList,
  relatedBooks: stringList,
  youtubeVideoId: z.string().min(1).optional(),
  mediumArticleUrl: z.string().url().optional(),
  infographic: mediaInfographicSchema.optional(),
  ...enrichmentFields,
});

const sourceSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  summary: z.string().optional(),
  concepts: stringList,
  patterns: stringList,
  relatedBooks: stringList,
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

/**
 * Root manifest schema. Unknown top-level keys are retained for forward compatibility
 * but stripped from the typed result.
 */
/** Strips unknown top-level keys; keeps the graph tolerant of pipeline metadata. */
export const semanticGraphSchema = z.object({
  books: z.array(bookSchema).default([]),
  glossary: z.array(glossaryConceptSchema).default([]),
  patterns: z.array(patternSchema).default([]),
  sources: z.array(sourceSchema).default([]),
  relationships: z.array(relationshipSchema).default([]),
  ontology: ontologySchema,
});

export type SemanticGraphZod = z.infer<typeof semanticGraphSchema>;

/** Normalize zod output to the exported SemanticGraph interface (identical shape). */
export function toSemanticGraph(data: SemanticGraphZod): SemanticGraph {
  return {
    books: data.books,
    glossary: data.glossary,
    patterns: data.patterns,
    sources: data.sources,
    relationships: data.relationships,
    ontology: data.ontology,
  };
}
