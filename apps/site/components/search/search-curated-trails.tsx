"use client";

import { useMemo } from "react";

import { CuratedTrailsCallout } from "@/components/search/curated-trails-callout";
import { matchTrailsForSearchQuery } from "@/lib/trails/enrichTrails";
import type { EnrichedTrail, TrailSearchBridge } from "@/types/trails";

type SearchCuratedTrailsProps = {
  query: string;
  enrichedTrails: EnrichedTrail[];
  searchBridges: TrailSearchBridge[];
};

export function SearchCuratedTrails({
  query,
  enrichedTrails,
  searchBridges,
}: SearchCuratedTrailsProps) {
  const matched = useMemo(() => {
    const manifest = {
      trails: enrichedTrails,
      searchBridges,
    };
    const ids = new Set(matchTrailsForSearchQuery(query, manifest, 2).map((t) => t.id));
    return enrichedTrails.filter((t) => ids.has(t.id));
  }, [query, enrichedTrails, searchBridges]);

  return <CuratedTrailsCallout trails={matched} />;
}
