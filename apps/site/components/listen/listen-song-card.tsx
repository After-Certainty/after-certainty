import Link from "next/link";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { SunoEmbed } from "@/components/listen/suno-embed";
import {
  explorePrimaryButtonClass,
  exploreSecondaryButtonClass,
} from "@/components/explore/explore-action-buttons";
import { LinkifiedText } from "@/components/ui/linkified-text";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { explorePaths } from "@/lib/graph/explorePaths";
import { sunoSongUrl } from "@/lib/songs/recordings";

export type ListenSongCardProps = {
  slug: string;
  title: string;
  shortDescription: string;
  recordingExternalId: string;
  versionTitle?: string;
};

export function ListenSongCard({
  slug,
  title,
  shortDescription,
  recordingExternalId,
  versionTitle,
}: ListenSongCardProps) {
  const aboutHref = `${explorePaths.songs}/${slug}`;
  const sunoHref = sunoSongUrl(recordingExternalId);
  const headingId = `listen-song-${slug}`;

  return (
    <article
      className="flex flex-col gap-3 border-b border-border/25 pb-6 last:border-b-0 last:pb-0 md:gap-5 md:pb-12"
      aria-labelledby={headingId}
    >
      <div className="space-y-2 md:space-y-3">
        <h2 id={headingId} className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
          {title}
        </h2>
        {shortDescription.trim() ? (
          <p className="max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            <LinkifiedText text={shortDescription} />
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        {versionTitle ? (
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted/80">{versionTitle}</p>
        ) : null}
        <SunoEmbed externalId={recordingExternalId} title={title} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <Link href={aboutHref} className={explorePrimaryButtonClass}>
          About this song →
        </Link>
        {sunoHref ? (
          <TrackedLink
            href={sunoHref}
            target="_blank"
            rel="noopener noreferrer"
            className={exploreSecondaryButtonClass}
            analytics={outboundLinkAnalytics(sunoHref, "Listen on Suno", "listen_song_card", "suno")}
          >
            Listen on Suno →
          </TrackedLink>
        ) : null}
      </div>
    </article>
  );
}
