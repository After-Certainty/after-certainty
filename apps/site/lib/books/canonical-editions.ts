import { WOLTY_PUBLIC_ALIAS, WOLTY_V1_SLUG } from "@/lib/books/book-slugs";
import type { Book } from "@/types/semanticGraph";

const EDITION_SLUG_RE = /^(.*)-v(\d+)$/i;

export function parseBookEdition(slug: string): { baseSlug: string; edition?: string } {
  const match = slug.match(EDITION_SLUG_RE);
  if (!match) return { baseSlug: slug };
  return { baseSlug: match[1]!, edition: `v${match[2]}` };
}

/**
 * Heuristic canonical pick for unregistered multi-edition groups.
 * Prefer the public-alias target (WoLTY v1), else a single export-bearing row,
 * else the highest explicit -vN edition.
 *
 * Authoritative resolution uses `resolve-work-edition` + publication-registry.
 */
export function pickCanonicalEditionSlug(baseSlug: string, siblings: readonly Book[]): string {
  if (baseSlug === WOLTY_PUBLIC_ALIAS || siblings.some((b) => b.slug === WOLTY_V1_SLUG)) {
    const v1 = siblings.find((b) => b.slug === WOLTY_V1_SLUG);
    if (v1) return v1.slug;
  }

  const withExport = siblings.filter(
    (b) => Boolean(b.epub?.url) || Boolean(b.pdf?.url) || Boolean(b.docx?.url),
  );
  if (withExport.length === 1) return withExport[0]!.slug;

  let best: Book | undefined;
  let bestVersion = -1;
  for (const book of siblings) {
    const { edition } = parseBookEdition(book.slug);
    const version = edition ? Number(edition.slice(1)) : 0;
    if (!best || version > bestVersion) {
      best = book;
      bestVersion = version;
    }
  }
  return best?.slug ?? siblings[0]!.slug;
}
