/** True when `href` parses as an absolute `http:` or `https:` URL. */
export function isHttpOrHttpsUrl(href: string): boolean {
  try {
    const parsed = new URL(href);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Return the URL when it is http(s); otherwise undefined. */
export function onlyHttpOrHttpsUrl(href: string | undefined | null): string | undefined {
  if (!href?.trim()) return undefined;
  const trimmed = href.trim();
  return isHttpOrHttpsUrl(trimmed) ? trimmed : undefined;
}

/**
 * Safe href for MDX / content links: same-origin paths, hashes, mailto, or http(s).
 * Rejects `javascript:` and other schemes.
 */
export function isSafeHref(href: string | undefined | null): boolean {
  if (!href?.trim()) return false;
  const trimmed = href.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  if (trimmed.startsWith("mailto:")) {
    return !trimmed.toLowerCase().includes("javascript:");
  }
  return isHttpOrHttpsUrl(trimmed);
}

/** YouTube video ids are 11 chars from [A-Za-z0-9_-]. */
export const YOUTUBE_VIDEO_ID_RE = /^[\w-]{11}$/;

export function isYouTubeVideoId(id: string): boolean {
  return YOUTUBE_VIDEO_ID_RE.test(id);
}
