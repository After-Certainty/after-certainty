"use client";

import { useEffect, useRef, useState } from "react";

import { sunoEmbedUrl } from "@/lib/songs/recordings";

const EMBED_HEIGHT_PX = 140;
const ROOT_MARGIN = "200px 0px";

type SunoEmbedProps = {
  externalId: string;
  /** Accessible iframe title — include the composition title. */
  title: string;
};

/**
 * Deferred Suno iframe: mounts only when near the viewport or when the user
 * explicitly loads the player. Avoids initializing dozens of third-party
 * players on first paint. Never autoplays.
 */
export function SunoEmbed({ externalId, title }: SunoEmbedProps) {
  const embedSrc = sunoEmbedUrl(externalId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (shouldMount || !embedSrc) return;
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldMount(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: ROOT_MARGIN, threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldMount, embedSrc]);

  if (!embedSrc) {
    return (
      <p className="text-sm text-muted" role="status">
        Player unavailable for this recording.
      </p>
    );
  }

  const iframeTitle = `${title} — Suno player`;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg border border-border/40 bg-bg-elevated/50"
      style={{ minHeight: EMBED_HEIGHT_PX }}
    >
      {shouldMount ? (
        <iframe
          title={iframeTitle}
          src={embedSrc}
          className="block w-full border-0"
          height={EMBED_HEIGHT_PX}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div
          className="flex h-[140px] flex-col items-start justify-center gap-3 px-4 py-3 sm:px-5"
          role="status"
        >
          <p className="text-sm text-muted">Player loads when this song is near view.</p>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-sm border border-border/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-fg transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => setShouldMount(true)}
          >
            Load player
          </button>
        </div>
      )}
    </div>
  );
}
