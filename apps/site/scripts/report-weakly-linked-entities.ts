#!/usr/bin/env node
/**
 * Report sitemap entity paths with weak inbound links from related* / relationship edges.
 * Usage (from apps/site, with local manifest installed):
 *   SEMANTIC_MANIFEST_USE_LOCAL=1 SEMANTIC_MANIFEST_OFFLINE=1 npx tsx scripts/report-weakly-linked-entities.ts
 */
import { getSitemapPaths } from "../app/sitemap";
import { getSemanticGraph } from "../lib/graph/manifest";
import { buildGraphIndex } from "../lib/graph/graph";
import { explorePaths } from "../lib/graph/explorePaths";

async function main() {
  const graph = await getSemanticGraph();
  const index = buildGraphIndex(graph);
  const paths = await getSitemapPaths();

  const inbound = new Map<string, number>();
  const bump = (path: string) => inbound.set(path, (inbound.get(path) ?? 0) + 1);

  for (const c of graph.glossary) {
    for (const id of c.relatedConcepts ?? []) {
      const n = index.getNodeByCanonicalId(id);
      if (n?.kind === "concept") bump(`${explorePaths.concepts}/${n.slug}`);
    }
    for (const id of c.relatedPatterns ?? []) {
      const n = index.getNodeByCanonicalId(id);
      if (n?.kind === "pattern") bump(`${explorePaths.patterns}/${n.slug}`);
    }
    for (const id of c.relatedBooks ?? []) {
      const n = index.getNodeByCanonicalId(id);
      if (n?.kind === "book") bump(`${explorePaths.books}/${n.slug}`);
    }
  }
  for (const p of graph.patterns) {
    for (const id of p.relatedConcepts ?? []) {
      const n = index.getNodeByCanonicalId(id);
      if (n?.kind === "concept") bump(`${explorePaths.concepts}/${n.slug}`);
    }
    for (const id of p.relatedBooks ?? []) {
      const n = index.getNodeByCanonicalId(id);
      if (n?.kind === "book") bump(`${explorePaths.books}/${n.slug}`);
    }
  }
  for (const rel of graph.relationships ?? []) {
    for (const end of [rel.source, rel.target]) {
      const n = index.getNodeByCanonicalId(end);
      if (!n) continue;
      const href =
        n.kind === "concept"
          ? `${explorePaths.concepts}/${n.slug}`
          : n.kind === "pattern"
            ? `${explorePaths.patterns}/${n.slug}`
            : n.kind === "book"
              ? `${explorePaths.books}/${n.slug}`
              : n.kind === "source"
                ? `${explorePaths.sources}/${n.slug}`
                : n.kind === "thinker"
                  ? `${explorePaths.thinkers}/${n.slug}`
                  : n.kind === "situation"
                    ? `${explorePaths.situations}/${n.slug}`
                    : n.kind === "force"
                      ? `${explorePaths.patterns}?force=${encodeURIComponent(n.slug)}`
                      : null;
      if (href) bump(href);
    }
  }

  const entityPaths = paths.filter(
    (p) =>
      p.startsWith("/explore/concepts/") ||
      p.startsWith("/explore/patterns/") ||
      p.startsWith("/explore/sources/") ||
      p.startsWith("/explore/thinkers/") ||
      p.startsWith("/explore/situations/") ||
      (p.startsWith("/explore/books/") && !p.includes("/chapters/")),
  );

  const weak = entityPaths
    .map((p) => ({ path: p, inbound: inbound.get(p) ?? 0 }))
    .filter((row) => row.inbound === 0)
    .sort((a, b) => a.path.localeCompare(b.path));

  console.log(`Sitemap entity paths: ${entityPaths.length}`);
  console.log(`Zero inbound from related*/relationships: ${weak.length}`);
  for (const row of weak.slice(0, 80)) {
    console.log(`  ${row.path}`);
  }
  if (weak.length > 80) console.log(`  … +${weak.length - 80} more`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
