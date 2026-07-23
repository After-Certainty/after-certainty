import siteWhatsNewJson from "@/data/site-whats-new.json";
import {
  parseWhatsNewManifest,
  type WhatsNewEvent,
  type WhatsNewManifest,
} from "@/lib/whats-new/schema";

let cached: WhatsNewManifest | null = null;

/** Site-owned What’s New rows (podcast + site features). Corpus book events come from changeEvents. */
export function getSiteWhatsNewManifest(): WhatsNewManifest {
  if (!cached) {
    cached = parseWhatsNewManifest(siteWhatsNewJson);
  }
  return cached;
}

/** @deprecated Prefer getSiteWhatsNewManifest + corpus changeEvents. */
export function getWhatsNewManifest(): WhatsNewManifest {
  return getSiteWhatsNewManifest();
}

export function getAuthoredWhatsNewEvents(): WhatsNewEvent[] {
  return getSiteWhatsNewManifest().events;
}

/** Test helper — clears the parse cache. */
export function resetWhatsNewCacheForTests(): void {
  cached = null;
}
