import type { SearchEntityType } from "@/lib/search/types";

export const SEARCH_PAGE_SIZE = 24;

export const SEARCH_ENTITY_TYPES: readonly SearchEntityType[] = [
  "book",
  "concept",
  "pattern",
  "thinker",
  "source",
  "podcast_episode",
] as const;

const TYPE_SET = new Set<string>(SEARCH_ENTITY_TYPES);

export type SearchUrlState = {
  q: string;
  types: SearchEntityType[];
  page: number;
};

/** Parse `type` query param: comma-separated entity types. */
export function parseSearchTypes(raw: string | undefined | null): SearchEntityType[] {
  if (!raw?.trim()) return [];
  const out: SearchEntityType[] = [];
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (TYPE_SET.has(trimmed) && !out.includes(trimmed as SearchEntityType)) {
      out.push(trimmed as SearchEntityType);
    }
  }
  return out;
}

export function parseSearchPage(raw: string | undefined | null): number {
  if (raw == null || raw.trim() === "") return 1;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function parseSearchUrlState(input: {
  q?: string | null;
  type?: string | null;
  page?: string | null;
}): SearchUrlState {
  return {
    q: typeof input.q === "string" ? input.q.trim() : "",
    types: parseSearchTypes(input.type),
    page: parseSearchPage(input.page),
  };
}

/** Build `?q=&type=&page=`, omitting defaults. */
export function searchBrowseQueryString(state: {
  q: string;
  types?: readonly SearchEntityType[];
  page?: number;
}): string {
  const params = new URLSearchParams();
  const trimmed = state.q.trim();
  if (trimmed) params.set("q", trimmed);
  if (state.types && state.types.length > 0) {
    params.set("type", state.types.join(","));
  }
  if (state.page && state.page > 1) {
    params.set("page", String(state.page));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function queryLengthBucket(query: string): string {
  const len = query.trim().length;
  if (len === 0) return "0";
  if (len <= 10) return "1-10";
  if (len <= 30) return "11-30";
  if (len <= 80) return "31-80";
  return "81+";
}

export function resultCountBucket(count: number): string {
  if (count <= 0) return "0";
  if (count <= 3) return "1-3";
  if (count <= 10) return "4-10";
  if (count <= 24) return "11-24";
  return "25+";
}

export function rankBucket(rank: number): string {
  if (rank <= 1) return "1";
  if (rank <= 3) return "2-3";
  if (rank <= 8) return "4-8";
  if (rank <= 24) return "9-24";
  return "25+";
}
