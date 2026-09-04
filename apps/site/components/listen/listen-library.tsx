"use client";

import { useId, useMemo, useState } from "react";

import {
  ListenSongCard,
  type ListenSongCardProps,
} from "@/components/listen/listen-song-card";

export type ListenLibraryItem = ListenSongCardProps;

type ListenLibraryProps = {
  items: readonly ListenLibraryItem[];
};

function matchesQuery(item: ListenLibraryItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    item.title.toLowerCase().includes(q) ||
    item.shortDescription.toLowerCase().includes(q)
  );
}

/**
 * Client search over the listening library (title + short description).
 * Keeps filtering local — no faceted genre system.
 */
export function ListenLibrary({ items }: ListenLibraryProps) {
  const inputId = useId();
  const statusId = useId();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => items.filter((item) => matchesQuery(item, query)),
    [items, query],
  );

  const trimmed = query.trim();
  const empty = filtered.length === 0;

  return (
    <div className="space-y-5 md:space-y-10">
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
        <div className="grid grid-cols-1 gap-x-10 gap-y-0 md:grid-cols-2 md:gap-y-4">
          {filtered.map((item) => (
            <ListenSongCard key={item.slug} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}
