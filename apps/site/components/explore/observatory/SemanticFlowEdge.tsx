"use client";

import { memo } from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

import { RelationshipEdgeLabel } from "@/components/explore/observatory/graph/RelationshipEdgeLabel";
import type { EdgeSemanticTier } from "@/lib/observatory/types";
import { styleForRelationshipPredicate } from "@/lib/graph/relationshipVisuals";

export type SemanticFlowEdgeData = {
  edgeKey: string;
  relationship: string;
  semanticTier?: EdgeSemanticTier;
  pathTraced?: boolean;
  showLabel?: boolean;
  isSyntheticRelated?: boolean;
  description?: string;
};

function SemanticFlowEdgeInner({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const d = data as SemanticFlowEdgeData | undefined;
  const rel = d?.relationship ?? "";
  const tier = d?.semanticTier ?? (d?.pathTraced ? "path" : "dim");
  const style = styleForRelationshipPredicate(rel);
  const [path] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

  const strong = tier === "selected" || tier === "path" || selected;
  const incident = tier === "incident";
  const dim = tier === "dim";

  const strokeWidth = strong ? style.strokeWidth + 4.25 : incident ? style.strokeWidth + 1.5 : style.strokeWidth;

  const stroke = strong
    ? `color-mix(in srgb, var(--accent) 52%, ${style.stroke})`
    : incident
      ? `color-mix(in srgb, var(--accent) 28%, ${style.stroke})`
      : style.stroke;

  const opacity = dim ? 0.28 : strong ? 1 : incident ? 0.88 : 0.55;

  const className = [
    "obs-semantic-edge",
    strong ? "obs-semantic-edge--strong" : "",
    incident ? "obs-semantic-edge--incident" : "",
    tier === "selected" ? "obs-semantic-edge--selected" : "",
    d?.isSyntheticRelated ? "obs-semantic-edge--related" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="obs-semantic-edge-hit"
        style={{ cursor: "pointer" }}
      />
      <BaseEdge
        id={id}
        path={path}
        className={className}
        style={{
          stroke,
          strokeWidth,
          strokeDasharray: strong || incident ? undefined : style.strokeDasharray,
          opacity,
          filter: strong ? "drop-shadow(0 0 5px color-mix(in srgb, var(--accent) 55%, transparent))" : undefined,
        }}
        interactionWidth={20}
      />
      <RelationshipEdgeLabel
        id={id}
        sourceX={sourceX}
        sourceY={sourceY}
        targetX={targetX}
        targetY={targetY}
        sourcePosition={sourcePosition}
        targetPosition={targetPosition}
        relationship={rel}
        showLabel={Boolean(d?.showLabel)}
      />
    </>
  );
}

export const SemanticFlowEdge = memo(SemanticFlowEdgeInner);
