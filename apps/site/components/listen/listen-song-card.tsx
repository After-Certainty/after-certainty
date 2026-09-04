import Link from "next/link";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { SunoEmbed } from "@/components/listen/suno-embed";
import { explorePrimaryButtonClass } from "@/components/explore/explore-action-buttons";
import { LinkifiedText } from "@/components/ui/linkified-text";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { explorePaths } from "@/lib/graph/explorePaths";
import { sunoSongUrl } from "@/lib/songs/recordings";

/** Secondary outbound action — quieter than the primary explore button. */
const listenSunoLinkClass =
  "inline-flex min-h-11 items-center text-sm text-muted underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

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
      className="flex flex-col gap-2.5 border-b border-border/25 pb-5 last:border-b-0 last:pb-0 md:gap-5 md:pb-12"
      aria-labelledby={headingId}
    >
      <div className="space-y-1.5 md:space-y-3">
        <h2 id={headingId} className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
          {title}
        </h2>
        {shortDescription.trim() ? (
          <p className="max-w-2xl text-sm leading-snug text-muted md:text-lg md:leading-relaxed">
            <LinkifiedText text={shortDescription} />
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5 md:space-y-2">
        {versionTitle ? (
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted/80">{versionTitle}</p>
        ) : null}
        <SunoEmbed externalId={recordingExternalId} title={title} />
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
            analytics={outboundLinkAnalytics(sunoHref, "Listen on Suno", "listen_song_card", "suno")}
          >
            Listen on Suno ↗
          </TrackedLink>
        ) : null}
      </div>
    </article>
  );
}
