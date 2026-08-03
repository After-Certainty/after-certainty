import { TrackedLink } from "@/components/analytics/tracked-link";
import { outboundLinkAnalytics } from "@/lib/analytics/track";
import { booksWithPatternsPlaylist } from "@/lib/explore/entity-media";
import type { Book } from "@/types/semanticGraph";

type ExplorePatternsPlaylistCalloutProps = {
  books: readonly Book[];
};

/**
 * Compact horizontal video callout for the Patterns index.
 * Whole card is the interactive target.
 */
export function ExplorePatternsPlaylistCallout({ books }: ExplorePatternsPlaylistCalloutProps) {
  const withPlaylist = booksWithPatternsPlaylist(books);
  if (withPlaylist.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-2 md:mb-8">
      {withPlaylist.map((book) => {
        const href = book.media?.patterns?.youtubePlaylistUrl;
        if (!href) return null;
        const title = `Pattern videos · ${book.title}`;
        return (
          <TrackedLink
            key={book.id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-h-11 items-center gap-3 rounded-md border border-border/40 bg-bg-elevated/30 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            analytics={outboundLinkAnalytics(
              href,
              `Watch pattern videos for ${book.title} on YouTube`,
              "explore_patterns_index",
              "youtube",
            )}
          >
            <span className="min-w-0 flex-1 leading-tight">
              <span className="text-[10px] uppercase tracking-[0.28em] text-accent">Video</span>
              <span className="mt-0.5 block font-display text-base font-medium tracking-tight text-fg transition-colors group-hover:text-accent">
                {title}
              </span>
            </span>
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/35 text-accent transition-colors group-hover:border-accent/60"
              aria-hidden
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 translate-x-px">
                <path d="M6.5 4.5v11l9-5.5-9-5.5Z" />
              </svg>
            </span>
          </TrackedLink>
        );
      })}
    </div>
  );
}
