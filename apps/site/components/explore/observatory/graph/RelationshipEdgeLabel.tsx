"use client";

import { memo, useLayoutEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { EdgeLabelRenderer, getBezierPath, type Position } from "@xyflow/react";

import { formatRelationshipLabelForDisplay } from "@/lib/graph/relationshipVisuals";

/** Same opaque surfaces as {@link SemanticFlowNode}. */
const LABEL_SURFACE_DARK = "#070708";
const LABEL_SURFACE_LIGHT = "#ffffff";
const LABEL_TEXT_DARK = "#fffcf7";
const LABEL_BORDER_DARK = "rgba(236, 232, 225, 0.22)";

type RelationshipEdgeLabelProps = {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  relationship: string;
  showLabel: boolean;
};

function RelationshipEdgeLabelInner(props: RelationshipEdgeLabelProps) {
  const { resolvedTheme } = useTheme();
  const pillRef = useRef<HTMLSpanElement>(null);
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    relationship,
    showLabel,
  } = props;

  const isLight = resolvedTheme === "light";

  useLayoutEffect(() => {
    const el = pillRef.current;
    if (!el) return;
    el.style.setProperty("background-color", isLight ? LABEL_SURFACE_LIGHT : LABEL_SURFACE_DARK, "important");
    el.style.setProperty("color", isLight ? "" : LABEL_TEXT_DARK, "important");
    el.style.setProperty(
      "border-color",
      isLight ? "" : LABEL_BORDER_DARK,
      "important",
    );
    el.style.setProperty("background-image", "none", "important");
    el.style.setProperty("-webkit-backdrop-filter", "none", "important");
    el.style.setProperty("backdrop-filter", "none", "important");
    el.style.setProperty("opacity", "1", "important");
    el.style.setProperty("mix-blend-mode", "normal", "important");
  }, [isLight]);

  if (!showLabel || !relationship) return null;

  const [, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const directed = targetX >= sourceX;

  return (
    <EdgeLabelRenderer>
      <div
        className="obs-edge-label pointer-events-none absolute"
        style={{
          transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
        }}
      >
        <span ref={pillRef} className="obs-edge-label-pill" data-edge={id}>
          {formatRelationshipLabelForDisplay(relationship)}
          <span className="obs-edge-label-arrow" aria-hidden>
            {directed ? " →" : " ←"}
          </span>
        </span>
      </div>
    </EdgeLabelRenderer>
  );
}

export const RelationshipEdgeLabel = memo(RelationshipEdgeLabelInner);
