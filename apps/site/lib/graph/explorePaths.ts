import type { GraphIndex, GraphNode } from "@/lib/graph/graph";
import type { GraphEntityKind } from "@/types/semanticGraph";

export const explorePaths = {
  home: "/explore",
  concepts: "/explore/concepts",
  patterns: "/explore/patterns",
  books: "/explore/books",
  sources: "/explore/sources",
} as const;

/** Glossary slug for the default focal node on `/explore` without query parameters. */
export const exploreDefaultHomeConceptSlug = "certainty";

/**
 * Canonical graph id for {@link exploreDefaultHomeConceptSlug} when it exists as a concept; otherwise `null`.
 */
export function exploreDefaultHomeFocalCanonicalId(index: GraphIndex): string | null {
  const id = index.resolveCanonicalId(exploreDefaultHomeConceptSlug);
  if (!id) return null;
  const n = index.getNodeByCanonicalId(id);
  return n?.kind === "concept" ? id : null;
}

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

/** Deep-link into the graph observatory with this entity as focal node. */
export function exploreObservatoryFocusHref(kind: GraphEntityKind, slug: string): string {
  const q = new URLSearchParams();
  q.set("focusKind", kind);
  q.set("focusSlug", slug);
  return `${explorePaths.home}?${q.toString()}`;
}
