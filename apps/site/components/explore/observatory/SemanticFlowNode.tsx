"use client";

import { memo, useLayoutEffect, useRef, type MouseEvent } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import { visualProfileForGraphNode } from "@/lib/graph/nodeVisuals";
import type { GraphNode } from "@/lib/graph/graph";
import type { NodeSemanticTier } from "@/lib/observatory/types";

export type SemanticFlowNodeData = {
  graphNode: GraphNode;
  semanticTier?: NodeSemanticTier;
  isFocus: boolean;
  isSelected: boolean;
  isPinned: boolean;
  onPath: boolean;
  /** Entity detail page; title is a link when set. */
  detailHref?: string;
};

/** Per-entity border tint (semantic tone / kind). Distinct from canvas so nodes read as colored frames on the map. */
const accentRing: Record<string, string> = {
  gold: "border border-[#c9a962]/75 shadow-[0_0_28px_rgba(201,169,98,0.14)] light:border-[#8a6f2d]/70 light:shadow-[0_0_24px_rgba(138,111,45,0.1)]",
  violet:
    "border border-violet-400/65 shadow-[0_0_22px_rgba(139,92,246,0.14)] light:border-violet-600/50 light:shadow-[0_0_20px_rgba(124,58,237,0.08)]",
  teal: "border border-teal-400/60 shadow-[0_0_22px_rgba(45,212,191,0.12)] light:border-teal-600/45 light:shadow-[0_0_18px_rgba(13,148,136,0.08)]",
  slate:
    "border border-[rgba(236,232,225,0.22)] shadow-[0_0_12px_rgba(0,0,0,0.2)] light:border-[rgba(20,18,16,0.2)] light:shadow-[0_0_12px_rgba(0,0,0,0.06)]",
  ember:
    "border border-rose-500/55 shadow-[0_0_24px_rgba(244,63,94,0.12)] light:border-rose-700/45 light:shadow-[0_0_18px_rgba(190,18,60,0.08)]",
};

/** Selected: thicker frame using the same accent hues (no neutral outline). */
function ringClassesForState(base: string, isSelected: boolean): string {
  if (!isSelected) return base;
  return base
    .replace(/^border border/, "border-[3px] border")
    .replace(/light:border-(?=\[|violet|teal|rose)/g, "light:border-[3px] light:border-");
}

const shapeClass: Record<string, string> = {
  circle: "rounded-full min-w-[7.5rem] min-h-[7.5rem] max-w-[10rem] aspect-square",
  diamond: "rotate-45 rounded-md min-w-[6rem] min-h-[6rem] max-w-[8rem]",
  rect: "rounded-sm min-w-[8rem] max-w-[11rem]",
  pill: "rounded-full px-4 py-3 min-w-[6rem]",
};

function titleOf(n: GraphNode): string {
  return n.kind === "source" ? n.entity.name : n.entity.title;
}

function stopNodeActivation(e: MouseEvent) {
  e.stopPropagation();
}

function NodeTitle({ title, detailHref }: { title: string; detailHref?: string }) {
  const className =
    "semantic-flow-node-title mt-1 line-clamp-3 text-[13px] leading-snug hover:text-accent hover:underline hover:underline-offset-2 md:text-sm";

  if (!detailHref) {
    return <p className={className}>{title}</p>;
  }

  return (
    <Link
      href={detailHref}
      className={className}
      aria-label={`Open ${title} detail page`}
      onClick={stopNodeActivation}
      onPointerDown={stopNodeActivation}
    >
      {title}
    </Link>
  );
}

function subtitleOf(n: GraphNode): string | undefined {
  if (n.kind === "concept") return n.entity.shortDefinition;
  if (n.kind === "pattern") return n.entity.summary;
  if (n.kind === "book") return n.entity.subtitle ?? n.entity.summary;
  return n.entity.summary;
}

/** Match tokens.css --bg / --bg-elevated; opaque fills (RF compositing can read as translucent). */
const NODE_SURFACE_DARK = "#070708";
const NODE_SURFACE_LIGHT = "#ffffff";

function SemanticFlowNodeInner({ data }: NodeProps<Node<SemanticFlowNodeData>>) {
  const { resolvedTheme } = useTheme();
  const surfaceRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const bg = resolvedTheme === "light" ? NODE_SURFACE_LIGHT : NODE_SURFACE_DARK;
    el.style.setProperty("background-color", bg, "important");
    el.style.setProperty("background-image", "none", "important");
    el.style.setProperty("-webkit-backdrop-filter", "none", "important");
    el.style.setProperty("backdrop-filter", "none", "important");
    el.style.setProperty("opacity", "1", "important");
    el.style.setProperty("mix-blend-mode", "normal", "important");
    el.style.setProperty("isolation", "isolate", "important");
  }, [resolvedTheme]);

  const { graphNode, semanticTier, isFocus, isSelected, isPinned, onPath, detailHref } = data;
  const tier = semanticTier ?? (isFocus ? "focus" : "dim");
  const title = titleOf(graphNode);
  const profile = visualProfileForGraphNode(graphNode);
  const ring = ringClassesForState(accentRing[profile.accent] ?? accentRing.slate, isSelected);
  const shape = shapeClass[profile.shape] ?? shapeClass.circle;
  const focusRing = isFocus || tier === "focus" ? "ring-2 ring-inset ring-accent/45 obs-node-focus-halo" : "";
  const neighborGlow = tier === "neighbor" ? "obs-node-neighbor-glow" : "";
  const pathGlow = onPath || tier === "path" ? "shadow-[0_0_32px_var(--accent-soft)]" : "";
  const dimClass = tier === "dim" ? "obs-node-dim opacity-[0.55]" : "";

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-accent/50" />
      <div
        ref={surfaceRef}
        className={[
          "semantic-flow-node-surface flex flex-col items-center justify-center px-3 py-3 text-center transition-[box-shadow,transform] duration-300",
          shape,
          ring,
          focusRing,
          neighborGlow,
          pathGlow,
          dimClass,
          profile.shape === "diamond" ? "text-[13px]" : "text-sm",
        ].join(" ")}
      >
        {profile.shape === "diamond" ? (
          <div className="-rotate-45 px-1">
            <p className="semantic-flow-node-meta text-[9px] uppercase tracking-[0.22em]">{graphNode.kind}</p>
            <NodeTitle title={title} detailHref={detailHref} />
          </div>
        ) : (
          <>
            <p className="semantic-flow-node-meta text-[9px] uppercase tracking-[0.22em]">{graphNode.kind}</p>
            <NodeTitle title={title} detailHref={detailHref} />
            {subtitleOf(graphNode) && profile.shape !== "pill" ? (
              <p className="semantic-flow-node-meta mt-1 line-clamp-2 text-[11px] leading-relaxed">
                {subtitleOf(graphNode)}
              </p>
            ) : null}
          </>
        )}
        {isPinned ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-accent/25 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-accent">
            pin
          </span>
        ) : null}
      </div>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-accent/50" />
    </div>
  );
}

export const SemanticFlowNode = memo(SemanticFlowNodeInner);
