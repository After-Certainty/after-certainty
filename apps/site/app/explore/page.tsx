import type { Metadata } from "next";
import Link from "next/link";
import { ExploreHero } from "@/components/explore/explore-hero";
import { ExploreCard } from "@/components/explore/explore-card";
import { ConceptCard } from "@/components/explore/concept-card";
import { PatternCard } from "@/components/explore/pattern-card";
import { BookCard } from "@/components/explore/book-card";
import { SourceCard } from "@/components/explore/source-card";
import { Section } from "@/components/ui/section";
import { buildGraphIndex } from "@/lib/graph/graph";
import { explorePaths } from "@/lib/graph/explorePaths";
import { getSemanticGraph } from "@/lib/graph/manifest";
import { relationshipEndpointsResolved } from "@/lib/graph/graphTraversal";
import {
  buildCoverImageBySlugLookup,
  resolveCoverForGraphBookSlug,
} from "@/lib/explore/graph-book-covers";
import { getBooks } from "@/lib/content-data";
import { createPageMetadata } from "@/lib/metadata";
import type { GraphIndex } from "@/lib/graph/graph";
import type { GlossaryConcept } from "@/types/semanticGraph";

export const metadata: Metadata = createPageMetadata({
  title: "Explore",
  description:
    "A conceptual observatory for the After Certainty semantic graph — traverse books, glossary concepts, patterns, and thinkers through shared intellectual terrain.",
});

function sortByTitle<T extends { title?: string; name?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ta = ("title" in a && a.title) || ("name" in a && a.name) || "";
    const tb = ("title" in b && b.title) || ("name" in b && b.name) || "";
    return ta.localeCompare(tb);
  });
}

function conceptsLinkedThroughRelationships(
  index: GraphIndex,
  limit: number,
): GlossaryConcept[] {
  const out: GlossaryConcept[] = [];
  const seen = new Set<string>();
  for (const r of index.graph.relationships) {
    const ends = relationshipEndpointsResolved(index, r);
    if (!ends) continue;
    for (const id of [ends.sourceId, ends.targetId]) {
      const n = index.getNodeByCanonicalId(id);
      if (n?.kind !== "concept") continue;
      if (seen.has(n.id)) continue;
      seen.add(n.id);
      out.push(n.entity);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export default async function ExploreLandingPage() {
  const [graph, catalogBooks] = await Promise.all([getSemanticGraph(), getBooks()]);
  const index = buildGraphIndex(graph);
  const coverLookup = buildCoverImageBySlugLookup(catalogBooks);
  const concepts = sortByTitle(graph.glossary);
  const patterns = sortByTitle(graph.patterns);
  const books = sortByTitle(graph.books);
  const sources = sortByTitle(graph.sources);
  const linkedConcepts = conceptsLinkedThroughRelationships(index, 6);

  const preview = <T,>(arr: T[], n: number) => arr.slice(0, n);

  return (
    <article>
      <ExploreHero />

      <Section atmosphere="transition" className="border-t border-border/25 py-16 md:py-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Core concepts</p>
            <h2 className="mt-3 font-display text-2xl font-medium text-fg md:text-3xl">Glossary constellations</h2>
          </div>
          <Link href={explorePaths.concepts} className="text-sm text-accent underline-offset-4 hover:underline">
            View all concepts
          </Link>
        </div>
        {concepts.length === 0 ? (
          <p className="mt-10 text-muted">The graph has no glossary entries yet. When the manifest publishes concepts, they will appear here.</p>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {preview(concepts, 6).map((c) => (
              <ConceptCard key={c.id} concept={c} />
            ))}
          </div>
        )}
      </Section>

      <Section atmosphere="none" className="border-t border-border/25 py-16 md:py-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Pattern language</p>
            <h2 className="mt-3 font-display text-2xl font-medium text-fg md:text-3xl">Recurring structures</h2>
          </div>
          <Link href={explorePaths.patterns} className="text-sm text-accent underline-offset-4 hover:underline">
            View all patterns
          </Link>
        </div>
        {patterns.length === 0 ? (
          <p className="mt-10 text-muted">Patterns from the semantic manifest will surface here for traversal.</p>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {preview(patterns, 6).map((p) => (
              <PatternCard key={p.id} pattern={p} />
            ))}
          </div>
        )}
      </Section>

      <Section atmosphere="quote" className="border-t border-border/25 py-16 md:py-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Influential thinkers</p>
            <h2 className="mt-3 font-display text-2xl font-medium text-fg md:text-3xl">Sources &amp; voices</h2>
          </div>
          <Link href={explorePaths.sources} className="text-sm text-accent underline-offset-4 hover:underline">
            View all sources
          </Link>
        </div>
        {sources.length === 0 ? (
          <p className="mt-10 text-muted">Thinkers and sources will populate this atlas as the graph grows.</p>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {preview(sources, 6).map((s) => (
              <SourceCard key={s.id} source={s} />
            ))}
          </div>
        )}
      </Section>

      <Section atmosphere="none" className="border-t border-border/25 py-16 md:py-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Explore by book</p>
            <h2 className="mt-3 font-display text-2xl font-medium text-fg md:text-3xl">Conceptual terrain by volume</h2>
          </div>
          <Link href={explorePaths.books} className="text-sm text-accent underline-offset-4 hover:underline">
            View all books
          </Link>
        </div>
        {books.length === 0 ? (
          <p className="mt-10 text-muted">Books linked in the semantic graph will appear here for cross-volume traversal.</p>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {preview(books, 6).map((b) => (
              <BookCard
                key={b.id}
                book={b}
                coverImage={resolveCoverForGraphBookSlug(coverLookup, catalogBooks, b.slug) ?? b.coverImage}
              />
            ))}
          </div>
        )}
      </Section>

      <Section atmosphere="none" className="border-t border-border/25 py-16 md:py-24">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Relationship maps</p>
        <h2 className="mt-3 font-display text-2xl font-medium text-fg md:text-3xl">Topology in view</h2>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted md:text-[15px]">
          {/* Extension: force-directed graphs, preserves/threatens overlays, reading paths, podcast + essay subgraphs. */}
          Interactive topology maps are not shipped in this release. Traversal below follows typed relationships in the
          manifest; later releases may layer D3, Cytoscape, or canvas-based views on the same graph index.
        </p>
        <ExploreCard className="mt-10 max-w-xl">
          <p className="font-display text-lg text-fg">Cartography, forthcoming</p>
          <p className="mt-3 text-sm text-muted">
            Relationship data is already live in the graph — visualization will meet the same atmospheric restraint as
            the rest of this atlas.
          </p>
        </ExploreCard>
      </Section>

      {linkedConcepts.length > 0 ? (
        <Section atmosphere="transition" className="border-t border-border/25 py-16 md:py-24">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Connected through relationships</p>
          <h2 className="mt-3 font-display text-2xl font-medium text-fg md:text-3xl">Concepts in dialogue</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {linkedConcepts.map((c) => (
              <ConceptCard key={c.id} concept={c} />
            ))}
          </div>
        </Section>
      ) : null}
    </article>
  );
}
