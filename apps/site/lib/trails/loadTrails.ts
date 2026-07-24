import pathSearchBridgesJson from "@/data/path-search-bridges.json";
import { trailsFromGraph } from "@/lib/graph/discovery";
import { loadInstalledSemanticGraphSync } from "@/lib/graph/installed-manifest";
import type { ParsedTrailsManifest } from "@/lib/trails/schema";
import type { TrailDefinition, TrailSearchBridge } from "@/types/trails";
import type { SemanticGraph } from "@/types/semanticGraph";

type PathSearchBridgesFile = {
  trailBridges?: TrailSearchBridge[];
};

function siteTrailBridges(): TrailSearchBridge[] {
  const data = pathSearchBridgesJson as PathSearchBridgesFile;
  return data.trailBridges ?? [];
}

export function getTrailsFromGraph(graph: SemanticGraph): TrailDefinition[] {
  return trailsFromGraph(graph);
}

export function getTrailsManifest(graph?: SemanticGraph): ParsedTrailsManifest {
  return {
    manifestVersion: 1,
    trails: getAllTrails(graph),
    searchBridges: siteTrailBridges(),
  };
}

export function getAllTrails(graph?: SemanticGraph): TrailDefinition[] {
  return trailsFromGraph(graph ?? loadInstalledSemanticGraphSync());
}

export function getPublishedTrails(graph?: SemanticGraph): TrailDefinition[] {
  return getAllTrails(graph).filter((t) => t.status === "published");
}

export function getUpcomingTrails(graph?: SemanticGraph): TrailDefinition[] {
  return getAllTrails(graph).filter((t) => t.status === "upcoming");
}

export function getBrowsableTrails(graph?: SemanticGraph): TrailDefinition[] {
  return getAllTrails(graph).filter((t) => t.status === "published" || t.status === "upcoming");
}

export function getTrailBySlug(slug: string, graph?: SemanticGraph): TrailDefinition | undefined {
  return getAllTrails(graph).find((t) => t.slug === slug);
}

export function getFeaturedTrails(limit = 4, graph?: SemanticGraph): TrailDefinition[] {
  return getPublishedTrails(graph)
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

export function getTrailSearchBridges() {
  return siteTrailBridges();
}

export function getTrailSitemapSlugs(graph?: SemanticGraph): string[] {
  return getPublishedTrails(graph).map((t) => t.slug);
}

export function slugifyTheme(theme: string): string {
  return theme
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
