import Image from "next/image";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { getPodcastEpisodes } from "@/lib/content-data";
import { getSemanticGraph } from "@/lib/graph/manifest";
import { formatWhatsNewEventDate } from "@/lib/whats-new/groupByMonth";
import { buildPublicWhatsNewEvents } from "@/lib/whats-new/publicEvents";
import { eventTypeLabel } from "@/lib/whats-new/url-state";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";

const PREVIEW_LIMIT = 3;

function FeaturedWhatsNewCard({ event }: { event: WhatsNewEvent }) {
  const typeLabel = eventTypeLabel(event.type);

  return (
    <article className="border-b border-border/30 pb-5">
      <TrackedLink
        href={event.href}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        analytics={{
          event: AnalyticsEvents.whatsNewSelect,
          params: {
            event_id: event.id,
            event_type: event.type,
            location: "home_featured",
          },
        }}
      >
        <div className="flex gap-4">
          {event.image ? (
            <div className="relative aspect-[2/3] w-[64px] shrink-0 overflow-hidden rounded-md border border-border/40 bg-bg-elevated/50 sm:w-[80px]">
              <Image src={event.image} alt="" fill className="object-contain" sizes="80px" />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="text-[10px] uppercase tracking-[0.28em] text-accent">{typeLabel}</span>
              <time
                dateTime={event.date}
                className="text-[10px] uppercase tracking-[0.16em] text-muted"
              >
                {formatWhatsNewEventDate(event.date)}
              </time>
            </div>
            <h3 className="mt-3 font-display text-xl font-medium tracking-tight text-fg transition-colors group-hover:text-accent md:text-2xl">
              {event.title}
            </h3>
            <p className="mt-3 line-clamp-3 text-sm leading-snug text-muted md:leading-relaxed">
              {event.summary}
            </p>
            <span className="mt-3 inline-flex min-h-9 items-center text-xs uppercase tracking-[0.2em] text-accent transition-colors group-hover:text-fg">
              Explore →
            </span>
          </div>
        </div>
      </TrackedLink>
    </article>
  );
}

function CompactWhatsNewRow({ event }: { event: WhatsNewEvent }) {
  const typeLabel = eventTypeLabel(event.type);

  return (
    <li className="border-b border-border/30 last:border-b-0">
      <TrackedLink
        href={event.href}
        className="group flex min-h-11 items-start justify-between gap-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        analytics={{
          event: AnalyticsEvents.whatsNewSelect,
          params: {
            event_id: event.id,
            event_type: event.type,
            location: "home_compact",
          },
        }}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] uppercase tracking-[0.22em] text-accent">
            {typeLabel}
          </span>
          <span className="mt-1 block font-display text-base font-medium tracking-tight text-fg transition-colors group-hover:text-accent">
            {event.title}
          </span>
          {event.summary ? (
            <span className="mt-1 block min-w-0 truncate text-xs leading-snug text-muted">
              {event.summary}
            </span>
          ) : null}
        </span>
        <time
          dateTime={event.date}
          className="shrink-0 pt-0.5 text-[10px] uppercase tracking-[0.14em] text-muted"
        >
          {formatWhatsNewEventDate(event.date)}
        </time>
      </TrackedLink>
    </li>
  );
}

/**
 * Homepage “What’s New” — one featured update plus compact secondary rows.
 */
export async function WhatsNewHomePreview() {
  const [podcastEpisodes, graph] = await Promise.all([getPodcastEpisodes(), getSemanticGraph()]);
  const events = buildPublicWhatsNewEvents({
    podcastEpisodes,
    changeEvents: graph.changeEvents,
  }).slice(0, PREVIEW_LIMIT);

  if (events.length === 0) return null;

  const [featured, ...secondary] = events;

  return (
    <div data-whats-new-home-preview>
      <p className="text-xs uppercase tracking-[0.28em] text-accent">What’s new</p>
      <div className="mt-5">
        {featured ? <FeaturedWhatsNewCard event={featured} /> : null}
        {secondary.length > 0 ? (
          <ul className="mt-0 list-none p-0">
            {secondary.map((event) => (
              <CompactWhatsNewRow key={event.id} event={event} />
            ))}
          </ul>
        ) : null}
      </div>
      <TrackedLink
        href="/whats-new"
        className="mt-7 inline-block text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        analytics={{
          event: AnalyticsEvents.whatsNewHomeSelect,
          params: { location: "home_preview_more" },
        }}
      >
        Browse What’s New →
      </TrackedLink>
    </div>
  );
}
