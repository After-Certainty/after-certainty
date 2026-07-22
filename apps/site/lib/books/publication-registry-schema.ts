import { z } from "zod";

/** How this edition relates to other editions of the same work. */
export const editionRelationshipSchema = z.enum([
  /** Only public edition of the work. */
  "sole",
  /** Canonical / primary public edition in a multi-volume work. */
  "primary",
  /** Parallel companion volume — not a replacement. */
  "companion",
  /** Explicitly replaced by another edition. */
  "superseded",
]);

export type EditionRelationship = z.infer<typeof editionRelationshipSchema>;

/**
 * Resolution overlay for one graph book (edition).
 * Stores IDs and flags only — never titles, covers, or download URLs.
 */
export const publicationEditionSchema = z
  .object({
    bookId: z.string().min(1),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    workId: z
      .string()
      .min(1)
      .regex(/^work-[a-z0-9]+(?:-[a-z0-9]+)*$/),
    isCanonical: z.boolean(),
    relationship: editionRelationshipSchema,
    editionLabel: z.string().min(1).optional(),
    companionEditionIds: z.array(z.string().min(1)).optional(),
    companionOfEditionId: z.string().min(1).optional(),
    supersededByEditionId: z.string().min(1).optional(),
    replacesEditionId: z.string().min(1).optional(),
    /** ISO date (YYYY-MM-DD) — authored first publication; do not invent from git. */
    firstPublishedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    /** ISO date of substantial editorial revision — never file mtime. */
    revisedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    changeSummary: z.string().min(1).optional(),
  })
  .superRefine((edition, ctx) => {
    if (edition.relationship === "sole" && !edition.isCanonical) {
      ctx.addIssue({
        code: "custom",
        message: "sole editions must be canonical",
        path: ["isCanonical"],
      });
    }
    if (edition.relationship === "primary" && !edition.isCanonical) {
      ctx.addIssue({
        code: "custom",
        message: "primary editions must be canonical",
        path: ["isCanonical"],
      });
    }
    if (edition.relationship === "companion" && edition.isCanonical) {
      ctx.addIssue({
        code: "custom",
        message: "companion editions must not be canonical",
        path: ["isCanonical"],
      });
    }
    if (edition.relationship === "superseded" && edition.isCanonical) {
      ctx.addIssue({
        code: "custom",
        message: "superseded editions must not be canonical",
        path: ["isCanonical"],
      });
    }
    if (edition.relationship === "companion" && !edition.companionOfEditionId) {
      ctx.addIssue({
        code: "custom",
        message: "companion editions require companionOfEditionId",
        path: ["companionOfEditionId"],
      });
    }
    if (edition.relationship === "superseded" && !edition.supersededByEditionId) {
      ctx.addIssue({
        code: "custom",
        message: "superseded editions require supersededByEditionId",
        path: ["supersededByEditionId"],
      });
    }
    if (
      edition.revisedAt &&
      edition.firstPublishedAt &&
      edition.revisedAt < edition.firstPublishedAt
    ) {
      ctx.addIssue({
        code: "custom",
        message: "revisedAt must not be before firstPublishedAt",
        path: ["revisedAt"],
      });
    }
    if (edition.changeSummary && !edition.revisedAt) {
      ctx.addIssue({
        code: "custom",
        message: "changeSummary requires revisedAt",
        path: ["changeSummary"],
      });
    }
  });

export const publicationRegistrySchema = z.object({
  manifestVersion: z.number().int().positive(),
  updatedAt: z.string().optional(),
  notes: z.string().optional(),
  editions: z.array(publicationEditionSchema).min(1),
});

export type PublicationEdition = z.infer<typeof publicationEditionSchema>;
export type PublicationRegistry = z.infer<typeof publicationRegistrySchema>;

export function parsePublicationRegistry(data: unknown): PublicationRegistry {
  return publicationRegistrySchema.parse(data);
}
