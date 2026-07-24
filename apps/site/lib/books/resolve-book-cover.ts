import type {
  Book,
  BookCoverImageVariant,
  BookCoverVariantKey,
} from "@/types/semanticGraph";

export type BookCoverUsage = "detail" | "card" | "thumbnail" | "original" | "openGraph";

export type ResolvedBookCoverSource = "generated" | "legacy" | "original";

export type ResolvedBookCover = {
  src: string;
  width?: number;
  height?: number;
  source: ResolvedBookCoverSource;
  variant?: BookCoverVariantKey;
};

const GENERATED_ORDER: Record<"detail" | "card" | "thumbnail", BookCoverVariantKey[]> = {
  detail: ["detail", "card", "thumbnail"],
  card: ["card", "detail", "thumbnail"],
  thumbnail: ["thumbnail", "card", "detail"],
};

function variantRecord(
  book: Pick<Book, "coverImages">,
  key: BookCoverVariantKey,
): BookCoverImageVariant | undefined {
  const images = book.coverImages;
  if (!images) return undefined;
  const variant = images[key];
  if (!variant?.url) return undefined;
  if (!Number.isFinite(variant.width) || variant.width <= 0) return undefined;
  if (!Number.isFinite(variant.height) || variant.height <= 0) return undefined;
  return variant;
}

function fromGenerated(
  book: Pick<Book, "coverImages">,
  usage: "detail" | "card" | "thumbnail",
): ResolvedBookCover | null {
  for (const key of GENERATED_ORDER[usage]) {
    const variant = variantRecord(book, key);
    if (!variant) continue;
    return {
      src: variant.url,
      width: variant.width,
      height: variant.height,
      source: "generated",
      variant: key,
    };
  }
  return null;
}

function fromLegacy(book: Pick<Book, "coverImage">): ResolvedBookCover | null {
  if (!book.coverImage) return null;
  return {
    src: book.coverImage,
    source: "legacy",
  };
}

/**
 * Centralized book-cover resolution for site rendering.
 *
 * Prefer generated WebP derivatives; fall back to legacy remote `coverImage`
 * only when derivatives are missing (transition / incomplete corpus).
 */
export function resolveBookCover(
  book: Pick<Book, "coverImage" | "coverImages" | "openGraphImage"> | null | undefined,
  usage: BookCoverUsage,
): ResolvedBookCover | null {
  if (!book) return null;

  if (usage === "openGraph") {
    if (book.openGraphImage) {
      return { src: book.openGraphImage, source: "original" };
    }
    return fromLegacy(book);
  }

  if (usage === "original") {
    return fromLegacy(book);
  }

  const generated = fromGenerated(book, usage);
  if (generated) return generated;
  return fromLegacy(book);
}

/** Convenience: src string only (for props that still expect a bare URL). */
export function resolveBookCoverSrc(
  book: Pick<Book, "coverImage" | "coverImages" | "openGraphImage"> | null | undefined,
  usage: BookCoverUsage,
): string | undefined {
  return resolveBookCover(book, usage)?.src;
}

/**
 * Warn when an eligible public book with coverImages still resolves to legacy
 * for a normal web usage. Intended for catalog integrity / CI checks.
 */
export function isLegacyCoverFallback(
  book: Pick<Book, "coverImage" | "coverImages">,
  usage: Exclude<BookCoverUsage, "original" | "openGraph">,
): boolean {
  if (!book.coverImages) return false;
  const resolved = resolveBookCover(book, usage);
  return resolved?.source === "legacy";
}
