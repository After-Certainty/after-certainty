"use client";

type FilterToggleProps = {
  pressed: boolean;
  label: string;
  onClick: () => void;
};

/** Shared catalog filter toggle button styling. */
export function FilterToggle({ pressed, label, onClick }: FilterToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="min-h-11 rounded-sm border border-border/50 px-4 py-2 text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent aria-pressed:border-accent/50 aria-pressed:text-accent"
    >
      {label}
    </button>
  );
}
