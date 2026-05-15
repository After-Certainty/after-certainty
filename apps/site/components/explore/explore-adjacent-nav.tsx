import Link from "next/link";

type Adjacent = { slug: string; title: string };

export type ExploreAdjacentNavProps = {
  /** e.g. `explorePaths.books` — no trailing slash */
  basePath: string;
  /** Singular noun for accessible labels, e.g. "book", "pattern", "concept", or "source" */
  entityLabel: string;
  prev?: Adjacent;
  next?: Adjacent;
};

export function ExploreAdjacentNav({ basePath, entityLabel, prev, next }: ExploreAdjacentNavProps) {
  if (!prev && !next) return null;

  const navLabel = `Previous and next ${entityLabel} in explore order`;

  return (
    <nav
      aria-label={navLabel}
      className="mt-12 flex flex-col gap-8 border-t border-border/25 pt-10 sm:flex-row sm:items-start sm:justify-between sm:gap-10"
    >
      <div className="min-w-0 flex-1 sm:max-w-[min(100%,28rem)]">
        {prev ? (
          <Link
            href={`${basePath}/${prev.slug}`}
            className="group block text-left"
            aria-label={`Previous ${entityLabel}: ${prev.title}`}
          >
            <span className="text-[11px] uppercase tracking-[0.28em] text-muted">Previous</span>
            <span className="mt-1 block font-display text-lg font-medium leading-snug tracking-tight text-fg transition-colors group-hover:text-accent">
              <span aria-hidden className="text-muted group-hover:text-accent">
                ←{" "}
              </span>
              {prev.title}
            </span>
          </Link>
        ) : null}
      </div>
      <div className="min-w-0 flex-1 sm:max-w-[min(100%,28rem)] sm:text-right">
        {next ? (
          <Link
            href={`${basePath}/${next.slug}`}
            className="group block sm:ml-auto sm:max-w-full sm:text-right"
            aria-label={`Next ${entityLabel}: ${next.title}`}
          >
            <span className="text-[11px] uppercase tracking-[0.28em] text-muted">Next</span>
            <span className="mt-1 block font-display text-lg font-medium leading-snug tracking-tight text-fg transition-colors group-hover:text-accent">
              {next.title}
              <span aria-hidden className="text-muted group-hover:text-accent">
                {" "}
                →
              </span>
            </span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
