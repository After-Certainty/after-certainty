"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  ReactFlow,
  useReactFlow,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { SemanticFlowEdgeData } from "@/components/explore/observatory/SemanticFlowEdge";
import { SemanticFlowEdge } from "@/components/explore/observatory/SemanticFlowEdge";
import type { SemanticFlowNodeData } from "@/components/explore/observatory/SemanticFlowNode";
import { SemanticFlowNode } from "@/components/explore/observatory/SemanticFlowNode";
import { cn } from "@/lib/cn";

const nodeTypes = { semantic: SemanticFlowNode };
const edgeTypes = { semantic: SemanticFlowEdge };

export type ExploreFlowCanvasProps = {
  nodes: Node<SemanticFlowNodeData>[];
  edges: Edge<SemanticFlowEdgeData>[];
  focusId: string | null;
  /** Increment to fit the view again without changing `focusId` (e.g. double-click same focal entity). */
  refitSignal?: number;
  onNodesChange: OnNodesChange<Node<SemanticFlowNodeData>>;
  onEdgesChange: OnEdgesChange<Edge<SemanticFlowEdgeData>>;
  onNodeClick: (canonicalId: string) => void;
  onNodeDoubleClick?: (canonicalId: string) => void;
  onPaneClick: () => void;
  /** Re-run radial placement for visible nodes (pinned positions preserved). */
  onTidyLayout?: () => void;
  /** Fill parent height (compact fullscreen observatory). */
  fullHeight?: boolean;
};

function FitViewOnFocus({ focusId, refitSignal = 0 }: { focusId: string | null; refitSignal?: number }) {
  const rf = useReactFlow();
  const prev = useRef<{ focus: string | null; sig: number }>({ focus: null, sig: -1 });

  useEffect(() => {
    const changedFocus = prev.current.focus !== focusId;
    const changedSig = prev.current.sig !== refitSignal;
    if (!changedFocus && !changedSig) return;
    prev.current = { focus: focusId, sig: refitSignal };
    if (!focusId) return;
    queueMicrotask(() => {
      rf.fitView({ padding: 0.22, duration: 420 });
    });
  }, [focusId, refitSignal, rf]);

  return null;
}

export function ExploreFlowCanvas({
  nodes,
  edges,
  focusId,
  refitSignal = 0,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onNodeDoubleClick,
  onPaneClick,
  onTidyLayout,
  fullHeight = false,
}: ExploreFlowCanvasProps) {
  const { resolvedTheme } = useTheme();
  /** XY Flow swaps `--xy-*-default` vars only when the root has `.dark` (see `@xyflow/react/dist/style.css`). */
  const xyflowDark = resolvedTheme !== "light";

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, n: Node) => {
      onNodeClick(n.id);
    },
    [onNodeClick],
  );

  const handleNodeDoubleClick = useCallback(
    (e: React.MouseEvent, n: Node) => {
      e.stopPropagation();
      onNodeDoubleClick?.(n.id);
    },
    [onNodeDoubleClick],
  );

  return (
    <div
      className={
        fullHeight
          ? "h-full min-h-0 w-full flex-1"
          : "h-[min(72vh,560px)] w-full min-h-[280px] lg:h-full lg:min-h-0"
      }
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.28}
        maxZoom={1.45}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={onNodeDoubleClick ? handleNodeDoubleClick : undefined}
        onPaneClick={onPaneClick}
        className={cn("explore-observatory-rf !bg-transparent", xyflowDark && "dark")}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        elevateEdgesOnSelect
      >
        <FitViewOnFocus focusId={focusId} refitSignal={refitSignal} />
        <Background variant={BackgroundVariant.Dots} gap={26} size={1} color="var(--explore-observatory-dots)" />
        <Controls
          showInteractive={false}
          className="!m-3 !overflow-hidden !rounded-md !border !border-border !bg-bg-elevated/95 !p-0 !shadow-none"
        >
          {onTidyLayout ? (
            <ControlButton
              onClick={onTidyLayout}
              title="Spread nodes — keeps everyone visible; pinned nodes stay put"
              aria-label="Spread nodes on a ring without overlap (pinned nodes stay put)"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="shrink-0">
                <g stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" fill="none">
                  <path d="M6 1v2M6 9v2M1 6h2M9 6h2" />
                  <path d="M2.35 2.35l1.3 1.3M8.35 8.35l1.3 1.3M8.35 3.65l1.3-1.3M2.35 9.65l1.3-1.3" />
                </g>
              </svg>
            </ControlButton>
          ) : null}
        </Controls>
      </ReactFlow>
    </div>
  );
}
