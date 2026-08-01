import type { Metadata } from "next";

import {
  EXPLORE_EDGE_PARAM,
  EXPLORE_PATHWAY_KIND_PARAM,
  EXPLORE_PATHWAY_SLUG_PARAM,
  EXPLORE_PATHWAY_STEP_PARAM,
  EXPLORE_REL_PRESET_PARAM,
  EXPLORE_VIEW_OBSERVATORY,
  explorePaths,
} from "@/lib/graph/explorePaths";
import { isValidExploreFocusKind } from "@/lib/explore/resolveExploreFocus";
import { createPageMetadata } from "@/lib/metadata";
import type { GraphEntityKind } from "@/types/semanticGraph";

const EXPLORE_DESCRIPTION =
  "A semantic observatory for the After Certainty graph — traverse concepts, patterns, books, and thinkers as a calm, navigable landscape.";

/** Query keys that encode observatory / pathway UI state (must not create indexable URL variants). */
export const EXPLORE_UI_STATE_PARAMS = [
  "focusKind",
  "focusSlug",
  "view",
  EXPLORE_EDGE_PARAM,
  EXPLORE_PATHWAY_KIND_PARAM,
  EXPLORE_PATHWAY_SLUG_PARAM,
  EXPLORE_PATHWAY_STEP_PARAM,
  EXPLORE_REL_PRESET_PARAM,
] as const;

export type ExploreSearchParamsInput = {
  focusKind?: string;
  focusSlug?: string;
  view?: string;
  pathwayKind?: string;
  pathwaySlug?: string;
  pathwayStep?: string;
  edge?: string;
  relPreset?: string;
  [key: string]: string | undefined;
};

export function exploreHasUiStateParams(sp: ExploreSearchParamsInput): boolean {
  for (const key of EXPLORE_UI_STATE_PARAMS) {
    const value = sp[key];
    if (typeof value === "string" && value.trim() !== "") return true;
  }
  // Also treat view=observatory even if other keys missing
  if (sp.view === EXPLORE_VIEW_OBSERVATORY) return true;
  return false;
}

/** Map focus kind + slug to the canonical entity detail path (unverified existence). */
export function exploreCanonicalPathForFocus(
  kind: GraphEntityKind,
  slug: string,
): string {
  const trimmed = slug.trim();
  switch (kind) {
    case "concept":
      return `${explorePaths.concepts}/${trimmed}`;
    case "pattern":
      return `${explorePaths.patterns}/${trimmed}`;
    case "situation":
      return `${explorePaths.situations}/${trimmed}`;
    case "book":
      return `${explorePaths.books}/${trimmed}`;
    case "source":
      return `${explorePaths.sources}/${trimmed}`;
    case "thinker":
      return `${explorePaths.thinkers}/${trimmed}`;
    case "force":
      return `${explorePaths.patterns}?force=${encodeURIComponent(trimmed)}`;
  }
}

/**
 * Canonical path for an Explore request: entity detail when focus resolves, else `/explore`.
 */
export function resolveExploreCanonicalPath(sp: ExploreSearchParamsInput): string {
  const fk = sp.focusKind;
  const fs = sp.focusSlug;
  if (typeof fk === "string" && typeof fs === "string" && isValidExploreFocusKind(fk) && fs.trim()) {
    return exploreCanonicalPathForFocus(fk, fs);
  }
  return explorePaths.home;
}

/** Metadata for `/explore` — noindex UI-state query variants; canonicalize to entity or hub. */
export function buildExplorePageMetadata(sp: ExploreSearchParamsInput = {}): Metadata {
  const canonical = resolveExploreCanonicalPath(sp);
  const hasUiState = exploreHasUiStateParams(sp);

  return createPageMetadata({
    title: "Explore",
    description: EXPLORE_DESCRIPTION,
    alternates: { canonical },
    robots: hasUiState ? { index: false, follow: true } : { index: true, follow: true },
  });
}
