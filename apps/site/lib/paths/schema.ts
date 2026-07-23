import { z } from "zod";

export const pathEntityTypeSchema = z.enum([
  "book",
  "concept",
  "pattern",
  "situation",
  "thinker",
  "source",
  "podcast_episode",
  "external",
]);

export const pathStopSchema = z
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
