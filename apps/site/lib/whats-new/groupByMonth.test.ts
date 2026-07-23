import { describe, expect, it } from "vitest";

import { formatWhatsNewEventDate, groupWhatsNewEventsByMonth } from "@/lib/whats-new/groupByMonth";
import type { WhatsNewEvent } from "@/lib/whats-new/schema";

function event(over: Partial<WhatsNewEvent> & Pick<WhatsNewEvent, "id" | "date">): WhatsNewEvent {
  return {
    type: "site_feature",
    title: over.title ?? over.id,
    summary: "Summary",
    entityType: "site",
    href: "/whats-new",
    visibility: "public",
    source: "authored",
    published: true,
    ...over,
  };
}

describe("groupWhatsNewEventsByMonth", () => {
  it("groups reverse-chronologically by month label", () => {
    const groups = groupWhatsNewEventsByMonth([
      event({ id: "event-july", date: "2026-07-01" }),
      event({ id: "event-may", date: "2026-05-09" }),
      event({ id: "event-july-2", date: "2026-07-15" }),
    ]);
    expect(groups.map((g) => g.key)).toEqual(["2026-07", "2026-05"]);
    expect(groups[0]?.label).toBe("July 2026");
    expect(groups[0]?.events.map((e) => e.id)).toEqual(["event-july", "event-july-2"]);
  });

  it("formats event dates for display", () => {
    expect(formatWhatsNewEventDate("2026-05-09")).toBe("May 9, 2026");
  });
});
