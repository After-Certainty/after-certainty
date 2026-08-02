"use client";

import Image from "next/image";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { StatusLabel } from "@/components/books/status-label";
import type { CatalogBookView } from "@/lib/books/catalog-view-model";
import { catalogExceptionalChip } from "@/lib/books/public-status";

type CatalogBookCardLayout = "responsive" | "compact" | "detailed" | "list";

type CatalogBookCardProps = {
  book: CatalogBookView;
  location: "shelf" | "catalog";
  /**
   * `responsive` = compact below md, detailed from md up (default).
   * `list` = dense horizontal row with chevron (shelf previews / shelf pages).
   */
  layout?: CatalogBookCardLayout;
};

function ListChevron() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="h-5 w-5 shrink-0 text-muted transition-colors group-hover:text-accent"
    >
      <path
        d="M7.5 5L12.5 10L7.5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ListCover({ book }: { book: CatalogBookView }) {
  const src = book.coverThumbnail ?? book.coverImage;
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-sm border border-border/50 bg-bg-elevated/50"
      style={{
        width: "var(--books-cover-list-w)",
        height: "var(--books-cover-list-h)",
      }}
    >
      {src ? (
        <Image
          src={src}
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
  );
}

function CompactCover({ book }: { book: CatalogBookView }) {
  const src = book.coverThumbnail ?? book.coverImage;
  return (
    <div className="relative h-28 w-[4.5rem] shrink-0 overflow-hidden rounded-sm border border-border/50 bg-bg-elevated/50 sm:h-32 sm:w-20">
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          className="object-contain opacity-95 transition-opacity duration-500 motion-reduce:transition-none motion-reduce:duration-0 group-hover:opacity-100"
          sizes="80px"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-accent/[0.12] via-bg-elevated to-bg transition-opacity duration-500 motion-reduce:transition-none motion-reduce:duration-0 group-hover:from-accent/[0.16]"
          aria-hidden
        />
      )}
    </div>
  );
}

function DetailedCover({ book }: { book: CatalogBookView }) {
  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden border-b border-border/40 bg-bg-elevated/50">
      {book.coverImage ? (
        <Image
          src={book.coverImage}
          alt=""
          fill
          className="object-contain opacity-95 transition-opacity duration-500 motion-reduce:transition-none motion-reduce:duration-0 group-hover:opacity-100"
          sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-accent/[0.12] via-bg-elevated to-bg transition-opacity duration-500 motion-reduce:transition-none motion-reduce:duration-0 group-hover:from-accent/[0.16]"
          aria-hidden
        />
      )}
    </div>
  );
}

function ListMeta({ book }: { book: CatalogBookView }) {
  const typeLabel = book.contentTypeLabel;
  const exceptional = catalogExceptionalChip(book);
  const blurb = book.subtitle || book.description;

  return (
    <div className="min-w-0 flex-1 space-y-0.5 py-0.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.28em] text-accent">{typeLabel}</span>
        {exceptional ? <StatusLabel label={exceptional.label} kind={exceptional.kind} /> : null}
      </div>
      <h3 className="font-display text-base font-medium leading-snug tracking-tight text-fg line-clamp-2 transition-colors group-hover:text-accent">
        {book.title}
      </h3>
      {blurb ? <p className="line-clamp-2 text-sm leading-snug text-muted">{blurb}</p> : null}
    </div>
  );
}

function CompactMeta({ book }: { book: CatalogBookView }) {
  const typeLabel = book.contentTypeLabel;
  const exceptional = catalogExceptionalChip(book);
  const blurb = book.subtitle || book.description;

  return (
    <div className="min-w-0 flex-1 space-y-1 py-0.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.28em] text-accent">{typeLabel}</span>
        {exceptional ? <StatusLabel label={exceptional.label} kind={exceptional.kind} /> : null}
      </div>
      <h3 className="font-display text-base font-medium leading-snug tracking-tight text-fg line-clamp-2 transition-colors group-hover:text-accent sm:text-lg">
        {book.title}
      </h3>
      {blurb ? <p className="line-clamp-2 text-sm leading-snug text-muted">{blurb}</p> : null}
      <p className="pt-0.5 text-xs text-accent">View Book →</p>
    </div>
  );
}

function DetailedMeta({ book }: { book: CatalogBookView }) {
  const typeLabel = book.contentTypeLabel;
  const exceptional = catalogExceptionalChip(book);

  return (
    <div className="space-y-2 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.28em] text-accent">{typeLabel}</span>
        {exceptional ? <StatusLabel label={exceptional.label} kind={exceptional.kind} /> : null}
      </div>
      <h3 className="font-display text-xl font-medium tracking-tight text-fg transition-colors group-hover:text-accent">
        {book.title}
      </h3>
      {book.subtitle ? <p className="text-sm text-muted">{book.subtitle}</p> : null}
      {book.description ? (
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{book.description}</p>
      ) : null}
      {book.availability.length > 0 ? (
        <ul className="flex flex-wrap gap-2 pt-1" aria-label="Availability">
          {book.availability.includes("download") ? (
            <li className="text-[10px] uppercase tracking-[0.14em] text-muted">Download</li>
          ) : null}
          {book.availability.includes("print") ? (
            <li className="text-[10px] uppercase tracking-[0.14em] text-muted">Print</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

export function CatalogBookCard({ book, location, layout = "responsive" }: CatalogBookCardProps) {
  if (layout === "list") {
    return (
      <article className="group min-w-0 border-b border-border/35 last:border-b-0">
        <TrackedLink
          href={book.href}
          className="flex min-h-11 items-center gap-3 py-[var(--books-row-py)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          analytics={{
            event: "books_card_select",
            params: { book_id: book.id, location },
          }}
        >
          <ListCover book={book} />
          <ListMeta book={book} />
          <ListChevron />
        </TrackedLink>
      </article>
    );
  }

  const showCompact = layout === "compact" || layout === "responsive";
  const showDetailed = layout === "detailed" || layout === "responsive";
  const isResponsive = layout === "responsive";

  return (
    <article className="group min-w-0 overflow-hidden rounded-md border border-border/40 bg-bg-elevated/30 shadow-sm backdrop-blur-sm transition-colors hover:border-accent/35">
      <TrackedLink
        href={book.href}
        className="group block"
        analytics={{
          event: "books_card_select",
          params: { book_id: book.id, location },
        }}
      >
        {showCompact ? (
          <div className={isResponsive ? "flex gap-3 p-3 md:hidden" : "flex gap-3 p-3"}>
            <CompactCover book={book} />
            <CompactMeta book={book} />
          </div>
        ) : null}
        {showDetailed ? (
          <div className={isResponsive ? "hidden md:block" : undefined}>
            <DetailedCover book={book} />
            <DetailedMeta book={book} />
          </div>
        ) : null}
      </TrackedLink>
    </article>
  );
}
