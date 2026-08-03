import Link from "next/link";

import { SiteIcon } from "@/components/icons/site-icon";
import { CaretLeftIcon, CaretRightIcon } from "@/components/icons/approved";

type Adjacent = { slug: string; title: string };

export type ExploreAdjacentNavProps = {
  /** e.g. `explorePaths.books` — no trailing slash */
  basePath: string;
  /** Singular noun for accessible labels, e.g. "book", "pattern", "concept", or "source" */
  entityLabel: string;
  /** Phrase after the entity label in the nav aria-label (default: "in explore order"). */
  orderDescription?: string;
  /** Extra classes for the nav element (e.g. remove default top border in nested contexts). */
  className?: string;
  prev?: Adjacent;
  next?: Adjacent;
};

export function ExploreAdjacentNav({
  basePath,
  entityLabel,
  orderDescription = "in explore order",
  className = "mt-12 border-t border-border/25 pt-10",
  prev,
  next,
}: ExploreAdjacentNavProps) {
  if (!prev && !next) return null;

  const navLabel = `Previous and next ${entityLabel} ${orderDescription}`;

  return (
    <nav
      aria-label={navLabel}
      className={`flex flex-row items-start justify-between gap-4 sm:gap-10 ${className}`.trim()}
    >
      <div className="min-w-0 flex-1 sm:max-w-[min(100%,28rem)]">
        {prev ? (
          <Link
            href={`${basePath}/${prev.slug}`}
            className="group block text-left"
            aria-label={`Previous ${entityLabel}: ${prev.title}`}
          >
            <span className="text-[11px] uppercase tracking-[0.28em] text-muted">Previous</span>
            <span className="mt-1 flex items-start gap-1.5 font-display text-base font-medium leading-snug tracking-tight text-fg transition-colors group-hover:text-accent sm:text-lg">
              <SiteIcon
                icon={CaretLeftIcon}
                size="sm"
                className="mt-1 text-muted group-hover:text-accent"
              />
              <span className="min-w-0">{prev.title}</span>
            </span>
          </Link>
        ) : null}
      </div>
      <div className="min-w-0 flex-1 text-right sm:max-w-[min(100%,28rem)]">
        {next ? (
          <Link
            href={`${basePath}/${next.slug}`}
            className="group ml-auto block max-w-full text-right"
            aria-label={`Next ${entityLabel}: ${next.title}`}
          >
            <span className="text-[11px] uppercase tracking-[0.28em] text-muted">Next</span>
            <span className="mt-1 flex items-start justify-end gap-1.5 font-display text-base font-medium leading-snug tracking-tight text-fg transition-colors group-hover:text-accent sm:text-lg">
              <span className="min-w-0">{next.title}</span>
              <SiteIcon
                icon={CaretRightIcon}
                size="sm"
                className="mt-1 text-muted group-hover:text-accent"
              />
            </span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
