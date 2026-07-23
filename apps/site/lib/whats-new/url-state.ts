import {
  whatsNewFilterBucket,
  type WhatsNewEvent,
  type WhatsNewEventType,
} from "@/lib/whats-new/schema";

export type WhatsNewFilter = "all" | "books" | "revisions" | "podcast" | "site";

export const WHATS_NEW_FILTERS: readonly { id: WhatsNewFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "books", label: "Books" },
  { id: "revisions", label: "Revisions" },
  { id: "podcast", label: "Podcast" },
  { id: "site", label: "Site" },
] as const;

export function parseWhatsNewFilter(raw: string | string[] | undefined | null): WhatsNewFilter {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (
    trimmed === "books" ||
    trimmed === "revisions" ||
    trimmed === "podcast" ||
    trimmed === "site"
  ) {
    return trimmed;
  }
  return "all";
}

export function whatsNewQueryString(filter: WhatsNewFilter): string {
  if (filter === "all") return "";
  return `?type=${filter}`;
}

export function whatsNewHref(filter: WhatsNewFilter): string {
  return `/whats-new${whatsNewQueryString(filter)}`;
}

export function filterWhatsNewEvents(
  events: readonly WhatsNewEvent[],
  filter: WhatsNewFilter,
): WhatsNewEvent[] {
  if (filter === "all") return [...events];
  return events.filter((event) => whatsNewFilterBucket(event.type) === filter);
}

export function eventTypeLabel(type: WhatsNewEventType): string {
  switch (type) {
    case "book_published":
      return "New book";
    case "book_revised":
      return "Revision";
    case "book_announced":
      return "Upcoming book";
    case "podcast_episode":
      return "Podcast";
    case "site_feature":
      return "Site";
  }
}
