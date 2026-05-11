import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/types/content";
import { getBookDetailHref } from "@/lib/content-data";

function statusLabel(status: Book["status"]): string {
  switch (status) {
    case "published":
      return "Published";
    case "forthcoming":
      return "Forthcoming";
    case "draft":
      return "Draft";
    case "in_progress":
      return "In progress";
    case "collaborative":
      return "Collaborative";
    default:
      return status;
  }
}

export function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={getBookDetailHref(book.slug)}
      className="group flex h-full flex-col overflow-hidden border border-border/50 bg-bg-elevated/18 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.45),0_0_0_1px_rgba(201,169,98,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden border-b border-border/45 bg-bg-elevated">
        {book.coverImage ? (
          <Image src={book.coverImage} alt="" fill className="object-cover opacity-95 transition-opacity duration-500 group-hover:opacity-100" sizes="(max-width:768px) 100vw, 33vw" />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-accent/[0.12] via-bg-elevated to-bg transition-opacity duration-500 group-hover:from-accent/[0.16]"
            aria-hidden
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[10px] uppercase tracking-[0.28em] text-accent/90">{statusLabel(book.status)}</p>
        <h3 className="mt-3 font-display text-xl font-medium leading-snug tracking-tight text-fg">{book.title}</h3>
        {book.subtitle ? <p className="mt-2 text-sm leading-snug text-muted">{book.subtitle}</p> : null}
        <p className="mt-4 flex-1 text-sm leading-relaxed text-muted line-clamp-4">{book.description}</p>
        <dl className="mt-6 space-y-1 border-t border-border/35 pt-5 text-[11px] uppercase tracking-[0.18em] text-muted">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <dt className="sr-only">Year</dt>
            <dd>{book.year ?? "—"}</dd>
            <span aria-hidden className="text-border">
              ·
            </span>
            <dt className="sr-only">Authors</dt>
            <dd>{book.authors.join(", ")}</dd>
          </div>
          {book.contributorCount != null ? (
            <div>
              <dt className="sr-only">Contributors</dt>
              <dd className="normal-case tracking-normal text-muted">+{book.contributorCount} contributors</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </Link>
  );
}
