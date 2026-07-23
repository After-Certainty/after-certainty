import { z } from "zod";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD date");

export const primaryActionPreferenceSchema = z.enum([
  "download_pdf",
  "download_epub",
  "download_docx",
  "purchase",
]);

export type PrimaryActionPreference = z.infer<typeof primaryActionPreferenceSchema>;

/** Start Here / core books expected to have overlays before Phase G. */
export const DEFAULT_BOOK_OVERVIEW_PRIORITY_SLUGS = [
  "curiosity-before-certainty",
  "how-serious-systems-learn",
  "trust-beyond-similarity",
  "what-we-cannot-see",
  "the-relay",
  "everyone-knows-love",
  "after-certainty",
  "coupling",
  "how-meaning-moves",
  "when-others-look-to-you-v1",
] as const;

/**
 * Authored orientation fields for redesigned book overview pages (Phase F/G).
 * Does not duplicate title, cover, summary, or format URLs from the semantic graph.
 */
export const bookOverviewSchema = z
  .object({
    bookId: z.string().min(1),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    centralQuestion: z.string().min(1).max(280),
    whyItExists: z.string().min(1).max(900),
    audience: z.string().min(1).max(400),
    nonGoals: z.array(z.string().min(1).max(240)).min(1).max(6),
    selectedConceptIds: z.array(z.string().min(1)).max(7),
    selectedPatternIds: z.array(z.string().min(1)).max(5).optional(),
    selectedConceptRoles: z
      .array(
        z.object({
          conceptId: z.string().min(1),
          roleInWork: z.string().min(1).max(600),
        }),
      )
      .max(7)
      .optional(),
    selectedPatternRoles: z
      .array(
        z.object({
          patternId: z.string().min(1),
          roleInWork: z.string().min(1).max(600),
        }),
      )
      .max(5)
      .optional(),
    relatedWorks: z
      .array(
        z.object({
          workId: z.string().min(1),
          relationship: z.string().min(1),
          reason: z.string().min(1).max(600).optional(),
        }),
      )
      .optional(),
    /** Book slugs for “read before” guidance. */
    readBefore: z.array(z.string().min(1)).max(3).optional(),
    /** Book slugs for “read next” guidance. */
    readNext: z.array(z.string().min(1)).max(3).optional(),
    revisedAt: isoDateSchema.optional(),
    changeSummary: z.string().min(1).max(600).optional(),
    primaryActionPreference: primaryActionPreferenceSchema.optional(),
  })
  .superRefine((overview, ctx) => {
    if (overview.readBefore?.includes(overview.slug)) {
      ctx.addIssue({
        code: "custom",
        message: "readBefore must not include the book itself",
        path: ["readBefore"],
      });
    }
    if (overview.readNext?.includes(overview.slug)) {
      ctx.addIssue({
        code: "custom",
        message: "readNext must not include the book itself",
        path: ["readNext"],
      });
    }
    if (overview.revisedAt && !overview.changeSummary?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "changeSummary is required when revisedAt is set",
        path: ["changeSummary"],
      });
    }
    if (overview.changeSummary && !overview.revisedAt) {
      ctx.addIssue({
        code: "custom",
        message: "revisedAt is required when changeSummary is set",
        path: ["revisedAt"],
      });
    }
  });

export const bookOverviewsManifestSchema = z.object({
  manifestVersion: z.number().int().positive(),
  updatedAt: z.string().optional(),
  notes: z.string().optional(),
  /** Slugs that should have overlays before Phase G ships redesigned pages broadly. */
  prioritySlugs: z.array(z.string().min(1)).optional(),
  overviews: z.array(bookOverviewSchema).min(1),
});

export type BookOverview = z.infer<typeof bookOverviewSchema>;
export type BookOverviewsManifest = z.infer<typeof bookOverviewsManifestSchema>;

export function parseBookOverviewsManifest(data: unknown): BookOverviewsManifest {
  return bookOverviewsManifestSchema.parse(data);
}
