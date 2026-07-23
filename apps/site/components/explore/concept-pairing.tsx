import type { ReactNode } from "react";

/**
 * Pairs two concept summaries for contrast / dialogue framing.
 * Future: explicit pairing types (tension / complement / preserves–threatens), topology overlays.
 */
export function ConceptPairing({
  left,
  right,
  className = "",
}: {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-6 md:grid-cols-2 ${className}`}>
      <div className="rounded-md border border-border/30 bg-bg-elevated/15 p-5">{left}</div>
      <div className="rounded-md border border-border/30 bg-bg-elevated/15 p-5">{right}</div>
    </div>
  );
}
