"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useState, type FormEvent, type KeyboardEvent } from "react";

import {
  exploreIndexBrowseQueryString,
  filterExploreIndexItems,
  type ExploreIndexItem,
} from "@/lib/explore/explore-index-browse";

const SUGGESTION_LIMIT = 8;
const QUERY_DEBOUNCE_MS = 250;

const opaquePanelStyle = {
  backgroundColor: "var(--bg-elevated)",
  opacity: 1,
  mixBlendMode: "normal" as const,
  isolation: "isolate" as const,
};

type ExploreIndexSearchProps = {
  items: readonly ExploreIndexItem[];
  /** Initial query from the server (`?q=`). */
  initialQuery?: string;
  placeholder?: string;
  label?: string;
};

function ExploreIndexSearchInner({
  items,
  initialQuery = "",
  placeholder = "Search by name…",
  label = "Search",
}: ExploreIndexSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listboxId = useId();

  const urlQ = (searchParams.get("q") ?? initialQuery).trim();
  const [query, setQuery] = useState(initialQuery);
  const [syncedUrlQ, setSyncedUrlQ] = useState(urlQ);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Keep the input aligned with URL changes (back/forward, shared links) without
  // clobbering in-progress typing that has not been committed yet.
  if (urlQ !== syncedUrlQ) {
    setSyncedUrlQ(urlQ);
    if (query.trim() === urlQ || query.trim() === syncedUrlQ) {
      setQuery(urlQ);
    }
  }

  const suggestions =
    query.trim().length === 0
      ? []
      : filterExploreIndexItems(items, query).slice(0, SUGGESTION_LIMIT);

  const showSuggestions = open && suggestions.length > 0;

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const nextQ = query.trim();
      if (nextQ === urlQ) return;
      const qs = exploreIndexBrowseQueryString(nextQ, 1);
      router.replace(`${pathname}${qs}`, { scroll: false });
    }, QUERY_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query, pathname, router, urlQ]);

  function goToSuggestion(item: ExploreIndexItem) {
    setOpen(false);
    setActiveIndex(-1);
    router.push(item.href);
  }

  function syncQueryNow(nextRaw: string) {
    const nextQ = nextRaw.trim();
    const qs = exploreIndexBrowseQueryString(nextQ, 1);
    router.replace(`${pathname}${qs}`, { scroll: false });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setOpen(false);
    syncQueryNow(query);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp") && suggestions.length > 0) {
      setOpen(true);
      setActiveIndex(0);
      e.preventDefault();
      return;
    }
    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const item = suggestions[activeIndex];
      if (item) goToSuggestion(item);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <form className="relative max-w-xl" role="search" onSubmit={onSubmit}>
      <label
        htmlFor={`${listboxId}-input`}
        className="text-[10px] uppercase tracking-[0.28em] text-muted"
      >
        {label}
      </label>
      <input
        id={`${listboxId}-input`}
        type="search"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={showSuggestions}
        aria-activedescendant={
          activeIndex >= 0 && suggestions[activeIndex]
            ? `${listboxId}-option-${suggestions[activeIndex]!.id}`
            : undefined
        }
        role="combobox"
        className="mt-2 w-full rounded-sm border border-border/80 bg-bg-elevated px-4 py-3 text-sm text-fg placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={onKeyDown}
      />
      {showSuggestions ? (
        <ul
          id={listboxId}
          role="listbox"
          className="relative z-10 mt-1 max-h-72 w-full overflow-auto rounded-sm border border-border py-1 text-fg shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
          style={opaquePanelStyle}
        >
          {suggestions.map((item, index) => (
            <li key={item.id} role="presentation" style={opaquePanelStyle}>
              <Link
                id={`${listboxId}-option-${item.id}`}
                role="option"
                aria-selected={index === activeIndex}
                href={item.href}
                className={`block px-4 py-2.5 text-sm transition-colors ${
                  index === activeIndex ? "text-accent" : "text-fg hover:text-accent"
                }`}
                style={
                  index === activeIndex
                    ? { backgroundColor: "var(--accent-soft)", opacity: 1, mixBlendMode: "normal" }
                    : opaquePanelStyle
                }
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  setOpen(false);
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}

function ExploreIndexSearchFallback({
  initialQuery = "",
  placeholder = "Search by name…",
  label = "Search",
}: Omit<ExploreIndexSearchProps, "items">) {
  return (
    <div className="relative max-w-xl">
      <p className="text-[10px] uppercase tracking-[0.28em] text-muted">{label}</p>
      <div className="mt-2 w-full rounded-sm border border-border/80 bg-bg-elevated px-4 py-3 text-sm text-muted">
        {initialQuery || placeholder}
      </div>
    </div>
  );
}

export function ExploreIndexSearch(props: ExploreIndexSearchProps) {
  return (
    <Suspense
      fallback={
        <ExploreIndexSearchFallback
          initialQuery={props.initialQuery}
          placeholder={props.placeholder}
          label={props.label}
        />
      }
    >
      <ExploreIndexSearchInner {...props} />
    </Suspense>
  );
}
