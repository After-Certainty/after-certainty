/**
 * Domain-level node styling hints for graph UIs (React Flow, canvas, etc.).
 * Extension: layer-based palettes, centrality sizing, timeline tint.
 */

import type { GraphNode } from "@/lib/graph/graph";

export type NodeVisualKind = "concept" | "pattern" | "book" | "source";

export type NodeVisualProfile = {
  kind: NodeVisualKind;
  /** Tailwind-oriented token names — consumer maps to classes. */
  accent: "gold" | "violet" | "teal" | "slate" | "ember";
  shape: "circle" | "diamond" | "rect" | "pill";
  emphasis: "high" | "mid" | "low";
};

export function visualProfileForGraphNode(node: GraphNode): NodeVisualProfile {
  switch (node.kind) {
    case "concept": {
      const tone = node.entity.semanticTone;
      if (tone === "pressure") {
        return { kind: "concept", accent: "ember", shape: "circle", emphasis: "mid" };
      }
      if (tone === "capability") {
        return { kind: "concept", accent: "teal", shape: "circle", emphasis: "high" };
      }
      return { kind: "concept", accent: "gold", shape: "circle", emphasis: "high" };
    }
    case "pattern":
      return { kind: "pattern", accent: "violet", shape: "diamond", emphasis: "mid" };
    case "book":
      return { kind: "book", accent: "gold", shape: "rect", emphasis: "mid" };
    case "source":
      return { kind: "source", accent: "slate", shape: "pill", emphasis: "low" };
  }
}
