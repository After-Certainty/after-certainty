/**
 * Shortest-path utilities on a simple adjacency view.
 * Extension: weighted Dijkstra, directed paths, reading-order constraints.
 */

export type UndirectedAdjacency = ReadonlyMap<string, ReadonlySet<string>>;

export function buildUndirectedAdjacency(
  edges: ReadonlyArray<{ a: string; b: string }>,
  nodeIds: ReadonlySet<string>,
): UndirectedAdjacency {
  const map = new Map<string, Set<string>>();
  const ensure = (id: string) => {
    if (!nodeIds.has(id)) return;
    if (!map.has(id)) map.set(id, new Set());
  };
  for (const { a, b } of edges) {
    if (!nodeIds.has(a) || !nodeIds.has(b)) continue;
    ensure(a);
    ensure(b);
    map.get(a)!.add(b);
    map.get(b)!.add(a);
  }
  return map;
}

/** Undirected BFS — returns vertex id chain from start to end, or null if unreachable. */
export function shortestPathUndirected(
  adj: UndirectedAdjacency,
  startId: string,
  endId: string,
): string[] | null {
  if (startId === endId) return [startId];
  if (!adj.has(startId) || !adj.has(endId)) return null;
  const prev = new Map<string, string | null>();
  const q: string[] = [startId];
  prev.set(startId, null);
  while (q.length) {
    const u = q.shift()!;
    const nbrs = adj.get(u);
    if (!nbrs) continue;
    for (const v of nbrs) {
      if (prev.has(v)) continue;
      prev.set(v, u);
      if (v === endId) {
        const out: string[] = [];
        let cur: string | null = endId;
        while (cur !== null) {
          out.push(cur);
          cur = prev.get(cur) ?? null;
        }
        out.reverse();
        return out;
      }
      q.push(v);
    }
  }
  return null;
}

export function pathEdgePairs(path: string[]): Array<{ source: string; target: string }> {
  const pairs: Array<{ source: string; target: string }> = [];
  for (let i = 0; i < path.length - 1; i += 1) {
    pairs.push({ source: path[i]!, target: path[i + 1]! });
  }
  return pairs;
}
