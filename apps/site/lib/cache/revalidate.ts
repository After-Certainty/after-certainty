import { timingSafeEqual } from "node:crypto";

import { refreshPodcastRss } from "@/lib/podcast/rss";
import { refreshSemanticGraph } from "@/lib/graph/manifest";

export const CACHE_REVALIDATE_TARGETS = ["podcast", "semantic"] as const;

export type CacheRevalidateTarget = (typeof CACHE_REVALIDATE_TARGETS)[number];

const TARGET_SET = new Set<string>(CACHE_REVALIDATE_TARGETS);

export function isCacheRevalidateConfigured(): boolean {
  return Boolean(process.env.CACHE_REVALIDATE_SECRET?.trim());
}

function bearerTokenEquals(authHeader: string | null, secret: string): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length);
  const tokenBuf = Buffer.from(token, "utf8");
  const secretBuf = Buffer.from(secret, "utf8");
  if (tokenBuf.length !== secretBuf.length) return false;
  return timingSafeEqual(tokenBuf, secretBuf);
}

/** Bearer token must match `CACHE_REVALIDATE_SECRET`. */
export function isCacheRevalidateAuthorized(request: Request): boolean {
  const secret = process.env.CACHE_REVALIDATE_SECRET?.trim();
  if (!secret) return false;
  return bearerTokenEquals(request.headers.get("authorization"), secret);
}

export function parseCacheRevalidateTargets(raw: unknown): CacheRevalidateTarget[] | null {
  if (raw === undefined || raw === null) {
    return [...CACHE_REVALIDATE_TARGETS];
  }

  if (!Array.isArray(raw) || raw.length === 0) {
    return null;
  }

  if (raw.length > CACHE_REVALIDATE_TARGETS.length) {
    return null;
  }

  const targets: CacheRevalidateTarget[] = [];
  for (const item of raw) {
    if (typeof item !== "string" || !TARGET_SET.has(item)) {
      return null;
    }
    targets.push(item as CacheRevalidateTarget);
  }

  return [...new Set(targets)];
}

export function revalidateCacheTargets(targets: CacheRevalidateTarget[]): void {
  for (const target of targets) {
    if (target === "podcast") {
      refreshPodcastRss();
    } else if (target === "semantic") {
      refreshSemanticGraph();
    }
  }
}
