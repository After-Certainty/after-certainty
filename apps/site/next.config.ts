import path from "node:path";
import { fileURLToPath } from "node:url";

import createMDX from "@next/mdx";
import type { NextConfig } from "next";

import { SECURITY_HEADERS } from "./lib/security/headers";

const configDir = path.dirname(fileURLToPath(import.meta.url));
/** Include corpus manuscripts outside apps/site in server file tracing (READ-003). */
const monorepoRoot = path.join(configDir, "../..");

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactStrictMode: true,
  outputFileTracingRoot: monorepoRoot,
  outputFileTracingIncludes: {
    // Installed manuscripts live inside the Next project after install-local-manifest.
    "/explore/books/[slug]/chapters/[chapterSlug]": ["./data/manuscripts/**/*"],
    "/explore/books/*/chapters/*": ["./data/manuscripts/**/*", "../../books/**/*.md"],
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
    return [
      { source: "/patterns", destination: "/explore/patterns", permanent: true },
      { source: "/patterns/:slug", destination: "/explore/patterns/:slug", permanent: true },
      { source: "/books", destination: "/explore/books", permanent: true },
      {
        source: "/books/when-others-look-to-you",
        destination: "/explore/books/when-others-look-to-you-v1",
        permanent: true,
      },
      {
        source: "/books/when-others-look-to-you-v1",
        destination: "/explore/books/when-others-look-to-you-v1",
        permanent: true,
      },
      {
        source: "/books/when-others-look-to-you/patterns",
        destination: "/explore/patterns",
        permanent: true,
      },
      {
        source: "/books/when-others-look-to-you/patterns/:slug",
        destination: "/explore/patterns/:slug",
        permanent: true,
      },
      {
        source: "/books/when-others-look-to-you/idea",
        destination: "/explore/books/when-others-look-to-you-v1",
        permanent: true,
      },
      {
        source: "/books/when-others-look-to-you/book",
        destination: "/explore/books/when-others-look-to-you-v1",
        permanent: true,
      },
      {
        source: "/books/when-others-look-to-you/about",
        destination: "/explore/books/when-others-look-to-you-v1",
        permanent: true,
      },
      {
        source: "/books/when-others-look-to-you/intro",
        destination: "/explore/books/when-others-look-to-you-v1",
        permanent: true,
      },
      {
        source: "/books/when-others-look-to-you/resources",
        destination: "/explore/books/when-others-look-to-you-v1",
        permanent: true,
      },
      { source: "/books/:slug", destination: "/explore/books/:slug", permanent: true },
    ];
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
        pathname: "/ksteffe/after-certainty/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
  },
});

export default withMDX(nextConfig);
