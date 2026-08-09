"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import { Container } from "@/components/ui/container";
import {
  resolveContinueReadingTarget,
  resolveContinueReadingTargets,
  type ContinueReadingCatalog,
} from "@/lib/reading/continueReading";
import {
  clearReadingProgress,
  getReadingProgress,
  listReadingProgress,
} from "@/lib/reading/readingProgress";

const START_LIMIT = 3;

function subscribeNoop() {
  return () => {};
}

/** True after hydration — localStorage is only meaningful on the client. */
function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

type ContinueReadingForBookProps = {
  editionId: string;
  catalog: ContinueReadingCatalog;
};

function progressKeysForEdition(editionId: string, catalog: ContinueReadingCatalog): string[] {
  const keys = new Set<string>([editionId]);
  const edition = catalog[editionId];
  if (edition?.editionId) keys.add(edition.editionId);
  return [...keys];
}

/**
 * Book overview / detail continue CTA (READ-012). Renders only with valid local progress.
 */
export function ContinueReadingForBook({ editionId, catalog }: ContinueReadingForBookProps) {
  const isClient = useIsClient();
  const [epoch, setEpoch] = useState(0);

  if (!isClient) return null;

  void epoch;
  let entry = null;
  for (const key of progressKeysForEdition(editionId, catalog)) {
    entry = getReadingProgress(key);
    if (entry) break;
  }
  const target = entry ? resolveContinueReadingTarget(entry, catalog) : null;
  if (!target) return null;

  return (
    <div
      className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-sm border border-border/50 bg-bg-elevated/30 px-4 py-3 text-sm text-muted"
      data-testid="continue-reading-book"
    >
      <p>
        Continue reading <span className="text-fg/90">{target.chapterTitle}</span>
      </p>
      <Link
        href={target.href}
        className="text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Resume chapter
      </Link>
      <button
        type="button"
        className="text-xs uppercase tracking-[0.18em] text-muted underline-offset-4 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        onClick={() => {
          for (const key of progressKeysForEdition(editionId, catalog)) {
            clearReadingProgress(key);
          }
          setEpoch((value) => value + 1);
        }}
      >
        Clear progress
      </button>
    </div>
  );
}

type ContinueReadingStartSectionProps = {
  catalog: ContinueReadingCatalog;
};

/**
 * Start Here continue-reading block (READ-012). Hidden when no valid local progress.
 */
export function ContinueReadingStartSection({ catalog }: ContinueReadingStartSectionProps) {
  const isClient = useIsClient();
  const [epoch, setEpoch] = useState(0);

  if (!isClient) return null;

  void epoch;
  const targets = resolveContinueReadingTargets(listReadingProgress(), catalog, START_LIMIT);
  if (!targets.length) return null;

  return (
    <section
      className="border-b border-border/35 bg-bg-elevated/[0.08] py-6 md:py-12"
      aria-labelledby="continue-reading-heading"
      data-testid="continue-reading-start"
    >
      <Container>
        <h2
          id="continue-reading-heading"
          className="font-display text-xl font-medium tracking-tight text-fg md:text-3xl"
        >
          Continue reading
        </h2>
        <ul className="mt-4 space-y-3 md:mt-8 md:space-y-4">
          {targets.map((target) => (
            <li
              key={target.editionId}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-sm border border-border/50 bg-bg/40 px-4 py-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-fg">{target.bookTitle}</p>
                <p className="mt-0.5 text-muted">{target.chapterTitle}</p>
              </div>
              <Link
                href={target.href}
                className="text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Resume
              </Link>
              <button
                type="button"
                className="text-xs uppercase tracking-[0.18em] text-muted underline-offset-4 hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={() => {
                  clearReadingProgress(target.editionId);
                  setEpoch((value) => value + 1);
                }}
              >
                Clear
              </button>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
