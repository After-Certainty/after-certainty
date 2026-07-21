import type { EnrichedPathStop } from "@/types/paths";

export function bookStatusLabel(status: EnrichedPathStop["bookStatus"]): string | null {
  if (!status || status === "published") return null;
  if (status === "forthcoming") return "Forthcoming";
  if (status === "draft" || status === "in_progress") return "In progress";
  return null;
}

export function buildPathStopLinkLabel(stop: EnrichedPathStop): string {
  return stop.external
    ? `Open ${stop.title} (${stop.entityTypeLabel}, opens external site)`
    : `Open ${stop.title} (${stop.entityTypeLabel})`;
}
