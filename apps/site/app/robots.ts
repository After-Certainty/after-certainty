import type { MetadataRoute } from "next";
import { OPEN_GRAPH_CRAWLER_USER_AGENTS } from "@/lib/seo/open-graph-crawlers";
import { resolveDeploymentUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const base = resolveDeploymentUrl();
  return {
    rules: [
      ...OPEN_GRAPH_CRAWLER_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
      })),
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
