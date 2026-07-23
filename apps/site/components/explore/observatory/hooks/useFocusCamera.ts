"use client";

import { useEffect, useRef } from "react";
import { useReactFlow } from "@xyflow/react";

export type FocusCameraTarget =
  | { type: "node"; nodeId: string }
  | { type: "relationship"; nodeIds: [string, string] }
  | null;

export function useFocusCamera({
  target,
  refitSignal = 0,
}: {
  target: FocusCameraTarget;
  refitSignal?: number;
}) {
  const rf = useReactFlow();
  const prevSig = useRef(refitSignal);

  useEffect(() => {
    if (prevSig.current === refitSignal) return;
    prevSig.current = refitSignal;
    if (!target) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 0 : 480;

    queueMicrotask(() => {
      if (target.type === "node") {
        rf.fitView({ nodes: [{ id: target.nodeId }], padding: 0.35, duration });
      } else {
        rf.fitView({
          nodes: [{ id: target.nodeIds[0] }, { id: target.nodeIds[1] }],
          padding: 0.45,
          duration,
        });
      }
    });
  }, [target, refitSignal, rf]);
}
