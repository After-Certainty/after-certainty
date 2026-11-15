import type { CorpusRelation, CorpusType } from "@/lib/analytics/vercel-intent";
import { trackVercelEvent } from "@/lib/analytics/vercel-track";
import { vercelAnalyticsCustomPropertyLimit } from "@/lib/site-config";

/**
 * Reader analytics facade — Vercel Web Analytics only (GA4 retired, Gate 4).
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
  /** Retained for call-site compatibility; not sent to Vercel (≤2/8 prop budget). */
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

/** Send a primary reader event to Vercel Web Analytics. */
export function trackReaderEvent(event: ReaderAnalyticsEvent): void {
  switch (event.name) {
    case "corpus_navigation": {
      trackVercelEvent("corpus_navigation", corpusNavigationVercelProperties(event.properties));
      return;
    }
    case "chapter_open": {
      const { book_id, chapter_id } = event.properties;
      trackVercelEvent("chapter_open", { book_id, chapter_id });
      return;
    }
    case "chapter_advance": {
      const { from_chapter_id, to_chapter_id } = event.properties;
      trackVercelEvent("chapter_advance", { from_chapter_id, to_chapter_id });
      return;
    }
    case "book_download": {
      const { book_id, format } = event.properties;
      trackVercelEvent("book_download", { book_id, format });
      return;
    }
    case "reader_audio_started": {
      const { book_id, chapter_id } = event.properties;
      trackVercelEvent("reader_audio_started", { book_id, chapter_id });
      return;
    }
    case "reading_path_started": {
      const { path_kind, path_id } = event.properties;
      trackVercelEvent("reading_path_started", { path_kind, path_id });
      return;
    }
    default: {
      const _exhaustive: never = event;
      void _exhaustive;
    }
  }
}
