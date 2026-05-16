import type { Book } from "@/types/semanticGraph";
import { bookHasMedia, youtubeEmbedUrl, youtubeWatchUrl } from "@/lib/explore/entity-media";

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
          <p className="text-sm text-muted">
            <a
              href={youtubeWatchUrl(introId)}
              className="text-accent underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch on YouTube
            </a>
          </p>
        </div>
      ) : null}

      {playlistUrl ? (
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Patterns</p>
          <p className="text-base leading-relaxed text-muted">
          <a
            href={playlistUrl}
            className="text-accent underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch the pattern playlist on YouTube
          </a>
          </p>
        </div>
      ) : null}
    </div>
  );
}
