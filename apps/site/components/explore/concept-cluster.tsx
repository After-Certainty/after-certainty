import type { ReactNode } from "react";

/**
 * Visual cluster for related concepts (lists, small groups).
 * Future: heatmap intensity, semantic similarity bands, AI-suggested clusters.
 */
export function ConceptCluster({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-md border border-border/30 bg-bg-elevated/15 p-6 ${className}`}
    >
      {children}
    </div>
  );
}
