"use client";

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
    "inline-flex min-h-9 items-center gap-2 rounded-sm border border-border/60 px-2.5 text-fg transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  return (
    <button
      ref={method === "header" ? triggerRef : undefined}
      type="button"
      className={baseClass}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => openSearch(method)}
    >
      <svg
        className="h-4 w-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
        />
      </svg>
      {label ? (
        <span>{label}</span>
      ) : (
        <span className="text-xs uppercase tracking-[0.18em] md:sr-only">Search</span>
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
