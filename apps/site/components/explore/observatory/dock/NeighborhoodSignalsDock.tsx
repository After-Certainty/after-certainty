"use client";

import { graphNodeTitle, type GraphIndex } from "@/lib/graph/graph";
import type { NeighborhoodSignals } from "@/lib/observatory/neighborhoodSignals";
import { formatRelationshipLabelForDisplay } from "@/lib/graph/relationshipVisuals";
import type { InsightEdge } from "@/lib/graph/graphInsights";

function labelFor(id: string, index: GraphIndex): string {
  const n = index.getNodeByCanonicalId(id);
  if (!n) return id;
  return graphNodeTitle(n);
}

type NeighborhoodSignalsDockProps = {
  index: GraphIndex;
  signals: NeighborhoodSignals;
  onSelectEdge?: (edge: InsightEdge) => void;
  onFocusNodeId?: (id: string) => void;
  compact?: boolean;
};

export function NeighborhoodSignalsDock({
  index,
  signals,
  onSelectEdge,
  onFocusNodeId,
  compact = false,
}: NeighborhoodSignalsDockProps) {
  return (
    <div className={compact ? "space-y-2 text-xs text-muted" : "space-y-3 text-sm text-muted"}>
      {!compact ? (
        <p className="font-display text-sm leading-relaxed text-fg">{signals.summaryLine}</p>
      ) : null}
      <ul className={compact ? "space-y-1 leading-snug" : "space-y-2 leading-relaxed"}>
        <li>
          <span className="text-[10px] uppercase tracking-[0.2em]">Connectivity</span>
          <span className="ml-2 capitalize text-fg">{signals.connectivity}</span>
        </li>
        <li>
          <span className="text-[10px] uppercase tracking-[0.2em]">Tension</span>
          <span className="ml-2 capitalize text-fg">{signals.tensionLevel}</span>
        </li>
        {signals.dominantPredicates[0] ? (
          <li>
            <span className="text-[10px] uppercase tracking-[0.2em]">Dominant</span>
            <span className="ml-2 text-fg">
              {signals.dominantPredicates
                .map((p) => formatRelationshipLabelForDisplay(p.predicate))
                .join(" · ")}
            </span>
          </li>
        ) : null}
        {signals.strongestEdges.map((e, i) => (
          <li key={`strong-${i}`}>
            <button
              type="button"
              className="text-left hover:text-accent"
              onClick={() => onSelectEdge?.(e)}
            >
              <span className="text-[10px] uppercase tracking-[0.2em]">Strong link</span>
              <span className="ml-2 text-fg">
                {formatRelationshipLabelForDisplay(e.relationship)} {labelFor(e.sourceId, index)} →{" "}
                {labelFor(e.targetId, index)}
              </span>
            </button>
          </li>
        ))}
        {signals.bridgeNodeIds[0] ? (
          <li>
            <span className="text-[10px] uppercase tracking-[0.2em]">Connectors</span>
            <span className="ml-2 text-fg">
              {signals.bridgeNodeIds.slice(0, 4).map((id, i) => (
                <span key={id}>
                  <button
                    type="button"
                    className="hover:text-accent"
                    onClick={() => onFocusNodeId?.(id)}
                  >
                    {signals.bridgeConcepts[i] ?? labelFor(id, index)}
                  </button>
                  {i < Math.min(signals.bridgeNodeIds.length, 4) - 1 ? ", " : ""}
                </span>
              ))}
            </span>
          </li>
        ) : null}
        {signals.isolatedNodeIds.length ? (
          <li>
            <span className="text-[10px] uppercase tracking-[0.2em]">Isolated</span>
            <span className="ml-2 text-fg">
              {signals.isolatedNodeIds
                .slice(0, 4)
                .map((id) => labelFor(id, index))
                .join(", ")}
            </span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
