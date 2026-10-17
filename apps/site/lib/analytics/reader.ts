import { track } from "@vercel/analytics";

import type { CorpusRelation, CorpusType } from "@/lib/analytics/vercel-intent";
import { trackEvent } from "@/lib/analytics/track";
import { vercelAnalyticsCustomPropertyLimit } from "@/lib/site-config";

/**
 * Provider-agnostic reader analytics facade (migration PR 1).
 *
 * Dispatch order:
 * 1. Resolve canonical event + properties once.
 * 2. Vercel — always attempt (independent of cookie consent).
 * 3. GA4 — separately, via consent-gated trackEvent helpers.
 *
 * Never nest Vercel sends inside trackEvent().
 */

export type ReadingPathKind = "question" | "trail";

export type CorpusNavigationProperties = {
  from_type: CorpusType;
  to_type: CorpusType;
  relation: CorpusRelation;
  /** Canonical semantic target id (same family as chapter_open / book ids) for attribution edges. */
  to_id?: string;
};

/** Build Vercel payload respecting the 2- vs 8-property plan budget. */
export function corpusNavigationVercelProperties(
  properties: CorpusNavigationProperties,
): Record<string, string> {
  const { from_type, to_type, relation, to_id } = properties;
  const edge = `${from_type}>${to_type}`;
  if (vercelAnalyticsCustomPropertyLimit() <= 2) {
    // Prefer destination identity when present; otherwise keep relation.
    if (to_id) return { edge, to_id };
    return { edge, relation };
  }
  return {
    from_type,
    to_type,
    relation,
    ...(to_id ? { to_id } : {}),
  };
}

export type ChapterOpenProperties = {
  book_id: string;
  chapter_id: string;
  edition_id?: string;
};

export type ChapterAdvanceProperties = {
  book_id: string;
  from_chapter_id: string;
  to_chapter_id: string;
};

export type BookDownloadProperties = {
  book_id: string;
  format: string;
  /** GA-only extras retained during parallel measurement. */
  file_name?: string;
  link_url?: string;
  location?: string;
};

export type ReaderAudioStartedProperties = {
  book_id: string;
  chapter_id: string;
};

export type ReadingPathStartedProperties = {
  path_kind: ReadingPathKind;
  path_id: string;
};

export type ReaderAnalyticsEvent =
  | { name: "corpus_navigation"; properties: CorpusNavigationProperties }
  | { name: "chapter_open"; properties: ChapterOpenProperties }
  | { name: "chapter_advance"; properties: ChapterAdvanceProperties }
  | { name: "book_download"; properties: BookDownloadProperties }
  | { name: "reader_audio_started"; properties: ReaderAudioStartedProperties }
  | { name: "reading_path_started"; properties: ReadingPathStartedProperties };

function vercelProps(
  properties: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  const cleaned: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value !== undefined) cleaned[key] = value;
  }
  return cleaned;
}

function trackVercel(name: string, properties: Record<string, string | number | boolean | undefined>): void {
  try {
    track(name, vercelProps(properties));
  } catch {
    // Best effort: measurement must not block navigation, selection, or playback.
  }
}

/**
 * Dual-write a primary reader event. Call sites should invoke this once per action.
 */
export function trackReaderEvent(event: ReaderAnalyticsEvent): void {
  switch (event.name) {
    case "corpus_navigation": {
      trackVercel("corpus_navigation", corpusNavigationVercelProperties(event.properties));
      // Vercel-only today; no GA corpus_navigation dual-write.
      return;
    }
    case "chapter_open": {
      const { book_id, chapter_id, edition_id } = event.properties;
      trackVercel("chapter_open", { book_id, chapter_id });
      trackEvent("chapter_open", {
        book_id,
        chapter_id,
        ...(edition_id ? { edition_id } : {}),
      });
      return;
    }
    case "chapter_advance": {
      const { book_id, from_chapter_id, to_chapter_id } = event.properties;
      // Destination chapter required for Vercel (≤2 props + book on GA only).
      trackVercel("chapter_advance", { from_chapter_id, to_chapter_id });
      trackEvent("next_chapter", { book_id, from_chapter_id, to_chapter_id });
      return;
    }
    case "book_download": {
      const { book_id, format, file_name, link_url, location } = event.properties;
      trackVercel("book_download", { book_id, format });
      trackEvent("file_download", {
        file_extension: format,
        content_type: "book",
        item_id: book_id,
        ...(file_name ? { file_name } : {}),
        ...(link_url ? { link_url } : {}),
        ...(location ? { location } : {}),
      });
      return;
    }
    case "reader_audio_started": {
      const { book_id, chapter_id } = event.properties;
      trackVercel("reader_audio_started", { book_id, chapter_id });
      // No historical GA audio event — Vercel-only during parallel measurement.
      return;
    }
    case "reading_path_started": {
      const { path_kind, path_id } = event.properties;
      trackVercel("reading_path_started", { path_kind, path_id });
      if (path_kind === "question") {
        trackEvent("question_path_start", { question_id: path_id });
      } else {
        trackEvent("trail_path_start", { trail_id: path_id });
      }
      return;
    }
    default: {
      const _exhaustive: never = event;
      void _exhaustive;
    }
  }
}
