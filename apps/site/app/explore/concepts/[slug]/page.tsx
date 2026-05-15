import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { ExploreAdjacentNav } from "@/components/explore/explore-adjacent-nav";
import { GraphNeighborhood } from "@/components/explore/graph-neighborhood";
import { RelatedContentGrid } from "@/components/explore/related-content-grid";
import { RelationshipList } from "@/components/explore/relationship-list";
import { Section } from "@/components/ui/section";
import { conceptsSortedForExploreIndex, exploreConceptAdjacentInIndexOrder } from "@/lib/explore/explore-concepts-order";
import { explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getAdjacentSourcesFromRelationships, getConceptBySlug } from "@/lib/graph/graphQueries";
import { getConnectedGraphNeighborhood, getIncomingRelationships, getOutgoingRelationships } from "@/lib/graph/graphTraversal";
import { relatedContentForConcept } from "@/lib/graph/relatedContent";
import { getSemanticGraph } from "@/lib/graph/manifest";
import { getBooks } from "@/lib/content-data";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const graph = await getSemanticGraph();
  const index = buildGraphIndex(graph);
  const concept = getConceptBySlug(index, slug);
  if (!concept) return {};
  return createPageMetadata({
    title: concept.title,
    description: concept.definition ?? concept.shortDefinition,
  });
}

export default async function ExploreConceptDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [graph, catalogBooks] = await Promise.all([getSemanticGraph(), getBooks()]);
  const index = buildGraphIndex(graph);
  const concept = getConceptBySlug(index, slug);
  if (!concept) notFound();

  const related = relatedContentForConcept(index, concept);
  const adjacentSources = getAdjacentSourcesFromRelationships(index, concept.id);
  const incoming = getIncomingRelationships(index, concept.id);
  const outgoing = getOutgoingRelationships(index, concept.id);

  const mergedSources = [...related.sources];
  const sourceIds = new Set(mergedSources.map((s) => s.id));
  for (const s of adjacentSources) {
    if (!sourceIds.has(s.id)) {
      sourceIds.add(s.id);
      mergedSources.push(s);
    }
  }

  const conceptsInListOrder = conceptsSortedForExploreIndex(graph.glossary);
  const { prev: prevConcept, next: nextConcept } = exploreConceptAdjacentInIndexOrder(
    conceptsInListOrder,
    concept.slug,
  );

  const hasRelated =
    related.concepts.length + related.patterns.length + related.books.length + mergedSources.length > 0;
  const hasRelationships = incoming.length > 0 || outgoing.length > 0;
  const hasNeighborhood =
    getConnectedGraphNeighborhood(
      index,
      { kind: "concept", id: concept.id, slug: concept.slug },
      { maxDepth: 1, maxNodes: 20 },
    ).length > 0;

  return (
    <article>
      <Section atmosphere="none" className="pt-10 md:pt-14 !pb-10 md:!pb-12">
        <BreadcrumbTrail
          items={[
            { label: "Explore", href: explorePaths.home },
            { label: "Concepts", href: explorePaths.concepts },
            { label: concept.title },
          ]}
        />
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Concept</p>
        <h1 className="mt-4 font-display text-4xl font-medium leading-[1.08] tracking-tight text-fg md:text-5xl">
          {concept.title}
        </h1>
        <p className="mt-8 max-w-2xl font-display text-xl italic leading-relaxed text-fg/90 md:text-2xl">
          {concept.shortDefinition}
        </p>
        {concept.definition ? (
          <div className="mt-12 max-w-2xl space-y-4 text-base leading-[1.85] text-muted md:text-[17px]">
            <p className="whitespace-pre-wrap">{concept.definition}</p>
          </div>
        ) : null}
        <ExploreAdjacentNav
          basePath={explorePaths.concepts}
          entityLabel="concept"
          prev={prevConcept ? { slug: prevConcept.slug, title: prevConcept.title } : undefined}
          next={nextConcept ? { slug: nextConcept.slug, title: nextConcept.title } : undefined}
        />
      </Section>

      {hasRelated ? (
        <Section atmosphere="transition" className="border-t border-border/25 !pt-8 md:!pt-10 !pb-14 md:!pb-20">
          <div className="flex flex-col gap-14">
            <RelatedContentGrid
              heading="Related concepts"
              concepts={related.concepts}
            />
            <RelatedContentGrid
              heading="Related patterns"
              patterns={related.patterns}
            />
            <RelatedContentGrid
              heading="Related books"
              books={related.books}
              catalogBooksForBookCovers={catalogBooks}
            />
            <RelatedContentGrid
              heading="Thinkers & sources"
              sources={mergedSources}
            />
          </div>
        </Section>
      ) : null}

      {hasRelationships ? (
        <Section
          atmosphere="none"
          className={
            hasNeighborhood
              ? "border-t border-border/25 !pt-10 md:!pt-14 !pb-4 md:!pb-6"
              : "border-t border-border/25 !pt-10 md:!pt-14 !pb-20 md:!pb-28"
          }
        >
          {incoming.length > 0 ? (
            <RelationshipList index={index} relationships={incoming} mode="incoming" title="Incoming relationships" />
          ) : null}
          {outgoing.length > 0 ? (
            <div className={incoming.length > 0 ? "mt-12" : undefined}>
              <RelationshipList index={index} relationships={outgoing} mode="outgoing" title="Outgoing relationships" />
            </div>
          ) : null}
        </Section>
      ) : null}

      {hasNeighborhood ? (
        <Section atmosphere="none" className="!pt-0 pb-16 md:!pt-0 md:pb-20">
          <GraphNeighborhood
            index={index}
            focal={{ kind: "concept", id: concept.id, slug: concept.slug }}
            title="Neighboring terrain"
          />
        </Section>
      ) : null}
    </article>
  );
}
