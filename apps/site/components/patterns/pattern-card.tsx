"use client";

import type { LibraryPattern } from "@/types/patterns-library";
import { PatternTag } from "@/components/patterns/pattern-tag";
import { cn } from "@/lib/cn";

type PatternCardProps = {
  pattern: LibraryPattern;
  selected: boolean;
  onSelect: () => void;
};

export function PatternCard({ pattern, selected, onSelect }: PatternCardProps) {
  const cardCopy = pattern.summary ?? pattern.description.slice(0, 160) + (pattern.description.length > 160 ? "…" : "");

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group w-full text-left transition-colors duration-200",
        "rounded-sm border bg-bg-elevated/[0.08] p-5 md:p-6",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        selected ? "border-accent/45 shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_35%,transparent)]" : "border-border/40 hover:border-accent/25",
      )}
    >
      <h3 className="font-display text-lg font-medium leading-snug tracking-tight text-fg transition-colors group-hover:text-accent/95 md:text-xl">
        {pattern.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted md:text-[15px]">{cardCopy}</p>
      {pattern.themes.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {pattern.themes.slice(0, 4).map((t) => (
            <li key={t}>
              <PatternTag>{t}</PatternTag>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-muted/70 opacity-0 transition-opacity group-hover:opacity-100">
        Explore →
      </p>
    </button>
  );
}
