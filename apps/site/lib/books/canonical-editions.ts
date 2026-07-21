import { WOLTY_PUBLIC_ALIAS, WOLTY_V1_SLUG } from "@/lib/books/book-slugs";
import type { Book } from "@/types/semanticGraph";

const EDITION_SLUG_RE = /^(.*)-v(\d+)$/i;

export function parseBookEdition(slug: string): { baseSlug: string; edition?: string } {
  const match = slug.match(EDITION_SLUG_RE);
  if (!match) return { baseSlug: slug };
  return { baseSlug: match[1]!, edition: `v${match[2]}` };
}

export type EditionGroupMeta = {
  siblingCount: number;
  canonicalSlug: string;
};

/**
 * Prefer the public-alias target (WoLTY v1), else a single export-bearing row,
 * else the highest explicit -vN edition.
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

export function buildEditionGroups(books: readonly Book[]): Map<string, EditionGroupMeta> {
  const byBase = new Map<string, Book[]>();
  for (const book of books) {
    const { baseSlug } = parseBookEdition(book.slug);
    const bucket = byBase.get(baseSlug) ?? [];
    bucket.push(book);
    byBase.set(baseSlug, bucket);
  }

  const metaBySlug = new Map<string, EditionGroupMeta>();
  for (const [baseSlug, siblings] of byBase) {
    if (siblings.length <= 1) {
      const only = siblings[0]!;
      metaBySlug.set(only.slug, { siblingCount: 1, canonicalSlug: only.slug });
      continue;
    }

    const canonicalSlug = pickCanonicalEditionSlug(baseSlug, siblings);
    for (const sibling of siblings) {
      metaBySlug.set(sibling.slug, { siblingCount: siblings.length, canonicalSlug });
    }
  }
  return metaBySlug;
}

export function isCanonicalEdition(book: Book, books: readonly Book[]): boolean {
  const meta = buildEditionGroups(books).get(book.slug);
  if (!meta) return true;
  return meta.canonicalSlug === book.slug;
}
