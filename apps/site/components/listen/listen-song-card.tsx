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
        "flex flex-col gap-2.5 border-b border-border/25 pb-5 last:border-b-0 last:pb-0 md:gap-3 md:pb-8",
        selected
          ? "border-l-2 border-l-accent pl-3 md:pl-4"
          : "border-l-2 border-l-transparent pl-3 md:pl-4",
      ].join(" ")}
      aria-labelledby={headingId}
      aria-current={selected ? "true" : undefined}
      data-listen-song={slug}
      data-listen-selected={selected ? "true" : "false"}
    >
      <div className="space-y-1.5 md:space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3
            id={headingId}
            className="font-display text-xl font-medium tracking-tight text-fg md:text-2xl"
          >
            {title}
          </h3>
          {selected ? (
            <span className="text-[11px] uppercase tracking-[0.2em] text-accent">Now playing</span>
          ) : null}
        </div>
        {shortDescription.trim() ? (
          <p className="max-w-2xl text-sm leading-snug text-muted md:text-base md:leading-relaxed">
            <LinkifiedText text={shortDescription} />
          </p>
        ) : null}
      </div>

      <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <button
          type="button"
          className={exploreSecondaryButtonClass}
          onClick={onSelect}
          aria-pressed={selected}
          aria-label={selected ? `${title}, now playing` : `Play ${title}`}
        >
          {selected ? "Playing" : "Play"}
        </button>
        <Link
          href={aboutHref}
          className="inline-flex min-h-11 items-center text-sm text-muted underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          About this song →
        </Link>
      </div>
    </article>
  );
}
