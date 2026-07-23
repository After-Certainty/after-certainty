import { semanticGraphSchema, toSemanticGraph } from "@/lib/graph/schemas";
import type { SemanticGraph } from "@/types/semanticGraph";
import type { ZodError } from "zod";

export type ValidateSemanticGraphResult =
  | { success: true; data: SemanticGraph; error?: undefined }
  | { success: false; data: undefined; error: ZodError | Error };

/**
 * Pure Zod validation for semantic-manifest JSON.
 * Safe to import from modules that may reach client components — does not use `next/cache`.
 */
export function validateSemanticGraph(raw: unknown): ValidateSemanticGraphResult {
  const parsed = semanticGraphSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, data: undefined, error: parsed.error };
  }
  return { success: true, data: toSemanticGraph(parsed.data) };
}
