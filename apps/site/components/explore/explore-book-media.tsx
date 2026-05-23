import { TrackedLink } from "@/components/analytics/tracked-link";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { bookHasMedia, youtubeEmbedUrl, youtubeWatchUrl } from "@/lib/explore/entity-media";
import type { Book } from "@/types/semanticGraph";

type ExploreBookMediaProps = {
  book: Book;
};

/** Book-level media from the semantic manifest — intro video and patterns playlist. */
export function ExploreBookMedia({ book }: ExploreBookMediaProps) {
  if (!bookHasMedia(book)) {
    return null;
  }

  const introId = book.media?.intro?.youtubeVideoId;
  const playlistUrl = book.media?.patterns?.youtubePlaylistUrl;
  const watchUrl = introId ? youtubeWatchUrl(introId) : null;

  return (
    <div className="mt-10 max-w-2xl space-y-8 border-t border-border/30 pt-10">
      {introId ? (
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Introduction</p>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/40 bg-bg-elevated/60">
            <iframe
              title={`${book.title} — introduction`}
              className="absolute inset-0 h-full w-full"
              src={youtubeEmbedUrl(introId)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          {watchUrl ? (
            <p className="text-sm text-muted">
              <TrackedLink
                href={watchUrl}
                className="text-accent underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                analytics={outboundLinkAnalytics(watchUrl, "Watch on YouTube", "explore_book_media", "youtube")}
              >
                Watch on YouTube
              </TrackedLink>
            </p>
          ) : null}
        </div>
      ) : null}

      {playlistUrl ? (
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Patterns</p>
          <p className="text-base leading-relaxed text-muted">
            <TrackedLink
              href={playlistUrl}
              className="text-accent underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              analytics={outboundLinkAnalytics(
                playlistUrl,
                "Watch the pattern playlist on YouTube",
                "explore_book_media",
                "youtube",
              )}
            >
              Watch the pattern playlist on YouTube
            </TrackedLink>
          </p>
        </div>
      ) : null}
    </div>
  );
}
