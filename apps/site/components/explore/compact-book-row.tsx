import Image from "next/image";
import Link from "next/link";

import { DisclosureChevron } from "@/components/ui/disclosure-chevron";
import { resolveBookCover } from "@/lib/books/resolve-book-cover";
import { explorePaths } from "@/lib/graph/explorePaths";
import type { Book } from "@/types/semanticGraph";

export type CompactBookRowBook = Pick<
  Book,
  "id" | "slug" | "title" | "subtitle" | "summary" | "description" | "coverImage" | "coverImages"
>;

type CompactBookRowProps = {
  book: CompactBookRowBook;
  /** Optional override for resolved cover (tests). */
  coverImage?: string | null;
  /** Eyebrow above the title (default "Book"). */
  eyebrow?: string;
  /** When false, omit summary/description under the subtitle. */
  showDescription?: boolean;
  /** CTA label shown under the text stack. */
  ctaLabel?: string;
  className?: string;
};

/**
 * Dense horizontal book row for explore related-content surfaces.
 * Uses reserved cover box tokens to avoid layout shift; Books catalog keeps
 * `CatalogBookCard layout="list"` for shelf/catalog analytics.
 */
export function CompactBookRow({
  book,
  coverImage: coverImageProp,
  eyebrow = "Book",
  showDescription = true,
  ctaLabel = "View book",
  className = "",
}: CompactBookRowProps) {
  const resolved = resolveBookCover(book, "thumbnail");
  const coverSrc = coverImageProp === undefined ? resolved?.src : coverImageProp;
  const description = showDescription ? book.summary || book.description : undefined;
  const href = `${explorePaths.books}/${book.slug}`;

  return (
    <article
      className={`group min-w-0 border-b border-border/35 last:border-b-0 ${className}`.trim()}
      data-compact-book-row
    >
      <Link
        href={href}
        className="flex min-h-11 items-center gap-3 py-[var(--explore-row-py)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div
          className="relative shrink-0 overflow-hidden rounded-sm border border-border/50 bg-bg-elevated/50"
          style={{
            width: "var(--explore-cover-list-w)",
            height: "var(--explore-cover-list-h)",
          }}
          data-cover-box
        >
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt=""
              fill
              className="object-contain opacity-95 transition-opacity duration-500 motion-reduce:transition-none motion-reduce:duration-0 group-hover:opacity-100"
              sizes="56px"
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-accent/[0.12] via-bg-elevated to-bg transition-opacity duration-500 motion-reduce:transition-none motion-reduce:duration-0 group-hover:from-accent/[0.16]"
              aria-hidden
            />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-0.5 py-0.5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
          <h3 className="font-display text-base font-medium leading-snug tracking-tight text-fg line-clamp-2 transition-colors group-hover:text-accent">
            {book.title}
          </h3>
          {book.subtitle ? (
            <p className="line-clamp-2 text-sm leading-snug text-muted">{book.subtitle}</p>
          ) : null}
          {description ? (
            <p className="line-clamp-2 text-sm leading-snug text-muted">{description}</p>
          ) : null}
          <p className="pt-0.5 text-xs text-accent">{ctaLabel}</p>
        </div>

        <DisclosureChevron expanded={false} direction="right" />
      </Link>
    </article>
  );
}
