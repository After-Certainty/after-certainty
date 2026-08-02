"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { trapFocusKeydown } from "@/lib/a11y/focus-trap";
import type { ChapterReadingNavigation } from "@/lib/reading/chapter-navigation";

export type ChapterTocListProps = {
  navigation: ChapterReadingNavigation;
  /** Called after navigating to a chapter (e.g. close drawer). */
  onNavigate?: () => void;
  /** Compact spacing for drawer panels. */
  compact?: boolean;
  /** Show 1-based chapter numbers (no fabricated page counts). */
  showNumbers?: boolean;
};

/**
 * Shared part/chapter TOC list used by inline and drawer surfaces (READ-004/015).
 */
export function ChapterTocList({
  navigation,
  onNavigate,
  compact = false,
  showNumbers = false,
}: ChapterTocListProps) {
  const { parts, current, chapters } = navigation;
  const longBook = chapters.length > 24 || parts.length > 4;
  const indexById = new Map(chapters.map((chapter, index) => [chapter.id, index + 1]));

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {parts.map((part, partIndex) => {
        const heading =
          part.title?.trim() || (parts.length === 1 ? "Chapters" : `Part ${part.position}`);
        const containsCurrent = part.chapters.some((chapter) => chapter.id === current.id);
        const defaultOpen = containsCurrent || partIndex === 0 || !longBook;

        return (
          <details
            key={part.id}
            className="group/part border-t border-border/20 pt-3 first:border-t-0 first:pt-0"
            open={defaultOpen}
          >
            <summary className="cursor-pointer list-none text-sm font-medium text-fg marker:content-none [&::-webkit-details-marker]:hidden">
              {heading}
            </summary>
            <ol className="mt-3 space-y-2 border-l border-border/30 pl-4">
              {part.chapters.map((chapter) => {
                const isCurrent = chapter.id === current.id;
                const number = indexById.get(chapter.id);
                const label = (
                  <span className="flex items-baseline gap-3">
                    {showNumbers && typeof number === "number" ? (
                      <span className="w-5 shrink-0 tabular-nums text-accent" aria-hidden>
                        {number}
                      </span>
                    ) : null}
                    <span className="min-w-0">{chapter.title}</span>
                  </span>
                );
                return (
                  <li key={chapter.id}>
                    {isCurrent ? (
                      <span aria-current="page" className="block text-sm leading-snug text-accent">
                        {label}
                      </span>
                    ) : (
                      <Link
                        href={chapter.href}
                        className="block text-sm leading-snug text-muted transition-colors hover:text-fg"
                        onClick={onNavigate}
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </details>
        );
      })}
    </div>
  );
}

export type ChapterTocProps = {
  navigation: ChapterReadingNavigation;
};

/**
 * In-reader table of contents (READ-004) with mobile drawer (READ-015).
 * Desktop: progressive disclosure. Mobile: Contents button opens a dialog drawer.
 * Phase E: focus trap + restore focus to the Contents trigger on close.
 */
export function ChapterToc({ navigation }: ChapterTocProps) {
  const { chapters } = navigation;
  if (chapters.length <= 1) return null;

  return (
    <>
      <nav aria-label="Table of contents" className="mb-10 hidden md:block">
        <details className="group border border-border/40 bg-bg-elevated/20 open:pb-2">
          <summary className="cursor-pointer list-none px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-muted marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-3">
              <span>In this book</span>
              <span className="text-fg/70 normal-case tracking-normal">
                {chapters.length} sections
                <span aria-hidden className="ml-2 text-muted group-open:hidden">
                  +
                </span>
                <span aria-hidden className="ml-2 hidden text-muted group-open:inline">
                  −
                </span>
              </span>
            </span>
          </summary>

          <div className="border-t border-border/30 px-4 py-4">
            <ChapterTocList navigation={navigation} />
          </div>
        </details>
      </nav>

      <ChapterTocDrawer navigation={navigation} />
    </>
  );
}

type ChapterTocDrawerProps = {
  navigation: ChapterReadingNavigation;
};

function ChapterTocDrawer({ navigation }: ChapterTocDrawerProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const { chapters } = navigation;

  useLayoutEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
      return () => {
        document.body.style.overflow = prev;
      };
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus();
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      trapFocusKeydown(e, panelRef.current);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="mb-8 md:hidden">
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex h-11 w-full items-center justify-between rounded-sm border border-border/60 bg-bg-elevated/30 px-4 text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:border-accent/50 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        data-testid="chapter-toc-drawer-open"
        onClick={() => setOpen(true)}
      >
        <span>Contents</span>
        <span className="normal-case tracking-normal text-fg/70">{chapters.length} sections</span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[500] bg-bg/75 backdrop-blur-sm motion-reduce:backdrop-blur-none"
              aria-label="Close contents"
              onClick={close}
            />
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Table of contents"
              data-testid="chapter-toc-drawer"
              className="fixed inset-y-0 right-0 z-[501] flex w-[min(100vw-2rem,22rem)] flex-col border-l border-border/60 bg-bg shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
                <span className="text-xs uppercase tracking-[0.22em] text-muted">Contents</span>
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="min-h-11 rounded-sm px-2 py-1 text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  onClick={close}
                >
                  Close
                </button>
              </div>
              <nav aria-label="Table of contents" className="flex-1 overflow-y-auto px-5 py-4">
                <ChapterTocList navigation={navigation} onNavigate={close} compact />
              </nav>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
