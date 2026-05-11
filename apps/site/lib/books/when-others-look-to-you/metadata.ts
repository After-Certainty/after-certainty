import type { Metadata } from "next";

import {
  assets,
  patternGroups,
  type PatternCardItem,
  woltyBasePath,
} from "@/lib/books/when-others-look-to-you/content";

/**
 * Default site / brand line for titles, OG `siteName`, and Twitter.
 * (Footer copy in `lib/content` may use different casing.)
 */
export const SITE_TITLE = "When Others Look To You";

/** Fallback description when a page does not override */
export const DEFAULT_DESCRIPTION =
  "Leadership as influence under observation—renewal, erosion, and the patterns others mirror when they look to you.";

export type BuildPageMetadataInput = {
  title: string;
  description: string;
  /** Route pathname, e.g. `/about` or `/patterns/attention-finds-a-focus` */
  path: string;
  /** Path under `public/` for OG/Twitter image; defaults to hero background */
  image?: string;
  /** When set, overrides `title` for Open Graph & Twitter only */
  openGraphTitle?: string;
  /** When set, overrides `description` for Open Graph & Twitter only */
  openGraphDescription?: string;
};

/**
 * Consistent SEO metadata (title, description, Open Graph, Twitter).
 * Use with root `metadataBase` in `app/layout.tsx` so image and canonical URLs resolve.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  image,
  openGraphTitle,
  openGraphDescription,
}: BuildPageMetadataInput): Metadata {
  const ogImage = image ?? assets.heroBackground;
  const pathname = path.startsWith("/") ? path : `/${path}`;
  const ogTitle = openGraphTitle ?? title;
  const ogDesc = openGraphDescription ?? description;

  return {
    title,
    description,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_TITLE,
      title: ogTitle,
      description: ogDesc,
      url: pathname,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDesc,
      images: [ogImage],
    },
  };
}

/** `/patterns/[slug]` — uses `pattern.seo`; meta description: seo.description → summary → card description */
export function buildPatternMetadata(pattern: PatternCardItem): Metadata {
  const description =
    pattern.seo.description ??
    pattern.summary ??
    pattern.description;

  return buildPageMetadata({
    title: pattern.seo.title,
    description,
    path: pattern.href,
    image: pattern.seo.openGraph?.image,
    openGraphTitle: pattern.seo.openGraph?.title,
    openGraphDescription: pattern.seo.openGraph?.description,
  });
}

/** Author for JSON-LD across pattern / article-like structured data */
export const STRUCTURED_DATA_AUTHOR = {
  "@type": "Person",
  name: "Kevin Steffensen",
} as const;

/**
 * JSON-LD `CreativeWork` for pattern detail URLs — complements page meta tags.
 * `siteUrl`: absolute origin (`NEXT_PUBLIC_SITE_URL` or dev fallback).
 */
export function buildPatternJsonLd(
  pattern: PatternCardItem,
  siteUrl: string,
): Record<string, unknown> {
  const description =
    pattern.seo.description ??
    pattern.summary ??
    pattern.description;

  const base = siteUrl.replace(/\/$/, "");
  const url = `${base}${pattern.href}`;
  const groupMeta = patternGroups[pattern.detail.group];

  const keywords = [
    pattern.title,
    groupMeta.title,
    pattern.detail.group,
    "leadership pattern",
    "renewal and erosion",
    SITE_TITLE,
  ].join(", ");

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: pattern.title,
    description,
    author: STRUCTURED_DATA_AUTHOR,
    keywords,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

/** Homepage: full title without the `%s | site` template suffix */
export function buildHomeMetadata(): Metadata {
  const description =
    "A leader is someone others look to when deciding what to do next. Explore renewal and erosion in leadership—and the patterns people mirror when they watch you.";

  const base = buildPageMetadata({
    title: SITE_TITLE,
    description,
    path: woltyBasePath,
    image: assets.heroBackground,
  });

  return {
    ...base,
    title: { absolute: SITE_TITLE },
  };
}
