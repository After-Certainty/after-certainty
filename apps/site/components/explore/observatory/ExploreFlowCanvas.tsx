"use client";

import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import { useTheme } from "next-themes";
import {
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { ObservatoryAtmosphere } from "@/components/explore/observatory/graph/ObservatoryAtmosphere";
import type { SemanticFlowEdgeData } from "@/components/explore/observatory/SemanticFlowEdge";
import { SemanticFlowEdge } from "@/components/explore/observatory/SemanticFlowEdge";
import type { SemanticFlowNodeData } from "@/components/explore/observatory/SemanticFlowNode";
import { SemanticFlowNode } from "@/components/explore/observatory/SemanticFlowNode";
import { useFitViewOnCanvasLayout } from "@/components/explore/observatory/hooks/useFitViewOnCanvasLayout";
import { useFitViewOnSpread } from "@/components/explore/observatory/hooks/useFitViewOnSpread";
import { useFocusCamera, type FocusCameraTarget } from "@/components/explore/observatory/hooks/useFocusCamera";
import { cn } from "@/lib/cn";

const nodeTypes = { semantic: SemanticFlowNode };
const edgeTypes = { semantic: SemanticFlowEdge };

export type ExploreFlowCanvasProps = {
  nodes: Node<SemanticFlowNodeData>[];
  edges: Edge<SemanticFlowEdgeData>[];
  cameraTarget: FocusCameraTarget;
  refitSignal?: number;
  /** Bumped when spread layout runs; triggers fit-to-all-nodes (not focus zoom). */
  layoutRevision?: number;
  /** Side-pane layout signature — refit when the visible canvas size changes. */
  canvasLayoutKey?: string;
  onNodesChange: OnNodesChange<Node<SemanticFlowNodeData>>;
  onEdgesChange: OnEdgesChange<Edge<SemanticFlowEdgeData>>;
  onNodeClick: (canonicalId: string) => void;
  onNodeDoubleClick?: (canonicalId: string) => void;
  onEdgeClick?: (edgeKey: string, edge: Edge<SemanticFlowEdgeData>) => void;
  onEdgeMouseEnter?: (edgeKey: string | null) => void;
  onPaneClick: () => void;
  onTidyLayout?: () => void;
  onFocusZoom?: () => void;
  canFocusZoom?: boolean;
  onPrune?: () => void;
  canPrune?: boolean;
  fullHeight?: boolean;
  showAtmosphere?: boolean;
};

function FocusCamera({ target, refitSignal }: { target: FocusCameraTarget; refitSignal: number }) {
  useFocusCamera({ target, refitSignal });
  return null;
}

function FitViewOnSpread({
  layoutRevision,
  nodes,
}: {
  layoutRevision: number;
  nodes: Node<SemanticFlowNodeData>[];
}) {
  useFitViewOnSpread(layoutRevision, nodes);
  return null;
}

function FitViewOnCanvasLayout({
  containerRef,
  layoutKey,
  nodeCount,
}: {
  containerRef: RefObject<HTMLElement | null>;
  layoutKey: string;
  nodeCount: number;
}) {
  useFitViewOnCanvasLayout({ containerRef, layoutKey, nodeCount });
  return null;
}

export function ExploreFlowCanvas({
  nodes,
  edges,
  cameraTarget,
  refitSignal = 0,
  layoutRevision = 0,
  canvasLayoutKey = "default",
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onNodeDoubleClick,
  onEdgeClick,
  onEdgeMouseEnter,
  onPaneClick,
  onTidyLayout,
  onFocusZoom,
  canFocusZoom = false,
  onPrune,
  canPrune = false,
  fullHeight = false,
  showAtmosphere = true,
}: ExploreFlowCanvasProps) {
  const { resolvedTheme } = useTheme();
  const xyflowDark = resolvedTheme !== "light";
  const hoverDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge<SemanticFlowEdgeData>) => {
      const key = edge.data?.edgeKey;
      if (key) onEdgeClick?.(key, edge);
    },
    [onEdgeClick],
  );

  const handleEdgeMouseEnter = useCallback(
    (_: React.MouseEvent, edge: Edge<SemanticFlowEdgeData>) => {
      if (hoverDebounce.current) clearTimeout(hoverDebounce.current);
      const key = edge.data?.edgeKey ?? null;
      hoverDebounce.current = setTimeout(() => onEdgeMouseEnter?.(key), 50);
    },
    [onEdgeMouseEnter],
  );

  const handleEdgeMouseLeave = useCallback(() => {
    if (hoverDebounce.current) clearTimeout(hoverDebounce.current);
    hoverDebounce.current = setTimeout(() => onEdgeMouseEnter?.(null), 80);
  }, [onEdgeMouseEnter]);

  useEffect(() => {
    return () => {
      if (hoverDebounce.current) clearTimeout(hoverDebounce.current);
    };
  }, []);

  const particleCount = useMemo(() => (nodes.length > 48 ? 0 : 16), [nodes.length]);

  return (
    <div
      ref={containerRef}
      className={
        fullHeight
          ? "relative h-full min-h-0 w-full flex-1"
          : "relative h-[min(72vh,560px)] w-full min-h-[280px] lg:h-full lg:min-h-0"
      }
    >
      {showAtmosphere && particleCount > 0 ? <ObservatoryAtmosphere particleCount={particleCount} /> : null}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.28}
        maxZoom={1.45}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={onNodeDoubleClick ? handleNodeDoubleClick : undefined}
        onEdgeClick={onEdgeClick ? handleEdgeClick : undefined}
        onEdgeMouseEnter={onEdgeMouseEnter ? handleEdgeMouseEnter : undefined}
        onEdgeMouseLeave={onEdgeMouseEnter ? handleEdgeMouseLeave : undefined}
        onPaneClick={onPaneClick}
        className={cn("explore-observatory-rf !bg-transparent", xyflowDark && "dark")}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        elevateEdgesOnSelect
      >
        <FocusCamera target={cameraTarget} refitSignal={refitSignal} />
        <FitViewOnCanvasLayout
          containerRef={containerRef}
          layoutKey={canvasLayoutKey}
          nodeCount={nodes.length}
        />
        <FitViewOnSpread layoutRevision={layoutRevision} nodes={nodes} />
        <Background variant={BackgroundVariant.Dots} gap={26} size={1} color="var(--explore-observatory-dots)" />
        <Controls
          showInteractive={false}
          className="!m-3 !overflow-hidden !rounded-md !border !border-border !bg-bg-elevated/95 !p-0 !shadow-none"
        >
          {onFocusZoom ? (
            <ControlButton
              onClick={onFocusZoom}
              disabled={!canFocusZoom}
              title={
                canFocusZoom
                  ? "Zoom to focus — frames the selected node or relationship"
                  : "Select a node or relationship to zoom"
              }
              aria-label="Zoom to the current focus node or relationship"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="shrink-0">
                <circle cx="6" cy="6" r="2.25" stroke="currentColor" strokeWidth="1.25" fill="none" />
                <path
                  d="M6 1v1.25M6 9.75V11M1 6h1.25M9.75 6H11"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />
              </svg>
            </ControlButton>
          ) : null}
          {onPrune ? (
            <ControlButton
              onClick={onPrune}
              disabled={!canPrune}
              title={
                canPrune
                  ? "Prune — reset the canvas to a fresh neighborhood around the current focus"
                  : "Already at a fresh focus neighborhood"
              }
              aria-label="Prune graph back to a fresh focus neighborhood"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="shrink-0">
                <circle cx="6" cy="6" r="1.35" fill="currentColor" />
                <path
                  d="M6 4.1V2.2M6 9.8V7.9M4.1 6H2.2M9.8 6H7.9"
                  stroke="currentColor"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                />
                <path
                  d="M3.4 3.4 4.5 4.5M8.6 3.4 7.5 4.5M3.4 8.6 4.5 7.5M8.6 8.6 7.5 7.5"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>
            </ControlButton>
          ) : null}
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
