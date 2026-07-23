import Link from "next/link";

import { WHATS_NEW_FILTERS, whatsNewHref, type WhatsNewFilter } from "@/lib/whats-new/url-state";

type WhatsNewFiltersProps = {
  active: WhatsNewFilter;
};

/**
 * URL-driven filters (no client JS). Filtered views canonicalize to /whats-new.
 */
export function WhatsNewFilters({ active }: WhatsNewFiltersProps) {
  return (
    <nav aria-label="Filter What’s New by type" className="mt-10">
      <ul className="flex flex-wrap gap-2">
        {WHATS_NEW_FILTERS.map((filter) => {
          const pressed = active === filter.id;
          return (
            <li key={filter.id}>
              <Link
                href={whatsNewHref(filter.id)}
                aria-current={pressed ? "page" : undefined}
                className={[
                  "inline-flex min-h-11 items-center rounded-sm border px-3 py-2 text-[10px] uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  pressed
                    ? "border-accent/50 bg-accent/10 text-fg"
                    : "border-border/60 text-muted hover:border-accent/35 hover:text-fg",
                ].join(" ")}
              >
                {filter.label}
              </Link>
            </li>
          );
        })}
      </ul>
      {active !== "all" ? (
        <p className="mt-4">
          <Link
            href="/whats-new"
            className="text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Reset filters
          </Link>
        </p>
      ) : null}
    </nav>
  );
}
