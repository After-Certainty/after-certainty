import whatsNewManifestJson from "@/data/whats-new.json";
import {
  parseWhatsNewManifest,
  type WhatsNewEvent,
  type WhatsNewManifest,
} from "@/lib/whats-new/schema";

let cached: WhatsNewManifest | null = null;

export function getWhatsNewManifest(): WhatsNewManifest {
  if (!cached) {
    cached = parseWhatsNewManifest(whatsNewManifestJson);
  }
  return cached;
}

export function getAuthoredWhatsNewEvents(): WhatsNewEvent[] {
  return getWhatsNewManifest().events;
}

/** Test helper — clears the parse cache. */
export function resetWhatsNewCacheForTests(): void {
  cached = null;
}
