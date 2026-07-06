import type { GraphIndex, GraphNode } from "@/lib/graph/graph";
import type { GraphEntityKind } from "@/types/semanticGraph";

export const explorePaths = {
  home: "/explore",
  concepts: "/explore/concepts",
  patterns: "/explore/patterns",
  books: "/explore/books",
  sources: "/explore/sources",
  thinkers: "/explore/thinkers",
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

export const EXPLORE_VIEW_OBSERVATORY = "observatory";

export type ExploreCompactView = "hub" | "observatory";

export function exploreViewFromSearchParams(sp: URLSearchParams): ExploreCompactView {
  return sp.get("view") === EXPLORE_VIEW_OBSERVATORY ? "observatory" : "hub";
}

/** Merge `view=observatory` into an explore URL (preserves focusKind/focusSlug). */
export function withExploreObservatoryView(href: string): string {
  const url = new URL(href, "http://local");
  url.searchParams.set("view", EXPLORE_VIEW_OBSERVATORY);
  return `${url.pathname}${url.search}`;
}

/** Deep-link into the graph observatory with this entity as focal node. */
export function exploreObservatoryFocusHref(kind: GraphEntityKind, slug: string): string {
  const q = new URLSearchParams();
  q.set("focusKind", kind);
  q.set("focusSlug", slug);
  return withExploreObservatoryView(`${explorePaths.home}?${q.toString()}`);
}

export const EXPLORE_EDGE_PARAM = "edge";

/** Deep-link a selected relationship (viz edge dedup key). */
export function exploreObservatoryRelationshipHref(
  kind: GraphEntityKind,
  slug: string,
  edgeKey: string,
): string {
  const q = new URLSearchParams();
  q.set("focusKind", kind);
  q.set("focusSlug", slug);
  q.set(EXPLORE_EDGE_PARAM, edgeKey);
  return withExploreObservatoryView(`${explorePaths.home}?${q.toString()}`);
}

export function edgeKeyFromSearchParams(sp: URLSearchParams): string | null {
  const raw = sp.get(EXPLORE_EDGE_PARAM)?.trim();
  return raw || null;
}

export const EXPLORE_REL_PRESET_PARAM = "relPreset";

export type ExploreRelationshipPreset = "tensions" | "dynamics";

export function relationshipPresetFromSearchParams(
  sp: URLSearchParams,
): ExploreRelationshipPreset | null {
  const raw = sp.get(EXPLORE_REL_PRESET_PARAM)?.trim();
  if (raw === "tensions" || raw === "dynamics") return raw;
  return null;
}

/** Observatory entry with relationship-family predicate filters applied. */
export function exploreObservatoryPresetHref(
  preset: ExploreRelationshipPreset,
  focus?: { kind: GraphEntityKind; slug: string },
): string {
  const q = new URLSearchParams();
  const kind = focus?.kind ?? "concept";
  const slug = focus?.slug ?? exploreDefaultHomeConceptSlug;
  q.set("focusKind", kind);
  q.set("focusSlug", slug);
  q.set(EXPLORE_REL_PRESET_PARAM, preset);
  return withExploreObservatoryView(`${explorePaths.home}?${q.toString()}`);
}
