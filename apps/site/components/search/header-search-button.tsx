"use client";

import { MagnifyingGlassIcon } from "@/components/icons/approved";
import { SiteIcon } from "@/components/icons/site-icon";
import { useSearchPalette } from "@/components/search/search-palette-provider";

type HeaderSearchButtonProps = {
  /** `header` for desktop chrome; `mobile` when opened from the drawer. */
  method?: "header" | "mobile";
  className?: string;
  /** Optional visible label (mobile menu). */
  label?: string;
};

export function HeaderSearchButton({
  method = "header",
  className,
  label,
}: HeaderSearchButtonProps) {
  const { open, openSearch, triggerRef } = useSearchPalette();

  const baseClass =
    className ??
    (label
      ? "inline-flex min-h-9 items-center gap-2 rounded-sm border border-border/60 px-2.5 text-fg transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      : "inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border/60 text-fg transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:h-9 md:w-auto md:gap-2 md:px-2.5");

  return (
    <button
      ref={method === "header" ? triggerRef : undefined}
      type="button"
      className={baseClass}
      aria-label={label ? undefined : "Search"}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => openSearch(method)}
    >
      <SiteIcon icon={MagnifyingGlassIcon} size="sm" weight="regular" />
      {label ? (
        <span>{label}</span>
      ) : (
        <span className="sr-only md:not-sr-only md:text-xs md:uppercase md:tracking-[0.18em]">
          Search
        </span>
      )}
      {method === "header" ? (
        <kbd
          aria-hidden
          className="pointer-events-none hidden rounded border border-border/70 px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.14em] text-muted lg:inline"
        >
          ⌘K
        </kbd>
      ) : null}
    </button>
  );
}
