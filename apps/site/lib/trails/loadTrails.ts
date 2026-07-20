import trailsManifestJson from "@/data/trails-manifest.json";
import { parseTrailsManifest, type ParsedTrailsManifest } from "@/lib/trails/schema";
import type { TrailDefinition } from "@/types/trails";

let cachedManifest: ParsedTrailsManifest | null = null;

export function getTrailsManifest(): ParsedTrailsManifest {
  if (!cachedManifest) {
    cachedManifest = parseTrailsManifest(trailsManifestJson);
  }
  return cachedManifest;
}

export function getAllTrails(): TrailDefinition[] {
  return getTrailsManifest().trails;
}

export function getPublishedTrails(): TrailDefinition[] {
  return getAllTrails().filter((t) => t.status === "published");
}

export function getUpcomingTrails(): TrailDefinition[] {
  return getAllTrails().filter((t) => t.status === "upcoming");
}

export function getBrowsableTrails(): TrailDefinition[] {
  return getAllTrails().filter((t) => t.status === "published" || t.status === "upcoming");
}

export function getTrailBySlug(slug: string): TrailDefinition | undefined {
  return getAllTrails().find((t) => t.slug === slug);
}

export function getFeaturedTrails(limit = 4): TrailDefinition[] {
  return getPublishedTrails()
    .filter((t) => t.featured)
    .sort((a, b) => (a.featuredRank ?? 999) - (b.featuredRank ?? 999))
    .slice(0, limit);
}

/** Group published trails by theme label (trails may appear in multiple groups). */
export function groupTrailsByTheme(
  trails: TrailDefinition[],
): { theme: string; trails: TrailDefinition[] }[] {
  const themeMap = new Map<string, TrailDefinition[]>();
  for (const trail of trails) {
    for (const theme of trail.themes) {
      const bucket = themeMap.get(theme) ?? [];
      bucket.push(trail);
      themeMap.set(theme, bucket);
    }
  }
  return [...themeMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([theme, grouped]) => ({ theme, trails: grouped }));
}

export function getTrailSitemapSlugs(): string[] {
  return getPublishedTrails().map((t) => t.slug);
}

export function getTrailSearchBridges() {
  return getTrailsManifest().searchBridges ?? [];
}

export function slugifyTheme(theme: string): string {
  return theme
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
