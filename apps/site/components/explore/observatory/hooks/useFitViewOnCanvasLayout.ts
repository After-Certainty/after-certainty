"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useReactFlow } from "@xyflow/react";

import {
  FIT_VIEW_CANVAS_PADDING,
  RESIZE_FIT_DEBOUNCE_MS,
  createDebouncedFitScheduler,
  shouldTriggerCanvasLayoutFit,
} from "@/lib/explore/fitViewOnCanvasLayout";

type UseFitViewOnCanvasLayoutArgs = {
  containerRef: RefObject<HTMLElement | null>;
  /** Changes when side panes open/close so the viewport can refit to the visible canvas. */
  layoutKey: string;
  nodeCount: number;
};

/**
 * Keeps the graph framed in the visible canvas when layout changes (e.g. side panes
 * opening after mount). React Flow does not refit automatically on container resize.
 */
export function useFitViewOnCanvasLayout({
  containerRef,
  layoutKey,
  nodeCount,
}: UseFitViewOnCanvasLayoutArgs) {
  const rf = useReactFlow();
  const snapshotRef = useRef({ layoutKey: null as string | null, nodeCount: 0 });

  useEffect(() => {
    const prev = snapshotRef.current;
    const next = { layoutKey, nodeCount };

    if (!shouldTriggerCanvasLayoutFit(prev, next)) {
      snapshotRef.current = next;
      return;
    }

    snapshotRef.current = next;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    requestAnimationFrame(() => {
      rf.fitView({
        padding: FIT_VIEW_CANVAS_PADDING,
        duration: reduceMotion ? 0 : 320,
      });
    });
  }, [layoutKey, nodeCount, rf]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const debounced = createDebouncedFitScheduler(() => {
      if (nodeCount === 0) return;
      rf.fitView({ padding: FIT_VIEW_CANVAS_PADDING, duration: 0 });
    }, RESIZE_FIT_DEBOUNCE_MS);

    const ro = new ResizeObserver(() => debounced.schedule());

    ro.observe(el);
    return () => {
      ro.disconnect();
      debounced.cancel();
    };
  }, [containerRef, nodeCount, rf]);
}
