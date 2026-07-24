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

/**
 * When set to `1`, prefer gitignored `data/local-semantic-manifest.json`
 * from the monorepo checkout. The site no longer fetches the public release
 * artifact at runtime; release publishing remains for external consumers.
 */
export function isSemanticManifestUseLocal(): boolean {
  return process.env.SEMANTIC_MANIFEST_USE_LOCAL?.trim() === "1";
}

/**
 * Compatibility flag for offline/local manifest loading. Stage E always loads
 * semantic data from local/offline JSON; this flag remains for scripts/tests.
 */
export function isSemanticManifestOffline(): boolean {
  return (
    process.env.SEMANTIC_MANIFEST_OFFLINE?.trim() === "1" || isSemanticManifestUseLocal()
  );
}

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

/** Outbound profile / repo links for the site footer (same defaults as the former WoLTY microsite footer). */
export type SiteSocialLinks = {
  github: string;
  medium: string;
  linkedIn: string;
  youtube: string;
};

export function resolveSiteSocialLinks(): SiteSocialLinks {
  const gh = "https://github.com/ksteffe/after-certainty";
  return {
    github: process.env.NEXT_PUBLIC_SOCIAL_GITHUB_URL?.trim() || gh,
    medium:
      process.env.NEXT_PUBLIC_SOCIAL_MEDIUM_URL?.trim() || "https://medium.com/@steffensen.kevin",
    linkedIn:
      process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL?.trim() || "https://www.linkedin.com/in/ksteffe/",
    youtube:
      process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_URL?.trim() || "https://www.youtube.com/@kstefftube",
  };
}

export function resolvePodcastPlatformLinks(): PodcastPlatformLinks {
  const gh = "https://github.com/ksteffe/after-certainty";
  return {
    spotify:
      process.env.NEXT_PUBLIC_PODCAST_SPOTIFY_URL?.trim() ||
      "https://podcasters.spotify.com/pod/show/kevin-steffensen",
    apple: process.env.NEXT_PUBLIC_PODCAST_APPLE_URL?.trim() || "",
    youtube: process.env.NEXT_PUBLIC_PODCAST_YOUTUBE_URL?.trim() || "",
    rss: resolvePodcastRssUrl(),
    githubDiscussions:
      process.env.NEXT_PUBLIC_GITHUB_DISCUSSIONS_URL?.trim() || `${gh}/discussions`,
  };
}

/** Default GA4 measurement ID (public). Override with `NEXT_PUBLIC_GA_MEASUREMENT_ID`. */
export const DEFAULT_GA_MEASUREMENT_ID = "G-H7FSEF4WLW";

/** GA4 web stream ID for client analytics (production + consent required for cookies/events). */
export function resolveGaMeasurementId(): string | null {
  const envId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (envId) return envId;
  return DEFAULT_GA_MEASUREMENT_ID;
}

/** Open Graph / Twitter card title (~50–60 chars for link preview tools). */
export const OG_SHARE_TITLE = "After Certainty — An Intellectual Commons for Human Systems";

export const siteConfig = {
  name: "After Certainty",
  ogShareTitle: OG_SHARE_TITLE,
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
    { href: "/explore/books", label: "Books" },
    { href: "/trails", label: "Trails" },
    { href: "/explore", label: "Explore" },
    { href: "/podcast", label: "Podcast" },
    { href: "/collaborators", label: "Collaborators" },
    { href: "/about", label: "About" },
  ],
} as const;
