import { isUpcomingStatus } from "@/lib/books/shelves";
import type { EditionRelationship } from "@/lib/books/publication-registry-schema";
import type { BookStatus } from "@/types/content";

export type PublicStatusKind = "upcoming" | "companion" | "superseded" | "revised";

export type CatalogExceptionalChip = {
  kind: PublicStatusKind;
  label: string;
};

/**
 * Single exceptional chip for catalog cards (plus content-type).
 * Omits published/sole/primary to avoid badge overload.
 */
export function catalogExceptionalChip(input: {
  status: BookStatus;
  editionRelationship: EditionRelationship;
  editionLabel?: string;
}): CatalogExceptionalChip | undefined {
  if (isUpcomingStatus(input.status)) {
    return { kind: "upcoming", label: "Upcoming" };
  }
  if (input.editionRelationship === "companion") {
    return {
      kind: "companion",
      label: input.editionLabel ?? "Companion edition",
    };
  }
  if (input.editionRelationship === "superseded") {
    return {
      kind: "superseded",
      label: input.editionLabel ?? "Earlier edition",
    };
  }
  return undefined;
}

/** Public visitor-facing status word for detail chrome (omits ordinary published). */
export function publicStatusLabel(status: BookStatus): string | undefined {
  if (isUpcomingStatus(status)) return "Upcoming";
  return undefined;
}

export function formatPublicationMonthYear(isoDate: string): string | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || month < 1 || month > 12) return undefined;
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
