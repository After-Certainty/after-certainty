"use client";

import { memo } from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

import { styleForRelationshipPredicate } from "@/lib/graph/relationshipVisuals";

export type SemanticFlowEdgeData = {
  relationship: string;
  /** Shortest-path trace (Paths & insights). */
  pathTraced?: boolean;
  /** Picked from the focus panel. */
  panelSelected?: boolean;
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
}: EdgeProps) {
  const rel = (data as SemanticFlowEdgeData | undefined)?.relationship ?? "";
  const style = styleForRelationshipPredicate(rel);
  const [path] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const pathTraced = Boolean((data as SemanticFlowEdgeData | undefined)?.pathTraced);
  const panelSel = Boolean((data as SemanticFlowEdgeData | undefined)?.panelSelected);
  const strong = pathTraced || panelSel;

  const strokeWidth = strong ? style.strokeWidth + 4.25 : style.strokeWidth;

  const stroke = strong ? `color-mix(in srgb, var(--accent) 52%, ${style.stroke})` : style.stroke;

  const opacity = strong ? 1 : 0.92;

  return (
    <BaseEdge
      id={id}
      path={path}
      style={{
        stroke,
        strokeWidth,
        strokeDasharray: strong ? undefined : style.strokeDasharray,
        opacity,
        filter: strong ? "drop-shadow(0 0 5px color-mix(in srgb, var(--accent) 55%, transparent))" : undefined,
      }}
    />
  );
}

export const SemanticFlowEdge = memo(SemanticFlowEdgeInner);
