"use client";

import { cn } from "@/lib/cn";

type ObservatoryPaneToggleProps = {
  side: "left" | "right";
  expanded: boolean;
  onToggle: () => void;
  /** On the panel seam when expanded; on the canvas edge when collapsed (desktop). */
  placement?: "panel" | "canvas";
  className?: string;
  label: string;
};

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="shrink-0">
      {direction === "left" ? (
        <path
          d="M7.5 2.5 4 6l3.5 3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M4.5 2.5 8 6 4.5 9.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function ObservatoryPaneToggle({
  side,
  expanded,
  onToggle,
  placement = "panel",
  className,
  label,
}: ObservatoryPaneToggleProps) {
  const isLeft = side === "left";
  const chevron = expanded ? (isLeft ? "left" : "right") : isLeft ? "right" : "left";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={label}
      title={label}
      className={cn(
        "z-20 flex h-11 w-6 items-center justify-center rounded-sm border border-border/80 bg-bg-elevated/95 text-muted shadow-sm transition-colors hover:border-accent/40 hover:text-fg",
        placement === "panel" &&
          isLeft &&
          "absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
        placement === "panel" &&
          !isLeft &&
          "absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2",
        placement === "canvas" && isLeft && "absolute top-1/2 left-2 -translate-y-1/2",
        placement === "canvas" && !isLeft && "absolute top-1/2 right-2 -translate-y-1/2",
        className,
      )}
    >
      <ChevronIcon direction={chevron} />
    </button>
  );
}
