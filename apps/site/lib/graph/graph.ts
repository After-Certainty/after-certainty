import { resolveThinkers } from "@/lib/graph/thinkers";
import type {
  Book,
  GlossaryConcept,
  GraphEntityKind,
  Pattern,
  SemanticGraph,
  Source,
  Thinker,
} from "@/types/semanticGraph";

/** Unified node view for traversal, cards, and future graph adapters (D3, Cytoscape, etc.). */
export type GraphNode =
  | { kind: "book"; id: string; slug: string; entity: Book }
  | { kind: "concept"; id: string; slug: string; entity: GlossaryConcept }
  | { kind: "pattern"; id: string; slug: string; entity: Pattern }
  | { kind: "source"; id: string; slug: string; entity: Source }
  | { kind: "thinker"; id: string; slug: string; entity: Thinker };

export type GraphIndex = {
  graph: SemanticGraph;
  /** Canonical ids for all indexed entities (relationship endpoint checks). */
  idSet: ReadonlySet<string>;
  nodeByCanonicalId: ReadonlyMap<string, GraphNode>;
  bookBySlug: ReadonlyMap<string, Book>;
  conceptBySlug: ReadonlyMap<string, GlossaryConcept>;
  patternBySlug: ReadonlyMap<string, Pattern>;
  sourceBySlug: ReadonlyMap<string, Source>;
  thinkerBySlug: ReadonlyMap<string, Thinker>;
  /**
   * Resolve a manifest ref (usually `id`, sometimes `slug`) to a canonical `id`.
   * Order: id match, then slug match (glossary → pattern → book → source → thinker).
   */
  resolveCanonicalId(ref: string): string | null;
  resolveNode(ref: string): GraphNode | null;
  getNodeByCanonicalId(id: string): GraphNode | null;
};

export function graphNodeTitle(node: GraphNode): string {
  return node.kind === "source" || node.kind === "thinker" ? node.entity.name : node.entity.title;
}

function asNode(
  kind: GraphEntityKind,
  entity: Book | GlossaryConcept | Pattern | Source | Thinker,
): GraphNode {
  switch (kind) {
    case "book":
      return { kind: "book", id: entity.id, slug: entity.slug, entity: entity as Book };
    case "concept":
      return {
        kind: "concept",
        id: entity.id,
        slug: entity.slug,
        entity: entity as GlossaryConcept,
      };
    case "pattern":
      return { kind: "pattern", id: entity.id, slug: entity.slug, entity: entity as Pattern };
    case "source":
      return { kind: "source", id: entity.id, slug: entity.slug, entity: entity as Source };
    case "thinker":
      return { kind: "thinker", id: entity.id, slug: entity.slug, entity: entity as Thinker };
  }
}

/**
 * Build an in-memory index for O(1) lookups. Missing arrays are treated as `[]` upstream (zod).
 */
export function buildGraphIndex(graph: SemanticGraph): GraphIndex {
  const nodeByCanonicalId = new Map<string, GraphNode>();
  const bookBySlug = new Map<string, Book>();
  const conceptBySlug = new Map<string, GlossaryConcept>();
  const patternBySlug = new Map<string, Pattern>();
  const sourceBySlug = new Map<string, Source>();
  const thinkerBySlug = new Map<string, Thinker>();
  const ids = new Set<string>();

  const warnDup = (scope: string, key: string) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[semantic-graph] duplicate ${scope} key "${key}" — last write wins`);
    }
  };

  for (const b of graph.books) {
    if (nodeByCanonicalId.has(b.id)) warnDup("canonical id", b.id);
    nodeByCanonicalId.set(b.id, asNode("book", b));
    ids.add(b.id);
    if (bookBySlug.has(b.slug)) warnDup("book slug", b.slug);
    bookBySlug.set(b.slug, b);
  }

  for (const c of graph.glossary) {
    if (nodeByCanonicalId.has(c.id)) warnDup("canonical id", c.id);
    nodeByCanonicalId.set(c.id, asNode("concept", c));
    ids.add(c.id);
    if (conceptBySlug.has(c.slug)) warnDup("concept slug", c.slug);
    conceptBySlug.set(c.slug, c);
  }

  for (const p of graph.patterns) {
    if (nodeByCanonicalId.has(p.id)) warnDup("canonical id", p.id);
    nodeByCanonicalId.set(p.id, asNode("pattern", p));
    ids.add(p.id);
    if (patternBySlug.has(p.slug)) warnDup("pattern slug", p.slug);
    patternBySlug.set(p.slug, p);
  }

  for (const s of graph.sources) {
    if (nodeByCanonicalId.has(s.id)) warnDup("canonical id", s.id);
    nodeByCanonicalId.set(s.id, asNode("source", s));
    ids.add(s.id);
    if (sourceBySlug.has(s.slug)) warnDup("source slug", s.slug);
    sourceBySlug.set(s.slug, s);
  }

  for (const t of resolveThinkers(graph)) {
    if (nodeByCanonicalId.has(t.id)) warnDup("canonical id", t.id);
    nodeByCanonicalId.set(t.id, asNode("thinker", t));
    ids.add(t.id);
    if (thinkerBySlug.has(t.slug)) warnDup("thinker slug", t.slug);
    thinkerBySlug.set(t.slug, t);
  }

  const idSet = new Set(ids);

  const resolveCanonicalId = (ref: string): string | null => {
    if (idSet.has(ref)) return ref;
    const c = conceptBySlug.get(ref);
    if (c) return c.id;
    const p = patternBySlug.get(ref);
    if (p) return p.id;
    const b = bookBySlug.get(ref);
    if (b) return b.id;
    const src = sourceBySlug.get(ref);
    if (src) return src.id;
    const thinker = thinkerBySlug.get(ref);
    if (thinker) return thinker.id;
    return null;
  };

  const resolveNode = (ref: string): GraphNode | null => {
    const id = resolveCanonicalId(ref);
    if (!id) return null;
    return nodeByCanonicalId.get(id) ?? null;
  };

  const getNodeByCanonicalId = (id: string): GraphNode | null => nodeByCanonicalId.get(id) ?? null;

  return {
    graph,
    idSet,
    nodeByCanonicalId,
    bookBySlug,
    conceptBySlug,
    patternBySlug,
    sourceBySlug,
    thinkerBySlug,
    resolveCanonicalId,
    resolveNode,
    getNodeByCanonicalId,
  };
}
