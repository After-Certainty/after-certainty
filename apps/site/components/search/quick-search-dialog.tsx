"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import { useSearchIndex } from "@/components/search/use-search-index";
import {
  trackSearchExpand,
  trackSearchNoResults,
  trackSearchQuery,
  trackSearchSelect,
} from "@/lib/analytics/track";
import { searchWithIndex, type SearchHit } from "@/lib/search/query";
import {
  clearRecentSearches,
  getRecentSearches,
  pushRecentSearch,
} from "@/lib/search/recentSearches";
import {
  queryLengthBucket,
  rankBucket,
  resultCountBucket,
  searchBrowseQueryString,
} from "@/lib/search/urlState";

const RESULT_LIMIT = 8;

type QuickSearchDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Element to restore focus to when the dialog closes. */
  restoreFocusRef?: RefObject<HTMLElement | null>;
};

type QuickSearchPanelProps = {
  onClose: () => void;
};

function QuickSearchPanel({ onClose }: QuickSearchPanelProps) {
  const router = useRouter();
  const indexState = useSearchIndex({ enabled: true });
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listId = useId();
  const statusId = useId();
  const trackedQuery = useRef("");

  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(() => getRecentSearches());
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hits: SearchHit[] = useMemo(() => {
    if (indexState.status !== "ready" || !query.trim()) return [];
    return searchWithIndex(indexState.engine, query, {
      limit: RESULT_LIMIT,
      aliasConfig: indexState.payload.aliasConfig,
    });
  }, [indexState, query]);

  useEffect(() => {
    if (indexState.status !== "ready") return;
    const q = query.trim();
    if (!q) return;
    if (trackedQuery.current === q) return;
    trackedQuery.current = q;
    trackSearchQuery({
      surface: "quick",
      has_results: hits.length > 0,
      result_count_bucket: resultCountBucket(hits.length),
      query_length_bucket: queryLengthBucket(q),
    });
    if (hits.length === 0) {
      trackSearchNoResults({
        surface: "quick",
        query_length_bucket: queryLengthBucket(q),
      });
    }
  }, [indexState.status, query, hits.length]);

  const showingRecent = !query.trim() && recent.length > 0;
  const optionCount = showingRecent ? recent.length : hits.length;

  function close() {
    onClose();
  }

  function goToFullResults(q: string) {
    const trimmed = q.trim();
    if (trimmed) {
      setRecent(pushRecentSearch(trimmed));
    }
    trackSearchExpand();
    close();
    router.push(`/search${searchBrowseQueryString({ q: trimmed })}`);
  }

  function selectHit(hit: SearchHit, rank: number) {
    setRecent(pushRecentSearch(query.trim() || hit.document.title));
    trackSearchSelect({
      content_type: hit.document.entityType,
      item_id: hit.document.id,
      surface: "quick",
      rank_bucket: rankBucket(rank),
    });
    close();
    if (hit.document.external) {
      window.open(hit.document.canonicalUrl, "_blank", "noopener,noreferrer");
    } else {
      router.push(hit.document.canonicalUrl);
    }
  }

  function selectRecent(term: string) {
    setQuery(term);
    setActiveIndex(0);
    setRecent(pushRecentSearch(term));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (showingRecent && recent[activeIndex]) {
      selectRecent(recent[activeIndex]!);
      return;
    }
    if (hits[activeIndex]) {
      selectHit(hits[activeIndex]!, activeIndex + 1);
      return;
    }
    goToFullResults(query);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (optionCount === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % optionCount);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? optionCount - 1 : i - 1));
    }
  }

  function onPanelKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const statusMessage =
    indexState.status === "loading" || indexState.status === "idle"
      ? "Loading search…"
      : indexState.status === "error"
        ? "Search unavailable"
        : !query.trim()
          ? showingRecent
            ? "Recent searches"
            : "Type to search the commons"
          : hits.length === 0
            ? "No quick results"
            : `${hits.length} top result${hits.length === 1 ? "" : "s"}`;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[600] bg-bg/80 backdrop-blur-sm motion-reduce:backdrop-blur-none"
        aria-label="Close search"
        onClick={close}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Quick search"
        className="fixed inset-0 z-[601] flex items-start justify-center overflow-y-auto p-0 md:items-start md:px-6 md:pt-[min(20vh,8rem)]"
        onKeyDown={onPanelKeyDown}
      >
        <div className="flex min-h-full w-full flex-col border-border/60 bg-bg shadow-2xl md:min-h-0 md:max-w-xl md:rounded-sm md:border">
          <form role="search" className="border-b border-border/50 p-4" onSubmit={onSubmit}>
            <div className="flex items-center gap-3">
              <label htmlFor={inputId} className="sr-only">
                Quick search
              </label>
              <input
                ref={inputRef}
                id={inputId}
                type="search"
                value={query}
                placeholder="Search books, concepts, patterns…"
                autoComplete="off"
                aria-controls={listId}
                aria-describedby={statusId}
                aria-autocomplete="list"
                className="min-h-12 w-full flex-1 rounded-sm border border-border/80 bg-bg-elevated px-4 py-3 text-base text-fg placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:text-sm"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onKeyDown}
              />
              <button
                type="button"
                className="min-h-11 shrink-0 rounded-sm border border-border/70 px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={close}
              >
                Esc
              </button>
            </div>
            <p id={statusId} className="mt-3 text-xs text-muted" aria-live="polite">
              {statusMessage}
            </p>
          </form>

          <div className="flex-1 overflow-y-auto px-2 py-2 md:max-h-[min(60vh,28rem)]">
            {indexState.status === "error" ? (
              <p className="px-3 py-4 text-sm text-muted">
                Could not load search.{" "}
                <Link
                  href="/search"
                  className="text-accent underline-offset-4 hover:underline"
                  onClick={close}
                >
                  Open full search
                </Link>
              </p>
            ) : null}

            {showingRecent ? (
              <div>
                <div className="flex items-center justify-between px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-muted">Recent</p>
                  <button
                    type="button"
                    className="text-[10px] uppercase tracking-[0.18em] text-muted underline-offset-4 hover:text-fg hover:underline"
                    onClick={() => {
                      clearRecentSearches();
                      setRecent([]);
                    }}
                  >
                    Clear
                  </button>
                </div>
                <ul id={listId} role="listbox" aria-label="Recent searches">
                  {recent.map((term, index) => (
                    <li key={term} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={index === activeIndex}
                        className={`flex min-h-11 w-full items-center px-3 py-2.5 text-left text-sm transition-colors ${
                          index === activeIndex
                            ? "bg-accent-soft text-accent"
                            : "text-fg hover:bg-accent-soft/40"
                        }`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectRecent(term)}
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {query.trim() && hits.length > 0 ? (
              <ul id={listId} role="listbox" aria-label="Top search results">
                {hits.map((hit, index) => (
                  <li key={hit.document.id} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === activeIndex}
                      className={`flex min-h-12 w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-colors ${
                        index === activeIndex
                          ? "bg-accent-soft text-accent"
                          : "text-fg hover:bg-accent-soft/40"
                      }`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectHit(hit, index + 1)}
                    >
                      <span className="text-[10px] uppercase tracking-[0.22em] text-muted">
                        {hit.document.resultLabel}
                        {hit.document.external ? " · External" : ""}
                      </span>
                      <span className="text-sm font-medium">{hit.document.title}</span>
                      {hit.explanations[0] ? (
                        <span className="text-xs text-muted">{hit.explanations[0]}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {query.trim() && indexState.status === "ready" && hits.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted">
                No top matches. Try the full results page for a broader scan.
              </p>
            ) : null}
          </div>

          <div className="border-t border-border/50 p-3">
            <button
              type="button"
              className="flex min-h-11 w-full items-center justify-between rounded-sm border border-border/70 px-3 py-2 text-left text-xs uppercase tracking-[0.18em] text-fg transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => goToFullResults(query)}
            >
              <span>{query.trim() ? "View all results" : "Open full search"}</span>
              <span className="text-muted">↵</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function QuickSearchDialog({ open, onClose, restoreFocusRef }: QuickSearchDialogProps) {
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      return;
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      restoreFocusRef?.current?.focus();
    }
  }, [open, restoreFocusRef]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(<QuickSearchPanel onClose={onClose} />, document.body);
}
