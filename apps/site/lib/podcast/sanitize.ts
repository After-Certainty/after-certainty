/**
 * Plain-text cleanup for RSS HTML snippets — safe for visible UI copy.
 */

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: "\u0022",
  apos: "\u0027",
  nbsp: " ",
};

function decodeBasicEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-z]+);/g, (match, ref: string) => {
    if (ref.startsWith("#x") || ref.startsWith("#")) {
      const code =
        ref.startsWith("#x")
          ? parseInt(ref.slice(2), 16)
          : parseInt(ref.slice(1), 10);
      if (Number.isFinite(code) && code > 0 && code < 0x110000) {
        try {
          return String.fromCodePoint(code);
        } catch {
          return match;
        }
      }
      return match;
    }
    return ENTITY_MAP[ref.toLowerCase()] ?? match;
  });
}

/** Strip tags and collapse whitespace — returns a single readable line-oriented string. */
export function stripHtml(html: string): string {
  return decodeBasicEntities(
    html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

/** Truncate at word boundary when possible. */
export function truncatePlaintext(text: string, maxChars: number): string {
  const t = text.trim();
  if (t.length <= maxChars) return t;
  const slice = t.slice(0, maxChars - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const body = lastSpace > maxChars * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${body.trim()}…`;
}
