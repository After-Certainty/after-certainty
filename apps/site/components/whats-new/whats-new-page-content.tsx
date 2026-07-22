import Link from "next/link";

import { WhatsNewEventCard } from "@/components/whats-new/whats-new-event-card";
import { WhatsNewFilters } from "@/components/whats-new/whats-new-filters";
import { WhatsNewPageAnalytics } from "@/components/whats-new/whats-new-page-analytics";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { groupWhatsNewEventsByMonth } from "@/lib/whats-new/groupByMonth";
import { filterWhatsNewEvents, type WhatsNewFilter } from "@/lib/whats-new/url-state";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";

type WhatsNewPageContentProps = {
  filter: WhatsNewFilter;
  events: readonly WhatsNewEvent[];
};

export function WhatsNewPageContent({ filter, events: allEvents }: WhatsNewPageContentProps) {
  const events = filterWhatsNewEvents(allEvents, filter);
  const featured =
    filter === "all" ? (allEvents.find((e) => e.featured) ?? allEvents[0]) : undefined;
  const listEvents =
    featured && filter === "all" ? events.filter((e) => e.id !== featured.id) : events;
  const groups = groupWhatsNewEventsByMonth(listEvents);

  return (
    <>
      <WhatsNewPageAnalytics filter={filter} resultCount={events.length} />
      <Section atmosphere="none" className="pt-10 md:pt-14 !pb-8 md:!pb-10">
        <Container>
          <p className="text-[11px] uppercase tracking-[0.28em] text-accent">Updates</p>
          <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-fg md:text-5xl">
            What’s New
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
            Meaningful publications, revisions, podcast episodes, and site features from After
            Certainty — not a changelog of every rebuild.
          </p>
          <p className="mt-4">
            <Link
              href="/whats-new/feed.xml"
              className="text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              RSS feed
            </Link>
          </p>
          <WhatsNewFilters active={filter} />
        </Container>
      </Section>

      {featured ? (
        <Section
          atmosphere="transition"
          className="border-t border-border/25 !pt-10 md:!pt-12 !pb-4 md:!pb-6"
        >
          <Container>
            <h2 className="text-[11px] uppercase tracking-[0.28em] text-accent">Highlighted</h2>
            <div className="mt-6">
              <WhatsNewEventCard event={featured} location="featured" headingLevel="h2" />
            </div>
          </Container>
        </Section>
      ) : null}

      <Section
        atmosphere="none"
        className="border-t border-border/25 !pt-10 md:!pt-14 !pb-20 md:!pb-28"
      >
        <Container>
          {listEvents.length === 0 && !featured ? (
            <p className="text-muted">
              No updates in this filter.{" "}
              <Link href="/whats-new" className="text-accent hover:underline">
                Show all updates
              </Link>
              .
            </p>
          ) : listEvents.length === 0 ? (
            <p className="text-muted">You’re caught up — the highlighted update is above.</p>
          ) : (
            <div className="space-y-14">
              {groups.map((group) => (
                <section key={group.key} aria-labelledby={`whats-new-${group.key}`}>
                  <h2
                    id={`whats-new-${group.key}`}
                    className="font-display text-2xl font-medium tracking-tight text-fg md:text-3xl"
                  >
                    {group.label}
                  </h2>
                  <div className="mt-2">
                    {group.events.map((event) => (
                      <WhatsNewEventCard
                        key={event.id}
                        event={event}
                        location="index"
                        headingLevel="h3"
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
