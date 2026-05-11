import type { MetadataRoute } from "next";
import { resolveDeploymentUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const base = resolveDeploymentUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
