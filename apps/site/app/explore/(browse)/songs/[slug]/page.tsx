import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbTrail } from "@/components/explore/breadcrumb-trail";
import { ExploreAdjacentNav } from "@/components/explore/explore-adjacent-nav";
import { RelatedBooksSection } from "@/components/explore/related-books-section";
import { RelatedContentGrid } from "@/components/explore/related-content-grid";
import { LinkifiedText } from "@/components/ui/linkified-text";
import { Section } from "@/components/ui/section";
import {
  explorePrimaryButtonClass,
  exploreSecondaryButtonClass,
} from "@/components/explore/explore-action-buttons";
import { EntityIntroDisclosure } from "@/components/explore/entity-intro-disclosure";
import { EXPLORE_ENTITY_DETAIL_SECTION_CLASS } from "@/lib/explore/entity-detail-layout";
import {
  entityIntroTeaser,
  shouldUseEntityIntroDisclosure,
} from "@/lib/explore/entity-intro-teaser";
import { explorePaths } from "@/lib/graph/explorePaths";
import { buildGraphIndex } from "@/lib/graph/graph";
import { getSongBySlug } from "@/lib/graph/query/graphQueries";
import { relatedContentForSong } from "@/lib/graph/query/relatedContent";
import { getExploreSemanticGraph } from "@/lib/explore/exploreSemanticGraph";
import { createPageMetadata } from "@/lib/metadata";
import { primaryRecording, sunoSongUrl } from "@/lib/songs/recordings";
import type { ManifestSong } from "@/types/semanticGraph";

type PageProps = { params: Promise<{ slug: string }> };

function songsSorted(songs: readonly ManifestSong[]): ManifestSong[] {
  return [...songs].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
  );
}

function adjacentSong(
  ordered: readonly ManifestSong[],
  slug: string,
): { prev?: ManifestSong; next?: ManifestSong } {
  const index = ordered.findIndex((s) => s.slug === slug);
  if (index < 0) return {};
  return {
    prev: index > 0 ? ordered[index - 1] : undefined,
    next: index < ordered.length - 1 ? ordered[index + 1] : undefined,
  };
}

function youtubeUrl(externalId: string): string {
  return `https://www.youtube.com/watch?v=${externalId}`;
}

function formatDuration(seconds: number | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null;
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function languageLabel(codes: readonly string[]): string {
  return codes.join(", ");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const song = getSongBySlug(index, slug);
  if (!song) return {};
  return createPageMetadata({
    title: song.title,
    description: song.shortDescription,
    alternates: { canonical: `${explorePaths.songs}/${song.slug}` },
  });
}

export default async function ExploreSongDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { graph } = await getExploreSemanticGraph();
  const index = buildGraphIndex(graph);
  const song = getSongBySlug(index, slug);
  if (!song) notFound();

  const related = relatedContentForSong(index, song);
  const ordered = songsSorted(graph.songs ?? []);
  const { prev, next } = adjacentSong(ordered, song.slug);
  const primary = primaryRecording(song);

  const hasRelated =
    related.concepts.length +
      related.patterns.length +
      related.books.length +
      related.sources.length >
    0;

  const breadcrumbs = [
    { label: "Explore", href: explorePaths.home },
    { label: "Songs", href: explorePaths.songs },
    { label: song.title },
  ];

  const shortDescription = song.shortDescription?.trim() ?? "";
  const longDescription = song.longDescription?.trim() ?? "";
  const longTeaser = entityIntroTeaser(longDescription);
  const useLongDisclosure = shouldUseEntityIntroDisclosure(longDescription, longTeaser);

  return (
    <article>
      <Section atmosphere="none" className={EXPLORE_ENTITY_DETAIL_SECTION_CLASS}>
        <BreadcrumbTrail items={breadcrumbs} />
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Song</p>
        <h1 className="mt-3 font-display text-4xl font-medium leading-[1.08] tracking-tight text-fg md:mt-4 md:text-5xl">
          {song.title}
        </h1>
        {song.creatorNames.length > 0 ? (
          <p className="mt-3 text-sm text-muted md:mt-4">
            {song.creatorNames.join(", ")}
          </p>
        ) : null}
        {shortDescription ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted md:mt-10 md:text-xl">
            <LinkifiedText text={shortDescription} />
          </p>
        ) : null}
        {longDescription ? (
          useLongDisclosure ? (
            <EntityIntroDisclosure
              id="song-full-description"
              regionLabel="Full song description"
              teaser={longTeaser}
              expandLabel="Read full description"
            >
              <p className="text-lg leading-relaxed text-muted md:text-xl">
                <LinkifiedText text={longDescription} />
              </p>
            </EntityIntroDisclosure>
          ) : (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:mt-6 md:text-lg">
              <LinkifiedText text={longDescription} />
            </p>
          )
        ) : null}

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted md:mt-8">
          {song.lyricLanguages.length > 0 ? (
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-muted/80">Languages</dt>
              <dd className="mt-1 text-fg">{languageLabel(song.lyricLanguages)}</dd>
            </div>
          ) : null}
        </dl>

        {primary && sunoSongUrl(primary.externalId) ? (
          <section className="mt-6 md:mt-10" aria-label="Listen">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href={sunoSongUrl(primary.externalId)!}
                target="_blank"
                rel="noopener noreferrer"
                className={explorePrimaryButtonClass}
              >
                Listen on Suno →
              </a>
            </div>
          </section>
        ) : null}

        <ExploreAdjacentNav
          basePath={explorePaths.songs}
          entityLabel="song"
          prev={prev ? { slug: prev.slug, title: prev.title } : undefined}
          next={next ? { slug: next.slug, title: next.title } : undefined}
        />
      </Section>

      <Section
        atmosphere="transition"
        className="border-t border-border/25 !pt-[var(--explore-section-y)] md:!pt-[var(--explore-section-y-md)] !pb-[var(--explore-section-pb)] md:!pb-[var(--explore-section-pb-md)]"
      >
        <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted">Recordings</h2>
        <ul className="mt-4 space-y-4 md:mt-6">
          {song.recordings.map((recording) => {
            const duration = formatDuration(recording.durationSeconds);
            const href = sunoSongUrl(recording.externalId);
            return (
              <li
                key={recording.externalId}
                className="border-b border-border/20 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-fg underline-offset-4 hover:text-accent hover:underline"
                    >
                      {recording.recordingTitle}
                    </a>
                  ) : (
                    <span className="font-medium text-fg">{recording.recordingTitle}</span>
                  )}
                  {recording.primary ? (
                    <span className="text-[11px] uppercase tracking-[0.18em] text-accent">
                      Primary
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {[
                    recording.versionTitle,
                    duration,
                    recording.modelName && recording.modelVersion
                      ? `${recording.modelName} ${recording.modelVersion}`
                      : recording.modelName,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </li>
            );
          })}
        </ul>

        {song.relatedMedia && song.relatedMedia.length > 0 ? (
          <div className="mt-10 md:mt-14">
            <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted">Related media</h2>
            <ul className="mt-4 space-y-3">
              {song.relatedMedia.map((media) => (
                <li key={`${media.kind}-${media.externalId}`}>
                  <a
                    href={youtubeUrl(media.externalId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={exploreSecondaryButtonClass}
                  >
                    {media.title?.trim() || "Watch on YouTube"} →
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      {hasRelated ? (
        <Section
          atmosphere="transition"
          className="border-t border-border/25 !pt-[var(--explore-section-y)] md:!pt-[var(--explore-section-y-md)] !pb-[var(--explore-section-pb)] md:!pb-[var(--explore-section-pb-md)]"
        >
          <div className="flex flex-col gap-8 md:gap-14">
            <RelatedContentGrid
              heading="Related patterns"
              patterns={related.patterns}
              collapsible
            />
            <RelatedContentGrid
              heading="Related concepts"
              concepts={related.concepts}
              collapsible
            />
            <RelatedBooksSection books={related.books} collapsible />
            <RelatedContentGrid
              heading="Related sources"
              sources={related.sources}
              collapsible
            />
          </div>
        </Section>
      ) : null}
    </article>
  );
}
