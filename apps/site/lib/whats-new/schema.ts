import { z } from "zod";

export const whatsNewEventTypeSchema = z.enum([
  "book_published",
  "book_revised",
  "book_announced",
  "podcast_episode",
  "site_feature",
]);

export type WhatsNewEventType = z.infer<typeof whatsNewEventTypeSchema>;

export const whatsNewEntityTypeSchema = z.enum(["book", "podcast", "site"]);

export type WhatsNewEntityType = z.infer<typeof whatsNewEntityTypeSchema>;

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const whatsNewEventSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .regex(/^event-[a-z0-9]+(?:-[a-z0-9]+)*$/),
    type: whatsNewEventTypeSchema,
    title: z.string().min(1).max(160),
    summary: z.string().min(1).max(480),
    date: isoDateSchema,
    entityType: whatsNewEntityTypeSchema,
    entityId: z.string().min(1).optional(),
    href: z.string().min(1),
    image: z.string().min(1).optional(),
    featured: z.boolean().optional(),
    significance: z.enum(["major", "standard"]).optional(),
    relatedEditionId: z.string().min(1).optional(),
    visibility: z.enum(["public", "hidden"]).default("public"),
    source: z.enum(["authored", "generated_candidate"]),
    /** Gate for generated candidates; authored seed events should be true. */
    published: z.boolean(),
  })
  .superRefine((event, ctx) => {
    if (event.entityType === "book" || event.entityType === "podcast") {
      if (!event.entityId) {
        ctx.addIssue({
          code: "custom",
          message: `${event.entityType} events require entityId`,
          path: ["entityId"],
        });
      }
    }
    if (event.type === "book_revised" && !event.relatedEditionId && !event.summary) {
      ctx.addIssue({
        code: "custom",
        message: "book_revised events require a summary of what changed",
        path: ["summary"],
      });
    }
    if (event.source === "generated_candidate" && event.type === "book_revised") {
      ctx.addIssue({
        code: "custom",
        message: "book_revised events must be authored (never auto-generated)",
        path: ["source"],
      });
    }
  });

export const whatsNewManifestSchema = z.object({
  manifestVersion: z.number().int().positive(),
  updatedAt: z.string().optional(),
  notes: z.string().optional(),
  /** Inclusive start of the public feed (seeded history). */
  launchFrom: isoDateSchema.optional(),
  events: z.array(whatsNewEventSchema),
});

export type WhatsNewEvent = z.infer<typeof whatsNewEventSchema>;
export type WhatsNewManifest = z.infer<typeof whatsNewManifestSchema>;

export function parseWhatsNewManifest(data: unknown): WhatsNewManifest {
  return whatsNewManifestSchema.parse(data);
}

/** Map event types to lightweight Phase E filter buckets. */
export function whatsNewFilterBucket(
  type: WhatsNewEventType,
): "books" | "revisions" | "podcast" | "site" {
  switch (type) {
    case "book_published":
    case "book_announced":
      return "books";
    case "book_revised":
      return "revisions";
    case "podcast_episode":
      return "podcast";
    case "site_feature":
      return "site";
  }
}
