import Image from "next/image";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { formatWhatsNewEventDate } from "@/lib/whats-new/groupByMonth";
import { eventTypeLabel } from "@/lib/whats-new/url-state";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";

type WhatsNewEventCardProps = {
  event: WhatsNewEvent;
  location: "index" | "home" | "featured";
  headingLevel?: "h2" | "h3";
};

export function WhatsNewEventCard({
  event,
  location,
  headingLevel = "h3",
}: WhatsNewEventCardProps) {
  const Heading = headingLevel;
  const typeLabel = eventTypeLabel(event.type);

  return (
    <article className="border-b border-border/30 py-8 last:border-b-0 first:pt-0">
      <div className="flex flex-col gap-5 sm:flex-row sm:gap-8">
        {event.image ? (
          <div className="relative mx-auto aspect-[2/3] w-full max-w-[120px] shrink-0 overflow-hidden rounded-md border border-border/40 bg-bg-elevated/40 sm:mx-0">
            <Image src={event.image} alt="" fill className="object-cover" sizes="120px" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[10px] uppercase tracking-[0.28em] text-accent">{typeLabel}</span>
            <time
              dateTime={event.date}
              className="text-[10px] uppercase tracking-[0.16em] text-muted"
            >
              {formatWhatsNewEventDate(event.date)}
            </time>
          </div>
          <Heading className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl">
            <TrackedLink
              href={event.href}
              className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              analytics={{
                event: AnalyticsEvents.whatsNewSelect,
                params: {
                  event_id: event.id,
                  event_type: event.type,
                  location,
                },
              }}
            >
              {event.title}
            </TrackedLink>
          </Heading>
          <p className="max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            {event.summary}
          </p>
          <TrackedLink
            href={event.href}
            className="inline-block text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            analytics={{
              event: AnalyticsEvents.whatsNewSelect,
              params: {
                event_id: event.id,
                event_type: event.type,
                location: `${location}_cta`,
              },
            }}
          >
            Explore →
          </TrackedLink>
        </div>
      </div>
    </article>
  );
}
