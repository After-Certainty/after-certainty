"use client";

import type { GraphIndex } from "@/lib/graph/graph";
import type { InsightEdge } from "@/lib/graph/graphInsights";
import type { NeighborhoodSignals } from "@/lib/observatory/neighborhoodSignals";

import { NeighborhoodSignalsDock } from "@/components/explore/observatory/dock/NeighborhoodSignalsDock";
import { PathTraceDock } from "@/components/explore/observatory/dock/PathTraceDock";

type ObservatoryBottomDockProps = {
  index: GraphIndex;
  nodeIds: string[];
  pathFromId: string | null;
  pathToId: string | null;
  pathChain: string[] | null;
  signals: NeighborhoodSignals;
  isOpen: boolean;
  onToggle: () => void;
  onPathFromChange: (id: string | null) => void;
  onPathToChange: (id: string | null) => void;
  onSelectEdge?: (edge: InsightEdge) => void;
  onFocusNodeId?: (id: string) => void;
};

export function ObservatoryBottomDock({
  index,
  nodeIds,
  pathFromId,
  pathToId,
  pathChain,
  signals,
  isOpen,
  onToggle,
  onPathFromChange,
  onPathToChange,
  onSelectEdge,
  onFocusNodeId,
}: ObservatoryBottomDockProps) {
  return (
    <section className="shrink-0 border-t border-border/30 bg-bg/90 lg:bg-bg/80">
      <div className="flex items-center gap-3 px-4 py-2.5 lg:px-5">
        <button
          type="button"
          id="observatory-paths-insights-toggle"
          className="shrink-0 text-[11px] uppercase tracking-[0.22em] text-accent underline-offset-4 transition-colors hover:underline"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls="observatory-paths-insights-panel"
        >
          Paths &amp; insights
        </button>
        {!isOpen ? (
          <p className="min-w-0 flex-1 truncate font-display text-sm text-fg/90">{signals.summaryLine}</p>
        ) : null}
      </div>

      {isOpen ? (
        <div
          id="observatory-paths-insights-panel"
          role="region"
          aria-labelledby="observatory-paths-insights-toggle"
          className="max-h-[min(22vh,11.5rem)] overflow-y-auto border-t border-border/20 px-4 py-3 lg:px-5"
        >
          <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
            <PathTraceDock
              index={index}
              nodeIds={nodeIds}
              pathFromId={pathFromId}
              pathToId={pathToId}
              pathChain={pathChain}
              onPathFromChange={onPathFromChange}
              onPathToChange={onPathToChange}
              compact
            />
            <NeighborhoodSignalsDock
              index={index}
              signals={signals}
              onSelectEdge={onSelectEdge}
              onFocusNodeId={onFocusNodeId}
              compact
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
