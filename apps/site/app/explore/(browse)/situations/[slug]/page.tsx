import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { ExploreEnrichmentSections } from "@/components/explore/explore-enrichment-sections";
import { ExploreEntityDetailActions } from "@/components/explore/explore-entity-detail-actions";
import { ExploreAdjacentNav } from "@/components/explore/explore-adjacent-nav";
import { RelatedBooksSection } from "@/components/explore/related-books-section";
import { RelatedContentGrid } from "@/components/explore/related-content-grid";
import { LinkifiedText } from "@/components/ui/linkified-text";
import { Section } from "@/components/ui/section";
import { explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getSituationBySlug } from "@/lib/graph/graphQueries";
import { relatedContentForSituation } from "@/lib/graph/relatedContent";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";
import { buildSituationPageJsonLd, relatedConceptUrls } from "@/lib/seo/json-ld";
import type { Situation } from "@/types/semanticGraph";
import { EntityIntroDisclosure } from "@/components/explore/entity-intro-disclosure";
import {
  entityIntroTeaser,
  shouldUseEntityIntroDisclosure,
} from "@/lib/explore/entity-intro-teaser";
import { hasSemanticEnrichment } from "@/components/explore/explore-enrichment-sections";

type PageProps = { params: Promise<{ slug: string }> };

function situationsSorted(situations: readonly Situation[]): Situation[] {
  return [...situations].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
  );
}

function adjacentSituation(
  ordered: readonly Situation[],
  slug: string,
): { prev?: Situation; next?: Situation } {
  const index = ordered.findIndex((s) => s.slug === slug);
  if (index < 0) return {};
  return {
    prev: index > 0 ? ordered[index - 1] : undefined,
    next: index < ordered.length - 1 ? ordered[index + 1] : undefined,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const situation = getSituationBySlug(index, slug);
  if (!situation) return {};
  return createPageMetadata({
    title: situation.title,
    description: situation.summary,
    alternates: { canonical: `${explorePaths.situations}/${situation.slug}` },
  });
}

export default async function ExploreSituationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const situation = getSituationBySlug(index, slug);
  if (!situation) notFound();

  const related = relatedContentForSituation(index, situation);
  const ordered = situationsSorted(graph.situations ?? []);
  const { prev, next } = adjacentSituation(ordered, situation.slug);

  const hasRelated = related.concepts.length + related.patterns.length + related.books.length > 0;

  const breadcrumbs = [
    { label: "Explore", href: explorePaths.home },
    { label: "Situations", href: explorePaths.situations },
    { label: situation.title },
  ];

  const summary = situation.summary?.trim() ?? "";
  const summaryTeaser = entityIntroTeaser(summary);
  const useSummaryDisclosure = shouldUseEntityIntroDisclosure(summary, summaryTeaser);
  const showEnrichment = hasSemanticEnrichment(situation);

  return (
    <article>
      <JsonLd
        data={buildSituationPageJsonLd({
          situation,
          breadcrumbs,
          relatedConceptUrls: relatedConceptUrls(index, situation.relatedConcepts),
        })}
      />
      <Section atmosphere="none" className="pt-6 md:pt-14 !pb-6 md:!pb-12">
        <BreadcrumbTrail items={breadcrumbs} />
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Situation</p>
        <h1 className="mt-3 font-display text-4xl font-medium leading-[1.08] tracking-tight text-fg md:mt-4 md:text-5xl">
          {situation.title}
        </h1>
        {summary ? (
          useSummaryDisclosure ? (
            <EntityIntroDisclosure
              id="situation-full-summary"
              regionLabel="Full situation summary"
              teaser={summaryTeaser}
              expandLabel="Read full summary"
            >
              <p className="text-lg leading-relaxed text-muted md:text-xl">
                <LinkifiedText text={summary} />
              </p>
            </EntityIntroDisclosure>
          ) : (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted md:mt-10 md:text-xl">
              <LinkifiedText text={summary} />
            </p>
          )
        ) : null}
        <ExploreEntityDetailActions observatory={{ kind: "situation", slug: situation.slug }} />
        <ExploreAdjacentNav
          basePath={explorePaths.situations}
          entityLabel="situation"
          prev={prev ? { slug: prev.slug, title: prev.title } : undefined}
          next={next ? { slug: next.slug, title: next.title } : undefined}
        />
      </Section>

      {showEnrichment ? (
        <Section
          atmosphere="transition"
          className="border-t border-border/25 !pt-8 md:!pt-10 !pb-14 md:!pb-20"
        >
          <ExploreEnrichmentSections enrichment={situation} />
        </Section>
      ) : null}

      {hasRelated ? (
        <Section
          atmosphere="none"
          className="border-t border-border/25 !pt-[var(--explore-section-y)] md:!pt-[var(--explore-section-y-md)] !pb-[var(--explore-section-pb)] md:!pb-[var(--explore-section-pb-md)]"
        >
          <div className="flex flex-col gap-8 md:gap-14">
            <RelatedContentGrid
              heading="Active patterns"
              patterns={related.patterns}
              collapsible
            />
            <RelatedContentGrid
              heading="Related concepts"
              concepts={related.concepts}
              collapsible
            />
            <RelatedBooksSection books={related.books} collapsible />
          </div>
        </Section>
      ) : null}
    </article>
  );
}
