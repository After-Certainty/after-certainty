import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { ExploreObservatoryFocusLink } from "@/components/explore/explore-observatory-focus-link";
import { ExploreAdjacentNav } from "@/components/explore/explore-adjacent-nav";
import { RelatedContentGrid } from "@/components/explore/related-content-grid";
import { RelationshipList } from "@/components/explore/relationship-list";
import { Section } from "@/components/ui/section";
import { exploreSourceAdjacentInIndexOrder, sourcesSortedForExploreIndex } from "@/lib/explore/explore-sources-order";
import { explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getSourceBySlug } from "@/lib/graph/graphQueries";
import { getIncomingRelationships, getOutgoingRelationships } from "@/lib/graph/graphTraversal";
import { relatedContentForSource } from "@/lib/graph/relatedContent";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const source = getSourceBySlug(index, slug);
  if (!source) return {};
  return createPageMetadata({
    title: source.name,
    description: source.summary ?? `${source.name} — ${source.type}`,
  });
}

export default async function ExploreSourceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { graph, catalogBooks } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const source = getSourceBySlug(index, slug);
  if (!source) notFound();

  const related = relatedContentForSource(index, source);
  const incoming = getIncomingRelationships(index, source.id);
  const outgoing = getOutgoingRelationships(index, source.id);

  const sourcesInListOrder = sourcesSortedForExploreIndex(graph.sources);
  const { prev: prevSource, next: nextSource } = exploreSourceAdjacentInIndexOrder(sourcesInListOrder, source.slug);

  const hasRelated =
    related.concepts.length + related.patterns.length + related.books.length > 0;
  const hasRelationships = incoming.length > 0 || outgoing.length > 0;

  return (
    <article>
      <Section atmosphere="none" className="pt-10 md:pt-14 !pb-10 md:!pb-12">
        <BreadcrumbTrail
          items={[
            { label: "Explore", href: explorePaths.home },
            { label: "Thinkers", href: explorePaths.sources },
            { label: source.name },
          ]}
        />
        <div className="mb-6">
          <ExploreObservatoryFocusLink kind="source" slug={source.slug} />
        </div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">{source.type}</p>
        <h1 className="mt-4 font-display text-4xl font-medium leading-[1.08] tracking-tight text-fg md:text-5xl">
          {source.name}
        </h1>
        {source.summary ? (
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{source.summary}</p>
        ) : null}
        <ExploreAdjacentNav
          basePath={explorePaths.sources}
          entityLabel="source"
          prev={prevSource ? { slug: prevSource.slug, title: prevSource.name } : undefined}
          next={nextSource ? { slug: nextSource.slug, title: nextSource.name } : undefined}
        />
      </Section>

      {hasRelated ? (
        <Section atmosphere="transition" className="border-t border-border/25 !pt-8 md:!pt-10 !pb-14 md:!pb-20">
          <div className="flex flex-col gap-14">
            <RelatedContentGrid heading="Related concepts" concepts={related.concepts} />
            <RelatedContentGrid heading="Related patterns" patterns={related.patterns} />
            <RelatedContentGrid
              heading="Related books"
              books={related.books}
              catalogBooksForBookCovers={catalogBooks}
            />
          </div>
        </Section>
      ) : null}

      {hasRelationships ? (
        <Section atmosphere="none" className="border-t border-border/25 !pt-10 md:!pt-14 !pb-20 md:!pb-28">
          <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted">Intellectual lineage</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-[15px]">
            {/* Extension: curated lineage fields, preserves/threatens chains, school-of-thought tags, secondary literature. */}
            Lineage views will layer on top of typed relationships. For now, traverse incoming and outgoing edges below
            to see how this voice is positioned in the graph.
          </p>
          {incoming.length > 0 ? (
            <div className="mt-10">
              <RelationshipList index={index} relationships={incoming} mode="incoming" title="Incoming relationships" />
            </div>
          ) : null}
          {outgoing.length > 0 ? (
            <div className={incoming.length > 0 ? "mt-12" : "mt-10"}>
              <RelationshipList index={index} relationships={outgoing} mode="outgoing" title="Outgoing relationships" />
            </div>
          ) : null}
        </Section>
      ) : null}
    </article>
  );
}
