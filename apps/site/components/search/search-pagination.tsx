"use client";

import Link from "next/link";

import type { SearchEntityType } from "@/lib/search/types";
import { searchBrowseQueryString } from "@/lib/search/urlState";

type SearchPaginationProps = {
  q: string;
  types: readonly SearchEntityType[];
  page: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
};

function hrefFor(q: string, types: readonly SearchEntityType[], page: number): string {
  return `/search${searchBrowseQueryString({ q, types, page })}`;
}

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

export function SearchPagination({
  q,
  types,
  page,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
}: SearchPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = visiblePageNumbers(page, totalPages);
  const showingFrom = totalItems === 0 ? 0 : startIndex + 1;

  return (
    <nav
      className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Search results pagination"
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
            href={hrefFor(q, types, page - 1)}
            className="min-h-11 rounded-sm border border-border/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:border-accent/50 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Previous
          </Link>
        ) : null}
        {pages.map((item, i) =>
          item === "ellipsis" ? (
            <span key={`e-${i}`} className="px-1 text-muted" aria-hidden>
              …
            </span>
          ) : (
            <Link
              key={item}
              href={hrefFor(q, types, item)}
              aria-current={item === page ? "page" : undefined}
              className={`min-h-11 min-w-11 rounded-sm border px-3 py-2 text-center text-xs uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                item === page
                  ? "border-accent/60 bg-accent-soft text-accent"
                  : "border-border/80 text-muted hover:border-accent/50 hover:text-fg"
              }`}
            >
              {item}
            </Link>
          ),
        )}
        {page < totalPages ? (
          <Link
            href={hrefFor(q, types, page + 1)}
            className="min-h-11 rounded-sm border border-border/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:border-accent/50 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
