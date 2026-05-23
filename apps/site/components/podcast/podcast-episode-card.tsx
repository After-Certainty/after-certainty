import { TrackedLink } from "@/components/analytics/tracked-link";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import type { PodcastEpisode } from "@/types/content";
import { formatEpisodeDisplayDate } from "@/lib/podcast/format";
import { truncatePlaintext } from "@/lib/podcast/sanitize";

const excerptLen = 220;

export type PodcastEpisodeCardVariant = "featured" | "list";

export function PodcastEpisodeCard({
  episode,
  variant,
}: {
  episode: PodcastEpisode;
  variant: PodcastEpisodeCardVariant;
}) {
  const excerpt = truncatePlaintext(episode.description, excerptLen);
  const dateLine = formatEpisodeDisplayDate(episode.publishedAt);
  const listenHref = episode.episodeUrl || episode.audioUrl;
  const canListen = Boolean(listenHref);

  if (variant === "featured") {
    return (
      <div className="relative overflow-hidden border border-border/45 bg-bg-elevated/[0.14]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-texture-light-bloom bg-cover bg-center mix-blend-soft-light" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.04] via-transparent to-transparent" aria-hidden />
        <div className="relative px-6 py-14 md:px-14 md:py-16 lg:px-20">
          <p className="text-[11px] uppercase tracking-[0.32em] text-accent">Latest</p>
          <h2 className="mt-6 max-w-3xl font-display text-3xl font-medium leading-snug tracking-tight text-fg md:text-4xl">
            {episode.title}
          </h2>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-muted">
            {dateLine ? <time dateTime={episode.publishedAt}>{dateLine}</time> : null}
            {episode.duration ? (
              <span className="text-muted/90" aria-hidden>
                ·
              </span>
            ) : null}
            {episode.duration ? <span>{episode.duration}</span> : null}
          </div>
          <p className="mt-8 max-w-2xl text-base leading-[1.75] text-muted md:text-[17px]">{excerpt}</p>

          <div className="podcast-wave mt-10 flex h-8 max-w-md items-end gap-1 opacity-[0.35]" aria-hidden>
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className="w-1 rounded-[1px] bg-accent/80"
                style={{ height: `${12 + ((i * 17) % 24)}px` }}
              />
            ))}
          </div>

          {episode.audioUrl ? (
            <div className="mt-10 max-w-xl">
              <audio
                controls
                preload="none"
                className="h-10 w-full opacity-90 [&::-webkit-media-controls-panel]:bg-bg-elevated/90"
                src={episode.audioUrl}
              />
            </div>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-4">
            {canListen ? (
              <TrackedLink
                href={listenHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center border border-accent/45 bg-accent-soft px-8 py-3 text-xs uppercase tracking-[0.26em] text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                analytics={outboundLinkAnalytics(listenHref, "Open in app", "podcast_episode_detail", "podcast")}
              >
                Open in app
              </TrackedLink>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="group border-b border-border/35 py-10 last:border-b-0 md:py-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-12">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.22em] text-muted">
            {dateLine ? <time dateTime={episode.publishedAt}>{dateLine}</time> : null}
            {episode.duration ? <span className="text-muted/80">{episode.duration}</span> : null}
          </div>
          <h2 className="mt-4 font-display text-xl font-medium leading-snug tracking-tight text-fg transition-colors group-hover:text-accent/95 md:text-2xl">
            {episode.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">{excerpt}</p>
        </div>
        <div className="shrink-0 md:pt-1">
          {canListen ? (
            <TrackedLink
              href={listenHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] min-w-[9rem] items-center justify-center border border-border/55 px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] text-accent transition-colors hover:border-accent/40 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              analytics={outboundLinkAnalytics(listenHref, "Listen", "podcast_episode_list", "podcast")}
            >
              Listen
            </TrackedLink>
          ) : (
            <span className="inline-flex min-h-[44px] items-center text-xs text-muted/70">Audio pending</span>
          )}
        </div>
      </div>
    </article>
  );
}
