import { track } from "@vercel/analytics";

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

type IntentEvent =
  | {
      name: "corpus_navigation";
      properties: { from_type: CorpusType; to_type: CorpusType; relation: CorpusRelation };
    }
  | {
      name: "listen_item_selected";
      properties: { location: "listen_library"; method: "row" | "previous" | "next" };
    }
  | {
      name: "listen_started";
      properties: { location: "chapter_reader"; media_type: "chapter_audio" };
    };

export function trackVercelIntent(event: IntentEvent): void {
  try {
    track(event.name, event.properties);
  } catch {
    // Best effort: measurement must not block navigation, selection, or playback.
  }
}
