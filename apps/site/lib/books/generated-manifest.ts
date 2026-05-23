import type { Book, BookStatus, BooksCatalogManifest } from "@/types/content";

/** Public URL alias for WoLTY v1 — used for featured slug derivation and microsite routing */
export const WOLTY_PUBLIC_ALIAS = "when-others-look-to-you";

export const WOLTY_V1_SLUG = "when-others-look-to-you-v1";

export interface GeneratedAssetBlock {
  enabled: boolean;
  file: string;
  url: string | null;
}

export interface GeneratedBook {
  slug: string;
  source?: string;
  status: BookStatus;
  title: string;
  subtitle?: string | null;
  description: string;
  authors: string[];
  year?: number;
  coverImage?: string | null;
  coverImagePath?: string | null;
  bookDir?: string;
  docx?: GeneratedAssetBlock;
  epub?: GeneratedAssetBlock;
  pdf?: GeneratedAssetBlock;
  slugAliases?: string[];
  companionBooks?: string[];
  companionOf?: string;
}

export interface GeneratedBooksManifest {
  manifestVersion?: number;
  generatedAt?: string;
  repository?: string;
  ref?: string;
  releaseTag?: string;
  featuredSlug?: string;
  books: GeneratedBook[];
  ongoingWorks?: BooksCatalogManifest["ongoingWorks"];
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** True for release-pipeline JSON (not the bundled legacy `data/books-manifest.json`). */
export function isGeneratedBooksManifest(data: unknown): data is GeneratedBooksManifest {
  if (!isRecord(data) || !Array.isArray(data.books)) return false;
  if (typeof data.manifestVersion === "number") return true;
  if (typeof data.generatedAt === "string") return true;
  if (typeof data.ref === "string" && typeof data.releaseTag === "string") return true;
  return false;
}

function assetUrl(block: GeneratedAssetBlock | undefined): string | undefined {
  if (!block?.enabled || !block.url) return undefined;
  return block.url;
}

function repositoryBaseUrl(repository: string | undefined): string | undefined {
  if (!repository || !repository.includes("/")) return undefined;
  return `https://github.com/${repository}`;
}

function generatedBookToBook(raw: GeneratedBook, repository: string | undefined): Book {
  const repositoryUrl = repositoryBaseUrl(repository);
  const subtitle = raw.subtitle === null || raw.subtitle === undefined ? undefined : raw.subtitle;
  const coverImage = raw.coverImage === null || raw.coverImage === undefined ? undefined : raw.coverImage;

  return {
    slug: raw.slug,
    title: raw.title,
    subtitle,
    description: raw.description,
    status: raw.status,
    year: raw.year,
    coverImage,
    repositoryUrl,
    authors: [...raw.authors],
    epubUrl: assetUrl(raw.epub),
    docxUrl: assetUrl(raw.docx),
    pdfUrl: assetUrl(raw.pdf),
    slugAliases: raw.slugAliases?.length ? [...raw.slugAliases] : undefined,
    companionBooks: raw.companionBooks?.length ? [...raw.companionBooks] : undefined,
    companionOf: raw.companionOf,
  };
}

/**
 * Picks `featuredSlug` for the site catalog spotlight.
 * 1) Book whose `slugAliases` includes the WoLTY public alias
 * 2) First `published` book
 * 3) First book in the list
 */
export function deriveFeaturedSlug(books: Book[]): string {
  const fromAlias = books.find((b) => b.slugAliases?.includes(WOLTY_PUBLIC_ALIAS));
  if (fromAlias) return fromAlias.slug;
  const published = books.find((b) => b.status === "published");
  if (published) return published.slug;
  return books[0]?.slug ?? "";
}

function hasExportUrl(book: Book): boolean {
  return Boolean(book.epubUrl || book.docxUrl || book.pdfUrl);
}

/** When release JSON still lists both `books` and `upcoming` rows for one slug, keep the published export row. */
export function dedupeCatalogBooksBySlug(books: Book[]): Book[] {
  const bySlug = new Map<string, Book>();
  for (const book of books) {
    const existing = bySlug.get(book.slug);
    if (!existing) {
      bySlug.set(book.slug, book);
      continue;
    }
    const bookScore =
      (book.status === "published" ? 2 : 0) + (hasExportUrl(book) ? 1 : 0);
    const existingScore =
      (existing.status === "published" ? 2 : 0) + (hasExportUrl(existing) ? 1 : 0);
    if (bookScore > existingScore) {
      bySlug.set(book.slug, book);
    }
  }
  return [...bySlug.values()];
}

export function normalizeGeneratedBooksManifest(raw: GeneratedBooksManifest): BooksCatalogManifest {
  const repository = raw.repository;
  const books = dedupeCatalogBooksBySlug(
    raw.books.map((b) => generatedBookToBook(b, repository)),
  );

  const featuredSlug =
    typeof raw.featuredSlug === "string" && raw.featuredSlug.length > 0
      ? raw.featuredSlug
      : deriveFeaturedSlug(books);

  return {
    featuredSlug,
    books,
    ongoingWorks: raw.ongoingWorks ?? [],
  };
}

/** Resolve a request slug to the canonical catalog `slug` (exact match or alias). */
export function resolveBookCanonicalSlug(slug: string, books: Book[]): string | undefined {
  if (books.some((b) => b.slug === slug)) return slug;
  for (const b of books) {
    if (b.slugAliases?.includes(slug)) return b.slug;
  }
  return undefined;
}

