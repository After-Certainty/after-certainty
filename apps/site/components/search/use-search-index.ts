"use client";

import { useEffect, useState } from "react";

import type { SearchIndexPayload } from "@/lib/search/indexPayload";
import { createSearchEngine, type SearchEngine } from "@/lib/search/miniSearch";

type SearchIndexState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; engine: SearchEngine; payload: SearchIndexPayload }
  | { status: "error"; message: string };

let cachedPayload: SearchIndexPayload | null = null;
let cachedEngine: SearchEngine | null = null;
let inflight: Promise<SearchIndexPayload> | null = null;

function readyState(): Extract<SearchIndexState, { status: "ready" }> | null {
  if (cachedEngine && cachedPayload) {
    return { status: "ready", engine: cachedEngine, payload: cachedPayload };
  }
  return null;
}

async function fetchSearchIndexPayload(): Promise<SearchIndexPayload> {
  if (cachedPayload) return cachedPayload;
  if (!inflight) {
    inflight = fetch("/api/search/index")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Search index unavailable (${res.status})`);
        }
        return (await res.json()) as SearchIndexPayload;
      })
      .then((payload) => {
        cachedPayload = payload;
        return payload;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export type UseSearchIndexOptions = {
  /** When false, skip fetching until enabled (used by quick search). Default true. */
  enabled?: boolean;
};

/** Lazy-load and memoize the public search index for client MiniSearch. */
export function useSearchIndex(options: UseSearchIndexOptions = {}): SearchIndexState {
  const enabled = options.enabled ?? true;
  const [state, setState] = useState<SearchIndexState>(() => {
    const ready = readyState();
    if (ready) return ready;
    return enabled ? { status: "loading" } : { status: "idle" };
  });

  const cached = readyState();
  if (enabled && cached && state.status !== "ready") {
    setState(cached);
  } else if (enabled && !cached && state.status === "idle") {
    setState({ status: "loading" });
  }

  useEffect(() => {
    if (!enabled) return;
    if (readyState()) return;

    let cancelled = false;

    fetchSearchIndexPayload()
      .then((payload) => {
        if (cancelled) return;
        const engine = createSearchEngine(payload.documents);
        cachedEngine = engine;
        setState({ status: "ready", engine, payload });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Search index unavailable",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
}

/** Test helper — clear module-level index cache. */
export function resetSearchIndexCacheForTests(): void {
  cachedPayload = null;
  cachedEngine = null;
  inflight = null;
}
