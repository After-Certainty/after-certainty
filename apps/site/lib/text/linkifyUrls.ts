export type TextSegment =
  | { type: "text"; value: string }
  | { type: "url"; value: string; href: string };

/** Trailing chars that are usually prose punctuation, not part of the URL. */
const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"»›]+$/u;

const URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;

function peelTrailingPunctuation(raw: string): { href: string; trailing: string } {
  const match = TRAILING_PUNCTUATION.exec(raw);
  if (!match) return { href: raw, trailing: "" };
  return {
    href: raw.slice(0, match.index),
    trailing: match[0],
  };
}

function isHttpUrl(href: string): boolean {
  try {
    const parsed = new URL(href);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Split plain text into text and URL segments for link rendering.
 * Trailing citation punctuation (e.g. `https://example.com/.`) stays as text after the link.
 */
export function splitTextWithUrls(text: string): TextSegment[] {
  if (!text) return [];

  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const raw = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, index) });
    }

    const { href, trailing } = peelTrailingPunctuation(raw);
    if (href && isHttpUrl(href)) {
      segments.push({ type: "url", value: href, href });
      if (trailing) {
        segments.push({ type: "text", value: trailing });
      }
    } else {
      segments.push({ type: "text", value: raw });
    }

    lastIndex = index + raw.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  if (segments.length === 0) {
    return [{ type: "text", value: text }];
  }

  return segments;
}
