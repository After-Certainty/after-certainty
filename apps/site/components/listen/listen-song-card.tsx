"use client";

import Link from "next/link";

import { exploreSecondaryButtonClass } from "@/components/explore/explore-action-buttons";
import { LinkifiedText } from "@/components/ui/linkified-text";
import { explorePaths } from "@/lib/graph/explorePaths";

export type ListenSongCardProps = {
  slug: string;
  title: string;
  shortDescription: string;
  recordingExternalId: string;
  versionTitle?: string;
  selected?: boolean;
  onSelect?: () => void;
};

/**
 * Lightweight selectable song row for the persistent-player listen library.
 * Does not mount a Suno iframe — selection drives the single shared player.
 *
 * Below `lg`: stacked title / description / actions (mobile-friendly).
 * At `lg+`: compact row — play | copy | About →.
 */
export function ListenSongCard({
  slug,
  title,
  shortDescription,
  selected = false,
  onSelect,
}: ListenSongCardProps) {
  const aboutHref = `${explorePaths.songs}/${slug}`;
  const headingId = `listen-song-${slug}`;

  return (
    <article
      className={[
        "border-b border-border/25 pb-5 last:border-b-0 last:pb-0 md:pb-6 lg:pb-5",
        selected
          ? "border-l-2 border-l-accent pl-3 md:pl-4"
          : "border-l-2 border-l-transparent pl-3 md:pl-4",
      ].join(" ")}
      aria-labelledby={headingId}
      aria-current={selected ? "true" : undefined}
      data-listen-song={slug}
      data-listen-selected={selected ? "true" : "false"}
    >
      <div className="flex flex-col gap-2.5 md:gap-3 lg:flex-row lg:items-start lg:gap-4">
        <div className="order-1 min-w-0 flex-1 space-y-1.5 md:space-y-2 lg:order-2 lg:space-y-1">
          <h3
            id={headingId}
            className="font-display text-xl font-medium tracking-tight text-fg md:text-2xl lg:text-xl"
          >
            {title}
          </h3>
          {shortDescription.trim() ? (
            <p className="max-w-2xl text-sm leading-snug text-muted md:text-base md:leading-relaxed lg:text-sm lg:leading-snug">
              <LinkifiedText text={shortDescription} />
            </p>
          ) : null}
        </div>

        <div className="order-2 flex flex-col items-start gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 lg:contents">
          <button
            type="button"
            className={`${exploreSecondaryButtonClass} shrink-0 lg:order-1`}
            onClick={onSelect}
            aria-pressed={selected}
            aria-label={selected ? `${title}, now playing` : `Play ${title}`}
          >
            {selected ? "Playing" : "Play"}
          </button>
          <Link
            href={aboutHref}
            className="inline-flex min-h-11 shrink-0 items-center text-sm text-muted underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:order-3 lg:min-h-0 lg:pt-2"
            aria-label={`About ${title}`}
          >
            <span className="lg:hidden">About this song →</span>
            <span className="hidden lg:inline">About →</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
