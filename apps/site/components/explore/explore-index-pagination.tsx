import Link from "next/link";

import { exploreIndexBrowseQueryString } from "@/lib/explore/explore-index-browse";

type ExploreIndexPaginationProps = {
  pathname: string;
  query: string;
  page: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  /** Accessible name for the nav, e.g. "Thinkers pagination". */
  label: string;
};

function pageHref(pathname: string, query: string, page: number): string {
  return `${pathname}${exploreIndexBrowseQueryString(query, page)}`;
}

/** Compact page number list: always includes 1, last, current ±1, with ellipses. */
function visiblePageNumbers(page: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const set = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  if (page <= 3) {
    set.add(2);
    set.add(3);
    set.add(4);
  }
  if (page >= totalPages - 2) {
    set.add(totalPages - 1);
    set.add(totalPages - 2);
    set.add(totalPages - 3);
  }

  const sorted = [...set].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const out: Array<number | "ellipsis"> = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n - prev > 1) out.push("ellipsis");
    out.push(n);
    prev = n;
  }
  return out;
}

export function ExploreIndexPagination({
  pathname,
  query,
  page,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  label,
}: ExploreIndexPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = visiblePageNumbers(page, totalPages);
  const showingFrom = totalItems === 0 ? 0 : startIndex + 1;

  return (
    <nav
      className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label={label}
    >
      <p className="text-sm text-muted">
        Showing{" "}
        <span className="text-fg">
          {showingFrom}–{endIndex}
        </span>{" "}
        of <span className="text-fg">{totalItems}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {page > 1 ? (
          <Link
            href={pageHref(pathname, query, page - 1)}
            className="rounded-sm border border-border/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-fg transition-colors hover:border-accent/40 hover:text-accent"
            rel="prev"
          >
            Prev
          </Link>
        ) : (
          <span className="rounded-sm border border-border/40 px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted/50">
            Prev
          </span>
        )}

        <ol className="flex flex-wrap items-center gap-1">
          {pages.map((entry, i) =>
            entry === "ellipsis" ? (
              <li key={`ellipsis-${i}`} className="px-1 text-muted" aria-hidden>
                …
              </li>
            ) : (
              <li key={entry}>
                {entry === page ? (
                  <span
                    aria-current="page"
                    className="inline-flex min-w-9 items-center justify-center rounded-sm border border-accent/60 bg-accent-soft px-2 py-2 text-xs text-accent"
                  >
                    {entry}
                  </span>
                ) : (
                  <Link
                    href={pageHref(pathname, query, entry)}
                    className="inline-flex min-w-9 items-center justify-center rounded-sm border border-border/80 px-2 py-2 text-xs text-fg transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    {entry}
                  </Link>
                )}
              </li>
            ),
          )}
        </ol>

        {page < totalPages ? (
          <Link
            href={pageHref(pathname, query, page + 1)}
            className="rounded-sm border border-border/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-fg transition-colors hover:border-accent/40 hover:text-accent"
            rel="next"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-sm border border-border/40 px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted/50">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
