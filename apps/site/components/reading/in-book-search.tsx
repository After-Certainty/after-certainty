"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

import { useSearchIndex } from "@/components/search/use-search-index";
import { trapFocusKeydown } from "@/lib/a11y/focus-trap";
import { trackSearchNoResults, trackSearchQuery, trackSearchSelect } from "@/lib/analytics/track";
import { searchWithinBook, type SearchHit } from "@/lib/search/query";
import { snippetSegments } from "@/lib/search/snippets";
import { queryLengthBucket, rankBucket, resultCountBucket } from "@/lib/search/urlState";

const RESULT_LIMIT = 12;

export type InBookSearchProps = {
  /** Edition id used for chapter `bookIds` filter. */
  editionId: string;
  bookTitle: string;
  /** Compact trigger for reader chrome; overview uses a slightly wider control. */
  variant?: "reader" | "readerCompact" | "overview";
};

/**
 * Edition-scoped chapter search (READ-016) — titles, summaries, and aliases.
 * Reuses the global MiniSearch index with a bookIds filter (no manuscript body).
 */
export function InBookSearch({ editionId, bookTitle, variant = "reader" }: InBookSearchProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  const triggerClass =
    variant === "overview"
      ? "inline-flex h-10 items-center gap-2 rounded-sm border border-border/60 bg-bg-elevated/30 px-4 text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:border-accent/50 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      : variant === "readerCompact"
        ? "flex min-h-11 w-full items-center justify-between rounded-sm border border-border/50 px-3 text-left text-sm text-fg transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        : "inline-flex h-10 w-full items-center justify-between rounded-sm border border-border/60 bg-bg-elevated/30 px-4 text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:border-accent/50 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:w-auto md:min-w-[12rem]";

  return (
    <div className={variant === "overview" ? "mt-6" : variant === "readerCompact" ? "" : "mb-8"}>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClass}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        data-testid="in-book-search-open"
        onClick={() => setOpen(true)}
      >
        <span>Find in this book</span>
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <InBookSearchDialog
              panelId={panelId}
              editionId={editionId}
              bookTitle={bookTitle}
              onClose={close}
            />,
            document.body,
          )
        : null}
    </div>
  );
}

type InBookSearchDialogProps = {
  panelId: string;
  editionId: string;
  bookTitle: string;
  onClose: () => void;
};

function InBookSearchDialog({ panelId, editionId, bookTitle, onClose }: InBookSearchDialogProps) {
  const router = useRouter();
  const indexState = useSearchIndex({ enabled: true });
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listId = useId();
  const statusId = useId();
  const trackedQuery = useRef("");

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      trapFocusKeydown(e, panelRef.current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const hits: SearchHit[] = useMemo(() => {
    if (indexState.status !== "ready" || !query.trim()) return [];
    return searchWithinBook(indexState.engine, query, editionId, {
      limit: RESULT_LIMIT,
      aliasConfig: indexState.payload.aliasConfig,
    });
  }, [indexState, query, editionId]);

  useEffect(() => {
    if (indexState.status !== "ready") return;
    const q = query.trim();
    if (!q) return;
    if (trackedQuery.current === q) return;
    trackedQuery.current = q;
    trackSearchQuery({
      surface: "in_book",
      has_results: hits.length > 0,
      result_count_bucket: resultCountBucket(hits.length),
      query_length_bucket: queryLengthBucket(q),
    });
    if (hits.length === 0) {
      trackSearchNoResults({
        surface: "in_book",
        query_length_bucket: queryLengthBucket(q),
      });
    }
  }, [indexState.status, query, hits.length]);

  const safeActiveIndex = hits.length === 0 ? 0 : Math.min(activeIndex, hits.length - 1);

  function selectHit(hit: SearchHit, rank: number) {
    trackSearchSelect({
      content_type: hit.document.entityType,
      item_id: hit.document.id,
      surface: "in_book",
      rank_bucket: rankBucket(rank),
    });
    onClose();
    router.push(hit.document.canonicalUrl);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (hits[safeActiveIndex]) {
      selectHit(hits[safeActiveIndex]!, safeActiveIndex + 1);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (hits.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(hits.length - 1, Math.min(i, hits.length - 1) + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, Math.min(i, hits.length - 1) - 1));
    }
  }

  const trimmed = query.trim();
  const statusMessage =
    indexState.status === "loading"
      ? "Loading search…"
      : indexState.status === "error"
        ? "Search is temporarily unavailable."
        : !trimmed
          ? `Search chapter titles and summaries in ${bookTitle}.`
          : hits.length === 0
            ? "No chapters match in this book."
            : `${hits.length} chapter${hits.length === 1 ? "" : "s"}`;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[500] bg-bg/75 backdrop-blur-sm motion-reduce:backdrop-blur-none"
        aria-label="Close find in this book"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label={`Find in ${bookTitle}`}
        data-testid="in-book-search-dialog"
        className="fixed inset-x-4 top-[12vh] z-[501] mx-auto flex max-h-[76vh] w-full max-w-lg flex-col overflow-hidden rounded-sm border border-border/60 bg-bg shadow-2xl sm:inset-x-auto"
      >
        <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
          <span className="text-xs uppercase tracking-[0.22em] text-muted">Find in this book</span>
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form className="border-b border-border/30 px-5 py-4" onSubmit={onSubmit}>
          <label htmlFor={inputId} className="sr-only">
            Search chapters in {bookTitle}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck={false}
            placeholder="Chapter titles and summaries…"
            className="w-full rounded-sm border border-border/60 bg-bg-elevated/40 px-3 py-2.5 text-sm text-fg placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              hits[safeActiveIndex] ? `${listId}-option-${safeActiveIndex}` : undefined
            }
            data-testid="in-book-search-input"
          />
          <p id={statusId} className="mt-2 text-xs text-muted" aria-live="polite">
            {statusMessage}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted/80">
            Matches titles and summaries — not the full chapter text.
          </p>
        </form>

        <ul
          id={listId}
          role="listbox"
          aria-label="Chapter results"
          className="flex-1 overflow-y-auto px-2 py-2"
        >
          {hits.map((hit, index) => (
            <li key={hit.document.id} role="presentation">
              <InBookSearchResult
                id={`${listId}-option-${index}`}
                hit={hit}
                active={index === safeActiveIndex}
                onSelect={() => selectHit(hit, index + 1)}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function InBookSearchResult({
  id,
  hit,
  active,
  onSelect,
}: {
  id: string;
  hit: SearchHit;
  active: boolean;
  onSelect: () => void;
}) {
  const { document } = hit;
  const segments = hit.snippet ? snippetSegments(hit.snippet) : [];

  return (
    <Link
      id={id}
      role="option"
      aria-selected={active}
      href={document.canonicalUrl}
      data-testid="in-book-search-result"
      className={`block rounded-sm px-3 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        active ? "bg-accent-soft/40" : "hover:bg-bg-elevated/50"
      }`}
      onClick={(e) => {
        e.preventDefault();
        onSelect();
      }}
    >
      <p className="font-display text-base text-fg">{document.title}</p>
      {document.contextLabel ? (
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-muted">
          {document.contextLabel}
        </p>
      ) : null}
      {segments.length > 0 ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {segments.map((segment, index) =>
            segment.highlight ? (
              <mark key={`h-${index}`} className="bg-accent-soft/80 text-fg">
                {segment.text}
              </mark>
            ) : (
              <span key={`t-${index}`}>{segment.text}</span>
            ),
          )}
        </p>
      ) : document.description ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {document.description}
        </p>
      ) : null}
    </Link>
  );
}
