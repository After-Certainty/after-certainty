import { z } from "zod";

import exceptionsFile from "@/data/shelf-edition-exceptions.json";

const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const shelfEditionExceptionSchema = z.object({
  shelfSlug: slugSchema,
  bookSlug: slugSchema,
  /** Human-readable justification shown in integrity warnings. */
  reason: z.string().min(1),
});

export const shelfEditionExceptionsFileSchema = z.object({
  version: z.literal(1),
  exceptions: z.array(shelfEditionExceptionSchema),
});

export type ShelfEditionException = z.infer<typeof shelfEditionExceptionSchema>;

export type ShelfEditionExceptionsConfig = z.infer<typeof shelfEditionExceptionsFileSchema>;

export function parseShelfEditionExceptions(data: unknown): ShelfEditionExceptionsConfig {
  return shelfEditionExceptionsFileSchema.parse(data);
}

/** Bundled intentional exceptions for non-canonical editions listed on curated shelves. */
export function getShelfEditionExceptions(): readonly ShelfEditionException[] {
  return parseShelfEditionExceptions(exceptionsFile).exceptions;
}

export function shelfEditionExceptionKey(shelfSlug: string, bookSlug: string): string {
  return `${shelfSlug}::${bookSlug}`;
}

export function indexShelfEditionExceptions(
  exceptions: readonly ShelfEditionException[],
): Map<string, ShelfEditionException> {
  const byKey = new Map<string, ShelfEditionException>();
  for (const entry of exceptions) {
    byKey.set(shelfEditionExceptionKey(entry.shelfSlug, entry.bookSlug), entry);
  }
  return byKey;
}
