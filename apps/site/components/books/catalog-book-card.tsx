"use client";

import Image from "next/image";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { StatusLabel } from "@/components/books/status-label";
import { CONTENT_TYPE_LABELS } from "@/lib/books/catalog-taxonomy";
import type { CatalogBookView } from "@/lib/books/catalog-view-model";
import { catalogExceptionalChip } from "@/lib/books/public-status";

type CatalogBookCardProps = {
  book: CatalogBookView;
  location: "shelf" | "catalog";
};

export function CatalogBookCard({ book, location }: CatalogBookCardProps) {
  const typeLabel = CONTENT_TYPE_LABELS[book.contentType];
  const exceptional = catalogExceptionalChip(book);

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
        <div className="relative aspect-[2/3] w-full overflow-hidden border-b border-border/40 bg-bg-elevated/40">
          {book.coverImage ? (
            <Image
              src={book.coverImage}
              alt=""
              fill
              className="object-cover opacity-95 transition-opacity duration-500 group-hover:opacity-100"
              sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-accent/[0.12] via-bg-elevated to-bg transition-opacity duration-500 group-hover:from-accent/[0.16]"
              aria-hidden
            />
          )}
        </div>
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
      </TrackedLink>
    </article>
  );
}
