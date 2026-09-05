"use client";

import Link from "next/link";

import { TrackedLink } from "@/components/analytics/tracked-link";
import {
  explorePrimaryButtonClass,
  exploreSecondaryButtonClass,
} from "@/components/explore/explore-action-buttons";
import { SunoEmbed } from "@/components/listen/suno-embed";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { explorePaths } from "@/lib/graph/explorePaths";
import { sunoSongUrl } from "@/lib/songs/recordings";

/** Secondary outbound action — quieter than the primary explore button. */
const listenSunoLinkClass =
  "inline-flex min-h-11 items-center text-sm text-muted underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

const navButtonClass = `${exploreSecondaryButtonClass} disabled:cursor-not-allowed disabled:opacity-40`;

export type PersistentSunoPlayerSong = {
  slug: string;
  title: string;
  recordingExternalId: string;
  versionTitle?: string;
};

type PersistentSunoPlayerProps = {
  song: PersistentSunoPlayerSong;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

/**
 * Single persistent Suno player chrome for `/listen`.
 *
 * The Suno iframe is the playback UI; this shell adds Now Playing identity,
 * Previous/Next (disabled at playlist ends), and semantic/outbound links.
 */
export function PersistentSunoPlayer({
  song,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: PersistentSunoPlayerProps) {
  const aboutHref = `${explorePaths.songs}/${song.slug}`;
  const sunoHref = sunoSongUrl(song.recordingExternalId);
  const headingId = "listen-now-playing-heading";

  return (
    <section
      className="space-y-3 border border-border/40 bg-bg/95 p-3 backdrop-blur-md md:space-y-4 md:p-4"
      aria-labelledby={headingId}
      data-listen-player="persistent"
    >
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.2em] text-accent">Now Playing</p>
        <h2
          id={headingId}
          className="font-display text-xl font-medium tracking-tight text-fg md:text-2xl"
        >
          {song.title}
        </h2>
        {song.versionTitle ? (
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted/80">{song.versionTitle}</p>
        ) : null}
      </div>

      <SunoEmbed externalId={song.recordingExternalId} title={song.title} />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={navButtonClass}
          onClick={onPrevious}
          disabled={!hasPrevious}
          aria-label="Previous song"
        >
          Previous
        </button>
        <button
          type="button"
          className={navButtonClass}
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Next song"
        >
          Next
        </button>
      </div>

      <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <Link href={aboutHref} className={explorePrimaryButtonClass}>
          About this song →
        </Link>
        {sunoHref ? (
          <TrackedLink
            href={sunoHref}
            target="_blank"
            rel="noopener noreferrer"
            className={listenSunoLinkClass}
            analytics={outboundLinkAnalytics(
              sunoHref,
              "Listen on Suno",
              "listen_persistent_player",
              "suno",
            )}
          >
            Listen on Suno ↗
          </TrackedLink>
        ) : null}
      </div>
    </section>
  );
}
