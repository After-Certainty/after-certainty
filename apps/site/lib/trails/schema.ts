import { z } from "zod";
import { pathStopSchema } from "@/lib/paths/schema";

const trailSchema = z
  .object({
    id: z.string().min(1),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1),
    summary: z.string().min(1).max(320),
    orientation: z.string().min(1),
    status: z.enum(["draft", "published", "upcoming", "archived"]),
    featured: z.boolean().optional(),
    featuredRank: z.number().int().positive().optional(),
    themes: z.array(z.string().min(1)).min(1),
    audience: z.string().min(1).optional(),
    depth: z.enum(["introductory", "intermediate", "deep"]).optional(),
    primaryBookId: z.string().min(1).optional(),
    pathStops: z.array(pathStopSchema).min(3).max(12),
    closingReflection: z.string().min(1),
    suggestedContinuation: z.string().min(1).optional(),
    relatedTrailIds: z.array(z.string().min(1)).optional(),
    createdDate: z.string().optional(),
    updatedDate: z.string().optional(),
    reviewNotes: z.string().optional(),
  })
  .superRefine((trail, ctx) => {
    if (trail.id !== trail.slug) {
      ctx.addIssue({
        code: "custom",
        message: "id and slug must match",
        path: ["slug"],
      });
    }
    const positions = trail.pathStops.map((s) => s.position);
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
  trailIds: z.array(z.string().min(1)).min(1),
  note: z.string().optional(),
});

export const trailsManifestSchema = z.object({
  manifestVersion: z.number().int().positive(),
  updatedAt: z.string().optional(),
  trails: z.array(trailSchema),
  searchBridges: z.array(searchBridgeSchema).optional(),
});

export type ParsedTrailsManifest = z.infer<typeof trailsManifestSchema>;

export function parseTrailsManifest(data: unknown): ParsedTrailsManifest {
  return trailsManifestSchema.parse(data);
}
