/**
 * Canonical origin for metadata (`metadataBase`), RSS, and sitemaps.
 * Without `NEXT_PUBLIC_SITE_URL`, local dev defaults to localhost so `<link rel="icon">`
 * URLs resolve on your machine instead of pointing at production.
 */
export function resolveDeploymentUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel}`;
  }
  return "http://localhost:3000";
}

/** Default Anchor RSS — override with `PODCAST_RSS_URL` on the server */
export const DEFAULT_PODCAST_RSS_URL = "https://anchor.fm/s/1126d00c0/podcast/rss";

/** Resolved podcast RSS for server-side fetch, `<link rel="alternate">`, redirects */
export function resolvePodcastRssUrl(): string {
  const envUrl = process.env.PODCAST_RSS_URL?.trim();
  return envUrl && envUrl.length > 0 ? envUrl : DEFAULT_PODCAST_RSS_URL;
}

export type PodcastPlatformLinks = {
  spotify: string;
  apple: string;
  youtube: string;
  rss: string;
  githubDiscussions: string;
};

/** Editorial / directory links — env overrides with sensible fallbacks */
export function resolvePodcastPlatformLinks(): PodcastPlatformLinks {
  const gh = "https://github.com/ksteffe/after-certainty";
  return {
    spotify:
      process.env.NEXT_PUBLIC_PODCAST_SPOTIFY_URL?.trim() ||
      "https://podcasters.spotify.com/pod/show/kevin-steffensen",
    apple: process.env.NEXT_PUBLIC_PODCAST_APPLE_URL?.trim() || "",
    youtube: process.env.NEXT_PUBLIC_PODCAST_YOUTUBE_URL?.trim() || "",
    rss: resolvePodcastRssUrl(),
    githubDiscussions: process.env.NEXT_PUBLIC_GITHUB_DISCUSSIONS_URL?.trim() || `${gh}/discussions`,
  };
}

export const siteConfig = {
  name: "After Certainty",
  description:
    "An intellectual commons exploring meaning, trust, leadership, authority, communication, and human systems—beyond false certainty.",
  url: resolveDeploymentUrl(),
  githubUrl: "https://github.com/ksteffe/after-certainty",
  /** Default RSS URL (Anchor). Server code should call `resolvePodcastRssUrl()` for env override. */
  podcastRssUrl: DEFAULT_PODCAST_RSS_URL,
  license: {
    name: "CC BY-SA 4.0",
    url: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  navigation: [
    { href: "/start", label: "Start Here" },
    { href: "/books", label: "Books" },
    { href: "/podcast", label: "Podcast" },
    { href: "/patterns", label: "Patterns" },
    { href: "/collaborators", label: "Collaborators" },
    { href: "/about", label: "About" },
  ],
} as const;
