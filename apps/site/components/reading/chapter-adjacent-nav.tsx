import Link from "next/link";

import type { ChapterNavLink } from "@/lib/reading/chapter-navigation";

export type ChapterAdjacentNavProps = {
  prev?: ChapterNavLink;
  next?: ChapterNavLink;
  /** Distinguish duplicate prev/next navs when both top and bottom are present. */
  ariaLabel?: string;
  className?: string;
};

/**
 * Previous / next chapter controls in edition reading order (READ-004).
 */
export function ChapterAdjacentNav({
  prev,
  next,
  ariaLabel = "Previous and next chapter",
  className = "flex flex-row items-start justify-between gap-4 sm:gap-10",
}: ChapterAdjacentNavProps) {
  if (!prev && !next) return null;

  return (
    <nav aria-label={ariaLabel} className={className}>
      <div className="min-w-0 flex-1 sm:max-w-[min(100%,28rem)]">
        {prev ? (
          <Link
            href={prev.href}
            className="group block text-left"
            aria-label={`Previous chapter: ${prev.title}`}
          >
            <span className="text-[11px] uppercase tracking-[0.28em] text-muted">Previous</span>
            <span className="mt-1 block font-display text-base font-medium leading-snug tracking-tight text-fg transition-colors group-hover:text-accent sm:text-lg">
              <span aria-hidden className="text-muted group-hover:text-accent">
                ←{" "}
              </span>
              {prev.title}
            </span>
          </Link>
        ) : (
          <span className="text-[11px] uppercase tracking-[0.28em] text-muted/50">Beginning</span>
        )}
      </div>
      <div className="min-w-0 flex-1 text-right sm:max-w-[min(100%,28rem)]">
        {next ? (
          <Link
            href={next.href}
            className="group ml-auto block max-w-full text-right"
            aria-label={`Next chapter: ${next.title}`}
          >
            <span className="text-[11px] uppercase tracking-[0.28em] text-muted">Next</span>
            <span className="mt-1 block font-display text-base font-medium leading-snug tracking-tight text-fg transition-colors group-hover:text-accent sm:text-lg">
              {next.title}
              <span aria-hidden className="text-muted group-hover:text-accent">
                {" "}
                →
              </span>
            </span>
          </Link>
        ) : (
          <span className="text-[11px] uppercase tracking-[0.28em] text-muted/50">End</span>
        )}
      </div>
    </nav>
  );
}
