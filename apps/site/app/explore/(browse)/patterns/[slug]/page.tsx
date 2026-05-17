import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { ExplorePatternMedia } from "@/components/explore/explore-pattern-media";
import { ExploreEntityDetailActions } from "@/components/explore/explore-entity-detail-actions";
import { ExploreAdjacentNav } from "@/components/explore/explore-adjacent-nav";
import { RelatedContentGrid } from "@/components/explore/related-content-grid";
import { RelationshipList } from "@/components/explore/relationship-list";
import { Section } from "@/components/ui/section";
import { explorePatternAdjacentInIndexOrder, patternsSortedForExploreIndex } from "@/lib/explore/explore-patterns-order";
import { explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getPatternBySlug } from "@/lib/graph/graphQueries";
import { getIncomingRelationships, getOutgoingRelationships } from "@/lib/graph/graphTraversal";
import { relatedContentForPattern } from "@/lib/graph/relatedContent";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const pattern = getPatternBySlug(index, slug);
  if (!pattern) return {};
  return createPageMetadata({
    title: pattern.title,
    description: pattern.summary,
  });
}

export default async function ExplorePatternDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { graph, catalogBooks } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const pattern = getPatternBySlug(index, slug);
  if (!pattern) notFound();

  const related = relatedContentForPattern(index, pattern);
  const incoming = getIncomingRelationships(index, pattern.id);
  const outgoing = getOutgoingRelationships(index, pattern.id);

  const patternsInListOrder = patternsSortedForExploreIndex(graph.patterns);
  const { prev: prevPattern, next: nextPattern } = explorePatternAdjacentInIndexOrder(
    patternsInListOrder,
    pattern.slug,
  );

  const hasRelated = related.concepts.length + related.books.length > 0;
  const hasRelationships = incoming.length > 0 || outgoing.length > 0;

  return (
    <article>
      <Section atmosphere="none" className="pt-10 md:pt-14 !pb-10 md:!pb-12">
        <BreadcrumbTrail
          items={[
            { label: "Explore", href: explorePaths.home },
            { label: "Patterns", href: explorePaths.patterns },
            { label: pattern.title },
          ]}
        />
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Pattern</p>
        <h1 className="mt-4 font-display text-4xl font-medium leading-[1.08] tracking-tight text-fg md:text-5xl">
          {pattern.title}
        </h1>
        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{pattern.summary}</p>
        <ExploreEntityDetailActions observatory={{ kind: "pattern", slug: pattern.slug }} />
        <ExplorePatternMedia pattern={pattern} />
        <ExploreAdjacentNav
          basePath={explorePaths.patterns}
          entityLabel="pattern"
          prev={prevPattern ? { slug: prevPattern.slug, title: prevPattern.title } : undefined}
          next={nextPattern ? { slug: nextPattern.slug, title: nextPattern.title } : undefined}
        />
        {/* Extension: structural tensions, polarity fields, preserves/threatens overlays. */}
      </Section>

      {hasRelated ? (
        <Section atmosphere="transition" className="border-t border-border/25 !pt-8 md:!pt-10 !pb-14 md:!pb-20">
          <div className="flex flex-col gap-14">
            <RelatedContentGrid heading="Related concepts" concepts={related.concepts} />
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
    </article>
  );
}
