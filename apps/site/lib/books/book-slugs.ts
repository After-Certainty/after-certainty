import type { Book } from "@/types/semanticGraph";

/** Public URL alias for WoLTY v1 — featured slug derivation and microsite routing */
export const WOLTY_PUBLIC_ALIAS = "when-others-look-to-you";

export const WOLTY_V1_SLUG = "when-others-look-to-you-v1";

/** Resolve a request slug to the canonical book `slug` (exact match or alias). */
export function resolveBookCanonicalSlug(slug: string, books: readonly Book[]): string | undefined {
  if (books.some((b) => b.slug === slug)) return slug;
  for (const b of books) {
    if (b.slugAliases?.includes(slug)) return b.slug;
  }
  return undefined;
}

/**
 * Picks the featured book slug for site spotlight.
 * 1) Book whose `slugAliases` includes the WoLTY public alias
 * 2) First `published` book
 * 3) First book in the list
 */
export function deriveFeaturedBookSlug(books: readonly Book[]): string {
  const fromAlias = books.find((b) => b.slugAliases?.includes(WOLTY_PUBLIC_ALIAS));
  if (fromAlias) return fromAlias.slug;
  const published = books.find((b) => (b.status ?? "published") === "published");
  if (published) return published.slug;
  return books[0]?.slug ?? "";
}
