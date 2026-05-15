import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/patterns", destination: "/explore/patterns", permanent: true },
      { source: "/patterns/:slug", destination: "/explore/patterns/:slug", permanent: true },
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
