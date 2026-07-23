import { describe, expect, it } from "vitest";

import { buildUndirectedAdjacency, pathEdgePairs, shortestPathUndirected } from "@/lib/graph/graphPaths";

describe("graphPaths", () => {
  it("finds shortest path", () => {
    const nodes = new Set(["a", "b", "c", "d"]);
    const adj = buildUndirectedAdjacency(
      [
        { a: "a", b: "b" },
        { a: "b", b: "c" },
        { a: "c", b: "d" },
      ],
      nodes,
    );
    expect(shortestPathUndirected(adj, "a", "d")).toEqual(["a", "b", "c", "d"]);
  });

  it("returns path edge pairs", () => {
    expect(pathEdgePairs(["a", "b", "c"])).toEqual([
      { source: "a", target: "b" },
      { source: "b", target: "c" },
    ]);
  });
});
