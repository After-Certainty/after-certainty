import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { EntityIntroDisclosure } from "@/components/explore/entity-intro-disclosure";
import { RelatedSectionDisclosure } from "@/components/explore/related-section-disclosure";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { TrailCard } from "@/components/trails/trail-card";
import { TrailPath } from "@/components/trails/trail-path";
import { TrailPathAnalytics } from "@/components/trails/trail-path-analytics";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ExplorePathwayLink } from "@/components/paths/explore-pathway-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import {
  entityIntroTeaser,
  shouldUseEntityIntroDisclosure,
} from "@/lib/explore/entity-intro-teaser";
import { buildTrailSearchHandoffUrl } from "@/lib/trails/enrichTrails";
import { getEnrichedPublishedTrails, getEnrichedTrailBySlug } from "@/lib/trails/getEnrichedTrails";
import { createPageMetadata } from "@/lib/metadata";
import { buildTrailDetailJsonLd } from "@/lib/seo/json-ld";

type PageProps = { params: Promise<{ slug: string }> };

function trailCountLabel(count: number): string {
  return `${count} ${count === 1 ? "trail" : "trails"}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const trail = await getEnrichedTrailBySlug(slug);
  if (!trail) return {};
  return createPageMetadata({
    title: `${trail.title} · Reading Trail`,
    description: trail.summary,
    robots: trail.status === "upcoming" ? { index: false, follow: true } : undefined,
    openGraph: trail.primaryBookCover
      ? {
          images: [{ url: trail.primaryBookCover, alt: trail.primaryBookTitle ?? trail.title }],
        }
      : undefined,
  });
}

export default async function TrailDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const trail = await getEnrichedTrailBySlug(slug);
  if (!trail) notFound();

  const allPublished = await getEnrichedPublishedTrails();
  const related = (trail.relatedTrailIds ?? [])
    .map((id) => allPublished.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .slice(0, 3);

  const searchHref = buildTrailSearchHandoffUrl(trail);
  const requiredStops = trail.pathStopsEnriched.filter((s) => !s.optional).length;
  const optionalStops = trail.pathStopsEnriched.length - requiredStops;

  const summary = trail.summary?.trim() ?? "";
  const summaryTeaser = entityIntroTeaser(summary);
  const useSummaryDisclosure = shouldUseEntityIntroDisclosure(summary, summaryTeaser);

  const orientation = trail.orientation?.trim() ?? "";
  const orientationTeaser = entityIntroTeaser(orientation);
  const useOrientationDisclosure = shouldUseEntityIntroDisclosure(orientation, orientationTeaser);

  return (
    <article>
      <TrailPathAnalytics trailId={trail.id} />
      {trail.status === "published" ? (
        <JsonLd
          data={buildTrailDetailJsonLd({
            slug: trail.slug,
            title: trail.title,
            summary: trail.summary,
            stopTitles: trail.pathStopsEnriched.map((s) => s.title),
          })}
        />
      ) : null}

      <Section atmosphere="transition" className="border-b border-border/40 !py-8 md:!py-20">
        <Container>
          <BreadcrumbTrail
            items={[
              { label: "Home", href: "/" },
              { label: "Reading Trails", href: "/trails" },
              { label: trail.title },
            ]}
          />
          <p className="text-xs uppercase tracking-[0.35em] text-accent">
            {trail.themes.join(" · ")}
            {trail.audience ? ` · ${trail.audience}` : ""}
          </p>
          {trail.status === "upcoming" ? (
            <p className="mt-3 inline-flex rounded-sm border border-border/60 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted md:mt-4">
              Upcoming trail — preview
            </p>
          ) : null}
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight text-fg md:mt-6 md:text-5xl">
            {trail.title}
          </h1>
          {summary ? (
            useSummaryDisclosure ? (
              <EntityIntroDisclosure
                id="trail-full-summary"
                regionLabel="Full trail summary"
                teaser={summaryTeaser}
                expandLabel="Read full summary"
                className="!mt-4 md:!mt-6"
              >
                <p className="text-lg leading-relaxed text-muted">{summary}</p>
              </EntityIntroDisclosure>
            ) : (
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted md:mt-6">{summary}</p>
            )
          ) : null}
          {trail.status === "upcoming" ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:mt-4">
              This trail is still being composed. The path below is a preview of the planned
              sequence and may change before publication.
            </p>
          ) : null}
          {orientation ? (
            useOrientationDisclosure ? (
              <EntityIntroDisclosure
                id="trail-full-orientation"
                regionLabel="Full trail orientation"
                teaser={orientationTeaser}
                expandLabel="Read full orientation"
                className="!mt-4 md:!mt-6"
              >
                <p className="leading-relaxed text-muted">{orientation}</p>
              </EntityIntroDisclosure>
            ) : (
              <p className="mt-4 max-w-2xl leading-relaxed text-muted md:mt-6">{orientation}</p>
            )
          ) : null}
        </Container>
      </Section>

      <Section atmosphere="transition" className="border-b border-border/35 !py-8 md:!py-16">
        <Container>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg">The path</h2>
          <p className="mt-3 max-w-2xl text-muted md:mt-4">
            {requiredStops} required stops
            {optionalStops > 0 ? ` · ${optionalStops} optional` : ""} · ~
            {trail.totalEstimatedMinutes} min
            {trail.depth ? ` · ${trail.depth} depth` : ""}
            {trail.primaryBookTitle ? (
              <>
                {" "}
                · primary book:{" "}
                <Link href={trail.primaryBookHref!} className="text-accent hover:underline">
                  {trail.primaryBookTitle}
                </Link>
              </>
            ) : null}
          </p>
          <TrailPath stops={trail.pathStopsEnriched} trailId={trail.id} />
        </Container>
      </Section>

      <Section atmosphere="none" className="border-b border-border/35 !py-8 md:!py-16">
        <Container>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg">
            Where this path leads
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted md:mt-6">
            {trail.closingReflection}
          </p>
          {trail.suggestedContinuation ? (
            <p className="mt-6 max-w-2xl leading-relaxed text-fg/90 md:mt-8">
              {trail.suggestedContinuation}
            </p>
          ) : null}
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section
          atmosphere="none"
          className="border-b border-border/35 !py-8 md:!py-16"
          data-path-related-section
        >
          <Container>
            <RelatedSectionDisclosure
              id="related-trails"
              title="Related trails"
              countLabel={trailCountLabel(related.length)}
            >
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {related.map((relatedTrail) => (
                  <TrailCard
                    key={relatedTrail.id}
                    trail={relatedTrail}
                    location="related"
                    analytics={{
                      event: "trail_related_select",
                      params: { from_id: trail.id, to_id: relatedTrail.id },
                    }}
                  />
                ))}
              </div>
            </RelatedSectionDisclosure>
          </Container>
        </Section>
      ) : null}

      <Section atmosphere="none" className="!py-8 md:!py-20">
        <Container>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg">
            Continue exploring
          </h2>
          <ul className="mt-6 flex flex-col gap-4 text-sm md:mt-8">
            {trail.primaryBookHref && trail.primaryBookTitle ? (
              <li>
                <TrackedLink
                  href={trail.primaryBookHref}
                  className="text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  analytics={{
                    event: "trail_continue_book",
                    params: {
                      trail_id: trail.id,
                      book_id: trail.primaryBookId ?? "",
                    },
                  }}
                >
                  Read {trail.primaryBookTitle} in full
                </TrackedLink>
              </li>
            ) : null}
            <li>
              <ExplorePathwayLink
                kind="trail"
                slug={trail.slug}
                analyticsEvent={AnalyticsEvents.trailObservatoryPathway}
                analyticsId={trail.id}
              />
            </li>
            <li>
              <TrackedLink
                href={searchHref}
                className="text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                analytics={{
                  event: "trail_search_handoff",
                  params: { trail_id: trail.id },
                }}
              >
                Search these themes across the commons
              </TrackedLink>
            </li>
            <li>
              <Link
                href="/questions"
                className="text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Start with a Question
              </Link>
            </li>
            <li>
              <Link
                href="/trails"
                className="text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Browse all reading trails
              </Link>
            </li>
          </ul>
        </Container>
      </Section>
    </article>
  );
}
