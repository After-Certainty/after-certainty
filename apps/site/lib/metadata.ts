import type { Metadata } from "next";
import { resolvePodcastRssUrl, siteConfig } from "@/lib/site-config";

/** Static 1200×630 crop of `public/images/hero/hero-backdrop.png` — see `scripts/generate-og.sh`. */
const ogImagePath = "/og.png";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/branding/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/branding/icon-180.png",
  },
  alternates: {
    types: {
      "application/rss+xml": resolvePodcastRssUrl(),
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: ogImagePath,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [ogImagePath],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function createPageMetadata(override: Metadata): Metadata {
  const pageTitle = typeof override.title === "string" ? override.title : siteConfig.name;
  const pageDescription =
    typeof override.description === "string" ? override.description : siteConfig.description;

  return {
    ...defaultMetadata,
    ...override,
    openGraph: {
      ...defaultMetadata.openGraph,
      ...override.openGraph,
      title: override.openGraph?.title ?? pageTitle,
      description: override.openGraph?.description ?? pageDescription,
    },
    twitter: {
      ...defaultMetadata.twitter,
      ...override.twitter,
      title: override.twitter?.title ?? pageTitle,
      description: override.twitter?.description ?? pageDescription,
    },
  };
}
