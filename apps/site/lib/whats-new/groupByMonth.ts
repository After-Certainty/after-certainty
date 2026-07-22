import type { WhatsNewEvent } from "@/lib/whats-new/schema";

export type WhatsNewMonthGroup = {
  /** Sort key YYYY-MM */
  key: string;
  label: string;
  events: WhatsNewEvent[];
};

export function groupWhatsNewEventsByMonth(events: readonly WhatsNewEvent[]): WhatsNewMonthGroup[] {
  const byKey = new Map<string, WhatsNewEvent[]>();

  for (const event of events) {
    const key = event.date.slice(0, 7);
    const bucket = byKey.get(key) ?? [];
    bucket.push(event);
    byKey.set(key, bucket);
  }

  return [...byKey.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, groupEvents]) => {
      const [year, month] = key.split("-").map(Number);
      const label = new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(Date.UTC(year!, month! - 1, 1)));
      return { key, label, events: groupEvents };
    });
}

export function formatWhatsNewEventDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
