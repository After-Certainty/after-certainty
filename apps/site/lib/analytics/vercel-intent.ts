import { track } from "@vercel/analytics";

import { trackReaderEvent } from "@/lib/analytics/reader";

export type CorpusType =
  | "source"
  | "thinker"
  | "concept"
  | "pattern"
  | "situation"
  | "book"
  | "chapter"
  | "song"
  | "question"
  | "trail"
  | "listen";
export type CorpusRelation = "related" | "creator" | "read";

// Only fixed categories reach Vercel; URLs below are inspected locally, never sent.
export function corpusDestination(href: string): CorpusType | null {
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  const path = href.split(/[?#]/, 1)[0].replace(/\/$/, "");
  if (/^\/explore\/books\/[^/]+\/chapters\/[^/]+$/.test(path)) return "chapter";
  const match =
    /^\/explore\/(sources|thinkers|concepts|patterns|situations|books|songs)\/[^/]+$/.exec(path);
  const types: Record<string, CorpusType> = {
    sources: "source",
    thinkers: "thinker",
    concepts: "concept",
    patterns: "pattern",
    situations: "situation",
    books: "book",
    songs: "song",
  };
  if (match) return types[match[1]];
  if (/^\/questions\/[^/]+$/.test(path)) return "question";
  if (/^\/trails\/[^/]+$/.test(path)) return "trail";
  if (path === "/listen") return "listen";
  return null;
}

/**
 * Path-derived id helper kept for tests/docs only.
 * Runtime attribution uses semantic `data-analytics-to-id` so `to_id` joins `chapter_open.chapter_id`.
 */
export function corpusTargetIdFromHref(href: string): string | null {
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  const path = href.split(/[?#]/, 1)[0].replace(/\/$/, "");
  const chapter = /^\/explore\/books\/([^/]+)\/chapters\/([^/]+)$/.exec(path);
  if (chapter) return `${chapter[1]}/${chapter[2]}`;
  const book = /^\/explore\/books\/([^/]+)$/.exec(path);
  if (book) return book[1];
  return null;
}

/** Attribution edges that may carry a privacy-safe `to_id` (source/thinker → book/chapter). */
export function shouldAttachCorpusToId(fromType: CorpusType, toType: CorpusType): boolean {
  return (fromType === "source" || fromType === "thinker") && (toType === "chapter" || toType === "book");
}

type IntentEvent =
  | {
      name: "corpus_navigation";
      properties: {
        from_type: CorpusType;
        to_type: CorpusType;
        relation: CorpusRelation;
        to_id?: string;
      };
    }
  | {
      name: "listen_item_selected";
      properties: { location: "listen_library"; method: "row" | "previous" | "next" };
    };

/**
 * Low-level Vercel intents. Prefer `trackReaderEvent` for primary reader vocabulary.
 * `corpus_navigation` routes through the facade (once). `listen_item_selected` stays Vercel-only.
 */
export function trackVercelIntent(event: IntentEvent): void {
  if (event.name === "corpus_navigation") {
    trackReaderEvent({ name: "corpus_navigation", properties: event.properties });
    return;
  }
  try {
    track(event.name, event.properties);
  } catch {
    // Best effort: measurement must not block navigation, selection, or playback.
  }
}
