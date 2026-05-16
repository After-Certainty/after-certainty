import { z } from "zod";
import type { SemanticGraph } from "@/types/semanticGraph";

const stringList = z
  .array(z.string())
  .optional()
  .transform((v) => v ?? []);

const bookSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  coverImage: z.string().min(1).optional(),
  concepts: stringList,
  patterns: stringList,
  sources: stringList,
});

const conceptSemanticToneSchema = z.enum(["pressure", "capability", "neutral"]);

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
});

const patternSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  relatedConcepts: stringList,
  relatedBooks: stringList,
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
  };
}
