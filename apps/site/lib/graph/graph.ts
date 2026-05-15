import type {
  Book,
  GlossaryConcept,
  GraphEntityKind,
  Pattern,
  SemanticGraph,
  Source,
} from "@/types/semanticGraph";

/** Unified node view for traversal, cards, and future graph adapters (D3, Cytoscape, etc.). */
export type GraphNode =
  | { kind: "book"; id: string; slug: string; entity: Book }
  | { kind: "concept"; id: string; slug: string; entity: GlossaryConcept }
  | { kind: "pattern"; id: string; slug: string; entity: Pattern }
  | { kind: "source"; id: string; slug: string; entity: Source };

export type GraphIndex = {
  graph: SemanticGraph;
  /** Canonical ids for all indexed entities (relationship endpoint checks). */
  idSet: ReadonlySet<string>;
  nodeByCanonicalId: ReadonlyMap<string, GraphNode>;
  bookBySlug: ReadonlyMap<string, Book>;
  conceptBySlug: ReadonlyMap<string, GlossaryConcept>;
  patternBySlug: ReadonlyMap<string, Pattern>;
  sourceBySlug: ReadonlyMap<string, Source>;
  /**
   * Resolve a manifest ref (usually `id`, sometimes `slug`) to a canonical `id`.
   * Order: id match, then slug match (glossary → pattern → book → source).
   */
  resolveCanonicalId(ref: string): string | null;
  resolveNode(ref: string): GraphNode | null;
  getNodeByCanonicalId(id: string): GraphNode | null;
};

function asNode(kind: GraphEntityKind, entity: Book | GlossaryConcept | Pattern | Source): GraphNode {
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
    resolveCanonicalId,
    resolveNode,
    getNodeByCanonicalId,
  };
}
