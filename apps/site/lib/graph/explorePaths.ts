import type { GraphIndex, GraphNode } from "@/lib/graph/graph";

export const explorePaths = {
  home: "/explore",
  concepts: "/explore/concepts",
  patterns: "/explore/patterns",
  books: "/explore/books",
  sources: "/explore/sources",
} as const;

export function exploreHrefForNode(node: GraphNode): string {
  switch (node.kind) {
    case "concept":
      return `${explorePaths.concepts}/${node.slug}`;
    case "pattern":
      return `${explorePaths.patterns}/${node.slug}`;
    case "book":
      return `${explorePaths.books}/${node.slug}`;
    case "source":
      return `${explorePaths.sources}/${node.slug}`;
  }
}

export function exploreHrefForCanonicalId(index: GraphIndex, canonicalId: string): string | null {
  const n = index.getNodeByCanonicalId(canonicalId);
  if (!n) return null;
  return exploreHrefForNode(n);
}
