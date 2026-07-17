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

/** YouTube video ids are 11 chars from [A-Za-z0-9_-]. */
export const YOUTUBE_VIDEO_ID_RE = /^[\w-]{11}$/;

export function isYouTubeVideoId(id: string): boolean {
  return YOUTUBE_VIDEO_ID_RE.test(id);
}
