import Link from "next/link";
import type { SemanticBookActionLinkItem } from "@/lib/books/semantic-book-action-links";

type Props = {
  links: SemanticBookActionLinkItem[];
};

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-sm border border-accent/55 bg-accent-soft px-6 py-3 text-sm uppercase tracking-[0.2em] text-accent shadow-[0_0_24px_var(--glow)] transition-colors hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-sm border border-border/70 px-6 py-3 text-sm uppercase tracking-[0.2em] text-fg transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

/**
 * Purchase and download actions on `/explore/books/[slug]`.
 * Button styling matches the featured book row on `/books`.
 */
export function ExploreBookPublicationLinks({ links }: Props) {
  if (links.length === 0) return null;

  const firstPurchaseIndex = links.findIndex((item) => item.kind === "purchase");

  return (
    <section className="mt-10" aria-label="Get the book">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {links.map((item, index) => {
          const isPrimary = item.kind === "purchase" && index === firstPurchaseIndex;

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={isPrimary ? primaryButtonClass : secondaryButtonClass}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
