import { z } from "zod";

const pathEntityTypeSchema = z.enum([
  "book",
  "concept",
  "pattern",
  "situation",
  "thinker",
  "source",
  "podcast_episode",
  "external",
]);

const pathStopSchema = z
  .object({
    position: z.number().int().positive(),
    entityType: pathEntityTypeSchema,
    entityId: z.string().min(1).optional(),
    bookSlug: z.string().min(1).optional(),
    externalUrl: z.string().url().optional(),
    titleOverride: z.string().min(1).optional(),
    description: z.string().min(1),
    whyThisFollows: z.string().min(1).optional(),
    estimatedMinutes: z.number().int().positive().optional(),
    optional: z.boolean().optional(),
    excerpt: z.string().min(1).optional(),
    fictionDoorway: z.boolean().optional(),
  })
  .superRefine((stop, ctx) => {
    if (stop.entityType === "external" && !stop.externalUrl) {
      ctx.addIssue({
        code: "custom",
        message: "external stops require externalUrl",
        path: ["externalUrl"],
      });
    }
    if (stop.entityType !== "external" && !stop.entityId && !stop.bookSlug) {
      ctx.addIssue({
        code: "custom",
        message: "stop requires entityId or bookSlug",
        path: ["entityId"],
      });
    }
  });

const questionSchema = z
  .object({
    id: z.string().min(1),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    question: z.string().min(1),
    shortLabel: z.string().min(1).optional(),
    summary: z.string().min(1).max(320),
    orientation: z.string().min(1),
    whatThisIsNot: z.array(z.string().min(1)).min(1),
    status: z.enum(["draft", "published", "archived"]),
    featured: z.boolean().optional(),
    featuredRank: z.number().int().positive().optional(),
    families: z.array(z.string().min(1)).min(1),
    primaryBookId: z.string().min(1),
    relatedQuestionIds: z.array(z.string().min(1)).optional(),
    pathStops: z.array(pathStopSchema).min(3).max(7),
    closingReflection: z.string().min(1),
    carryForwardQuestion: z.string().min(1).optional(),
    searchHints: z.array(z.string().min(1)).optional(),
    createdDate: z.string().optional(),
    updatedDate: z.string().optional(),
    editorialOwner: z.string().optional(),
    reviewNotes: z.string().optional(),
  })
  .superRefine((question, ctx) => {
    if (question.id !== question.slug) {
      ctx.addIssue({
        code: "custom",
        message: "id and slug must match",
        path: ["slug"],
      });
    }
    const positions = question.pathStops.map((s) => s.position);
    const uniquePositions = new Set(positions);
    if (uniquePositions.size !== positions.length) {
      ctx.addIssue({
        code: "custom",
        message: "path stop positions must be unique",
        path: ["pathStops"],
      });
    }
  });

const searchBridgeSchema = z.object({
  terms: z.array(z.string().min(1)).min(1),
  questionIds: z.array(z.string().min(1)).min(1),
  note: z.string().optional(),
});

export const questionsManifestSchema = z.object({
  manifestVersion: z.number().int().positive(),
  updatedAt: z.string().optional(),
  questions: z.array(questionSchema),
  searchBridges: z.array(searchBridgeSchema).optional(),
});

export type ParsedQuestionsManifest = z.infer<typeof questionsManifestSchema>;

export function parseQuestionsManifest(data: unknown): ParsedQuestionsManifest {
  return questionsManifestSchema.parse(data);
}
