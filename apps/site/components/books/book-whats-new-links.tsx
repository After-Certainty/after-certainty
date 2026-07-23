import { TrackedLink } from "@/components/analytics/tracked-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { formatWhatsNewEventDate } from "@/lib/whats-new/groupByMonth";
import { eventTypeLabel } from "@/lib/whats-new/url-state";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";

type BookWhatsNewLinksProps = {
  bookId: string;
  events: readonly WhatsNewEvent[];
  /** Compact list for overview/legacy continue sections. */
  variant?: "section" | "inline";
};

/**
 * Book → What’s New cross-links (Phase H).
 * Lists events that reference this book; falls back to the full feed link when empty.
 */
export function BookWhatsNewLinks({ bookId, events, variant = "section" }: BookWhatsNewLinksProps) {
  if (events.length === 0) {
    return (
      <p className={variant === "section" ? "text-base leading-relaxed" : "text-sm"}>
        <TrackedLink
          href="/whats-new"
          className="text-accent underline-offset-4 hover:underline"
          analytics={{
            event: AnalyticsEvents.whatsNewHomeSelect,
            params: { location: "book_page" },
          }}
        >
          See what’s new across the project
        </TrackedLink>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {events.map((event) => (
          <li key={event.id} className="text-base leading-relaxed">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
              {eventTypeLabel(event.type)}
              <span aria-hidden> · </span>
              <time dateTime={event.date}>{formatWhatsNewEventDate(event.date)}</time>
            </span>
            <div>
              <TrackedLink
                href={event.href}
                className="text-accent underline-offset-4 hover:underline"
                analytics={{
                  event: AnalyticsEvents.whatsNewSelect,
                  params: {
                    event_id: event.id,
                    event_type: event.type,
                    location: "book_overview",
                  },
                }}
              >
                {event.title}
              </TrackedLink>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-sm">
        <TrackedLink
          href="/whats-new"
          className="text-accent underline-offset-4 hover:underline"
          analytics={{
            event: AnalyticsEvents.whatsNewHomeSelect,
            params: { location: "book_page" },
          }}
        >
          Browse all updates
        </TrackedLink>
      </p>
    </div>
  );
}
