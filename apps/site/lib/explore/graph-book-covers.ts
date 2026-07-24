import { resolveBookCanonicalSlug } from "@/lib/books/book-slugs";
import {
  resolveBookCover,
  resolveBookCoverSrc,
  type BookCoverUsage,
  type ResolvedBookCover,
} from "@/lib/books/resolve-book-cover";
import type { Book } from "@/types/semanticGraph";

/** @deprecated Prefer resolveBookCover(book, usage) — kept for slug-alias lookup. */
export function buildCoverImageBySlugLookup(
  books: readonly Book[],
  usage: BookCoverUsage = "card",
): Map<string, string> {
  const map = new Map<string, string>();
  for (const b of books) {
    const src = resolveBookCoverSrc(b, usage);
    if (src) {
      map.set(b.slug, src);
      for (const alias of b.slugAliases ?? []) {
        map.set(alias, src);
      }
    }
  }
  return map;
}

export function buildResolvedCoverBySlugLookup(
  books: readonly Book[],
  usage: BookCoverUsage,
): Map<string, ResolvedBookCover> {
  const map = new Map<string, ResolvedBookCover>();
  for (const b of books) {
    const resolved = resolveBookCover(b, usage);
    if (resolved) {
      map.set(b.slug, resolved);
      for (const alias of b.slugAliases ?? []) {
        map.set(alias, resolved);
      }
    }
  }
  return map;
}

export function resolveCoverForGraphBookSlug(
  lookup: Map<string, string>,
  books: readonly Book[],
  graphSlug: string,
): string | undefined {
  const direct = lookup.get(graphSlug);
  if (direct) return direct;
  const canonical = resolveBookCanonicalSlug(graphSlug, books);
  if (canonical) return lookup.get(canonical);
  return undefined;
}

export function resolveBookCoverForSlug(
  books: readonly Book[],
  graphSlug: string,
  usage: BookCoverUsage,
): ResolvedBookCover | null {
  const bySlug = new Map(books.map((b) => [b.slug, b] as const));
  for (const b of books) {
    bySlug.set(b.slug, b);
    for (const alias of b.slugAliases ?? []) {
      bySlug.set(alias, b);
    }
  }
  const book = bySlug.get(graphSlug) ?? (() => {
    const canonical = resolveBookCanonicalSlug(graphSlug, books);
    return canonical ? bySlug.get(canonical) : undefined;
  })();
  return resolveBookCover(book, usage);
}
