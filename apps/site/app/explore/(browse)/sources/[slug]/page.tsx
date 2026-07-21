import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { ExploreEntityDetailActions } from "@/components/explore/explore-entity-detail-actions";
import { ExploreAdjacentNav } from "@/components/explore/explore-adjacent-nav";
import { RelatedContentGrid } from "@/components/explore/related-content-grid";
import { SemanticRelationshipsSection } from "@/components/explore/semantic-relationships-section";
import { entityHasSemanticRelationships } from "@/lib/graph/relationshipTaxonomy";
import { LinkifiedText } from "@/components/ui/linkified-text";
import { Section } from "@/components/ui/section";
import {
  exploreSourceAdjacentInIndexOrder,
  sourcesSortedForExploreIndex,
} from "@/lib/explore/explore-sources-order";
import { explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getSourceBySlug } from "@/lib/graph/graphQueries";
import { relatedContentForSource } from "@/lib/graph/relatedContent";
import {
  sourceCreatorThinkerLinks,
  sourceDisplayBody,
  sourceDisplayLabel,
  sourceDisplayTitle,
  thinkerHref,
} from "@/lib/graph/sourceDisplay";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";
import { buildSourcePageJsonLd } from "@/lib/seo/json-ld";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const source = getSourceBySlug(index, slug);
  if (!source) return {};
  const description =
    sourceDisplayBody(source) ?? `${sourceDisplayTitle(source)} — ${sourceDisplayLabel(source)}`;
  return createPageMetadata({
    title: sourceDisplayTitle(source),
    description,
  });
}

export default async function ExploreSourceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const source = getSourceBySlug(index, slug);
  if (!source) notFound();

  const related = relatedContentForSource(index, source);
  const sourcesInListOrder = sourcesSortedForExploreIndex(graph.sources);
  const { prev: prevSource, next: nextSource } = exploreSourceAdjacentInIndexOrder(
    sourcesInListOrder,
    source.slug,
  );

  const hasRelated = related.concepts.length + related.patterns.length + related.books.length > 0;
  const hasRelationships = entityHasSemanticRelationships(index, source.id);
  const creatorThinkers = sourceCreatorThinkerLinks(graph, source);
  const displayTitle = sourceDisplayTitle(source);
  const displayLabel = sourceDisplayLabel(source);
  const displayBody = sourceDisplayBody(source);

  const sourceBreadcrumbs = [
    { label: "Explore", href: explorePaths.home },
    { label: "Sources", href: explorePaths.sources },
    { label: displayTitle },
  ];

  return (
    <article>
      <JsonLd
        data={buildSourcePageJsonLd({
          source,
          breadcrumbs: sourceBreadcrumbs,
        })}
      />
      <Section atmosphere="none" className="pt-10 md:pt-14 !pb-10 md:!pb-12">
        <BreadcrumbTrail items={sourceBreadcrumbs} />
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">{displayLabel}</p>
        <h1 className="mt-4 font-display text-4xl font-medium leading-[1.08] tracking-tight text-fg md:text-5xl">
          {displayTitle}
        </h1>
        {creatorThinkers.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {creatorThinkers.map((thinker) => (
              <Link
                key={thinker.id}
                href={thinkerHref(thinker.slug)}
                className="rounded-full border border-border/40 px-3 py-1 text-sm text-muted transition-colors hover:border-accent/40 hover:text-fg"
              >
                {thinker.name}
              </Link>
            ))}
          </div>
        ) : null}
        {displayBody ? (
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
            <LinkifiedText text={displayBody} />
          </p>
        ) : null}
        {source.whyThisMatters ? (
          <div className="mt-8 max-w-2xl space-y-3">
            <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted">Why this matters</h2>
            <p className="text-lg leading-relaxed text-muted md:text-xl">
              <LinkifiedText text={source.whyThisMatters} />
            </p>
          </div>
        ) : null}
        <ExploreEntityDetailActions observatory={{ kind: "source", slug: source.slug }} />
        <ExploreAdjacentNav
          basePath={explorePaths.sources}
          entityLabel="source"
          prev={prevSource ? { slug: prevSource.slug, title: prevSource.name } : undefined}
          next={nextSource ? { slug: nextSource.slug, title: nextSource.name } : undefined}
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
              booksForCovers={graph.books}
            />
          </div>
        </Section>
      ) : null}

      {hasRelationships ? (
        <Section
          atmosphere="none"
          className="border-t border-border/25 !pt-10 md:!pt-14 !pb-20 md:!pb-28"
        >
          <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted">
            Intellectual lineage
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-[15px]">
            {/* Extension: curated lineage fields, preserves/threatens chains, school-of-thought tags, secondary literature. */}
            Lineage views will layer on top of typed relationships. For now, traverse incoming and
            outgoing edges below to see how this voice is positioned in the graph.
          </p>
          <div className="mt-10">
            <SemanticRelationshipsSection
              index={index}
              focalCanonicalId={source.id}
              focalKind="source"
              focalSlug={source.slug}
            />
          </div>
        </Section>
      ) : null}
    </article>
  );
}
