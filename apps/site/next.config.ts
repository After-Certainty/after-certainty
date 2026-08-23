import path from "node:path";
import { fileURLToPath } from "node:url";

import createMDX from "@next/mdx";
import type { NextConfig } from "next";

import { SECURITY_HEADERS } from "./lib/security/headers";
import { LEGACY_EXPLORE_REDIRECTS } from "./lib/seo/legacy-redirects";

const configDir = path.dirname(fileURLToPath(import.meta.url));
/** Include corpus manuscripts outside apps/site in server file tracing (READ-003). */
const monorepoRoot = path.join(configDir, "../..");

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactStrictMode: true,
  outputFileTracingRoot: monorepoRoot,
  outputFileTracingIncludes: {
    // Installed manuscripts live inside the Next project after install-local-manifest.
    // Alignment JSON for Listen highlighting (not MP3s — those stay CDN-only under public/).
    "/explore/books/[slug]/chapters/[chapterSlug]": [
      "./data/manuscripts/**/*",
      "./data/chapter-audio/**/*.alignment.json",
      "./data/local-chapter-audio-manifest.json",
    ],
    "/explore/books/*/chapters/*": [
      "./data/manuscripts/**/*",
      "./data/chapter-audio/**/*.alignment.json",
      "./data/local-chapter-audio-manifest.json",
      "../../books/**/*.md",
    ],
  },
  outputFileTracingExcludes: {
    // MP3s are served from public/ via the CDN. Server code must not pull them into
    // the chapter serverless function (250MB limit; WOLTY audio alone is tens of MB).
    "*": ["./public/generated/audio/**/*.mp3", "../../books/**/audio/**/*.mp3"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
  async redirects() {
    return LEGACY_EXPLORE_REDIRECTS.map((rule) => ({
      ...rule,
      permanent: true,
    }));
  },
  images: {
    qualities: [60, 65, 70, 75, 85, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d3t3ozftmdmh3i.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/After-Certainty/after-certainty/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/ksteffe/after-certainty/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "@phosphor-icons/react"],
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
  },
});

export default withMDX(nextConfig);
