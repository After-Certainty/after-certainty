/**
 * Deterministic radial placement for semantic graph nodes (React Flow positions).
 * Extension: force-directed snapshots, pinned layout persistence, timeline axes.
 */

export type XY = { x: number; y: number };

const BASE_RADIUS = 200;
/** Approximate node footprint in flow coordinates (semantic nodes are ~7.5–11rem wide). */
const NODE_APPARENT_DIAMETER = 160;

export function radialPositionsForNodes(focusId: string, nodeIds: readonly string[]): Map<string, XY> {
  const map = new Map<string, XY>();
  map.set(focusId, { x: 0, y: 0 });
  const others = nodeIds.filter((id) => id !== focusId);
  const n = others.length;
  const minChordR =
    n <= 0
      ? BASE_RADIUS
      : n === 1
        ? Math.max(BASE_RADIUS, NODE_APPARENT_DIAMETER)
        : NODE_APPARENT_DIAMETER / (2 * Math.sin(Math.PI / n));
  const R = Math.max(BASE_RADIUS + Math.min(120, n * 4), minChordR);
  for (let i = 0; i < n; i += 1) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const id = others[i]!;
    map.set(id, { x: Math.cos(angle) * R, y: Math.sin(angle) * R });
  }
  return map;
}

/** Merge new radial coords without clobbering existing user-dragged positions. */
export function mergeNodePositions(
  focusId: string,
  nodeIds: readonly string[],
  previous: ReadonlyMap<string, XY>,
): Map<string, XY> {
  const radial = radialPositionsForNodes(focusId, nodeIds);
  const next = new Map<string, XY>();
  for (const id of nodeIds) {
    const prev = previous.get(id);
    if (prev) next.set(id, prev);
    else {
      const r = radial.get(id);
      if (r) next.set(id, r);
    }
  }
  return next;
}
