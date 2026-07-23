import { buildPublicWhatsNewEvents } from "@/lib/whats-new/publicEvents";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";

/**
 * Public What’s New events that mention this book as the primary entity
 * or as a related edition (e.g. companion announcement linking the primary).
 */
export function findWhatsNewEventsForBook(
  bookId: string,
  options: {
    events?: readonly WhatsNewEvent[];
    limit?: number;
  } = {},
): WhatsNewEvent[] {
  const events = options.events ?? buildPublicWhatsNewEvents();
  const limit = options.limit ?? 3;

  return events
    .filter(
      (event) =>
        event.entityType === "book" &&
        (event.entityId === bookId || event.relatedEditionId === bookId),
    )
    .slice(0, limit);
}
