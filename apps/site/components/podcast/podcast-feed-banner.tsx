/**
 * Subtle notice when the live RSS feed could not be reached — layout stays intact.
 */
export function PodcastFeedBanner({ message }: { message: string }) {
  return (
    <div className="border-b border-border/40 bg-bg-elevated/25">
      <div className="mx-auto max-w-3xl px-6 py-4 text-center">
        <p className="text-sm leading-relaxed text-muted">{message}</p>
        <p className="mt-2 text-xs text-muted/80">
          Showing the last cached listing where available. Listening links remain active when provided by the host.
        </p>
      </div>
    </div>
  );
}
