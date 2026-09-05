"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useId, useMemo, useState } from "react";

import { exploreSecondaryButtonClass } from "@/components/explore/explore-action-buttons";
import {
  ListenSongCard,
  type ListenSongCardProps,
} from "@/components/listen/listen-song-card";
import { PersistentSunoPlayer } from "@/components/listen/persistent-suno-player";
import { explorePaths } from "@/lib/graph/explorePaths";

export type ListenLibraryItem = ListenSongCardProps;

type ListenLibraryProps = {
  items: readonly ListenLibraryItem[];
  /** Optional initial slug from `?song=` (validated against playable items). */
  initialSongSlug?: string;
};

function matchesQuery(item: ListenLibraryItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    item.title.toLowerCase().includes(q) ||
    item.shortDescription.toLowerCase().includes(q)
  );
}

function resolveInitialSlug(
  items: readonly ListenLibraryItem[],
  preferred?: string,
): string {
  if (items.length === 0) return "";
  if (preferred && items.some((item) => item.slug === preferred)) {
    return preferred;
  }
  return items[0]!.slug;
}

/**
 * Client listening library: one persistent Suno player + selectable song rows.
 *
 * Playback selection (`currentSlug`) is independent of search filtering so the
 * current player keeps working when its song is temporarily filtered out.
 */
export function ListenLibrary({ items, initialSongSlug }: ListenLibraryProps) {
  const inputId = useId();
  const statusId = useId();
  const listHeadingId = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSong = searchParams.get("song") ?? undefined;
  const [query, setQuery] = useState("");
  const [currentSlug, setCurrentSlug] = useState(() =>
    resolveInitialSlug(items, initialSongSlug ?? urlSong),
  );

  // Derive a valid selection if the item list changes (e.g. HMR) — avoid setState in effects.
  const activeSlug = useMemo(() => {
    if (items.length === 0) return "";
    if (items.some((item) => item.slug === currentSlug)) return currentSlug;
    return items[0]!.slug;
  }, [items, currentSlug]);

  const syncSongParam = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) {
        params.set("song", slug);
      } else {
        params.delete("song");
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const selectSong = useCallback(
    (slug: string) => {
      if (!items.some((item) => item.slug === slug)) return;
      setCurrentSlug(slug);
      syncSongParam(slug);
    },
    [items, syncSongParam],
  );

  const currentIndex = useMemo(
    () => items.findIndex((item) => item.slug === activeSlug),
    [items, activeSlug],
  );
  const currentItem = currentIndex >= 0 ? items[currentIndex] : items[0];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < items.length - 1;

  const filtered = useMemo(
    () => items.filter((item) => matchesQuery(item, query)),
    [items, query],
  );

  const trimmed = query.trim();
  const empty = filtered.length === 0;

  if (!currentItem) {
    return (
      <p className="text-muted">No playable songs are published in the manifest yet.</p>
    );
  }

  const player = (
    <div className="sticky top-16 z-30 lg:top-20">
      <PersistentSunoPlayer
        song={{
          slug: currentItem.slug,
          title: currentItem.title,
          recordingExternalId: currentItem.recordingExternalId,
          ...(currentItem.versionTitle ? { versionTitle: currentItem.versionTitle } : {}),
        }}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPrevious={() => {
          if (!hasPrevious) return;
          selectSong(items[currentIndex - 1]!.slug);
        }}
        onNext={() => {
          if (!hasNext) return;
          selectSong(items[currentIndex + 1]!.slug);
        }}
      />
    </div>
  );

  const songList = (
    <div className="space-y-3 md:space-y-4">
      <h2
        id={listHeadingId}
        className="font-display text-lg font-medium tracking-tight text-fg md:text-xl"
      >
        Songs
      </h2>

      <p id={statusId} className="sr-only" role="status" aria-live="polite">
        {empty
          ? trimmed
            ? `No songs match “${trimmed}”.`
            : "No songs available."
          : `${filtered.length} song${filtered.length === 1 ? "" : "s"} shown.`}
      </p>

      {empty ? (
        <p className="text-muted" role="status">
          {trimmed
            ? `No songs match “${trimmed}”. Try another title or phrase.`
            : "No playable songs are published in the manifest yet."}
        </p>
      ) : (
        <div className="flex flex-col gap-0" role="list" aria-labelledby={listHeadingId}>
          {filtered.map((item) => (
            <div key={item.slug} role="listitem">
              <ListenSongCard
                {...item}
                selected={item.slug === activeSlug}
                onSelect={() => selectSong(item.slug)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="space-y-3 md:space-y-0">
        <div className="md:hidden">
          <Link href={explorePaths.songs} className={exploreSecondaryButtonClass}>
            Explore songs →
          </Link>
        </div>
        <div className="w-full max-w-md">
          <label htmlFor={inputId} className="sr-only">
            Search songs
          </label>
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs…"
            autoComplete="off"
            spellCheck={false}
            aria-controls={statusId}
            className="min-h-11 w-full rounded-sm border border-border/60 bg-bg-elevated/40 px-4 py-2.5 text-sm text-fg placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>
      </div>

      {/* Mobile: sticky player above list. Desktop: two-column with sticky player. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:items-start lg:gap-10">
        <div className="order-2 space-y-4 lg:order-1">{songList}</div>
        <div className="order-1 lg:order-2">{player}</div>
      </div>
    </div>
  );
}
