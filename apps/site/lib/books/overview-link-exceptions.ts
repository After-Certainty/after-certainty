import { z } from "zod";

import exceptionsFile from "@/data/overview-concept-link-exceptions.json";

const allowAllOrIds = z.union([z.literal("*"), z.array(z.string().min(1)).min(1)]);

export const overviewLinkExceptionSchema = z.object({
  bookSlug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  /** Concept ids allowed off-book, or `*` for any selected concepts on this book. */
  conceptIds: allowAllOrIds.optional(),
  /** Pattern ids allowed off-book, or `*` for any selected patterns on this book. */
  patternIds: allowAllOrIds.optional(),
  /** Human-readable justification shown in integrity warnings. */
  reason: z.string().min(1),
});

export const overviewLinkExceptionsFileSchema = z.object({
  version: z.literal(1),
  exceptions: z.array(overviewLinkExceptionSchema),
});

export type OverviewLinkException = z.infer<typeof overviewLinkExceptionSchema>;

export type OverviewLinkExceptionsConfig = z.infer<typeof overviewLinkExceptionsFileSchema>;

export function parseOverviewLinkExceptions(data: unknown): OverviewLinkExceptionsConfig {
  return overviewLinkExceptionsFileSchema.parse(data);
}

/** Bundled intentional exceptions for overview↔book concept/pattern link mismatches. */
export function getOverviewLinkExceptions(): readonly OverviewLinkException[] {
  return parseOverviewLinkExceptions(exceptionsFile).exceptions;
}

export function exceptionAllowsConcept(
  exception: OverviewLinkException | undefined,
  conceptId: string,
): boolean {
  if (!exception?.conceptIds) return false;
  if (exception.conceptIds === "*") return true;
  return exception.conceptIds.includes(conceptId);
}

export function exceptionAllowsAnyConcepts(exception: OverviewLinkException | undefined): boolean {
  return exception?.conceptIds === "*" || (exception?.conceptIds?.length ?? 0) > 0;
}

export function exceptionAllowsPattern(
  exception: OverviewLinkException | undefined,
  patternId: string,
): boolean {
  if (!exception?.patternIds) return false;
  if (exception.patternIds === "*") return true;
  return exception.patternIds.includes(patternId);
}

export function exceptionAllowsAnyPatterns(exception: OverviewLinkException | undefined): boolean {
  return exception?.patternIds === "*" || (exception?.patternIds?.length ?? 0) > 0;
}

export function indexOverviewLinkExceptions(
  exceptions: readonly OverviewLinkException[],
): Map<string, OverviewLinkException> {
  const bySlug = new Map<string, OverviewLinkException>();
  for (const entry of exceptions) {
    bySlug.set(entry.bookSlug, entry);
  }
  return bySlug;
}
