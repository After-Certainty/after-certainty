import type { EnrichedPathStop } from "@/types/paths";

export type TrailStatus = "draft" | "published" | "upcoming" | "archived";

export type TrailDepth = "introductory" | "intermediate" | "deep";

export type TrailDefinition = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  orientation: string;
  status: TrailStatus;
  featured?: boolean;
  featuredRank?: number;
  themes: string[];
  audience?: string;
  depth?: TrailDepth;
  primaryBookId?: string;
  pathStops: import("@/types/paths").PathStopInput[];
  closingReflection: string;
  suggestedContinuation?: string;
  relatedTrailIds?: string[];
  createdDate?: string;
  updatedDate?: string;
  reviewNotes?: string;
};

export type TrailsManifest = {
  manifestVersion: number;
  updatedAt?: string;
  trails: TrailDefinition[];
};

export type EnrichedTrail = TrailDefinition & {
  pathStopsEnriched: EnrichedPathStop[];
  totalEstimatedMinutes: number;
  primaryBookTitle?: string;
  primaryBookHref?: string;
  primaryBookCover?: string;
};
