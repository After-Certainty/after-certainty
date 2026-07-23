import { TrackedLink } from "@/components/analytics/tracked-link";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { booksWithPatternsPlaylist } from "@/lib/explore/entity-media";
import type { Book } from "@/types/semanticGraph";

type ExplorePatternsPlaylistCalloutProps = {
  books: readonly Book[];
};

/** Surfaces book-level pattern playlist links on the explore patterns index. */
export function ExplorePatternsPlaylistCallout({ books }: ExplorePatternsPlaylistCalloutProps) {
  const withPlaylist = booksWithPatternsPlaylist(books);
  if (withPlaylist.length === 0) {
    return null;
  }

  return (
    <div className="mb-10 max-w-2xl space-y-4 rounded-lg border border-border/40 bg-bg-elevated/30 px-5 py-4">
      <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Video</p>
      <ul className="space-y-2 text-base leading-relaxed text-muted">
        {withPlaylist.map((book) => {
          const href = book.media?.patterns?.youtubePlaylistUrl;
          if (!href) return null;
          return (
            <li key={book.id}>
              <TrackedLink
                href={href}
                className="text-accent underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                analytics={outboundLinkAnalytics(
                  href,
                  `Watch pattern videos for ${book.title} on YouTube`,
                  "explore_patterns_index",
                  "youtube",
                )}
              >
                Watch pattern videos for {book.title} on YouTube
              </TrackedLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
