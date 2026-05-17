"use client";

import { useEffect, useRef } from "react";
import { useReactFlow } from "@xyflow/react";

type NodePositionSnapshot = { id: string; position: { x: number; y: number } };

/** After spread layout, frame the full visible subgraph (not the focus node alone). */
export function useFitViewOnSpread(
  layoutRevision: number,
  nodes: ReadonlyArray<NodePositionSnapshot>,
) {
  const rf = useReactFlow();
  const prevRevision = useRef(0);
  const pendingSpread = useRef(false);
  const preSpreadPositions = useRef<string | null>(null);

  useEffect(() => {
    if (layoutRevision <= 0 || layoutRevision === prevRevision.current) return;
    prevRevision.current = layoutRevision;
    pendingSpread.current = true;
    preSpreadPositions.current = nodes.map((n) => `${n.id}:${n.position.x},${n.position.y}`).join("|");
  }, [layoutRevision, nodes]);

  useEffect(() => {
    if (!pendingSpread.current || nodes.length === 0) return;

    const signature = nodes.map((n) => `${n.id}:${n.position.x},${n.position.y}`).join("|");
    if (signature === preSpreadPositions.current) return;

    pendingSpread.current = false;
    preSpreadPositions.current = null;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 0 : 420;

    requestAnimationFrame(() => {
      rf.fitView({ padding: 0.22, duration });
    });
  }, [nodes, rf]);
}
