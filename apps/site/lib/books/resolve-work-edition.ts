import { parseBookEdition, pickCanonicalEditionSlug } from "@/lib/books/canonical-editions";
import { getPublicationRegistry } from "@/lib/books/load-publication-registry";
import type {
  EditionRelationship,
  PublicationRegistry,
} from "@/lib/books/publication-registry-schema";
import type { Book } from "@/types/semanticGraph";

export type ResolvedEdition = {
  bookId: string;
  slug: string;
  workId: string;
  isCanonical: boolean;
  relationship: EditionRelationship;
  editionLabel?: string;
  siblingCount: number;
  canonicalSlug: string;
  companionOfSlug?: string;
  supersededBySlug?: string;
};

export type EditionGroupMeta = {
  siblingCount: number;
  canonicalSlug: string;
};

function heuristicWorkId(slug: string): string {
  return `work-${parseBookEdition(slug).baseSlug}`;
}

function inferRelationship(input: {
  siblingCount: number;
  isCanonical: boolean;
  book: Book;
}): EditionRelationship {
  if (input.siblingCount <= 1) return "sole";
  if (input.isCanonical) return "primary";
  // Never infer supersession from -vN alone (see roadmap). CompanionOf is the only safe hint.
  if (input.book.companionOf) return "companion";
  return "companion";
}

function resolveLabel(input: {
  registryLabel?: string;
  relationship: EditionRelationship;
  siblingCount: number;
  slug: string;
}): string | undefined {
  if (input.registryLabel) return input.registryLabel;
  if (input.siblingCount <= 1) return undefined;
  if (input.relationship === "companion") return "Companion edition";
  if (input.relationship === "superseded") return "Earlier edition";
  if (input.relationship === "primary") return "Primary volume";
  const { edition } = parseBookEdition(input.slug);
  return edition;
}

/**
 * Authoritative work/edition resolution.
 * Prefers `graph.editions` (via publicationRegistryFromGraph); falls back to -vN heuristics.
 */
export function buildResolvedEditionIndex(
  books: readonly Book[],
  registry: PublicationRegistry = getPublicationRegistry(),
): Map<string, ResolvedEdition> {
  const registryByBookId = new Map(registry.editions.map((e) => [e.bookId, e] as const));
  const bookById = new Map(books.map((b) => [b.id, b] as const));

  const groups = new Map<string, Book[]>();
  for (const book of books) {
    const reg = registryByBookId.get(book.id);
    const key = reg?.workId ?? `heuristic:${parseBookEdition(book.slug).baseSlug}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(book);
    groups.set(key, bucket);
  }

  const bySlug = new Map<string, ResolvedEdition>();

  for (const [, siblings] of groups) {
    const registered = siblings
      .map((book) => ({ book, reg: registryByBookId.get(book.id) }))
      .filter((row) => row.reg);

    let canonicalSlug: string;
    if (registered.length === siblings.length && registered.length > 0) {
      const canonical = registered.find((row) => row.reg!.isCanonical);
      canonicalSlug = canonical?.book.slug ?? siblings[0]!.slug;
    } else if (siblings.length === 1) {
      canonicalSlug = siblings[0]!.slug;
    } else {
      const baseSlug = parseBookEdition(siblings[0]!.slug).baseSlug;
      canonicalSlug = pickCanonicalEditionSlug(baseSlug, siblings);
    }

    const workId =
      registryByBookId.get(siblings[0]!.id)?.workId ?? heuristicWorkId(siblings[0]!.slug);

    for (const book of siblings) {
      const reg = registryByBookId.get(book.id);
      const isCanonical = book.slug === canonicalSlug;
      const relationship =
        reg?.relationship ??
        inferRelationship({ siblingCount: siblings.length, isCanonical, book });

      let companionOfSlug: string | undefined;
      if (reg?.companionOfEditionId) {
        companionOfSlug = bookById.get(reg.companionOfEditionId)?.slug;
      } else if (book.companionOf) {
        companionOfSlug = book.companionOf;
      }

      let supersededBySlug: string | undefined;
      if (reg?.supersededByEditionId) {
        supersededBySlug = bookById.get(reg.supersededByEditionId)?.slug;
      }

      bySlug.set(book.slug, {
        bookId: book.id,
        slug: book.slug,
        workId: reg?.workId ?? workId,
        isCanonical,
        relationship,
        editionLabel: resolveLabel({
          registryLabel: reg?.editionLabel,
          relationship,
          siblingCount: siblings.length,
          slug: book.slug,
        }),
        siblingCount: siblings.length,
        canonicalSlug,
        companionOfSlug,
        supersededBySlug,
      });
    }
  }

  return bySlug;
}

export function resolveWorkEdition(
  book: Book,
  books: readonly Book[],
  registry?: PublicationRegistry,
): ResolvedEdition {
  const index = buildResolvedEditionIndex(books, registry ?? getPublicationRegistry());
  return (
    index.get(book.slug) ?? {
      bookId: book.id,
      slug: book.slug,
      workId: heuristicWorkId(book.slug),
      isCanonical: true,
      relationship: "sole",
      siblingCount: 1,
      canonicalSlug: book.slug,
    }
  );
}

export function buildEditionGroups(
  books: readonly Book[],
  registry?: PublicationRegistry,
): Map<string, EditionGroupMeta> {
  const resolved = buildResolvedEditionIndex(books, registry ?? getPublicationRegistry());
  const meta = new Map<string, EditionGroupMeta>();
  for (const [slug, edition] of resolved) {
    meta.set(slug, {
      siblingCount: edition.siblingCount,
      canonicalSlug: edition.canonicalSlug,
    });
  }
  return meta;
}

export function isCanonicalEdition(
  book: Book,
  books: readonly Book[],
  registry?: PublicationRegistry,
): boolean {
  return resolveWorkEdition(book, books, registry).isCanonical;
}
