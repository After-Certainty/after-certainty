export const FIT_VIEW_CANVAS_PADDING = 0.22;

/** Debounce container resize refits to avoid jitter while panes animate. */
export const RESIZE_FIT_DEBOUNCE_MS = 180;

export type CanvasLayoutFitSnapshot = {
  layoutKey: string | null;
  nodeCount: number;
};

/**
 * Whether to refit when layoutKey or node count changes (not on every nodeCount bump).
 */
export function shouldTriggerCanvasLayoutFit(
  prev: CanvasLayoutFitSnapshot,
  next: { layoutKey: string; nodeCount: number },
): boolean {
  if (next.nodeCount === 0) return false;
  const layoutChanged = prev.layoutKey !== next.layoutKey;
  const nodesArrived = prev.nodeCount === 0 && next.nodeCount > 0;
  return layoutChanged || nodesArrived;
}

/** Debounced scheduler for resize-driven refits (testable with fake timers). */
export function createDebouncedFitScheduler(
  fit: () => void,
  debounceMs: number,
): { schedule: () => void; cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return {
    schedule() {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;
        fit();
      }, debounceMs);
    },
    cancel() {
      if (timeout) clearTimeout(timeout);
      timeout = null;
    },
  };
}
