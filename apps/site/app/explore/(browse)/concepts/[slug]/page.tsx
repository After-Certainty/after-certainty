import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { ExploreEntityDetailActions } from "@/components/explore/explore-entity-detail-actions";
import { ExploreAdjacentNav } from "@/components/explore/explore-adjacent-nav";
import { GraphNeighborhoodCards } from "@/components/explore/graph-neighborhood-cards";
import { RelatedContentGrid } from "@/components/explore/related-content-grid";
import { SemanticRelationshipsSection } from "@/components/explore/semantic-relationships-section";
import { entityHasSemanticRelationships } from "@/lib/graph/relationshipTaxonomy";
import { LinkifiedText } from "@/components/ui/linkified-text";
import { Section } from "@/components/ui/section";
import {
  conceptsSortedForExploreIndex,
  exploreConceptAdjacentInIndexOrder,
} from "@/lib/explore/explore-concepts-order";
import { explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getAdjacentSourcesFromRelationships, getConceptBySlug } from "@/lib/graph/graphQueries";
import { getConnectedGraphNeighborhood } from "@/lib/graph/graphTraversal";
import { relatedContentForConcept } from "@/lib/graph/relatedContent";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";
import {
  buildConceptPageJsonLd,
  conceptRelationshipUrls,
  relatedBookUrls,
  relatedPatternUrls,
} from "@/lib/seo/json-ld";
import { getConceptFullDefinition } from "@/lib/graph/conceptFormatting";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const concept = getConceptBySlug(index, slug);
  if (!concept) return {};
  return createPageMetadata({
    title: concept.title,
    description: getConceptFullDefinition(concept),
  });
}

export default async function ExploreConceptDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { graph, catalogBooks } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const concept = getConceptBySlug(index, slug);
  if (!concept) notFound();

  const related = relatedContentForConcept(index, concept);
  const adjacentSources = getAdjacentSourcesFromRelationships(index, concept.id);

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
    related.concepts.length +
      related.patterns.length +
      related.books.length +
      related.thinkers.length +
      mergedSources.length >
    0;
  const hasRelationships = entityHasSemanticRelationships(index, concept.id);

  // Get neighborhood and deduplicate against related sections
  const allNeighbors = getConnectedGraphNeighborhood(
    index,
    { kind: "concept", id: concept.id, slug: concept.slug },
    { maxDepth: 1, maxNodes: 20 },
  );

  // Build set of IDs already shown in related sections
  const alreadyShownIds = new Set<string>([
    ...related.concepts.map((c) => c.id),
    ...related.patterns.map((p) => p.id),
    ...related.books.map((b) => b.id),
    ...related.thinkers.map((t) => t.id),
    ...mergedSources.map((s) => s.id),
  ]);

  // Filter neighbors to only those not already shown
  const uniqueNeighbors = allNeighbors.filter((node) => !alreadyShownIds.has(node.id));
  const hasNeighborhood = uniqueNeighbors.length > 0;

  const conceptBreadcrumbs = [
    { label: "Explore", href: explorePaths.home },
    { label: "Concepts", href: explorePaths.concepts },
    { label: concept.title },
  ];
  const relatedUrls = [
    ...relatedBookUrls(index, concept.relatedBooks),
    ...relatedPatternUrls(index, concept.relatedPatterns),
    ...conceptRelationshipUrls(index, concept.id),
  ];

  return (
    <article>
      <JsonLd
        data={buildConceptPageJsonLd({
          concept,
          breadcrumbs: conceptBreadcrumbs,
          relatedUrls,
        })}
      />
      <Section atmosphere="none" className="pt-10 md:pt-14 !pb-10 md:!pb-12">
        <BreadcrumbTrail items={conceptBreadcrumbs} />
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Concept</p>
        <h1 className="mt-4 font-display text-4xl font-medium leading-[1.08] tracking-tight text-fg md:text-5xl">
          {concept.title}
        </h1>
        <div className="mt-8 max-w-2xl space-y-4 text-base leading-[1.85] text-muted md:text-[17px]">
          <p className="whitespace-pre-wrap">
            <LinkifiedText text={getConceptFullDefinition(concept)} />
          </p>
        </div>
        <ExploreEntityDetailActions observatory={{ kind: "concept", slug: concept.slug }} />
        <ExploreAdjacentNav
          basePath={explorePaths.concepts}
          entityLabel="concept"
          prev={prevConcept ? { slug: prevConcept.slug, title: prevConcept.title } : undefined}
          next={nextConcept ? { slug: nextConcept.slug, title: nextConcept.title } : undefined}
        />
      </Section>

      {hasRelated ? (
        <Section
          atmosphere="transition"
          className="border-t border-border/25 !pt-8 md:!pt-10 !pb-14 md:!pb-20"
        >
          <div className="flex flex-col gap-14">
            <RelatedContentGrid heading="Related concepts" concepts={related.concepts} />
            <RelatedContentGrid heading="Related patterns" patterns={related.patterns} />
            <RelatedContentGrid
              heading="Related books"
              books={related.books}
              catalogBooksForBookCovers={catalogBooks}
            />
            <RelatedContentGrid
              heading="Thinkers & sources"
              thinkers={related.thinkers}
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
          <SemanticRelationshipsSection
            index={index}
            focalCanonicalId={concept.id}
            focalKind="concept"
            focalSlug={concept.slug}
          />
        </Section>
      ) : null}

      {hasNeighborhood ? (
        <Section atmosphere="none" className="!pt-0 pb-16 md:!pt-0 md:pb-20">
          <GraphNeighborhoodCards
            nodes={uniqueNeighbors}
            title="Neighboring terrain (other connected entities)"
          />
        </Section>
      ) : null}
    </article>
  );
}
