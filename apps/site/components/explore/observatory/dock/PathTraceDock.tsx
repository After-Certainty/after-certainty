"use client";

import { graphNodeTitle, type GraphIndex } from "@/lib/graph/graph";

function labelFor(id: string, index: GraphIndex): string {
  const n = index.getNodeByCanonicalId(id);
  if (!n) return id;
  return graphNodeTitle(n);
}

type PathTraceDockProps = {
  index: GraphIndex;
  nodeIds: string[];
  pathFromId: string | null;
  pathToId: string | null;
  pathChain: string[] | null;
  onPathFromChange: (id: string | null) => void;
  onPathToChange: (id: string | null) => void;
  compact?: boolean;
};

export function PathTraceDock({
  index,
  nodeIds,
  pathFromId,
  pathToId,
  pathChain,
  onPathFromChange,
  onPathToChange,
  compact = false,
}: PathTraceDockProps) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {!compact ? (
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Path in current view</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <select
          className="max-w-[11rem] rounded-sm border border-border bg-bg-elevated px-2 py-2 text-xs text-fg"
          value={pathFromId ?? ""}
          onChange={(e) => onPathFromChange(e.target.value || null)}
        >
          <option value="">From…</option>
          {nodeIds.map((id) => (
            <option key={id} value={id}>
              {labelFor(id, index)}
            </option>
          ))}
        </select>
        <select
          className="max-w-[11rem] rounded-sm border border-border bg-bg-elevated px-2 py-2 text-xs text-fg"
          value={pathToId ?? ""}
          onChange={(e) => onPathToChange(e.target.value || null)}
        >
          <option value="">To…</option>
          {nodeIds.map((id) => (
            <option key={`t-${id}`} value={id}>
              {labelFor(id, index)}
            </option>
          ))}
        </select>
      </div>
      {pathChain && pathChain.length ? (
        <p
          className={
            compact
              ? "text-xs leading-relaxed text-fg"
              : "font-display text-sm leading-relaxed text-fg"
          }
        >
          {pathChain.map((id) => labelFor(id, index)).join(" → ")}
        </p>
      ) : pathFromId && pathToId ? (
        <p className="text-sm text-muted">No path within the current filtered neighborhood.</p>
      ) : null}
    </div>
  );
}
