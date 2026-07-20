import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { TrailCard } from "@/components/trails/trail-card";
import { TrailPath } from "@/components/trails/trail-path";
import { TrailPathAnalytics } from "@/components/trails/trail-path-analytics";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { buildTrailSearchHandoffUrl } from "@/lib/trails/enrichTrails";
import { getEnrichedPublishedTrails, getEnrichedTrailBySlug } from "@/lib/trails/getEnrichedTrails";
import { createPageMetadata } from "@/lib/metadata";
import { buildTrailDetailJsonLd } from "@/lib/seo/json-ld";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const trail = await getEnrichedTrailBySlug(slug);
  if (!trail) return {};
  return createPageMetadata({
    title: `${trail.title} · Reading Trail`,
    description: trail.summary,
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

  return (
    <article>
      <TrailPathAnalytics trailId={trail.id} />
      <JsonLd
        data={buildTrailDetailJsonLd({
          slug: trail.slug,
          title: trail.title,
          summary: trail.summary,
          stopTitles: trail.pathStopsEnriched.map((s) => s.title),
        })}
      />

      <Section atmosphere="transition" className="border-b border-border/40 py-14 md:py-20">
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
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight text-fg md:text-5xl">
            {trail.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{trail.summary}</p>
          <p className="mt-6 max-w-2xl leading-relaxed text-muted">{trail.orientation}</p>
        </Container>
      </Section>

      <Section atmosphere="transition" className="border-b border-border/35 py-12 md:py-16">
        <Container>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg">The path</h2>
          <p className="mt-4 max-w-2xl text-muted">
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

      <Section atmosphere="none" className="border-b border-border/35 py-12 md:py-16">
        <Container>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg">
            Where this path leads
          </h2>
          <p className="mt-6 max-w-2xl leading-relaxed text-muted">{trail.closingReflection}</p>
          {trail.suggestedContinuation ? (
            <p className="mt-8 max-w-2xl leading-relaxed text-fg/90">
              {trail.suggestedContinuation}
            </p>
          ) : null}
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section atmosphere="none" className="border-b border-border/35 py-12 md:py-16">
          <Container>
            <h2 className="font-display text-2xl font-medium tracking-tight text-fg">
              Related trails
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          </Container>
        </Section>
      ) : null}

      <Section atmosphere="none" className="py-14 md:py-20">
        <Container>
          <h2 className="font-display text-2xl font-medium tracking-tight text-fg">
            Continue exploring
          </h2>
          <ul className="mt-8 flex flex-col gap-4 text-sm">
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
