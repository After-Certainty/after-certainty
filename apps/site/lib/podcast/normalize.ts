import type Parser from "rss-parser";
import type { PodcastEpisode } from "@/types/content";
import { stripHtml } from "@/lib/podcast/sanitize";

/** rss-parser `Item` typings omit several `itunes:*` fields present at runtime */
export type RssItem = Parser.Item & {
  itunes?: {
    duration?: string;
    episode?: string | number;
    image?: string | { href?: string };
  };
};

/** Anchor / Apple podcasts duration: seconds as integer, or HH:MM:SS, or MM:SS → minutes */
export function parseItunesDurationToMinutes(raw?: string): number | undefined {
  if (!raw?.trim()) return undefined;
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) {
    const sec = parseInt(trimmed, 10);
    if (!Number.isFinite(sec)) return undefined;
    return Math.max(1, Math.round(sec / 60));
  }
  const parts = trimmed.split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return undefined;
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return Math.max(1, Math.round(h * 60 + m + s / 60));
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return Math.max(1, Math.round(m + s / 60));
  }
  return undefined;
}

/** Human-readable duration for UI */
export function formatEpisodeDuration(minutes?: number): string | undefined {
  if (minutes == null || !Number.isFinite(minutes)) return undefined;
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h ${rest}m` : `${h}h`;
}

function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "episode";
}

function extractEpisodeImage(item: RssItem): string | undefined {
  const img = item.itunes?.image;
  if (typeof img === "string") return img;
  if (img && typeof img === "object" && img.href) return img.href;
  return undefined;
}

function parsePublishedIso(item: RssItem): string {
  const pub = item.isoDate ?? item.pubDate;
  if (pub) {
    const d = new Date(pub);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return "";
}

/** Sort key for newest-first ordering */
export function episodeSortKey(item: RssItem): number {
  const pub = item.isoDate ?? item.pubDate;
  if (!pub) return 0;
  const t = new Date(pub).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Map RSS items to normalized episodes (sorted caller-side).
 * Stable `id` derived from title with collision suffixes.
 */
export function mapFeedItemsToEpisodes(items: RssItem[]): PodcastEpisode[] {
  const slugCounts = new Map<string, number>();

  return items.map((item) => {
    const title = item.title?.trim() || "Episode";
    const baseId = slugifyTitle(title);
    const seen = slugCounts.get(baseId) ?? 0;
    slugCounts.set(baseId, seen + 1);
    const id = seen === 0 ? baseId : `${baseId}-${seen + 1}`;

    const summaryRaw = item.contentSnippet ?? item.summary ?? item.content ?? "";
    const description = stripHtml(typeof summaryRaw === "string" ? summaryRaw : "");

    const publishedAt = parsePublishedIso(item);

    const durationRaw = item.itunes?.duration;
    const durationMinutes =
      typeof durationRaw === "string" ? parseItunesDurationToMinutes(durationRaw) : undefined;
    const duration = formatEpisodeDuration(durationMinutes);

    const audioUrl = typeof item.enclosure?.url === "string" ? item.enclosure.url.trim() : "";
    const link = typeof item.link === "string" ? item.link.trim() : "";
    const episodeUrl = link || audioUrl;

    const image = extractEpisodeImage(item);

    return {
      id,
      title,
      description,
      publishedAt,
      audioUrl,
      episodeUrl,
      duration,
      image,
    };
  });
}
