/**
 * Expected permanent (308) legacy → Explore redirects.
 * Kept in sync with `next.config.ts` `redirects()` for unit verification.
 * Live e2e also covers a subset via Playwright.
 */
export const LEGACY_EXPLORE_REDIRECTS: ReadonlyArray<{
  source: string;
  destination: string;
}> = [
  { source: "/patterns", destination: "/explore/patterns" },
  { source: "/patterns/:slug", destination: "/explore/patterns/:slug" },
  { source: "/books", destination: "/explore/books" },
  {
    source: "/books/when-others-look-to-you",
    destination: "/explore/books/when-others-look-to-you-v1",
  },
  {
    source: "/books/when-others-look-to-you-v1",
    destination: "/explore/books/when-others-look-to-you-v1",
  },
  {
    source: "/books/when-others-look-to-you/patterns",
    destination: "/explore/patterns",
  },
  {
    source: "/books/when-others-look-to-you/patterns/:slug",
    destination: "/explore/patterns/:slug",
  },
  {
    source: "/books/when-others-look-to-you/idea",
    destination: "/explore/books/when-others-look-to-you-v1",
  },
  {
    source: "/books/when-others-look-to-you/book",
    destination: "/explore/books/when-others-look-to-you-v1",
  },
  {
    source: "/books/when-others-look-to-you/about",
    destination: "/explore/books/when-others-look-to-you-v1",
  },
  {
    source: "/books/when-others-look-to-you/intro",
    destination: "/explore/books/when-others-look-to-you-v1",
  },
  {
    source: "/books/when-others-look-to-you/resources",
    destination: "/explore/books/when-others-look-to-you-v1",
  },
  { source: "/books/:slug", destination: "/explore/books/:slug" },
];

/** Concrete Search Console / crawl sample URLs → expected Location path (no host). */
export const LEGACY_REDIRECT_SAMPLES: ReadonlyArray<{
  from: string;
  to: string;
}> = [
  {
    from: "/books/when-authority-outlives-accountability",
    to: "/explore/books/when-authority-outlives-accountability",
  },
  {
    from: "/books/when-others-look-to-you/patterns/exceptions-are-forever",
    to: "/explore/patterns/exceptions-are-forever",
  },
  {
    from: "/books/why-collaboration-is-so-hard",
    to: "/explore/books/why-collaboration-is-so-hard",
  },
  {
    from: "/books/after-certainty",
    to: "/explore/books/after-certainty",
  },
];

function sourceToRegex(source: string): RegExp {
  const escaped = source
    .split("/")
    .map((seg) => {
      if (seg.startsWith(":")) return "([^/]+)";
      return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return new RegExp(`^${escaped}$`);
}

/** Apply the first matching permanent redirect rule (mirrors Next.js redirect order). */
export function applyLegacyRedirect(pathname: string): string | null {
  for (const rule of LEGACY_EXPLORE_REDIRECTS) {
    if (!rule.source.includes(":")) {
      if (pathname === rule.source) return rule.destination;
      continue;
    }
    const re = sourceToRegex(rule.source);
    const match = pathname.match(re);
    if (!match) continue;
    let dest = rule.destination;
    const paramNames = [...rule.source.matchAll(/:([^/]+)/g)].map((m) => m[1]);
    paramNames.forEach((name, i) => {
      dest = dest.replace(`:${name}`, match[i + 1] ?? "");
    });
    return dest;
  }
  return null;
}
